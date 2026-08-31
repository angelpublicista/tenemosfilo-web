import Link from "next/link";

import { Aparece } from "@/components/aparece";
import { TarjetaExperiencia } from "@/components/experiencias/tarjeta-experiencia";
import { Buscador } from "@/components/inicio/buscador";
import { TituloAnimado } from "@/components/inicio/titulo-animado";
import { VideoFondo } from "@/components/inicio/video-fondo";
import { listarCategorias, listarDestacadas } from "@/lib/api/experiences";

// La portada se regenera cada pocos minutos en vez de renderizarse por
// visitante: el límite del API es de 300 peticiones por minuto para todo el
// sitio.
export const revalidate = 300;

/**
 * Las frases del titular, heredadas del sitio en WordPress: son las que el
 * equipo ya usaba para describir el catálogo.
 */
const FRASES = [
  "Clases de cocina",
  "Talleres de trabajo en equipo",
  "Turismo gastronómico",
  "Momentos clandestinos",
];

export default async function Portada() {
  // Las categorías salen del catálogo real, no de una lista fija: si nadie ha
  // publicado una cata, no tiene sentido ofrecer ese filtro.
  const [destacadas, categorias] = await Promise.all([
    listarDestacadas(),
    listarCategorias(),
  ]);

  return (
    <>
      {/*
        El banner monta su propio contexto de apilamiento con `isolate`, para
        que el z-index negativo del vídeo se quede dentro de la sección y no
        acabe detrás del fondo de la página.

        El carbón de base es lo que se ve mientras el vídeo carga y lo que
        queda si no llega a cargar: el titular tiene que leerse igual.
      */}
      <section className="relative isolate overflow-hidden bg-carbon">
        <VideoFondo />

        {/*
          Velo sobre el vídeo. Sin él, un fotograma claro dejaría el texto
          blanco ilegible; el degradado carga más abajo, que es donde están
          los botones.
        */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon/60 via-carbon/65 to-carbon/80"
        />

        <div className="mx-auto max-w-6xl px-4 py-28 text-center sm:py-36">
          {/*
            La primera línea es fija y la segunda se escribe sola, con las
            mismas frases que rotaba el sitio en WordPress. La frase inicial
            viaja ya escrita en el HTML, así que el h1 nunca llega vacío a un
            buscador.
          */}
          <h1 className="font-titulo text-4xl font-bold text-white drop-shadow-sm sm:text-6xl">
            Tenemos filo para
            {/*
              Altura reservada para dos líneas en móvil y una en escritorio:
              «Talleres de trabajo en equipo» parte en dos en pantalla
              estrecha, y sin esta reserva el banner daría un salto cada vez
              que el texto cambia de frase.
            */}
            <span className="mt-1 block min-h-[2.4em] sm:min-h-[1.2em]">
              <TituloAnimado frases={FRASES} />
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Catas, clases de cocina y recorridos gastronómicos de la mano de
            anfitriones apasionados.
          </p>

          {/* La búsqueda es la acción principal del banner; los enlaces
              quedan debajo para quien prefiere mirar sin buscar. */}
          <div className="mx-auto mt-8 max-w-xl">
            <Buscador />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/experiencias"
              className="font-medium text-white/90 underline-offset-4 hover:underline"
            >
              Ver todas las experiencias
            </Link>
            <Link
              href="/grupos"
              className="font-medium text-white/90 underline-offset-4 hover:underline"
            >
              Algo para mi equipo
            </Link>
          </div>
        </div>
      </section>

      {categorias.length > 0 && (
        <Aparece>
          <section className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="font-titulo text-2xl text-carbon">
              Explora por tipo
            </h2>

            <ul className="mt-6 flex flex-wrap gap-3">
              {categorias.map((categoria) => (
                <li key={categoria.nombre}>
                  <Link
                    href={`/experiencias?category=${encodeURIComponent(categoria.nombre)}`}
                    className="inline-block rounded-full border border-filo-200 px-5 py-2 text-sm font-medium text-carbon transition-colors hover:border-filo-500 hover:text-filo-600"
                  >
                    {categoria.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Aparece>
      )}

      {destacadas.length > 0 && (
        <Aparece>
          <section className="mx-auto max-w-6xl px-4 pb-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-titulo text-2xl text-carbon">
                Descubre experiencias
              </h2>
              <Link
                href="/experiencias"
                className="text-sm font-medium text-filo-600 hover:underline"
              >
                Ver todas
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacadas.slice(0, 6).map((experiencia) => (
                <TarjetaExperiencia
                  key={experiencia.id}
                  experiencia={experiencia}
                />
              ))}
            </div>
          </section>
        </Aparece>
      )}
    </>
  );
}
