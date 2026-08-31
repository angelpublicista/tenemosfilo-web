import type { MetadataRoute } from "next";

import { listarExperiencias } from "@/lib/api/experiences";
import { SITIO } from "@/lib/sitio";

// El sitemap se regenera con el resto del catálogo.
export const revalidate = 3600;

const FIJAS = ["", "/experiencias", "/grupos", "/anfitriones", "/contacto"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = FIJAS.map((ruta) => ({
    url: `${SITIO.url}${ruta}`,
    changeFrequency: "weekly",
    priority: ruta === "" ? 1 : 0.8,
  }));

  try {
    const { experiencias } = await listarExperiencias({ limit: 100 });

    return [
      ...estaticas,
      ...experiencias.map((experiencia) => ({
        url: `${SITIO.url}/experiencias/${experiencia.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    // Si el API no responde, es mejor publicar el sitemap con las rutas fijas
    // que devolver un 500 y quedarnos sin sitemap ninguno.
    console.error("[sitemap]", error);
    return estaticas;
  }
}
