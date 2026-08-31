/**
 * Iconos lineales.
 *
 * Todos comparten la misma retícula de 24, `stroke-width` 1.75 y trazo
 * redondeado, para que juntos se lean como una familia y no como piezas
 * sueltas bajadas de sitios distintos.
 *
 * Usan `currentColor`, así que heredan el color del texto que los rodea y
 * funcionan igual sobre crema, blanco o el carbón del cierre. No llevan
 * `fill`: son de trazo, no de relleno.
 *
 * Son decorativos y van acompañados de un título escrito, así que se marcan
 * `aria-hidden`: si un lector de pantalla los anunciara, repetiría lo que ya
 * dice el encabezado.
 */

type PropsIcono = {
  className?: string;
};

function Base({
  className = "size-6",
  children,
}: PropsIcono & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Publicar: una ficha con líneas de texto y un lápiz. */
export function IconoPublicar(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      <path d="M8 8h6M8 12h4" />
      <path d="M20.5 11.5 15 17l-2.5.5.5-2.5 5.5-5.5a1.4 1.4 0 0 1 2 2Z" />
    </Base>
  );
}

/** Calendario con una franja marcada. */
export function IconoCalendario(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M7.5 14h4" />
    </Base>
  );
}

/** Cobro: un billete con una moneda. */
export function IconoCobro(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </Base>
  );
}

/** Dos comensales: la demanda que ya existe. */
export function IconoComensales(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M18 20a6 6 0 0 0-3-5.2" />
    </Base>
  );
}

/** Etiqueta de precio: sin cuota de entrada. */
export function IconoEtiqueta(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M3 12.5V5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.4.6l6.5 6.5a2 2 0 0 1 0 2.8l-7.5 7.5a2 2 0 0 1-2.8 0L3.6 13.9A2 2 0 0 1 3 12.5Z" />
      <path d="M7.5 7.5h.01" />
    </Base>
  );
}

/** Reloj: la agenda bajo control. */
export function IconoReloj(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

/** Un grupo alrededor de la mesa. */
export function IconoGrupo(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M7.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M2 18a3.5 3.5 0 0 1 3.8-3.5M22 18a3.5 3.5 0 0 0-3.8-3.5" />
    </Base>
  );
}

/** Enlace: el catálogo que se lleva a otras webs. */
export function IconoEnlace(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5L12.5 17" />
    </Base>
  );
}

/** Lupa: filtrar dentro de una lista larga. */
export function IconoBuscar(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </Base>
  );
}

/** Visto: cada punto de lo que incluye la experiencia. */
export function IconoCheck(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Base>
  );
}

/** Chincheta: dónde ocurre la experiencia. */
export function IconoUbicacion(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Base>
  );
}

/** Billete de precio, para el importe de la ficha. */
export function IconoPrecio(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-2.5-1.2" />
      <path d="M12 6.5v11" />
    </Base>
  );
}

/** Cuchillo de chef: el sello de la marca. */
export function IconoCuchillo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M3 15.5 13.5 5a4.5 4.5 0 0 1 6.4 6.3L9.5 21.7 3 15.5Z" />
      <path d="M13.5 5 9.5 21.7" />
    </Base>
  );
}
