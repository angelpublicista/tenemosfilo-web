"use server";

import { z } from "zod";

import { listarExperiencias } from "@/lib/api/experiences";
import { enviarLead } from "@/lib/leads";

/**
 * Leads del formulario de grupos.
 *
 * Van a un webhook de n8n, no al API. `POST /quotes` los guardaba en una
 * tabla sin avisar a nadie, así que el equipo comercial no se enteraba de que
 * había llegado una solicitud; n8n reparte el aviso.
 *
 * Si el envío falla, se dice. Dar las gracias por un lead que se ha perdido
 * es peor que reconocer el fallo: la persona se va convencida de que alguien
 * la va a llamar.
 */

const FormularioSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().email("Revisa el correo"),
  telefono: z.string().trim().optional(),
  empresa: z.string().trim().optional(),
  fecha: z.string().trim().optional(),
  hora: z.string().trim().optional(),
  personas: z.coerce.number().int().min(1, "Indica cuántas personas son"),
  ciudad: z.string().trim().optional(),
  experiencias: z
    .array(z.string())
    .min(1, "Elige al menos una experiencia que te interese"),
  notas: z.string().trim().optional(),
});

export type EstadoCotizacion =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string; campos?: Record<string, string> }
  | { estado: "ok" };

const CORREO = "hola@tenemosfilo.com";

export async function cotizar(
  _anterior: EstadoCotizacion,
  formulario: FormData,
): Promise<EstadoCotizacion> {
  const datos = FormularioSchema.safeParse({
    nombre: formulario.get("nombre"),
    email: formulario.get("email"),
    telefono: formulario.get("telefono"),
    empresa: formulario.get("empresa"),
    fecha: formulario.get("fecha"),
    hora: formulario.get("hora"),
    personas: formulario.get("personas"),
    ciudad: formulario.get("ciudad"),
    experiencias: formulario.getAll("experiencias").map(String),
    notas: formulario.get("notas"),
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
    /*
     * Los ids se cambian por títulos antes de enviar. n8n no tiene la API key
     * de Tenemos Filo, así que un id suelto no le dice nada: quien reciba el
     * aviso tiene que poder leer qué pidieron sin abrir otra herramienta.
     *
     * Si la consulta falla, el lead se manda igual con los ids: perder los
     * títulos es un incordio, perder el contacto es perder una venta.
     */
    const catalogo = await listarExperiencias({ limit: 100 })
      .then(({ experiencias }) => experiencias)
      .catch((error) => {
        console.error("[cotizar] sin catálogo para resolver títulos", error);
        return [];
      });

    const elegidas = entrada.experiencias.map((id) => {
      const encontrada = catalogo.find((e) => e.id === id);

      return {
        id,
        titulo: encontrada?.title ?? "(no identificada)",
        anfitrion: encontrada?.company?.companyName,
      };
    });

    await enviarLead({
      nombre: entrada.nombre,
      email: entrada.email,
      telefono: entrada.telefono || undefined,
      empresa: entrada.empresa || undefined,
      fecha: entrada.fecha || undefined,
      hora: entrada.hora || undefined,
      personas: entrada.personas,
      ciudad: entrada.ciudad || undefined,
      notas: entrada.notas || undefined,
      experiencias: elegidas,
    });

    return { estado: "ok" };
  } catch (error) {
    // Se registra con los datos del lead: si n8n estaba caído, este log es lo
    // único que queda para recuperar el contacto a mano.
    console.error("[cotizar] no se pudo enviar el lead", {
      error,
      lead: {
        nombre: entrada.nombre,
        email: entrada.email,
        telefono: entrada.telefono,
        personas: entrada.personas,
        experiencias: entrada.experiencias,
      },
    });

    return {
      estado: "error",
      mensaje:
        `No pudimos registrar tu solicitud por un problema nuestro. ` +
        `Escríbenos a ${CORREO} y la atendemos enseguida.`,
    };
  }
}
