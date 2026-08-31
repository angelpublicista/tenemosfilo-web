import "server-only";

import { z } from "zod";

import { pedirApi, REVALIDAR } from "@/lib/api/client";
import { coincide } from "@/lib/texto";
import {
  CatalogoPublicoSchema,
  DisponibilidadSchema,
  ExperienciaSchema,
  PaginacionSchema,
  SedeSchema,
  type Experiencia,
  type Paginacion,
} from "@/lib/api/schemas";

/**
 * Lecturas del catálogo.
 *
 * Todo lo de aquí se cachea: son datos que cambian poco y el límite de 300
 * peticiones por minuto se comparte entre todas las visitas del sitio.
 */

export type FiltrosExperiencias = {
  companyId?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  experienceType?: "PRESENTIAL" | "VIRTUAL" | "HYBRID";
  sortBy?: "title" | "basePrice" | "rating" | "createdAt" | "totalBookings";
  sortOrder?: "asc" | "desc";
  page?: number;
  /** El API topa en 100. */
  limit?: number;
};

export async function listarExperiencias(
  filtros: FiltrosExperiencias = {},
): Promise<{ experiencias: Experiencia[]; paginacion: Paginacion }> {
  /*
   * La búsqueda por texto se resuelve aquí, no en el API.
   *
   * El `?search=` del API distingue acentos: `café` encuentra la cata de
   * cafés y `cafe` no encuentra nada. Como en Colombia se escribe sin tildes
   * a todas horas, eso deja en blanco media búsqueda.
   *
   * Así que se pide el catálogo sin `search`, se filtra normalizado y se
   * pagina sobre el resultado. Funciona porque el catálogo cabe en una
   * petición: el API tope son 100 experiencias. Si algún día crece por
   * encima, la búsqueda hay que arreglarla en el API — este atajo se
   * quedaría corto y habría que quitarlo.
   */
  const { search, ...paraApi } = filtros;

  if (search?.trim()) {
    return buscarEnCatalogo(search, paraApi);
  }

  const { data, meta } = await pedirApi(
    "/experiences",
    z.array(ExperienciaSchema),
    {
      query: filtros,
      revalidate: REVALIDAR.catalogo,
      tags: ["experiencias"],
    },
  );

  // `meta` puede faltar si el API cambia; preferimos un fallback coherente
  // antes que romper el render de un listado que ya tenemos.
  const paginacion = PaginacionSchema.safeParse(meta);

  return {
    experiencias: data,
    paginacion: paginacion.success
      ? paginacion.data
      : {
          total: data.length,
          page: filtros.page ?? 1,
          pageSize: filtros.limit ?? 20,
        },
  };
}

/**
 * Búsqueda por texto sobre el catálogo, insensible a acentos.
 *
 * Se busca en el título, la descripción, las categorías, la ciudad y el
 * nombre del anfitrión: es por donde alguien recuerda una experiencia.
 */
async function buscarEnCatalogo(
  search: string,
  resto: Omit<FiltrosExperiencias, "search">,
): Promise<{ experiencias: Experiencia[]; paginacion: Paginacion }> {
  const pagina = resto.page ?? 1;
  const porPagina = resto.limit ?? 20;

  const { data } = await pedirApi(
    "/experiences",
    z.array(ExperienciaSchema),
    {
      // El resto de filtros (categoría, tipo, orden) los sigue aplicando el
      // API; aquí solo se añade el texto encima.
      query: { ...resto, page: 1, limit: 100 },
      revalidate: REVALIDAR.catalogo,
      tags: ["experiencias"],
    },
  );

  const encontradas = data.filter((e) =>
    coincide(
      search,
      e.title,
      e.description,
      e.presentialCity,
      e.company?.companyName,
      ...e.categories,
    ),
  );

  const desde = (pagina - 1) * porPagina;

  return {
    experiencias: encontradas.slice(desde, desde + porPagina),
    paginacion: {
      total: encontradas.length,
      page: pagina,
      pageSize: porPagina,
    },
  };
}

/**
 * Las experiencias de la portada.
 *
 * /experiences/featured solo devuelve las que el anfitrión marcó como
 * destacadas, y hoy no hay ninguna: dejaría la portada sin catálogo. Cuando
 * viene vacío se cae a las más reservadas, que para el visitante cumplen la
 * misma función.
 */
export async function listarDestacadas(limite = 6): Promise<Experiencia[]> {
  const { data } = await pedirApi(
    "/experiences/featured",
    z.array(ExperienciaSchema),
    { revalidate: REVALIDAR.catalogo, tags: ["experiencias", "destacadas"] },
  );

  if (data.length > 0) return data.slice(0, limite);

  const { experiencias } = await listarExperiencias({
    limit: limite,
    sortBy: "totalBookings",
    sortOrder: "desc",
  });

  return experiencias;
}

export async function obtenerExperiencia(id: string): Promise<Experiencia> {
  const { data } = await pedirApi(`/experiences/${id}`, ExperienciaSchema, {
    revalidate: REVALIDAR.catalogo,
    tags: ["experiencias", `experiencia:${id}`],
  });

  return data;
}

export async function listarDisponibilidad() {
  const { data } = await pedirApi(
    "/availabilities",
    z.array(DisponibilidadSchema),
    { revalidate: REVALIDAR.disponibilidad, tags: ["disponibilidad"] },
  );

  return data;
}

export async function listarSedes() {
  const { data } = await pedirApi("/locations", z.array(SedeSchema), {
    revalidate: REVALIDAR.catalogo,
    tags: ["sedes"],
  });

  return data;
}

/**
 * Las categorías que se usan de verdad, con cuántas experiencias tiene cada
 * una.
 *
 * El API no expone un endpoint de categorías, así que se derivan del propio
 * catálogo. Es preferible a una lista fija en el código: si un anfitrión
 * escribe la categoría distinta, el filtro sigue cuadrando con el dato.
 *
 * Ojo: mira como mucho las 100 primeras experiencias (el tope del API). Si
 * el catálogo crece por encima de eso, una categoría rara puede quedarse
 * fuera del filtro aunque sus experiencias si aparezcan en el listado.
 */
export async function listarCategorias(): Promise<
  { nombre: string; total: number }[]
> {
  const { experiencias } = await listarExperiencias({ limit: 100 });

  const conteo = new Map<string, number>();
  for (const experiencia of experiencias) {
    for (const categoria of experiencia.categories) {
      conteo.set(categoria, (conteo.get(categoria) ?? 0) + 1);
    }
  }

  return [...conteo.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es"));
}

/**
 * Si la pasarela está activa para este anfitrión ahora mismo.
 *
 * Es la condición para dejar reservar: sin cobro en línea, una reserva se
 * crearía sin que nadie haya pagado. El dato sale del catálogo público, que
 * acepta tanto el slug como el id de la empresa.
 *
 * Ante la duda dice `false`. Si el API no responde o la experiencia no trae
 * empresa, preferimos no ofrecer la reserva antes que ofrecerla sin cobrar:
 * equivocarse hacia el lado de no vender se arregla con un correo, y
 * equivocarse hacia el otro deja al anfitrión con una mesa ocupada y sin
 * dinero.
 */
export async function pagosActivos(
  companyId: string | null | undefined,
): Promise<boolean> {
  if (!companyId) return false;

  try {
    const { paymentsEnabled } = await obtenerCatalogo(companyId);
    return paymentsEnabled;
  } catch (error) {
    console.error("[pagosActivos] no se pudo comprobar", error);
    return false;
  }
}

/**
 * Catálogo público de un anfitrión. No lleva credencial.
 *
 * Acepta el slug o el id, y los slugs antiguos siguen resolviendo: si un
 * anfitrión se renombra, los enlaces ya compartidos no se rompen.
 */
export async function obtenerCatalogo(slug: string) {
  const { data } = await pedirApi(
    `/public/catalog/${encodeURIComponent(slug)}`,
    CatalogoPublicoSchema,
    {
      publico: true,
      revalidate: REVALIDAR.catalogo,
      tags: ["catalogo", `catalogo:${slug}`],
    },
  );

  return data;
}
