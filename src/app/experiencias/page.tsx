import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Filtros } from "@/components/experiencias/filtros";
import { TarjetaExperiencia } from "@/components/experiencias/tarjeta-experiencia";
import {
  listarCategorias,
  listarExperiencias,
  type FiltrosExperiencias,
} from "@/lib/api/experiences";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experiencias",
  description:
    "Catas, clases de cocina, tours culinarios y experiencias para equipos " +
    "con anfitriones verificados.",
};

const POR_PAGINA = 12;

/** Solo dejamos pasar al API los valores que su contrato acepta. */
function leerFiltros(
  parametros: Record<string, string | string[] | undefined>,
): FiltrosExperiencias {
  const texto = (clave: string) => {
    const valor = parametros[clave];
    return typeof valor === "string" && valor !== "" ? valor : undefined;
  };

  const número = (clave: string) => {
    const valor = texto(clave);
    const n = valor === undefined ? NaN : Number(valor);
    return Number.isFinite(n) ? n : undefined;
  };

  const tipo = texto("experienceType");
  const orden = texto("sortBy");
  const sentido = texto("sortOrder");

  return {
    search: texto("search"),
    category: texto("category"),
    minPrice: número("minPrice"),
    maxPrice: número("maxPrice"),
    experienceType:
      tipo === "PRESENTIAL" || tipo === "VIRTUAL" || tipo === "HYBRID"
        ? tipo
        : undefined,
    sortBy:
      orden === "title" ||
      orden === "basePrice" ||
      orden === "rating" ||
      orden === "createdAt" ||
      orden === "totalBookings"
        ? orden
        : undefined,
    sortOrder: sentido === "asc" || sentido === "desc" ? sentido : undefined,
    page: Math.max(1, número("page") ?? 1),
    limit: POR_PAGINA,
  };
}

export default async function PaginaExperiencias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);

  // Las dos lecturas son independientes: no hay razon para encadenarlas.
  const [{ experiencias, paginacion }, categorias] = await Promise.all([
    listarExperiencias(filtros),
    listarCategorias(),
  ]);

  const paginaActual = filtros.page ?? 1;
  const totalPaginas = Math.max(
    1,
    Math.ceil(paginacion.total / (paginacion.pageSize || POR_PAGINA)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-titulo text-3xl text-carbon">Experiencias</h1>
      <p className="mt-2 text-carbon-suave">
        {paginacion.total > 0
          ? `${paginacion.total} experiencias disponibles`
          : "Explora el catálogo"}
      </p>

      <div className="mt-8">
        {/* useSearchParams exige un límite de Suspense para no forzar el
            render dinamico de toda la página. */}
        <Suspense fallback={<div className="h-32" />}>
          <Filtros categorias={categorias} />
        </Suspense>
      </div>

      {experiencias.length === 0 ? (
        <p className="mt-16 text-center text-carbon-suave">
          No encontramos experiencias con esos filtros.{" "}
          <Link href="/experiencias" className="text-filo-600 hover:underline">
            Ver todas
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiencias.map((experiencia) => (
            <TarjetaExperiencia
              key={experiencia.id}
              experiencia={experiencia}
            />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          parametros={parametros}
        />
      )}
    </div>
  );
}

function Paginador({
  paginaActual,
  totalPaginas,
  parametros,
}: {
  paginaActual: number;
  totalPaginas: number;
  parametros: Record<string, string | string[] | undefined>;
}) {
  const enlace = (página: number) => {
    const siguiente = new URLSearchParams();

    for (const [clave, valor] of Object.entries(parametros)) {
      if (typeof valor === "string" && valor !== "" && clave !== "page") {
        siguiente.set(clave, valor);
      }
    }
    if (página > 1) siguiente.set("page", String(página));

    const cadena = siguiente.toString();
    return cadena ? `/experiencias?${cadena}` : "/experiencias";
  };

  return (
    <nav
      aria-label="Paginación"
      className="mt-12 flex items-center justify-center gap-4"
    >
      {paginaActual > 1 && (
        <Link
          href={enlace(paginaActual - 1)}
          rel="prev"
          className="rounded-full border border-filo-200 px-5 py-2 text-sm font-medium hover:border-filo-500"
        >
          Anterior
        </Link>
      )}

      <span className="text-sm text-carbon-suave">
        Página {paginaActual} de {totalPaginas}
      </span>

      {paginaActual < totalPaginas && (
        <Link
          href={enlace(paginaActual + 1)}
          rel="next"
          className="rounded-full border border-filo-200 px-5 py-2 text-sm font-medium hover:border-filo-500"
        >
          Siguiente
        </Link>
      )}
    </nav>
  );
}
