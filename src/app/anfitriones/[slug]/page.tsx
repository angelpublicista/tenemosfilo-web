import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { TarjetaExperiencia } from "@/components/experiencias/tarjeta-experiencia";
import { ApiError } from "@/lib/api/client";
import { obtenerCatalogo } from "@/lib/api/experiences";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function cargar(slug: string) {
  try {
    return await obtenerCatalogo(slug);
  } catch (error) {
    if (error instanceof ApiError && error.esNoEncontrado) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { company } = await obtenerCatalogo(slug);

    return {
      title: company.companyName,
      description: company.tagline ?? company.description ?? undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Página pública de un anfitrión.
 *
 * Usa /public/catalog/{slug}, que no lleva credencial y acepta tanto el slug
 * como el id. Los slugs antiguos siguen resolviendo, así que un anfitrión
 * puede cambiar de nombre sin romper los enlaces ya compartidos.
 */
export default async function PaginaAnfitrion({ params }: Props) {
  const { slug } = await params;
  const { company, experiences } = await cargar(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="flex flex-wrap items-start gap-6">
        {company.logo && (
          <Image
            src={company.logo}
            alt=""
            width={96}
            height={96}
            className="rounded-xl object-cover"
          />
        )}

        <div className="min-w-64 flex-1">
          <h1 className="font-titulo text-3xl text-carbon">
            {company.companyName}
          </h1>

          {company.tagline && (
            <p className="mt-1 text-filo-600">{company.tagline}</p>
          )}

          {company.description && (
            <p className="mt-4 max-w-2xl leading-relaxed text-carbon-suave">
              {company.description}
            </p>
          )}
        </div>
      </header>

      <section className="mt-12">
        <h2 className="font-titulo text-2xl text-carbon">Sus experiencias</h2>

        {experiences.length === 0 ? (
          <p className="mt-4 text-carbon-suave">
            Este anfitrión no tiene experiencias publicadas ahora mismo.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experiencia) => (
              <TarjetaExperiencia
                key={experiencia.id}
                experiencia={experiencia}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
