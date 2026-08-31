/**
 * Los días de la semana como los nombra el API: en ingles y minusculas.
 *
 * Vive aparte de `api/schemas.ts` a propósito. Lo necesitan tanto el esquema
 * (servidor) como el calendario del formulario (navegador), y si se importara
 * desde schemas.ts, el navegador se bajaría zod entero para leer una lista de
 * siete cadenas: unos 19 kB de más en la ficha de cada experiencia.
 */
export const DIAS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Dia = (typeof DIAS)[number];

export const NOMBRE_DIA: Record<Dia, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};
