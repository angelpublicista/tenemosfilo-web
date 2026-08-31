"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { cotizar, type EstadoCotizacion } from "@/app/grupos/acciones";
import { IconoBuscar } from "@/components/iconos";
import type { Experiencia } from "@/lib/api/schemas";
import { cn } from "@/lib/cn";

const INICIAL: EstadoCotizacion = { estado: "inicial" };

export function FormularioCotizacion({
  experiencias,
}: {
  experiencias: Experiencia[];
}) {
  const [estado, accion] = useActionState(cotizar, INICIAL);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");

  /**
   * Experiencias que se muestran.
   *
   * Las ya elegidas se muestran SIEMPRE, coincidan o no con la búsqueda. No
   * es un capricho de diseño: un checkbox marcado que desaparece del DOM deja
   * de enviarse con el formulario, así que filtrarlo sin más borraría en
   * silencio algo que la persona ya había elegido.
   */
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return experiencias;

    // Se busca por título, categoría y anfitrión: son las tres cosas por las
    // que alguien recuerda una experiencia.
    const palabras = texto.split(/\s+/);

    return experiencias.filter((experiencia) => {
      if (elegidas.includes(experiencia.id)) return true;

      const donde = [
        experiencia.title,
        experiencia.company?.companyName ?? "",
        ...experiencia.categories,
      ]
        .join(" ")
        .toLowerCase();

      return palabras.every((palabra) => donde.includes(palabra));
    });
  }, [experiencias, busqueda, elegidas]);

  // Agrupadas por anfitrión para que se lea de un vistazo de quién es cada
  // experiencia. Ya se pueden mezclar libremente: los leads van a n8n, que
  // no impone el límite de un solo anfitrión que sí tenía `POST /quotes`.
  const porAnfitrion = useMemo(() => {
    const grupos = new Map<string, Experiencia[]>();

    for (const experiencia of visibles) {
      const nombre = experiencia.company?.companyName ?? "Tenemos Filo";
      grupos.set(nombre, [...(grupos.get(nombre) ?? []), experiencia]);
    }

    return [...grupos.entries()];
  }, [visibles]);

  function alternar(experiencia: Experiencia, marcada: boolean) {
    setElegidas((actuales) =>
      marcada
        ? [...actuales, experiencia.id]
        : actuales.filter((id) => id !== experiencia.id),
    );
  }

  if (estado.estado === "ok") {
    return (
      <div className="rounded-xl border border-menta/30 bg-menta/5 p-8 text-center">
        <h2 className="font-titulo text-2xl text-carbon">
          Recibimos tu solicitud
        </h2>
        <p className="mt-3 text-carbon-suave">
          Te escribiremos al correo que nos dejaste con una propuesta a tu
          medida.
        </p>
      </div>
    );
  }

  const error = estado.estado === "error" ? estado : null;

  return (
    <form action={accion} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <fieldset>
        <legend className="font-titulo text-xl text-carbon">
          ¿Qué experiencias te interesan?
        </legend>
        <p className="mt-1 text-sm text-carbon-suave">
          Elige una o varias y te preparamos una propuesta a medida.
        </p>

        {error?.campos?.experiencias && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error.campos.experiencias}
          </p>
        )}

        <div className="mt-5">
          <label htmlFor="buscar-experiencia" className="sr-only">
            Buscar entre las experiencias
          </label>

          <div className="relative">
            <IconoBuscar className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-carbon-suave" />
            <input
              id="buscar-experiencia"
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Busca por nombre, tipo o anfitrión…"
              className="w-full rounded-full border border-filo-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-filo-500"
            />
          </div>

          {/* Se anuncia el resultado para quien navega con lector de
                pantalla: si no, el filtrado ocurre en silencio. */}
          <p role="status" className="mt-2 text-xs text-carbon-suave">
            {busqueda.trim() === ""
              ? `${experiencias.length} experiencias disponibles`
              : `${visibles.length} de ${experiencias.length}`}
            {elegidas.length > 0 && ` · ${elegidas.length} elegidas`}
          </p>
        </div>

        {porAnfitrion.length === 0 && (
          <p className="mt-6 text-sm text-carbon-suave">
            No encontramos experiencias con esa búsqueda.{" "}
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="text-filo-600 underline"
            >
              Ver todas
            </button>
          </p>
        )}

        {porAnfitrion.map(([anfitrion, suyas]) => (
          <div key={anfitrion} className="mt-6">
            {porAnfitrion.length > 1 && (
              <h3 className="font-titulo text-sm uppercase tracking-wide text-carbon-suave">
                {anfitrion}
              </h3>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {suyas.map((experiencia) => {
                const activa = elegidas.includes(experiencia.id);

                return (
                  <label
                    key={experiencia.id}
                    className={cn(
                      "cursor-pointer rounded-lg border p-4 text-sm transition-colors",
                      activa
                        ? "border-filo-500 bg-filo-50"
                        : "border-filo-100 hover:border-filo-300",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="experiencias"
                      value={experiencia.id}
                      checked={activa}
                      onChange={(evento) =>
                        alternar(experiencia, evento.target.checked)
                      }
                      className="sr-only"
                    />
                    <span className="font-medium text-carbon">
                      {experiencia.title}
                    </span>
                    {experiencia.categories.length > 0 && (
                      <span className="mt-1 block text-xs text-carbon-suave">
                        {experiencia.categories.slice(0, 2).join(" · ")}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>

      <div className="rounded-xl border border-filo-100 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-titulo text-xl text-carbon">Cuéntanos del grupo</h2>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error.mensaje}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <Campo
            etiqueta="Nombre"
            nombre="nombre"
            autoComplete="name"
            required
            error={error?.campos?.nombre}
          />
          <Campo
            etiqueta="Correo"
            nombre="email"
            type="email"
            autoComplete="email"
            required
            error={error?.campos?.email}
          />
          <Campo
            etiqueta="Teléfono (opcional)"
            nombre="telefono"
            type="tel"
            autoComplete="tel"
          />
          <Campo
            etiqueta="Empresa (opcional)"
            nombre="empresa"
            autoComplete="organization"
          />

          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Fecha" nombre="fecha" type="date" />
            <Campo etiqueta="Hora" nombre="hora" type="time" />
          </div>

          <Campo
            etiqueta="Personas"
            nombre="personas"
            type="number"
            min={1}
            defaultValue={10}
            required
            error={error?.campos?.personas}
          />
          <Campo etiqueta="Ciudad (opcional)" nombre="ciudad" />

          <div>
            <label
              htmlFor="notas"
              className="block text-sm font-medium text-carbon"
            >
              Cuéntanos más (opcional)
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              placeholder="La ocasión, alguna restricción alimentaria, el presupuesto…"
              className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500"
            />
          </div>
        </div>

        <BotonEnviar />
      </div>
    </form>
  );
}

function BotonEnviar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-full bg-filo-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-filo-600 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Pedir cotización"}
    </button>
  );
}

function Campo({
  etiqueta,
  nombre,
  error,
  ...resto
}: React.InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  nombre: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-carbon">
        {etiqueta}
      </label>
      <input
        id={nombre}
        name={nombre}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${nombre}-error` : undefined}
        className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500"
        {...resto}
      />
      {error && (
        <p id={`${nombre}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
