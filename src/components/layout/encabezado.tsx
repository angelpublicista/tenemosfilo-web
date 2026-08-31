"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { NAVEGACION, URL_LOGIN, URL_REGISTRO } from "@/lib/sitio";
import { cn } from "@/lib/cn";

export function Encabezado() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ruta = usePathname();

  // Al navegar, el menú móvil se queda abierto tapando la página nueva.
  useEffect(() => {
    setMenuAbierto(false);
  }, [ruta]);

  return (
    <header className="sticky top-0 z-50 border-b border-filo-100 bg-white/95 backdrop-blur">
      {/*
        La navegación completa aparece a partir de `lg` (1024 px) y no de
        `md` (768 px): con el logo, cinco enlaces y los dos accesos al panel,
        la barra necesita unos 895 px. Entre 768 y 895 se apretaba, así que
        en ese tramo —tablet en vertical— se usa el menú desplegable.
      */}
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Tenemos Filo — inicio">
          <Logo className="h-14 sm:h-16" prioridad />
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-6 lg:flex"
        >
          {NAVEGACION.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              {...("externo" in enlace && enlace.externo
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className={cn(
                "text-sm font-medium text-carbon-suave transition-colors hover:text-filo-500",
                ruta.startsWith(enlace.href) &&
                  !("externo" in enlace && enlace.externo) &&
                  "text-filo-600",
              )}
            >
              {enlace.etiqueta}
            </Link>
          ))}

          {/*
            El acceso al panel va separado por una línea: no es navegación
            del sitio, sino la salida hacia otra aplicación.
          */}
          <span aria-hidden className="h-5 w-px bg-filo-100" />

          <a
            href={URL_LOGIN}
            className="text-sm font-medium text-carbon-suave transition-colors hover:text-filo-500"
          >
            Iniciar sesión
          </a>

          <a
            href={URL_REGISTRO}
            className="rounded-full bg-filo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-filo-600"
          >
            Crear cuenta
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          className="rounded-md p-2 text-carbon lg:hidden"
        >
          <span aria-hidden className="block text-lg leading-none">
            {menuAbierto ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {menuAbierto && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="border-t border-filo-100 bg-white lg:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {NAVEGACION.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  {...("externo" in enlace && enlace.externo
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="block py-3 text-sm font-medium text-carbon"
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            ))}

            <li className="mt-2 flex items-center gap-3 border-t border-filo-100 pt-4 pb-2">
              <a
                href={URL_LOGIN}
                className="flex-1 rounded-full border border-filo-200 px-4 py-2.5 text-center text-sm font-medium text-carbon"
              >
                Iniciar sesión
              </a>
              <a
                href={URL_REGISTRO}
                className="flex-1 rounded-full bg-filo-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Crear cuenta
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
