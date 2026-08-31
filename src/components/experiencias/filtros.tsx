"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";

/**
 * Controles del listado.
 *
 * El estado vive en la URL, no en React: así un filtro se puede compartir,
 * el botón de atrás funciona y cada combinación se cachea por separado en el
 * servidor. Aquí solo se traduce la interaccion a un push de ruta.
 */
export function Filtros({
  categorias,
}: {
  categorias: { nombre: string; total: number }[];
}) {
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const [pendiente, iniciarTransicion] = useTransition();

  const [busqueda, setBusqueda] = useState(parametros.get("search") ?? "");

  const categoriaActiva = parametros.get("category");
  const tipoActivo = parametros.get("experienceType");
  const orden = parametros.get("sortBy") ?? "createdAt";

  function navegar(cambios: Record<string, string | null>) {
    const siguiente = new URLSearchParams(parametros.toString());

    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null || valor === "") siguiente.delete(clave);
      else siguiente.set(clave, valor);
    }

    // Cualquier cambio de filtro invalida la página en la que estabamos.
    siguiente.delete("page");

    iniciarTransicion(() => {
      router.push(`${ruta}?${siguiente.toString()}`, { scroll: false });
    });
  }

  // La busqueda se manda sola tras una pausa, para no navegar en cada tecla.
  useEffect(() => {
    const actual = parametros.get("search") ?? "";
    if (busqueda === actual) return;

    const temporizador = setTimeout(() => {
      navegar({ search: busqueda || null });
    }, 400);

    return () => clearTimeout(temporizador);
    // `navegar` y `parametros` cambian en cada render; la dependencia real
    // es lo que escribe la persona.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        pendiente && "pointer-events-none opacity-60",
      )}
    >
      <div>
        <label htmlFor="buscar" className="sr-only">
          Buscar experiencias
        </label>
        <input
          id="buscar"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Busca una cata, una clase, un tour…"
          className="w-full rounded-full border border-filo-200 px-5 py-3 text-sm outline-none focus:border-filo-500"
        />
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <BotonFiltro
            activo={!categoriaActiva}
            onClick={() => navegar({ category: null })}
          >
            Todas
          </BotonFiltro>

          {categorias.map((categoria) => (
            <BotonFiltro
              key={categoria.nombre}
              activo={categoriaActiva === categoria.nombre}
              onClick={() =>
                navegar({
                  category:
                    categoriaActiva === categoria.nombre
                      ? null
                      : categoria.nombre,
                })
              }
            >
              {categoria.nombre}
              <span className="ml-1 text-xs opacity-60">{categoria.total}</span>
            </BotonFiltro>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { valor: "PRESENTIAL", etiqueta: "Presencial" },
            { valor: "VIRTUAL", etiqueta: "Virtual" },
            { valor: "HYBRID", etiqueta: "Híbrida" },
          ].map((tipo) => (
            <BotonFiltro
              key={tipo.valor}
              activo={tipoActivo === tipo.valor}
              onClick={() =>
                navegar({
                  experienceType:
                    tipoActivo === tipo.valor ? null : tipo.valor,
                })
              }
            >
              {tipo.etiqueta}
            </BotonFiltro>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="orden" className="text-sm text-carbon-suave">
            Ordenar por
          </label>
          <select
            id="orden"
            value={orden}
            onChange={(evento) => navegar({ sortBy: evento.target.value })}
            className="rounded-full border border-filo-200 px-4 py-2 text-sm outline-none focus:border-filo-500"
          >
            <option value="createdAt">Más recientes</option>
            <option value="basePrice">Precio</option>
            <option value="title">Nombre</option>
            <option value="totalBookings">Más reservadas</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function BotonFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        activo
          ? "border-filo-500 bg-filo-500 text-white"
          : "border-filo-200 text-carbon hover:border-filo-500",
      )}
    >
      {children}
    </button>
  );
}
