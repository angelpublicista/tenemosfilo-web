import type { Metadata } from "next";

import { FormularioCotizacion } from "@/components/grupos/formulario-cotizacion";
import { listarExperiencias } from "@/lib/api/experiences";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experiencias para grupos",
  description:
    "Catas, clases de cocina y experiencias gastronómicas para equipos y " +
    "celebraciones de empresa. Te preparamos una propuesta a medida.",
};

export default async function PaginaGrupos() {
  // Se ofrecen las que admiten grupo. El API no marca cuales son "de grupo",
  // así que el criterio es el cupo: si no caben al menos 8 personas, no
  // sirve para un equipo.
  const { experiencias } = await listarExperiencias({
    limit: 100,
    sortBy: "totalBookings",
    sortOrder: "desc",
  });

  const paraGrupos = experiencias.filter(
    (experiencia) => (experiencia.capacity ?? 0) >= 8,
  );

  // Si ninguna declara cupo, es preferible ofrecer el catálogo completo antes
  // que una página vacía.
  const ofrecidas = paraGrupos.length > 0 ? paraGrupos : experiencias;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="font-titulo text-3xl text-carbon sm:text-4xl">
          Experiencias para grupos
        </h1>
        <p className="mt-3 text-carbon-suave">
          Celebraciones, integraciones y eventos de empresa alrededor de la
          mesa. Cuéntanos qué tienes en mente y te preparamos una propuesta.
        </p>
      </header>

      <div className="mt-10">
        <FormularioCotizacion experiencias={ofrecidas} />
      </div>
    </div>
  );
}
