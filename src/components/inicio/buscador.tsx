"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconoBuscar } from "@/components/iconos";

/**
 * Buscador general del catálogo.
 *
 * Es un formulario de verdad, con `action` a /experiencias y `method="get"`:
 * si el JavaScript no llega a cargar, el navegador envía el formulario por su
 * cuenta y la búsqueda funciona igual. El `onSubmit` solo está para navegar
 * sin recargar la página cuando sí hay JS.
 *
 * La búsqueda se resuelve en /experiencias, que ya tiene los filtros y la
 * paginación. Aquí no se duplica nada: esto es la puerta de entrada.
 */
export function Buscador({
  className = "",
  autoFocus = false,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");

  return (
    <form
      action="/experiencias"
      method="get"
      onSubmit={(evento) => {
        evento.preventDefault();

        const consulta = texto.trim();
        router.push(
          consulta
            ? `/experiencias?search=${encodeURIComponent(consulta)}`
            : "/experiencias",
        );
      }}
      role="search"
      className={`flex w-full items-center gap-2 rounded-full bg-white p-2 shadow-lg ${className}`}
    >
      <label htmlFor="buscador-general" className="sr-only">
        Buscar experiencias
      </label>

      <IconoBuscar
        aria-hidden
        className="ml-3 size-5 shrink-0 text-carbon-suave"
      />

      <input
        id="buscador-general"
        // `name` tiene que coincidir con el parámetro que lee /experiencias,
        // porque es lo que enviará el navegador si el JS no está.
        name="search"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        autoFocus={autoFocus}
        placeholder="¿Una cata, una clase, un recorrido?"
        className="min-w-0 flex-1 bg-transparent py-2 text-carbon outline-none placeholder:text-carbon-suave"
      />

      <button
        type="submit"
        className="shrink-0 rounded-full bg-filo-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-filo-600"
      >
        Buscar
      </button>
    </form>
  );
}
