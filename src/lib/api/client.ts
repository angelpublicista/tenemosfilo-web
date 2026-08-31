import "server-only";

import { z } from "zod";

import { env } from "@/lib/env";

/**
 * Cliente del API de Tenemos Filo.
 *
 * Dos reglas que vienen del contrato y conviene no perder de vista:
 *
 * 1. La key es de servidor. Este módulo es "server-only" para que ningún
 *    componente de cliente pueda arrastrarla al bundle.
 *
 * 2. Hay 300 peticiones por minuto y por key, compartidas por TODO el sitio.
 *    Con render por visitante eso se agota en cuanto entra trafico, así que
 *    por defecto cacheamos y revalidamos. Solo las mutaciones van sin cache.
 */

const ErrorApiSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    /** Segundos a esperar, presente solo en 429. */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** El recurso no existe: normalmente se traduce en notFound(). */
  get esNoEncontrado() {
    return this.status === 404;
  }

  /** Problema de credencial, no del visitante. Hay que revisar la key. */
  get esCredencial() {
    return this.status === 401 || this.status === 403;
  }
}

/** Cuanto vive en cache cada tipo de dato, en segundos. */
export const REVALIDAR = {
  /** El catálogo cambia poco y es lo más visitado. */
  catalogo: 300,
  /** La disponibilidad cambia más: no queremos ofrecer horas ya ocupadas. */
  disponibilidad: 60,
} as const;

type OpcionesPeticion = {
  /** Query string. Las claves con valor undefined o "" se omiten. */
  query?: Record<string, string | number | boolean | undefined | null>;
  method?: "GET" | "POST";
  body?: unknown;
  /** Segundos de cache. `false` desactiva la cache (mutaciones). */
  revalidate?: number | false;
  /** Etiquetas para invalidar con revalidateTag(). */
  tags?: string[];
  /** Las rutas /public/* no llevan credencial. */
  publico?: boolean;
};

function construirUrl(
  ruta: string,
  query: OpcionesPeticion["query"],
): string {
  const url = new URL(ruta, env.TF_API_URL);

  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor === undefined || valor === null || valor === "") continue;
    url.searchParams.set(clave, String(valor));
  }

  return url.toString();
}

async function leerError(respuesta: Response): Promise<ApiError> {
  let code = "UNKNOWN";
  let message = respuesta.statusText || "Error del API";
  let details: unknown;

  try {
    const cuerpo = ErrorApiSchema.safeParse(await respuesta.json());
    if (cuerpo.success) {
      code = cuerpo.data.error.code;
      message = cuerpo.data.error.message;
      details = cuerpo.data.error.details;
    }
  } catch {
    // Respuesta sin JSON (un 502 del proxy, por ejemplo). Nos quedamos con
    // el statusText.
  }

  const retryAfter = respuesta.headers.get("Retry-After");

  return new ApiError(
    respuesta.status,
    code,
    message,
    details,
    retryAfter ? Number(retryAfter) : undefined,
  );
}

/**
 * Hace la petición y valida la respuesta contra el esquema.
 *
 * Devuelve ya el contenido de `data`: todas las respuestas del API vienen
 * envueltas en `{ data, meta? }`.
 */
export async function pedirApi<T>(
  ruta: string,
  esquema: z.ZodType<T>,
  opciones: OpcionesPeticion = {},
): Promise<{ data: T; meta?: unknown }> {
  const {
    query,
    method = "GET",
    body,
    revalidate = REVALIDAR.catalogo,
    tags,
    publico = false,
  } = opciones;

  const cabeceras: Record<string, string> = { Accept: "application/json" };

  if (!publico) {
    cabeceras.Authorization = `Bearer ${env.TF_API_KEY}`;
  }
  if (body !== undefined) {
    cabeceras["Content-Type"] = "application/json";
  }

  const respuesta = await fetch(construirUrl(ruta, query), {
    method,
    headers: cabeceras,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Las mutaciones nunca se cachean.
    cache: method === "POST" || revalidate === false ? "no-store" : undefined,
    next:
      method === "POST" || revalidate === false
        ? undefined
        : { revalidate, tags },
  });

  if (!respuesta.ok) {
    throw await leerError(respuesta);
  }

  const crudo = (await respuesta.json()) as { data?: unknown; meta?: unknown };
  const validado = esquema.safeParse(crudo?.data);

  if (!validado.success) {
    throw new ApiError(
      respuesta.status,
      "RESPUESTA_INVALIDA",
      `El API devolvio algo que no encaja con el contrato en ${ruta}: ` +
        validado.error.issues
          .map((i) => `${i.path.join(".")} ${i.message}`)
          .join("; "),
      validado.error.issues,
    );
  }

  return { data: validado.data, meta: crudo?.meta };
}
