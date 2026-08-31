import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imagenes de las experiencias las sube el API a S3, y opcionalmente
    // se sirven por CloudFront (S3_PUBLIC_URL_BASE en el API).
    //
    // PENDIENTE: acotar al bucket y distribucion reales en cuanto veamos una
    // URL de produccion. Un patron con comodin de host acepta cualquier
    // bucket de S3, que es mas de lo que necesitamos.
    remotePatterns: [
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },

  // El sitio se sirve tras el proxy de Netlify; no hace falta anunciar el
  // servidor.
  poweredByHeader: false,
};

export default nextConfig;
