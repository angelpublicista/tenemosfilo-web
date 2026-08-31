"use client";

import { useEffect } from "react";

/**
 * Pantalla de error del sitio.
 *
 * Next no manda el mensaje real al navegador en produccion (llega como
 * "an error occurred in the Server Components render" con un digest), así que
 * aquí solo se muestra el aviso generico y el digest, que es lo que sirve
 * para cruzar con los logs de la función en Netlify.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tenemos-filo-web]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-titulo text-3xl text-carbon">
        Se nos quemó algo en la cocina
      </h1>

      <p className="mt-3 text-carbon-suave">
        No pudimos cargar esta página. Danos un momento y vuelve a
        intentarlo.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-filo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-filo-600"
      >
        Reintentar
      </button>

      {error.digest && (
        <p className="mt-6 text-xs text-carbon-suave">
          Referencia: {error.digest}
        </p>
      )}
    </div>
  );
}
