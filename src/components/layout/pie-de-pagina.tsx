import Link from "next/link";

import { Logo } from "@/components/layout/logo";

import {
  SITIO,
  URL_LOGIN,
  URL_REGISTRO,
  URL_REGISTRO_ANFITRION,
} from "@/lib/sitio";

const MAPA = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/experiencias", etiqueta: "Experiencias" },
  { href: "/anfitriones", etiqueta: "Anfitriones FILO" },
  { href: "/grupos", etiqueta: "Experiencias para grupos" },
  { href: "/contacto", etiqueta: "Contacto" },
  { href: SITIO.blog, etiqueta: "Blog", externo: true },
];

/**
 * Accesos al panel (tenemos-filo-front).
 *
 * El registro con `?type=host` deja elegido el tipo «anfitrión», para que
 * quien llega desde aquí no tenga que volver a decidirlo.
 */
const CUENTA = [
  { href: URL_LOGIN, etiqueta: "Iniciar sesión" },
  { href: URL_REGISTRO, etiqueta: "Crear cuenta" },
  { href: URL_REGISTRO_ANFITRION, etiqueta: "Quiero ser anfitrión" },
];

// Los perfiles que enlaza el sitio actual.
const REDES = [
  { href: "https://www.instagram.com/tenemosfilo", etiqueta: "Instagram" },
  { href: "https://www.facebook.com/tenemosFILO", etiqueta: "Facebook" },
  { href: "https://twitter.com/TenemosFILO", etiqueta: "Twitter" },
];

/**
 * El pie no lleva margen superior: cada página trae su propio espacio al
 * final. Un margen aquí abriria una franja blanca justo debajo de las
 * secciones que terminan en color, como el cierre de /anfitriones.
 */
export function PieDePagina() {
  return (
    <footer className="bg-crema">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="h-20" />
          <p className="mt-3 text-sm text-carbon-suave">
            Experiencias gastronómicas con anfitriones verificados en Colombia.
          </p>
        </div>

        <nav aria-labelledby="pie-mapa">
          <h2
            id="pie-mapa"
            className="font-titulo text-sm font-semibold uppercase tracking-wide text-carbon"
          >
            Mapa del sitio
          </h2>
          <ul className="mt-3 space-y-2">
            {MAPA.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  {...("externo" in enlace && enlace.externo
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="text-sm text-carbon-suave hover:text-filo-500"
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/*
          Esta columna era «Recursos» con un solo enlace al blog. Los accesos
          al panel la llenan mejor, y el blog se ha ido al mapa del sitio, que
          es donde alguien lo busca.
        */}
        <nav aria-labelledby="pie-cuenta">
          <h2
            id="pie-cuenta"
            className="font-titulo text-sm font-semibold uppercase tracking-wide text-carbon"
          >
            Tu cuenta
          </h2>
          <ul className="mt-3 space-y-2">
            {CUENTA.map((enlace) => (
              <li key={enlace.href}>
                <a
                  href={enlace.href}
                  className="text-sm text-carbon-suave hover:text-filo-500"
                >
                  {enlace.etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="pie-redes">
          <h2
            id="pie-redes"
            className="font-titulo text-sm font-semibold uppercase tracking-wide text-carbon"
          >
            Síguenos
          </h2>
          <ul className="mt-3 space-y-2">
            {REDES.map((red) => (
              <li key={red.href}>
                <a
                  href={red.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-carbon-suave hover:text-filo-500"
                >
                  {red.etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-filo-100">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-carbon-suave">
          © {new Date().getFullYear()} Tenemos Filo. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
