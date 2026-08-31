import type { Addon, Experiencia } from "@/lib/api/schemas";
import { aNumero } from "@/lib/money";

/**
 * Desglose del precio de una reserva.
 *
 * Se usa en dos sitios y tiene que dar lo mismo en los dos: el resumen que ve
 * la persona mientras rellena el formulario (en el navegador) y el `pricing`
 * que se manda al API (en el servidor). Por eso este módulo no es
 * server-only ni toca la red.
 *
 * La cifra que manda al final es la que calcula el API. Esto es para que no
 * haya sorpresas entre lo que se ve y lo que se cobra.
 */

export type Desglose = {
  precioBase: number;
  /** Precio base por el número de asistentes. */
  subtotal: number;
  extras: number;
  total: number;
};

export function calcularTotal(
  experiencia: Pick<Experiencia, "basePrice">,
  participantes: number,
  addons: Addon[] = [],
): Desglose {
  const precioBase = aNumero(experiencia.basePrice);
  const personas = Math.max(1, participantes);

  const subtotal = precioBase * personas;

  // `priceType` decide si el extra se cobra por persona o una sola vez.
  const extras = addons.reduce(
    (suma, addon) =>
      suma + addon.price * (addon.priceType === "per_person" ? personas : 1),
    0,
  );

  return {
    precioBase,
    subtotal,
    extras,
    total: subtotal + extras,
  };
}
