import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Hablemos de tu próximo plan gastronómico, tu evento de empresa o de " +
    "publicar tus experiencias como anfitrión.",
};

/**
 * Contacto.
 *
 * PENDIENTE: no hay formulario porque no hay a donde mandarlo. El módulo
 * `contacts` del API es el CRM comercial (contactos de una empresa
 * anfitriona), no un buzon del sitio, y no forma parte de su superficie
 * pública.
 *
 * Para tener formulario hacen falta dos cosas, cualquiera de las dos sirve:
 * un endpoint tipo `POST /public/contact` en tenemosfilo-api, o las
 * credenciales de ZeptoMail aquí para enviar desde una Server Action. Las
 * peticiones de grupo ya tienen salida propia en /grupos, que si crea una
 * cotización de verdad.
 */

const CORREO = "hola@tenemosfilo.com";

export default function PaginaContacto() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-titulo text-3xl text-carbon sm:text-4xl">
        Hablemos
      </h1>

      <p className="mt-4 leading-relaxed text-carbon-suave">
        ¿Tienes una duda sobre una experiencia, quieres organizar algo para tu
        equipo o te gustaría compartir la tuya como anfitrión? Nos encanta que
        nos escribas.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Bloque titulo="Correo">
          <a
            href={`mailto:${CORREO}`}
            className="text-filo-600 hover:underline"
          >
            {CORREO}
          </a>
        </Bloque>

        <Bloque titulo="Instagram">
          <a
            href="https://www.instagram.com/tenemosfilo"
            target="_blank"
            rel="noreferrer"
            className="text-filo-600 hover:underline"
          >
            @tenemosfilo
          </a>
        </Bloque>
      </div>

      <div className="mt-12 rounded-xl border border-filo-100 bg-crema p-6">
        <h2 className="font-titulo text-xl text-carbon">
          ¿Es para un grupo o una empresa?
        </h2>
        <p className="mt-2 text-sm text-carbon-suave">
          Cuéntanos los detalles en el formulario de grupos y te preparamos una
          propuesta con precios.
        </p>
        <Link
          href="/grupos"
          className="mt-4 inline-block rounded-full bg-filo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-filo-600"
        >
          Pedir cotización
        </Link>
      </div>
    </div>
  );
}

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-filo-100 p-5">
      <h2 className="font-titulo text-sm uppercase tracking-wide text-carbon-suave">
        {titulo}
      </h2>
      <p className="mt-2">{children}</p>
    </div>
  );
}
