import "server-only";

import { z } from "zod";

/**
 * Variables de entorno del servidor.
 *
 * El import de "server-only" es la barrera real: si algún componente de
 * cliente importa este módulo (aunque sea por una cadena de imports larga),
 * el build falla en vez de mandar la API key al navegador.
 *
 * La doc del API es explicita: la key es una credencial de servidor y quien
 * la tenga puede reservar a nombre de la empresa. Por eso no lleva el prefijo
 * NEXT_PUBLIC_ y nunca debe llevarlo.
 */
const esquema = z.object({
  TF_API_URL: z.string().url().default("https://api.tenemosfilo.com"),

  // Empieza por `tf_live_`. Se emite desde el panel del API y solo se muestra
  // una vez: si se pierde, hay que revocarla y emitir otra.
  TF_API_KEY: z.string().min(1, "Falta TF_API_KEY"),

  // Webhook de n8n al que van los leads del formulario de grupos.
  //
  // Es opcional en el esquema para que el sitio arranque sin él (el resto de
  // páginas no lo necesitan), pero sin esta variable el formulario de grupos
  // no puede enviar y avisa del fallo en vez de fingir que lo recibió.
  N8N_WEBHOOK_URL: z.string().url().optional(),

  // Secreto compartido con n8n. El flujo debe rechazar lo que no traiga esta
  // cabecera; si no, cualquiera que descubra la URL puede inyectar leads.
  N8N_WEBHOOK_SECRET: z.string().min(1).optional(),
});

/**
 * Una variable declarada pero vacía cuenta como ausente.
 *
 * Pasa constantemente: en el panel de Netlify se crea la variable antes de
 * tener el valor, y llega como cadena vacía. Sin esto, `""` no supera la
 * validación de URL y tumba el build entero por una variable opcional.
 */
const opcional = (valor: string | undefined) =>
  valor && valor.trim() !== "" ? valor : undefined;

const resultado = esquema.safeParse({
  TF_API_URL: opcional(process.env.TF_API_URL),
  TF_API_KEY: process.env.TF_API_KEY,
  N8N_WEBHOOK_URL: opcional(process.env.N8N_WEBHOOK_URL),
  N8N_WEBHOOK_SECRET: opcional(process.env.N8N_WEBHOOK_SECRET),
});

if (!resultado.success) {
  const detalle = resultado.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  throw new Error(
    `Configuración de entorno invalida:\n${detalle}\n\n` +
      `Copia .env.example a .env.local y completa los valores. En Netlify se ` +
      `configuran en Site settings > Environment variables.`,
  );
}

export const env = resultado.data;
