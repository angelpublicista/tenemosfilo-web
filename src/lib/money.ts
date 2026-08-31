/**
 * Dinero.
 *
 * El API manda `basePrice` como cadena ("100000") a propósito, para no perder
 * decimales al serializar. Aquí está el único sitio donde se convierte, para
 * que no aparezcan `Number(exp.basePrice)` sueltos por los componentes.
 *
 * Wompi cobra en centavos, de ahi `aCentavos`.
 */

export function aNumero(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export function aCentavos(valor: string | number | null | undefined): number {
  return Math.round(aNumero(valor) * 100);
}

const formateadores = new Map<string, Intl.NumberFormat>();

/**
 * Formatea en pesos colombianos por defecto.
 *
 * El COP no usa decimales en la práctica, así que se redondean; cualquier
 * otra moneda mantiene los dos habituales.
 */
export function formatearPrecio(
  valor: string | number | null | undefined,
  moneda = "COP",
): string {
  const clave = moneda;
  let formateador = formateadores.get(clave);

  if (!formateador) {
    formateador = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: moneda === "COP" ? 0 : 2,
      maximumFractionDigits: moneda === "COP" ? 0 : 2,
    });
    formateadores.set(clave, formateador);
  }

  return formateador.format(aNumero(valor));
}

/** "90 min" o "1 h 30 min". */
export function formatearDuracion(minutos: number | null | undefined): string {
  if (!minutos || minutos <= 0) return "";
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
