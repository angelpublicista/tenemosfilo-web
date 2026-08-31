"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { reservar, type EstadoReserva } from "@/app/experiencias/[id]/acciones";
import type { Disponibilidad, Experiencia } from "@/lib/api/schemas";
import {
  franjasDelDia,
  primeraFechaDisponible,
} from "@/lib/disponibilidad";
import { formatearPrecio } from "@/lib/money";
import { calcularTotal } from "@/lib/precios";

const INICIAL: EstadoReserva = { estado: "inicial" };

export function FormularioReserva({
  experiencia,
  calendario,
}: {
  experiencia: Experiencia;
  /** Calendario de la sede. Si es null, la hora se pide a mano. */
  calendario: Disponibilidad | null;
}) {
  const [estado, accion] = useActionState(reservar, INICIAL);

  const minimo = experiencia.minCapacity ?? 1;
  const [participantes, setParticipantes] = useState(minimo);
  const [addons, setAddons] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");

  // Las franjas dependen del día elegido: cada día de la semana tiene su
  // propio horario en el calendario de la sede.
  const franjas = useMemo(
    () => franjasDelDia(calendario, fecha),
    [calendario, fecha],
  );

  const seleccionados = useMemo(
    () => experiencia.addons.filter((addon) => addons.includes(addon.name)),
    [experiencia.addons, addons],
  );

  const desglose = calcularTotal(experiencia, participantes, seleccionados);

  // Cuando el API devuelve checkout, la reserva ya existe: hay que llevar a
  // pagar sin que la persona tenga que pulsar otra cosa.
  useEffect(() => {
    if (estado.estado === "ok" && estado.urlPago) {
      window.location.href = estado.urlPago;
    }
  }, [estado]);

  if (estado.estado === "ok") {
    // El cupo no queda asegurado hasta que el pago entra, así que el mensaje
    // no puede dar la reserva por hecha: sería prometer una mesa que todavía
    // no está guardada.
    return (
      <div className="rounded-xl border border-filo-200 bg-filo-50 p-6">
        <h2 className="font-titulo text-xl text-carbon">
          Ya casi, solo falta el pago
        </h2>
        <p className="mt-2 text-sm text-carbon-suave">
          Guardamos tu lugar con el número{" "}
          <strong className="text-carbon">{estado.numeroReserva}</strong>. Tu
          cupo queda confirmado en cuanto completes el pago.
        </p>

        {estado.urlPago ? (
          <>
            <p className="mt-4 text-sm text-carbon-suave">
              Te estamos llevando a la pasarela…
            </p>
            <a
              href={estado.urlPago}
              className="mt-3 inline-block rounded-full bg-filo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-filo-600"
            >
              Ir a pagar
            </a>
          </>
        ) : (
          <p className="mt-4 text-sm text-carbon-suave">
            No pudimos abrir la pasarela de pago. Escríbenos a{" "}
            <a
              href="mailto:hola@tenemosfilo.com"
              className="text-filo-600 underline"
            >
              hola@tenemosfilo.com
            </a>{" "}
            con ese número y lo resolvemos contigo.
          </p>
        )}
      </div>
    );
  }

  // La primera fecha elegible ya respeta la antelación mínima de la sede.
  const desde = primeraFechaDisponible(calendario);

  return (
    <form
      action={accion}
      className="rounded-xl border border-filo-100 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="experienceId" value={experiencia.id} />

      <h2 className="font-titulo text-xl text-carbon">Reserva tu lugar</h2>

      {estado.estado === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {estado.mensaje}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Fecha"
          nombre="fecha"
          type="date"
          min={desde}
          value={fecha}
          onChange={(evento) => setFecha(evento.target.value)}
          required
          error={estado.estado === "error" ? estado.campos?.fecha : undefined}
        />

        <div>
          <label
            htmlFor="hora"
            className="block text-sm font-medium text-carbon"
          >
            Hora
          </label>

          {/* Sin calendario de sede no sabemos los horarios, así que se pide
              a mano y lo confirma el anfitrión. */}
          {calendario ? (
            <select
              id="hora"
              name="hora"
              required
              disabled={!fecha || franjas.length === 0}
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500 disabled:bg-crema disabled:text-carbon-suave"
            >
              <option value="" disabled>
                {!fecha ? "Elige la fecha" : "Selecciona"}
              </option>
              {franjas.map((franja) => (
                <option key={franja.inicio} value={franja.inicio}>
                  {franja.inicio} – {franja.fin}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="hora"
              name="hora"
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500"
            />
          )}

          {calendario && fecha && franjas.length === 0 && (
            <p className="mt-1 text-xs text-carbon-suave">
              Ese día no hay horarios disponibles. Prueba con otra fecha.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="participantes"
          className="block text-sm font-medium text-carbon"
        >
          Personas
        </label>
        <input
          id="participantes"
          name="participantes"
          type="number"
          min={minimo}
          max={experiencia.capacity ?? undefined}
          value={participantes}
          onChange={(evento) => setParticipantes(Number(evento.target.value))}
          required
          className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500"
        />
        {(experiencia.minCapacity || experiencia.capacity) && (
          <p className="mt-1 text-xs text-carbon-suave">
            {experiencia.minCapacity ? `Desde ${experiencia.minCapacity}` : ""}
            {experiencia.minCapacity && experiencia.capacity ? " · " : ""}
            {experiencia.capacity ? `Hasta ${experiencia.capacity}` : ""}
          </p>
        )}
      </div>

      {experiencia.addons.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-carbon">
            Extras opcionales
          </legend>

          <div className="mt-2 space-y-2">
            {experiencia.addons.map((addon) => (
              <label
                key={addon.name}
                className="flex items-start gap-3 rounded-lg border border-filo-100 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="addons"
                  value={addon.name}
                  checked={addons.includes(addon.name)}
                  onChange={(evento) =>
                    setAddons((actuales) =>
                      evento.target.checked
                        ? [...actuales, addon.name]
                        : actuales.filter((n) => n !== addon.name),
                    )
                  }
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="font-medium text-carbon">{addon.name}</span>
                  {addon.description && (
                    <span className="block text-xs text-carbon-suave">
                      {addon.description}
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap text-carbon-suave">
                  {formatearPrecio(addon.price, experiencia.currency)}
                  {addon.priceType === "per_person" && " c/u"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Nombre"
          nombre="nombre"
          autoComplete="name"
          required
          error={estado.estado === "error" ? estado.campos?.nombre : undefined}
        />
        <Campo
          etiqueta="Correo"
          nombre="email"
          type="email"
          autoComplete="email"
          required
          error={estado.estado === "error" ? estado.campos?.email : undefined}
        />
      </div>

      <div className="mt-4">
        <Campo
          etiqueta="Teléfono (opcional)"
          nombre="telefono"
          type="tel"
          autoComplete="tel"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="requerimientos"
          className="block text-sm font-medium text-carbon"
        >
          Alergias o algo que debamos saber (opcional)
        </label>
        <textarea
          id="requerimientos"
          name="requerimientos"
          rows={3}
          className="mt-1 w-full rounded-lg border border-filo-200 px-4 py-2 outline-none focus:border-filo-500"
        />
      </div>

      <dl className="mt-6 space-y-1 border-t border-filo-100 pt-4 text-sm">
        <div className="flex justify-between text-carbon-suave">
          <dt>
            {formatearPrecio(desglose.precioBase, experiencia.currency)} ×{" "}
            {participantes}
          </dt>
          <dd>{formatearPrecio(desglose.subtotal, experiencia.currency)}</dd>
        </div>

        {desglose.extras > 0 && (
          <div className="flex justify-between text-carbon-suave">
            <dt>Extras</dt>
            <dd>{formatearPrecio(desglose.extras, experiencia.currency)}</dd>
          </div>
        )}

        <div className="flex justify-between pt-2 font-titulo text-lg font-semibold text-carbon">
          <dt>Total</dt>
          <dd>{formatearPrecio(desglose.total, experiencia.currency)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-xs text-carbon-suave">
        Tenemos Filo confirma el total al procesar tu reserva.
      </p>

      <BotonEnviar />
    </form>
  );
}

function BotonEnviar() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-full rounded-full bg-filo-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-filo-600 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Reservar"}
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
