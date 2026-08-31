import "server-only";

import { env } from "@/lib/env";

/**
 * Envío de leads de grupos al webhook de n8n.
 *
 * Sustituye a `POST /quotes` del API: allí los leads se guardaban en una
 * tabla que nadie mira y sin avisar a nadie. n8n se encarga ahora de
 * repartirlos (correo, CRM, lo que se monte en el flujo).
 *
 * El envío va con títulos y nombres ya resueltos, no con ids. n8n no tiene la
 * API key de Tenemos Filo, así que un id suelto no le sirve de nada: lo que
 * llegue tiene que poder leerse tal cual en un correo.
 */

export type Lead = {
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  fecha?: string;
  hora?: string;
  personas: number;
  ciudad?: string;
  notas?: string;
  experiencias: {
    id: string;
    titulo: string;
    anfitrion?: string;
  }[];
};

/** Lo que n8n recibe. Plano a propósito, para mapearlo sin pelearse. */
type Envio = Lead & {
  origen: "tenemosfilo-web";
  formulario: "grupos";
  enviadoEn: string;
};

/**
 * Manda el lead y espera confirmación.
 *
 * Se aborta a los 8 segundos: quien rellena un formulario no debería quedarse
 * mirando un botón bloqueado porque n8n esté lento. Si falla, lanza — la
 * acción que lo llama enseña un error con el correo de contacto, que es
 * preferible a dar las gracias por un lead que se ha perdido.
 */
export async function enviarLead(lead: Lead): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) {
    throw new Error(
      "Falta N8N_WEBHOOK_URL: el formulario de grupos no tiene a dónde enviar.",
    );
  }

  const cuerpo: Envio = {
    ...lead,
    origen: "tenemosfilo-web",
    formulario: "grupos",
    enviadoEn: new Date().toISOString(),
  };

  const cabeceras: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // El secreto viaja en cabecera, nunca en la URL: las URLs acaban en logs de
  // proxies y de servidores, y las cabeceras no.
  if (env.N8N_WEBHOOK_SECRET) {
    cabeceras["X-Filo-Secret"] = env.N8N_WEBHOOK_SECRET;
  }

  const respuesta = await fetch(env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify(cuerpo),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(
      `n8n respondió ${respuesta.status}: ${detalle.slice(0, 200)}`,
    );
  }
}
