import type { MetadataRoute } from "next";

import { SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  // Las previews de rama no deben indexarse: competirian con el dominio real
  // por el mismo contenido.
  if (!SITIO.esProduccion) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
