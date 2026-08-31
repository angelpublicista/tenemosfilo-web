import Image from "next/image";

/**
 * El logo de la marca.
 *
 * Hay dos archivos, los dos con fondo transparente, porque el logo es de una
 * sola tinta y no se puede recolorear por CSS: el naranja para fondos claros
 * y el blanco para el carbón del cierre de /anfitriones. Recortar el naranja
 * sobre oscuro se leería mal, de ahí las dos versiones.
 *
 * El original mide 797x678, así que la proporción se respeta al escalar.
 * Como el logo ya dice «Tenemos Filo», el texto va en el `alt` y no repetido
 * al lado.
 */

const ANCHO = 797;
const ALTO = 678;

export function Logo({
  className = "h-16",
  variante = "naranja",
  prioridad = false,
}: {
  /**
   * Altura como clase de Tailwind (`h-16`, `h-14 sm:h-16`…). Se usa clase y
   * no un número para poder dar una altura en móvil y otra en escritorio.
   * El ancho va siempre en `auto` para no deformar el logo.
   */
  className?: string;
  variante?: "naranja" | "blanco";
  /** Solo en el encabezado, que está en la primera pantalla. */
  prioridad?: boolean;
}) {
  return (
    <Image
      src={variante === "blanco" ? "/logo-filo-blanco.png" : "/logo-filo.png"}
      alt="Tenemos Filo"
      width={ANCHO}
      height={ALTO}
      priority={prioridad}
      className={`w-auto select-none ${className}`}
    />
  );
}
