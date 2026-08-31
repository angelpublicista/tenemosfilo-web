import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";

import type { Experiencia } from "@/lib/api/schemas";
import { formatearDuracion, formatearPrecio } from "@/lib/money";

const ETIQUETA_TIPO: Record<string, string> = {
  PRESENTIAL: "Presencial",
  VIRTUAL: "Virtual",
  HYBRID: "Híbrida",
};

/**
 * Tarjeta del listado.
 *
 * Solo pinta campos que el contrato del API garantiza. Varios son nullable
 * (descripcion, duración, imagen, precio), así que cada bloque comprueba
 * antes de renderizar en vez de dejar huecos o "null" en pantalla.
 */
export function TarjetaExperiencia({
  experiencia,
}: {
  experiencia: Experiencia;
}) {
  const { id, title, description, featuredImage, basePrice, currency } =
    experiencia;

  const duración = formatearDuracion(experiencia.duration);
  const tipo = experiencia.experienceType
    ? ETIQUETA_TIPO[experiencia.experienceType]
    : null;

  return (
    <article className="group overflow-hidden rounded-xl border border-filo-100 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/experiencias/${id}`} className="block">
        <div className="relative aspect-[4/3] bg-crema">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt=""
              fill
              // Tres columnas en escritorio, dos en tablet, una en móvil.
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            /* Sin foto, el logo rebajado marca el hueco sin fingir contenido. */
            <div className="flex h-full items-center justify-center opacity-20">
              <Logo className="h-16" />
            </div>
          )}

          {tipo && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-carbon">
              {tipo}
            </span>
          )}
        </div>

        <div className="p-4">
          {experiencia.categories.length > 0 && (
            <p className="text-xs font-medium uppercase tracking-wide text-filo-600">
              {experiencia.categories.slice(0, 2).join(" · ")}
            </p>
          )}

          <h3 className="mt-1 line-clamp-2 text-lg text-carbon">{title}</h3>

          {description && (
            <p className="mt-2 line-clamp-2 text-sm text-carbon-suave">
              {description}
            </p>
          )}

          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              {basePrice ? (
                <>
                  <p className="text-xs text-carbon-suave">Desde</p>
                  <p className="font-titulo text-lg font-semibold text-carbon">
                    {formatearPrecio(basePrice, currency)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-carbon-suave">Consultar precio</p>
              )}
            </div>

            {duración && (
              <p className="text-xs text-carbon-suave">{duración}</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
