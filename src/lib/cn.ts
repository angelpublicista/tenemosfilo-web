import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Une clases resolviendo los conflictos de Tailwind: la última gana.
 * Sin esto, `cn("p-2", "p-4")` deja las dos y el resultado depende del orden
 * en la hoja de estilos.
 */
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}
