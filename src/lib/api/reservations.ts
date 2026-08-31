import "server-only";

import { z } from "zod";

import { pedirApi } from "@/lib/api/client";
import { ReservaCreadaSchema } from "@/lib/api/schemas";

/**
 * Reservas hechas desde el sitio de Tenemos Filo.
 *
 * Van por /reservations/public, sin credencial, que es el endpoint pensado
 * para la página pública. El otro (POST /reservations, con API key) atribuye
 * la venta a una empresa revendedora y le genera comisión: usarlo aquí
 * significaria cobrarnos comisión a nosotros mismos.
 *
 * El precio lo calcula entero el servidor a partir de la experiencia. Lo que
 * mandamos en `pricing` se ignora, así que sirve solo para que el desglose
 * que ve la persona y el que registra el API partan del mismo sitio.
 *
 * Limite: 15 reservas cada 10 minutos por IP.
 */

export const DatosReservaSchema = z.object({
  experience: z.string().min(1),
  client: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    notes: z.string().optional(),
  }),
  reservationDate: z.string(),
  participants: z.number().int().min(1),
  duration: z.number().int().optional(),
  location: z.string().optional(),
  pricing: z.object({
    basePrice: z.number(),
    subtotal: z.number(),
    total: z.number(),
    addons: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
        }),
      )
      .optional(),
  }),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
});

export type DatosReserva = z.infer<typeof DatosReservaSchema>;

export async function crearReservaPublica(datos: DatosReserva) {
  const { data } = await pedirApi(
    "/reservations/public",
    ReservaCreadaSchema,
    {
      method: "POST",
      body: datos,
      publico: true,
      revalidate: false,
    },
  );

  return data;
}
