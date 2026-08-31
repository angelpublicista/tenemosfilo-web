"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Envuelve un bloque para que entre con un fundido al llegar a la pantalla.
 *
 * El contenido está siempre en el HTML: esto solo cambia opacidad y posición.
 * Si el JavaScript no llega a ejecutarse, el bloque se ve igual, sin animar
 * — por eso el estado inicial en el servidor es «visible» y el observador
 * solo lo esconde después de montar, cuando ya sabe que puede devolverlo.
 *
 * Con `prefers-reduced-motion` no se anima nada en absoluto.
 */
export function Aparece({
  children,
  className,
  retraso = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Milisegundos de retraso, para escalonar varios bloques seguidos. */
  retraso?: number;
}) {
  const referencia = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodo = referencia.current;
    if (!nodo) return;

    // Si el bloque ya está en pantalla al cargar (el primero de la página),
    // no tiene sentido esconderlo para volver a mostrarlo: se quedaría
    // parpadeando.
    const rect = nodo.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) return;

    setAnimar(true);
    setVisible(false);

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisible(true);
        observador.disconnect();
      },
      // Se dispara un poco antes de que el borde entre, para que el fundido
      // termine justo cuando el bloque queda a la vista.
      { rootMargin: "0px 0px -12% 0px" },
    );

    observador.observe(nodo);

    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={referencia}
      style={animar && retraso ? { transitionDelay: `${retraso}ms` } : undefined}
      className={cn(
        animar && "transition-[opacity,transform] duration-700 ease-out",
        animar && !visible && "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
