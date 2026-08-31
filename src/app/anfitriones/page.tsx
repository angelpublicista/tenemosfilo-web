import type { Metadata } from "next";
import Link from "next/link";

import { Aparece } from "@/components/aparece";
import { CtaAnfitrion } from "@/components/anfitriones/cta-anfitrion";
import {
  IconoCalendario,
  IconoCobro,
  IconoComensales,
  IconoEnlace,
  IconoEtiqueta,
  IconoGrupo,
  IconoPublicar,
  IconoReloj,
} from "@/components/iconos";
import { Logo } from "@/components/layout/logo";
import { listarExperiencias } from "@/lib/api/experiences";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Publica tus experiencias gastronómicas",
  description:
    "Comparte tu cocina con quienes quieren conocerla. Publicas gratis y " +
    "nosotros acompañamos con los comensales, el cobro y la logística.",
  openGraph: {
    title: "Sé anfitrión en Tenemos Filo",
    description:
      "Comparte tus experiencias y recibe comensales. Publicar es gratis.",
  },
};

const PASOS = [
  {
    Icono: IconoPublicar,
    titulo: "Comparte tu experiencia",
    texto:
      "Cuéntanos qué preparas, cuánto dura, cuántos comensales recibes y qué precio tiene. Se hace en una tarde.",
  },
  {
    Icono: IconoCalendario,
    titulo: "Abre tu calendario",
    texto:
      "Eliges los días y las horas en que te gusta recibir, y solo se ofrece lo que tú has abierto.",
  },
  {
    Icono: IconoCobro,
    titulo: "Recibe a tus comensales",
    texto:
      "Las reservas te llegan con los datos de quien viene. El pago entra en línea y se liquida a tu cuenta.",
  },
];

const BENEFICIOS = [
  {
    Icono: IconoComensales,
    titulo: "Comensales que ya te buscan",
    texto:
      "Llegan a Tenemos Filo con ganas de una cata o una clase. Vienen convencidos de la idea; tú solo tienes que contarles la tuya.",
  },
  {
    Icono: IconoEtiqueta,
    titulo: "Empiezas sin costo",
    texto:
      "Publicar es gratis y no hay cuota mensual. Ganamos una comisión por cada reserva concretada, así que crecemos contigo.",
  },
  {
    Icono: IconoCobro,
    titulo: "El pago, resuelto",
    texto:
      "Quien reserva paga en línea, así que llegas al día con la mesa lista y las cuentas claras.",
  },
  {
    Icono: IconoReloj,
    titulo: "Tu agenda, a tu ritmo",
    texto:
      "Eliges los días, los horarios, cuántos comensales recibes y con cuánta antelación. Todo lo demás se acomoda a eso.",
  },
  {
    Icono: IconoGrupo,
    titulo: "Mesas grandes y empresas",
    texto:
      "Te llegan solicitudes de equipos y celebraciones, que suelen ser las reuniones más numerosas.",
  },
  {
    Icono: IconoEnlace,
    titulo: "Tu catálogo, donde quieras",
    texto:
      "Tienes una página propia que puedes compartir, poner en tu web o llevar a las agencias aliadas.",
  },
];

/**
 * Landing de captación de anfitriones.
 *
 * El objetivo es una sola acción: llevar al registro del panel
 * (tenemos-filo-front), que es donde existe el alta de verdad. Por eso todos
 * los CTA apuntan al mismo sitio y no hay enlaces que se lleven la atención a
 * otra parte.
 *
 * Nota sobre las cifras: aquí no hay números de anfitriones, reservas ni
 * valoraciones porque no los tenemos medidos. Inventarlos sería mentir a
 * quien está decidiendo si monta un negocio con nosotros. Cuando el equipo
 * tenga las cifras reales, el sitio natural es la franja de confianza.
 */
export default async function PaginaAnfitriones() {
  // Se usan las categorías reales como prueba de que la plataforma está viva.
  // Si el API falla, la landing se sirve igual: es contenido de marketing y no
  // puede caerse porque el catálogo tenga un mal día.
  const categorias = await listarExperiencias({ limit: 100 })
    .then(({ experiencias }) => [
      ...new Set(experiencias.flatMap((e) => e.categories)),
    ])
    .catch(() => []);

  return (
    <>
      <section className="bg-crema">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <p className="font-titulo text-sm uppercase tracking-widest text-filo-600">
            Para cocineros, baristas, sommeliers y reposteros
          </p>

          <h1 className="mt-4 font-titulo text-4xl font-bold leading-tight text-carbon sm:text-5xl">
            Tu cocina tiene mucho que contar.
            <span className="block text-filo-500">Ábrela a la mesa.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-carbon-suave">
            Comparte tus catas, clases o cenas en Tenemos Filo. Nosotros
            acompañamos con los comensales, el calendario y el cobro; tú pones
            lo que sabes hacer.
          </p>

          <CtaAnfitrion origen="hero" />

          <p className="mt-4 text-sm text-carbon-suave">
            Publicar es gratis: ganamos solo cuando tú recibes una reserva.
          </p>
        </div>
      </section>

      <Aliados />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <h2 className="text-center font-titulo text-3xl text-carbon">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-carbon-suave">
          De tu cocina a tu primera mesa, en tres pasos.
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {PASOS.map(({ Icono, titulo, texto }, indice) => (
            <li key={titulo}>
              {/* El envoltorio va dentro del <li> y no fuera: el <li> tiene
                  que seguir siendo hijo directo del grid del <ol>. */}
              <Aparece retraso={indice * 120}>
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-filo-50 text-filo-600">
                    <Icono className="size-6" />
                  </span>
                  <span
                    aria-hidden
                    className="font-titulo text-3xl font-bold text-filo-200"
                  >
                    {indice + 1}
                  </span>
                </div>

                <h3 className="mt-4 font-titulo text-xl text-carbon">
                  {titulo}
                </h3>
                <p className="mt-2 leading-relaxed text-carbon-suave">
                  {texto}
                </p>
              </Aparece>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-crema">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-center font-titulo text-3xl text-carbon">
            Lo que encuentras al abrir tu mesa
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {BENEFICIOS.map(({ Icono, titulo, texto }, indice) => (
              <Aparece key={titulo} retraso={(indice % 2) * 120}>
                <div className="rounded-xl border border-filo-100 bg-white p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-filo-50 text-filo-600">
                    <Icono className="size-6" />
                  </span>

                  <h3 className="mt-4 font-titulo text-lg text-carbon">
                    {titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-carbon-suave">
                    {texto}
                  </p>
                </div>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {categorias.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center font-titulo text-3xl text-carbon">
            Nuestros anfitriones ya comparten
          </h2>

          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {categorias.map((categoria) => (
              <li
                key={categoria}
                className="rounded-full border border-filo-200 px-5 py-2 text-sm font-medium text-carbon"
              >
                {categoria}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-carbon-suave">
            ¿Lo tuyo es algo distinto?{" "}
            <Link href="/contacto" className="text-filo-600 hover:underline">
              Cuéntanoslo
            </Link>{" "}
            y lo vemos juntos.
          </p>
        </section>
      )}

      <Preguntas />

      <section className="bg-carbon">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          {/* Sobre el carbón va la versión blanca: el naranja se apagaría. */}
          <div className="flex justify-center">
            <Logo className="h-20" variante="blanco" />
          </div>

          <h2 className="mt-8 font-titulo text-3xl text-white sm:text-4xl">
            La próxima mesa puede ser la tuya
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Crea tu cuenta y comparte tu primera experiencia. Empezar es
            gratis.
          </p>

          <CtaAnfitrion origen="cierre" oscuro />
        </div>
      </section>
    </>
  );
}

/** Programas que respaldan a Tenemos Filo, tal como los lista el sitio. */
function Aliados() {
  const ALIADOS = ["ProColombia", "iNNpulsa", "apps.co", "Bancolombia"];

  return (
    <section className="border-y border-filo-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-carbon-suave">
          Con el respaldo de
        </p>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {ALIADOS.map((aliado) => (
            <li
              key={aliado}
              className="font-titulo text-lg font-semibold text-carbon-suave"
            >
              {aliado}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Preguntas frecuentes.
 *
 * Con <details>, que abre y cierra sin JavaScript y el buscador lo indexa
 * como texto normal.
 */
function Preguntas() {
  const PREGUNTAS = [
    {
      pregunta: "¿Cuánto cuesta publicar?",
      respuesta:
        "Publicar es gratis y no hay cuota mensual. Tenemos Filo recibe una comisión sobre cada reserva concretada, que se descuenta antes de liquidarte.",
    },
    {
      pregunta: "¿Necesito un restaurante o un local?",
      respuesta:
        "Para nada. Muchas experiencias ocurren en cocinas particulares, talleres o espacios prestados. Lo importante es que sea un lugar seguro y cómodo para quienes recibes.",
    },
    {
      pregunta: "¿Qué pasa si alguien cancela?",
      respuesta:
        "Cada reserva queda registrada con los datos de quien viene y su estado de pago. Las condiciones de cancelación las acordamos contigo al publicar.",
    },
    {
      pregunta: "¿Puedo decidir cuándo recibo?",
      respuesta:
        "Claro. Tú eliges los días y las franjas en que abres, la antelación mínima y las fechas que prefieres guardarte. Solo se ofrece lo que tú has abierto.",
    },
    {
      pregunta: "¿Cuántos comensales puedo recibir?",
      respuesta:
        "Tú defines el mínimo y el máximo de cada experiencia. Si algo se disfruta más con seis personas que con veinte, así se configura.",
    },
    {
      pregunta: "¿Cómo me pagan?",
      respuesta:
        "Quien reserva paga en línea, y el dinero se liquida a tu cuenta según el calendario de dispersiones de la plataforma.",
    },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <h2 className="text-center font-titulo text-3xl text-carbon">
        Preguntas frecuentes
      </h2>

      <div className="mt-10 divide-y divide-filo-100 border-y border-filo-100">
        {PREGUNTAS.map((item) => (
          <details key={item.pregunta} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-titulo text-lg text-carbon">
              {item.pregunta}
              <span
                aria-hidden
                className="shrink-0 text-filo-500 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-carbon-suave">
              {item.respuesta}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
