"use client";

import { useEffect, useState } from "react";

/**
 * Vídeo de fondo del banner de la portada.
 *
 * Se monta después de la hidratación, no en el HTML inicial, por dos razones:
 *
 * 1. Son 5,4 MB. Si estuviera en el marcado, competiría por ancho de banda
 *    con la fuente y el CSS justo cuando se está pintando el titular, que es
 *    lo que de verdad hay que leer rápido.
 *
 * 2. Permite consultar `prefers-reduced-motion` antes de cargarlo. Quien pide
 *    menos animación no ve el vídeo y se queda con el fondo fijo: no es solo
 *    una preferencia estética, hay personas a las que el movimiento en bucle
 *    les provoca mareo.
 *
 * Un vídeo decorativo no debe anunciarse a un lector de pantalla, de ahí el
 * `aria-hidden`. Y sin `muted` + `playsInline` los navegadores móviles no
 * reproducen solos: abrirían el vídeo a pantalla completa.
 */
export function VideoFondo() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (consulta.matches) return;

    setMostrar(true);
  }, []);

  if (!mostrar) return null;

  return (
    <video
      // La clave fuerza a React a montar el elemento una sola vez.
      key="banner"
      autoPlay
      muted
      loop
      playsInline
      // Este componente ya se monta tarde a propósito, así que aquí la
      // descarga sí debe empezar de inmediato: con "none" el autoplay se
      // quedaría esperando datos que nadie pide.
      preload="auto"
      aria-hidden
      tabIndex={-1}
      className="absolute inset-0 -z-20 size-full object-cover motion-safe:animate-[aparecer_1.2s_ease-out]"
    >
      <source src="/video/banner-home.mp4" type="video/mp4" />
    </video>
  );
}
