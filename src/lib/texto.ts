/**
 * Normaliza texto para buscar.
 *
 * Quita acentos y pasa a minúsculas, de modo que «cafe» encuentre «Cata de
 * cafés de origen». El buscador del API distingue acentos —comprobado:
 * `?search=café` devuelve la experiencia y `?search=cafe` no devuelve nada—
 * y en Colombia se escribe sin tildes constantemente, sobre todo desde el
 * móvil. Sin esto, la mitad de las búsquedas se quedan en blanco.
 *
 * `normalize("NFD")` separa cada letra de su tilde y el rango ̀-ͯ
 * borra las tildes sueltas. La ñ sobrevive porque no es una vocal acentuada,
 * sino una letra propia.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * ¿Aparecen todas las palabras de la consulta en el texto?
 *
 * Cada palabra por separado, para que «cata cafe» afine el resultado en vez
 * de exigir esa secuencia exacta.
 */
export function coincide(consulta: string, ...campos: (string | null | undefined)[]) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;

  const donde = normalizar(campos.filter(Boolean).join(" "));

  return palabras.every((palabra) => donde.includes(palabra));
}
