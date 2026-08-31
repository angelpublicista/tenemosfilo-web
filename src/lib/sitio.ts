/**
 * Datos del sitio que si viajan al navegador.
 *
 * Aquí solo entra lo público. Todo lo que toque la API key vive en
 * `lib/env.ts`, que es server-only.
 */

const url =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://tenemosfilo.com";

export const SITIO = {
  url,
  esProduccion: url === "https://tenemosfilo.com",

  /** El blog vive en WordPress, en su propio subdominio. */
  blog: process.env.NEXT_PUBLIC_BLOG_URL ?? "https://blog.tenemosfilo.com",

  /**
   * El panel de anfitriones (tenemos-filo-front). Ahi viven el registro y la
   * gestion de experiencias: este sitio solo lleva trafico hasta su puerta.
   */
  panel: process.env.NEXT_PUBLIC_PANEL_URL ?? "https://app.tenemosfilo.com",
} as const;

/**
 * Accesos al panel.
 *
 * El registro del panel ofrece dos tipos de cuenta —anfitrión y comensal— y
 * acepta `?type=host` para dejar elegida la primera. Por eso hay dos enlaces
 * distintos: quien llega desde /anfitriones ya ha dicho a qué viene y no
 * tiene por qué volver a elegir, mientras que desde la cabecera lo normal es
 * que sea alguien que quiere reservar.
 */
export const URL_LOGIN = `${SITIO.panel}/login`;

/** Alta genérica: la persona elige si es comensal o anfitrión. */
export const URL_REGISTRO = `${SITIO.panel}/register`;

/** Alta con el tipo «anfitrión» ya elegido. Destino de los CTA de /anfitriones. */
export const URL_REGISTRO_ANFITRION = `${SITIO.panel}/register?type=host`;

export const NAVEGACION = [
  { href: "/experiencias", etiqueta: "Experiencias" },
  { href: "/grupos", etiqueta: "Experiencias para grupos" },
  { href: "/anfitriones", etiqueta: "Anfitriones" },
  { href: "/contacto", etiqueta: "Contacto" },
  // Sale del sitio: es WordPress y se despliega aparte.
  { href: SITIO.blog, etiqueta: "Blog", externo: true },
] as const;
