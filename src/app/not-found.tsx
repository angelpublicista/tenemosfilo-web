import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-titulo text-5xl text-filo-500">404</p>

      <h1 className="mt-4 font-titulo text-3xl text-carbon">
        Esta página no está en el menú
      </h1>

      <p className="mt-3 text-carbon-suave">
        Puede que la experiencia ya no esté disponible o que el enlace tenga
        algún error. Te dejamos el camino de vuelta a la mesa.
      </p>

      <Link
        href="/experiencias"
        className="mt-8 inline-block rounded-full bg-filo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-filo-600"
      >
        Ver experiencias
      </Link>
    </div>
  );
}
