"use client";

import { useEffect, useState } from "react";

/**
 * Titular que se escribe solo, como el del sitio en WordPress que este
 * reemplaza (allí lo hacía Typed.js con typeSpeed 80 y backDelay 4000).
 *
 * Aquí va a mano en vez de con la librería: son treinta líneas, evita 10 kB
 * de JavaScript y permite dos cosas que Typed.js no da de serie.
 *
 * 1. La primera frase se renderiza en el servidor, ya escrita. El titular es
 *    el h1 de la portada: si solo existiera después de que corra el JS, un
 *    buscador podría indexar un encabezado vacío.
 *
 * 2. El texto que cambia lleva `aria-hidden` y al lado va una versión
 *    completa solo para lectores de pantalla. Sin eso, un lector iría
 *    anunciando el titular letra a letra.
 */

const ESCRIBIR = 80;
const BORRAR = 40;
/** Lo que se queda quieta la frase completa antes de borrarse. */
const PAUSA_LEIDA = 2400;
const PAUSA_VACIA = 400;

export function TituloAnimado({ frases }: { frases: string[] }) {
  const [texto, setTexto] = useState(frases[0]);
  const [animar, setAnimar] = useState(false);

  // El bucle solo arranca tras la hidratación, y nunca si se ha pedido menos
  // movimiento: en ese caso el titular se queda con la primera frase.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimar(true);
  }, []);

  useEffect(() => {
    if (!animar) return;

    let indice = 0;
    let letras = frases[0].length;
    let borrando = false;
    let temporizador: ReturnType<typeof setTimeout>;

    function paso() {
      const frase = frases[indice];

      if (!borrando && letras === frase.length) {
        borrando = true;
        temporizador = setTimeout(paso, PAUSA_LEIDA);
        return;
      }

      if (borrando && letras === 0) {
        borrando = false;
        indice = (indice + 1) % frases.length;
        temporizador = setTimeout(paso, PAUSA_VACIA);
        return;
      }

      letras += borrando ? -1 : 1;
      setTexto(frases[indice].slice(0, letras));
      temporizador = setTimeout(paso, borrando ? BORRAR : ESCRIBIR);
    }

    temporizador = setTimeout(paso, PAUSA_LEIDA);

    return () => clearTimeout(temporizador);
  }, [animar, frases]);

  return (
    <>
      {/* Lo que oye un lector de pantalla: la lista entera, de una vez. */}
      <span className="sr-only">{frases.join(", ")}.</span>

      <span aria-hidden className="text-filo-400">
        {texto}
        {animar && (
          <span className="ml-0.5 inline-block w-[0.06em] animate-parpadeo bg-filo-400 align-[-0.05em] [height:0.9em]" />
        )}
      </span>
    </>
  );
}
