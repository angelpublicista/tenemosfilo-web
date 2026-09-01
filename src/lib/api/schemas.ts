import { z } from "zod";

// Los días viven en su propio módulo para que el navegador no tenga que
// bajarse zod solo para leerlos.
export { DIAS, type Dia } from "@/lib/dias";

/**
 * Espejo en zod del contrato de docs/openapi.yaml del API.
 *
 * Validamos las respuestas en vez de confiar en ellas: el API evoluciona en
 * otro repo y es preferible un error claro en el servidor a un `undefined`
 * reventando a mitad de render. Los campos opcionales están marcados como
 * tales a propósito — el contrato declara varios como nullable.
 */

/** El API manda los precios como cadena para no perder decimales. */
export const Dinero = z.union([z.string(), z.number(), z.null()]);

/**
 * Campos que el API entrega unas veces como texto y otras como lista.
 *
 * `includes` llega como array de cadenas cuando el anfitrión rellena varios
 * puntos, y como null cuando no rellena ninguno; el openapi.yaml no lo
 * documenta. Se aceptan las dos formas y siempre se devuelve una lista, para
 * que los componentes no tengan que preguntar de qué tipo es.
 */
export const TextoOLista = z
  .union([z.string(), z.array(z.string()), z.null()])
  .optional()
  .transform((valor) => {
    if (valor === null || valor === undefined) return [];
    return typeof valor === "string"
      ? valor
          .split("\n")
          .map((linea) => linea.trim())
          .filter(Boolean)
      : valor;
  })
  // Si algún día llega en otro formato, el campo se queda vacío en vez de
  // tumbar la página entera: es contenido decorativo, no esencial.
  .catch([]);

export const TipoExperiencia = z.enum(["PRESENTIAL", "VIRTUAL", "HYBRID"]);
export const EstadoExperiencia = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
]);

export const AddonSchema = z.object({
  name: z.string(),
  price: z.number(),
  // Decide si el precio se multiplica por asistente o se cobra una vez.
  priceType: z.enum(["per_person", "total"]),
  description: z.string().optional(),
});

/**
 * Una experiencia.
 *
 * IMPORTANTE: zod descarta lo que no se declare aquí, y eso es deliberado.
 * La respuesta real de /experiences incluye además `totalRevenue`,
 * `filoCommissionType/Value` y `resellerCommissionType/Value`: cifras de
 * negocio del anfitrión que no pintan nada en un sitio público. Al no
 * declararlas, no llegan a los componentes y no pueden acabar en el HTML que
 * se manda al navegador.
 *
 * No añadas aquí un campo sin mirar antes si es publicable.
 */
export const ExperienciaSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  categories: z.array(z.string()).default([]),
  /** Minutos. */
  duration: z.number().int().nullish(),
  capacity: z.number().int().nullish(),
  minCapacity: z.number().int().nullish(),
  basePrice: Dinero.optional(),
  currency: z.string().default("COP"),
  featuredImage: z.string().nullish(),
  // Hoy llega siempre null, así que su forma real está sin confirmar: si
  // apareciera con otra estructura, preferimos quedarnos sin galería antes
  // que romper el listado entero.
  gallery: z.array(z.string()).nullish().catch([]),
  experienceType: TipoExperiencia.optional(),
  status: EstadoExperiencia.optional(),
  addons: z.array(AddonSchema).default([]),

  // Campos que el API devuelve pero el openapi.yaml no documenta. Se usan
  // para la ficha y el calendario.
  isFeatured: z.boolean().nullish(),
  rating: z.union([z.number(), z.string(), z.null()]).optional(),
  requirements: TextoOLista,
  includes: TextoOLista,
  presentialCity: z.string().nullish(),
  presentialAddress: z.string().nullish(),
  /** Si el anfitrión prefiere no publicar la dirección exacta. */
  hideAddress: z.boolean().nullish(),
  company: z
    .object({ id: z.string(), companyName: z.string() })
    .nullish(),
  /**
   * Sedes donde ocurre. El `id` es lo que permite cruzarla con el calendario
   * de /availabilities, que va por sede y no por experiencia.
   */
  locations: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        isMain: z.boolean().nullish(),
      }),
    )
    .nullish(),
});

export const PaginacionSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const FranjaSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

export const DiaSchema = z.object({
  isActive: z.boolean(),
  timeSlots: z.array(FranjaSchema).default([]),
});

/**
 * Calendario de disponibilidad.
 *
 * Cuelga de una SEDE, no de una experiencia: el contrato no lo dice, pero la
 * respuesta real trae `locationId`. Para saber cuando ocurre una experiencia
 * hay que cruzar `experiencia.locations[].id` con este `locationId`.
 */
export const DisponibilidadSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  locationId: z.string().nullish(),
  isActive: z.boolean().default(true),
  weeklySchedule: z.record(z.string(), DiaSchema).default({}),
  /** Minutos entre reservas. */
  bufferTime: z.number().int().nullish(),
  /** Antelacion mínima, en horas. */
  minimumNotice: z.number().int().nullish(),
  blockedDates: z
    .array(z.object({ date: z.string(), reason: z.string().optional() }))
    .default([]),
});

export const SedeSchema = z.object({
  id: z.string(),
  name: z.string(),
  isMain: z.boolean().default(false),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export const EmpresaSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  slug: z.string().optional(),
  tagline: z.string().nullish(),
  description: z.string().nullish(),
  logo: z.string().nullish(),
  companyEmail: z.string().nullish(),
  companyPhone: z.string().nullish(),
});

export const CatalogoPublicoSchema = z.object({
  company: EmpresaSchema,
  experiences: z.array(ExperienciaSchema).default([]),
  /** Si la pasarela está activa ahora mismo. */
  paymentsEnabled: z.boolean().default(false),
});

/**
 * Datos firmados para abrir el checkout de Wompi. Nunca traen secretos.
 *
 * `checkoutUrl` es solo la URL base del checkout; los demás campos son los
 * parámetros que hay que colgarle. Los junta `lib/pagos.ts`.
 */
export const PagoSchema = z.object({
  checkoutUrl: z.string(),
  publicKey: z.string(),
  currency: z.string(),
  amountInCents: z.number().int(),
  reference: z.string(),
  signature: z.string(),
  /** A dónde vuelve la persona tras pagar. Wompi lo trata como opcional. */
  redirectUrl: z.string().optional(),
  environment: z.enum(["SANDBOX", "PRODUCTION"]),
});

export const ReservaCreadaSchema = z.object({
  reservationNumber: z.string(),
  payment: PagoSchema.nullable().optional(),
});

export type Experiencia = z.infer<typeof ExperienciaSchema>;
export type Addon = z.infer<typeof AddonSchema>;
export type Disponibilidad = z.infer<typeof DisponibilidadSchema>;
export type Sede = z.infer<typeof SedeSchema>;
export type Empresa = z.infer<typeof EmpresaSchema>;
export type CatalogoPublico = z.infer<typeof CatalogoPublicoSchema>;
export type Pago = z.infer<typeof PagoSchema>;
export type ReservaCreada = z.infer<typeof ReservaCreadaSchema>;
export type Paginacion = z.infer<typeof PaginacionSchema>;
