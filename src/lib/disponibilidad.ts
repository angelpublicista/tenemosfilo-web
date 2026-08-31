// Los tipos se borran al compilar; DIAS es un valor y por eso viene de su
// propio módulo, para no arrastrar zod al bundle del navegador.
import type { Disponibilidad, Experiencia } from "@/lib/api/schemas";
import { DIAS, NOMBRE_DIA } from "@/lib/dias";

/**
 * Traduce los calendarios del API a "qué días y horas puede elegir esta
 * persona".
 *
 * El API no expone un endpoint de horas libres, así que se compone a partir
 * de tres cosas que sí da: el horario semanal de la sede, la antelación
 * mínima y las fechas bloqueadas.
 *
 * Lo que esto NO sabe es qué cupos ya están vendidos: /availabilities
 * describe cuándo ABRE la sede, no qué queda libre. Por eso una hora
 * ofrecida aquí puede rebotar al reservar, y el formulario tiene que
 * aguantar ese error en vez de darla por buena.
 */

export type FranjaHoraria = { inicio: string; fin: string };

/** El calendario que aplica a una experiencia, vía su sede principal. */
export function calendarioDeExperiencia(
  experiencia: Pick<Experiencia, "locations">,
  calendarios: Disponibilidad[],
): Disponibilidad | null {
  const sedes = experiencia.locations ?? [];
  if (sedes.length === 0) return null;

  const principal = sedes.find((sede) => sede.isMain) ?? sedes[0];

  return (
    calendarios.find(
      (calendario) =>
        calendario.isActive && calendario.locationId === principal.id,
    ) ?? null
  );
}

/** Índice 0-6 de getDay() a la clave que usa el API. */
function claveDelDia(fecha: Date) {
  // getDay(): 0 = domingo. DIAS empieza en lunes.
  return DIAS[(fecha.getDay() + 6) % 7];
}

/**
 * Fecha local en formato YYYY-MM-DD.
 *
 * A propósito no se usa toISOString(): convierte a UTC y en Colombia (UTC-5)
 * eso adelanta un día cualquier hora a partir de las 19:00.
 */
export function aFechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function estaBloqueada(
  calendario: Disponibilidad,
  fechaISO: string,
): boolean {
  return calendario.blockedDates.some((bloqueo) =>
    bloqueo.date.startsWith(fechaISO),
  );
}

/** La primera fecha reservable, respetando la antelación mínima en horas. */
export function primeraFechaDisponible(
  calendario: Disponibilidad | null,
): string {
  const ahora = new Date();
  const horas = calendario?.minimumNotice ?? 0;

  ahora.setHours(ahora.getHours() + horas);

  return aFechaLocal(ahora);
}

/**
 * Franjas que abre la sede ese día, ya descontando las horas que no cumplen
 * la antelación mínima.
 */
export function franjasDelDia(
  calendario: Disponibilidad | null,
  fechaISO: string,
): FranjaHoraria[] {
  if (!calendario || !fechaISO) return [];
  if (estaBloqueada(calendario, fechaISO)) return [];

  // Se construye con las piezas sueltas para que la fecha sea local y no UTC.
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, (mes ?? 1) - 1, dia ?? 1);
  if (Number.isNaN(fecha.getTime())) return [];

  const horario = calendario.weeklySchedule[claveDelDia(fecha)];
  if (!horario?.isActive) return [];

  const minimo = new Date();
  minimo.setHours(minimo.getHours() + (calendario.minimumNotice ?? 0));

  return horario.timeSlots
    .map((franja) => ({ inicio: franja.startTime, fin: franja.endTime }))
    .filter((franja) => {
      const [hora, minuto] = franja.inicio.split(":").map(Number);
      const cuando = new Date(fecha);
      cuando.setHours(hora ?? 0, minuto ?? 0, 0, 0);

      return cuando >= minimo;
    })
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/**
 * Los días abiertos en una frase corta.
 *
 * Enumerarlos todos da cosas como «Martes, Miércoles, Jueves, Viernes,
 * Sábado, Domingo»: ocupa más que el resto de datos de la ficha juntos y no
 * se lee mejor. Los tramos seguidos se juntan en un rango.
 *
 *   lunes a domingo        → «Todos los días»
 *   martes…domingo         → «De martes a domingo»
 *   lunes, miércoles       → «Lunes y miércoles»
 *   lun-mar, vie-sáb       → «De lunes a martes y de viernes a sábado»
 */
export function resumenDeDias(calendario: Disponibilidad | null): string {
  const abiertos = DIAS.filter((dia) => {
    const horario = calendario?.weeklySchedule[dia];
    return horario?.isActive && horario.timeSlots.length > 0;
  });

  if (abiertos.length === 0) return "";
  if (abiertos.length === 7) return "Todos los días";

  // Tramos de días consecutivos, siguiendo el orden lunes→domingo.
  const tramos: (typeof DIAS)[number][][] = [];
  for (const dia of abiertos) {
    const ultimo = tramos.at(-1);
    const anterior = ultimo?.at(-1);

    if (ultimo && anterior && DIAS.indexOf(dia) === DIAS.indexOf(anterior) + 1) {
      ultimo.push(dia);
    } else {
      tramos.push([dia]);
    }
  }

  // Todo se compone en minúscula y solo se capitaliza la frase entera al
  // final: así no aparecen mayúsculas a mitad de «lunes y Miércoles».
  const frases = tramos.map((tramo) => {
    const nombres = tramo.map((d) => NOMBRE_DIA[d].toLowerCase());

    // Un tramo de dos no gana nada con «de … a …»: son las mismas palabras.
    // Con un solo tramo se unen con «y»; con varios, la «y» se reserva para
    // separar los tramos y aquí se usa coma, o saldría «lunes y martes y de
    // viernes a domingo».
    if (nombres.length <= 2) {
      return nombres.join(tramos.length === 1 ? " y " : ", ");
    }

    return `de ${nombres[0]} a ${nombres[nombres.length - 1]}`;
  });

  const texto =
    frases.length === 1
      ? frases[0]
      : `${frases.slice(0, -1).join(", ")} y ${frases.at(-1)}`;

  // La frase empieza en mayúscula, venga de un rango o de un nombre suelto.
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
