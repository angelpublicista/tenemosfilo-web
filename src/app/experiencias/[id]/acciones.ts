"use server";

import { z } from "zod";

import { ApiError } from "@/lib/api/client";
import { obtenerExperiencia, pagosActivos } from "@/lib/api/experiences";
import { crearReservaPublica } from "@/lib/api/reservations";
import { calcularTotal } from "@/lib/precios";

/**
 * Crear una reserva desde la ficha de la experiencia.
 *
 * Vive en el servidor: el formulario nunca habla directamente con el API.
 *
 * El precio no se acepta del formulario. Se vuelve a leer la experiencia y se
 * recalcula aquí, porque cualquiera puede editar el HTML antes de enviarlo.
 * El API también lo recalcula por su cuenta, así que esto es la segunda de
 * dos barreras, no la única.
 */

const FormularioSchema = z.object({
  experienceId: z.string().min(1),
  nombre: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().email("Revisa el correo"),
  telefono: z.string().trim().optional(),
  fecha: z.string().min(1, "Elige una fecha"),
  hora: z.string().min(1, "Elige una hora"),
  participantes: z.coerce.number().int().min(1, "Mínimo una persona"),
  addons: z.array(z.string()).default([]),
  requerimientos: z.string().trim().optional(),
});

export type EstadoReserva =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string; campos?: Record<string, string> }
  | { estado: "ok"; numeroReserva: string; urlPago?: string };

export async function reservar(
  _anterior: EstadoReserva,
  formulario: FormData,
): Promise<EstadoReserva> {
  const datos = FormularioSchema.safeParse({
    experienceId: formulario.get("experienceId"),
    nombre: formulario.get("nombre"),
    email: formulario.get("email"),
    telefono: formulario.get("telefono"),
    fecha: formulario.get("fecha"),
    hora: formulario.get("hora"),
    participantes: formulario.get("participantes"),
    addons: formulario.getAll("addons").map(String),
    requerimientos: formulario.get("requerimientos"),
  });

  if (!datos.success) {
    const campos: Record<string, string> = {};
    for (const problema of datos.error.issues) {
      const campo = problema.path[0];
      if (typeof campo === "string" && !campos[campo]) {
        campos[campo] = problema.message;
      }
    }

    return {
      estado: "error",
      mensaje: "Revisa los datos del formulario.",
      campos,
    };
  }

  const entrada = datos.data;

  try {
    const experiencia = await obtenerExperiencia(entrada.experienceId);

    /*
     * Regla de negocio: no se reserva si no se paga.
     *
     * Se comprueba aquí y no solo al pintar el formulario porque ocultar un
     * formulario no impide que alguien envíe la petición igual. Esta es la
     * comprobación que cuenta.
     *
     * Ojo con lo que esto NO puede garantizar: el API crea la reserva y
     * después construye el checkout a partir de su número, así que el
     * registro nace antes de que nadie pague. Nace `paymentStatus: PENDING`
     * y solo pasa a PAID cuando la pasarela avisa. Lo que se evita aquí es
     * el caso peor: crear reservas cuando la pasarela está apagada y no hay
     * ninguna posibilidad de cobrar.
     */
    if (!(await pagosActivos(experiencia.company?.id))) {
      console.error(
        "[reservar] intento de reserva sin pasarela activa",
        experiencia.id,
      );

      return {
        estado: "error",
        mensaje:
          "Ahora mismo no tenemos el pago en línea disponible. Escríbenos y " +
          "organizamos la reserva contigo.",
      };
    }

    if (
      experiencia.capacity != null &&
      entrada.participantes > experiencia.capacity
    ) {
      return {
        estado: "error",
        mensaje: `Esta experiencia recibe hasta ${experiencia.capacity} personas.`,
        campos: { participantes: "Supera el cupo" },
      };
    }

    if (
      experiencia.minCapacity != null &&
      entrada.participantes < experiencia.minCapacity
    ) {
      return {
        estado: "error",
        mensaje: `Esta experiencia se disfruta desde ${experiencia.minCapacity} personas.`,
        campos: { participantes: "Por debajo del mínimo" },
      };
    }

    const seleccionados = experiencia.addons.filter((addon) =>
      entrada.addons.includes(addon.name),
    );

    const desglose = calcularTotal(
      experiencia,
      entrada.participantes,
      seleccionados,
    );

    // El API espera un ISO completo; el formulario da fecha y hora sueltas.
    const fechaHora = new Date(`${entrada.fecha}T${entrada.hora}:00`);

    if (Number.isNaN(fechaHora.getTime())) {
      return {
        estado: "error",
        mensaje: "Revisa la fecha y la hora, por favor.",
        campos: { fecha: "Fecha no válida" },
      };
    }

    const reserva = await crearReservaPublica({
      experience: experiencia.id,
      client: {
        name: entrada.nombre,
        email: entrada.email,
        phone: entrada.telefono || undefined,
      },
      reservationDate: fechaHora.toISOString(),
      participants: entrada.participantes,
      duration: experiencia.duration ?? undefined,
      pricing: {
        basePrice: desglose.precioBase,
        subtotal: desglose.subtotal,
        total: desglose.total,
        addons: seleccionados.map((addon) => ({
          name: addon.name,
          price: addon.price,
          quantity:
            addon.priceType === "per_person" ? entrada.participantes : 1,
        })),
      },
      specialRequirements: entrada.requerimientos || undefined,
    });

    const urlPago = reserva.payment?.checkoutUrl;

    if (!urlPago) {
      // La pasarela estaba activa al empezar pero el API no devolvió
      // checkout. La reserva ya existe y ha quedado sin cobrar: hay que
      // dejar rastro para que alguien la revise, y no decirle a la persona
      // que está todo en orden.
      console.error(
        "[reservar] reserva creada sin checkout",
        reserva.reservationNumber,
      );
    }

    return {
      estado: "ok",
      numeroReserva: reserva.reservationNumber,
      urlPago,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // 429: el API limita a 15 reservas cada 10 minutos por IP.
      if (error.status === 429) {
        return {
          estado: "error",
          mensaje:
            "Hemos recibido muchas solicitudes desde tu conexión. " +
            "Espera unos minutos y vuelve a intentarlo.",
        };
      }

      // Los 400 traen un mensaje pensado para leerse; el resto no.
      if (error.status === 400) {
        return { estado: "error", mensaje: error.message };
      }
    }

    console.error("[reservar]", error);

    return {
      estado: "error",
      mensaje:
        "No pudimos crear la reserva. Inténtalo de nuevo o escríbenos y lo " +
        "vemos contigo.",
    };
  }
}
