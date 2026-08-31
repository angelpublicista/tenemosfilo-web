import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioReserva } from "@/components/experiencias/formulario-reserva";
import { Logo } from "@/components/layout/logo";
import {
  IconoCalendario,
  IconoCheck,
  IconoGrupo,
  IconoPrecio,
  IconoReloj,
  IconoUbicacion,
} from "@/components/iconos";
import { ApiError } from "@/lib/api/client";
import {
  listarDisponibilidad,
  obtenerExperiencia,
  pagosActivos,
} from "@/lib/api/experiences";
import { calendarioDeExperiencia, resumenDeDias } from "@/lib/disponibilidad";
import { formatearDuracion, formatearPrecio } from "@/lib/money";

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

/**
 * Un 404 del API es una experiencia que no existe, no un fallo: se traduce a
 * notFound(). Cualquier otro error sí debe subir, para que no se cachee una
 * página vacía por una caída pasajera.
 */
async function cargar(id: string) {
  try {
    return await obtenerExperiencia(id);
  } catch (error) {
    if (error instanceof ApiError && error.esNoEncontrado) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const experiencia = await obtenerExperiencia(id);

    return {
      title: experiencia.title,
      description: experiencia.description ?? undefined,
      openGraph: {
        title: experiencia.title,
        description: experiencia.description ?? undefined,
        images: experiencia.featuredImage
          ? [{ url: experiencia.featuredImage }]
          : undefined,
      },
    };
  } catch {
    // Los metadatos no deben tumbar la página; el render se encarga del 404.
    return {};
  }
}

export default async function PaginaExperiencia({ params }: Props) {
  const { id } = await params;
  const experiencia = await cargar(id);

  // El calendario cuelga de la sede, no de la experiencia. Si /availabilities
  // falla no tiramos la ficha entera: sin calendario el formulario pide la
  // hora a mano y la confirma el anfitrión.
  const calendarios = await listarDisponibilidad().catch((error) => {
    console.error("[experiencia] sin calendario", error);
    return [];
  });

  // Sin cobro en línea no se ofrece reservar: una reserva sin pago le ocupa
  // la mesa al anfitrión sin garantía de que alguien aparezca.
  const sePuedeCobrar = await pagosActivos(experiencia.company?.id);

  const calendario = calendarioDeExperiencia(experiencia, calendarios);
  const dias = resumenDeDias(calendario);
  const duracion = formatearDuracion(experiencia.duration);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-crema">
        {experiencia.featuredImage ? (
          <Image
            src={experiencia.featuredImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1152px) 1120px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center opacity-20">
            <Logo className="h-28" />
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          {experiencia.categories.length > 0 && (
            <p className="text-xs font-medium uppercase tracking-wide text-filo-600">
              {experiencia.categories.join(" · ")}
            </p>
          )}

          <h1 className="mt-2 font-titulo text-3xl text-carbon sm:text-4xl">
            {experiencia.title}
          </h1>

          {experiencia.company && (
            <p className="mt-2 text-sm text-carbon-suave">
              Con {experiencia.company.companyName}
            </p>
          )}

          {/*
            Rejilla y no flex-wrap: con flex, cada dato ocupaba lo que medía
            su texto y las filas no cuadraban entre sí. En columnas fijas los
            iconos quedan alineados aunque el contenido cambie de largo.
          */}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 text-sm sm:grid-cols-3">
            {duracion && (
              <Dato Icono={IconoReloj} termino="Duración" valor={duracion} />
            )}
            {experiencia.capacity != null && (
              <Dato
                Icono={IconoGrupo}
                termino="Cupo"
                valor={`Hasta ${experiencia.capacity} personas`}
              />
            )}
            {experiencia.presentialCity && (
              <Dato
                Icono={IconoUbicacion}
                termino="Ciudad"
                valor={experiencia.presentialCity}
              />
            )}
            {dias && (
              <Dato Icono={IconoCalendario} termino="Días" valor={dias} />
            )}
            {experiencia.basePrice ? (
              <Dato
                Icono={IconoPrecio}
                termino="Desde"
                valor={formatearPrecio(
                  experiencia.basePrice,
                  experiencia.currency,
                )}
              />
            ) : null}
          </dl>

          {experiencia.description && (
            <div className="mt-8 whitespace-pre-line leading-relaxed text-carbon-suave">
              {experiencia.description}
            </div>
          )}

          {experiencia.includes.length > 0 && (
            <Lista titulo="Qué incluye" puntos={experiencia.includes} />
          )}

          {experiencia.requirements.length > 0 && (
            <Lista
              titulo="Qué necesitas saber"
              puntos={experiencia.requirements}
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {sePuedeCobrar ? (
            <FormularioReserva
              experiencia={experiencia}
              calendario={calendario}
            />
          ) : (
            <SinCobro />
          )}
        </aside>
      </div>
    </article>
  );
}

/**
 * Sustituye al formulario cuando la pasarela está apagada.
 *
 * Se ofrece el contacto en vez de la reserva: es preferible perder la venta
 * automática a registrar una reserva que nadie ha pagado.
 */
function SinCobro() {
  return (
    <div className="rounded-xl border border-filo-100 bg-crema p-6">
      <h2 className="font-titulo text-xl text-carbon">
        Reserva escribiéndonos
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-carbon-suave">
        Ahora mismo no tenemos el pago en línea disponible. Cuéntanos qué día
        te gustaría venir y coordinamos la reserva contigo.
      </p>

      <Link
        href="/contacto"
        className="mt-5 inline-block rounded-full bg-filo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-filo-600"
      >
        Escribirnos
      </Link>
    </div>
  );
}

/** Lo que incluye la experiencia y lo que hay que saber, punto por punto. */
function Lista({ titulo, puntos }: { titulo: string; puntos: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl text-carbon">{titulo}</h2>

      <ul className="mt-3 space-y-2">
        {puntos.map((punto) => (
          <li key={punto} className="flex items-start gap-2.5">
            <IconoCheck className="mt-0.5 size-5 shrink-0 text-menta" />
            <span className="leading-relaxed text-carbon-suave">{punto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Dato({
  Icono,
  termino,
  valor,
}: {
  Icono: (props: { className?: string }) => React.ReactElement;
  termino: string;
  valor: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono className="mt-0.5 size-5 shrink-0 text-filo-500" />

      <div>
        <dt className="text-xs uppercase tracking-wide text-carbon-suave">
          {termino}
        </dt>
        <dd className="mt-0.5 font-medium text-carbon">{valor}</dd>
      </div>
    </div>
  );
}
