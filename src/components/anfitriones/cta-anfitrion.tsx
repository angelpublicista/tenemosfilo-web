import { URL_REGISTRO_ANFITRION } from "@/lib/sitio";
import { cn } from "@/lib/cn";

/**
 * El botón de conversión de la landing de anfitriones.
 *
 * Se repite a lo largo de la página porque quien decide al leer el "como
 * funciona" no debería tener que buscar el botón. Todos llevan al mismo
 * registro; lo que cambia es el parámetro `origen`, que llega como UTM y
 * permite saber que sección convierte de verdad antes de tocar el copy.
 *
 * Es un enlace, no un botón con JavaScript: se puede abrir en otra pestaña y
 * funciona aunque el JS no cargue.
 */
export function CtaAnfitrion({
  origen,
  oscuro = false,
}: {
  /** Seccion desde la que se pulsa. Viaja como utm_content. */
  origen: string;
  /** Para el bloque final, que va sobre fondo oscuro. */
  oscuro?: boolean;
}) {
  const destino = new URL(URL_REGISTRO_ANFITRION);
  destino.searchParams.set("utm_source", "tenemosfilo-web");
  destino.searchParams.set("utm_medium", "landing");
  destino.searchParams.set("utm_campaign", "anfitriones");
  destino.searchParams.set("utm_content", origen);

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <a
        href={destino.toString()}
        className={cn(
          "rounded-full px-8 py-4 font-semibold transition-colors",
          oscuro
            ? "bg-white text-carbon hover:bg-filo-50"
            : "bg-filo-500 text-white hover:bg-filo-600",
        )}
      >
        Quiero ser anfitrión
      </a>

      <a
        href="/contacto"
        className={cn(
          "rounded-full border px-8 py-4 font-semibold transition-colors",
          oscuro
            ? "border-white/40 text-white hover:bg-white/10"
            : "border-filo-500 text-filo-600 hover:bg-filo-50",
        )}
      >
        Tengo una duda
      </a>
    </div>
  );
}
