import type { Pago } from "@/lib/api/schemas";

/**
 * Enlace al Checkout Web de Wompi a partir de lo que devuelve el API.
 *
 * El `checkoutUrl` del API no es un enlace: es la URL a la que Wompi pide que
 * apunte un formulario (`https://checkout.wompi.co/p/`, sin más). Abrirla tal
 * cual deja a la persona en un checkout vacío, con la reserva ya creada y sin
 * forma de pagar. Los datos de la transacción viajan aparte, en el resto del
 * objeto `payment`, y hay que montarlos aquí.
 *
 * Wompi documenta la integración como un formulario con `method="GET"`, así
 * que los campos acaban en la query string igual que si lo enviara el
 * navegador. Los nombres llevan guion y uno de ellos, dos puntos
 * (`signature:integrity`); `URLSearchParams` los codifica igual que el envío
 * nativo de un formulario, así que no hay que tocarlos a mano.
 *
 * La firma la calcula el API con su secreto de integridad. Aquí solo se
 * transporta: si se recalculara en el sitio haría falta ese secreto, y este
 * enlace se construye para el navegador.
 */
export function urlDeCheckout(pago: Pago): string {
  const parametros = new URLSearchParams({
    "public-key": pago.publicKey,
    currency: pago.currency,
    "amount-in-cents": String(pago.amountInCents),
    reference: pago.reference,
    "signature:integrity": pago.signature,
  });

  // A dónde vuelve la persona al terminar el pago. Es opcional en Wompi: si
  // el API no lo manda, Wompi se queda con su propia pantalla de resultado.
  if (pago.redirectUrl) {
    parametros.set("redirect-url", pago.redirectUrl);
  }

  return `${pago.checkoutUrl}?${parametros}`;
}
