# tenemosfilo-web

Sitio público de Tenemos Filo. Sustituye al sitio en WordPress y consume la
API de `tenemosfilo-api`.

**Next.js 15** (App Router) + TypeScript + Tailwind v4. Se despliega en
Netlify. Está en la 15 y no en la 16 a propósito: el adaptador de Netlify
(`@netlify/plugin-nextjs`) se prueba contra la 15 en su línea principal, y la
16 solo aparece como fixture en beta.

```bash
npm run dev        # desarrollo
npm run build      # compilación de producción
npm run lint
npm run typecheck
```

Copia `.env.example` a `.env.local` antes de arrancar. Sin `TF_API_KEY` el
arranque falla con un mensaje que dice qué falta.

## Cómo está organizado

```
src/lib/env.ts        variables de servidor validadas (server-only)
src/lib/api/          cliente del API, esquemas zod y lecturas del catálogo
src/lib/leads.ts      envío de leads de grupos al webhook de n8n
src/app/              rutas (App Router)
src/components/       componentes; los de cliente llevan "use client"
```

## Lo que hay que saber antes de tocar

**La API key es de servidor.** `lib/env.ts` y `lib/api/*` importan
`server-only` para que el build falle si un componente de cliente los
arrastra. No la muevas a una variable `NEXT_PUBLIC_`.

**Los esquemas de `lib/api/schemas.ts` descartan campos a propósito.** El API
devuelve `totalRevenue` y los valores de comisión de cada anfitrión; al no
declararlos en zod, no llegan a los componentes ni al HTML. Antes de añadir
un campo, mira si es publicable.

**El API limita a 300 peticiones por minuto y ese límite es de todo el
sitio.** Por eso las páginas usan ISR (`export const revalidate`) en vez de
renderizarse por visitante.

**Sin cobro en línea no se ofrece reservar.** `pagosActivos()` decide, y se
comprueba también en la Server Action: ocultar el formulario no impide que
alguien envíe la petición.

**La búsqueda por texto se resuelve aquí, no en el API.** Su `?search=`
distingue acentos (`cafe` no encuentra `café`). Se filtra en el servidor
normalizando, lo que funciona porque el catálogo cabe en una petición: el
tope del API son 100 experiencias. Si crece por encima, hay que arreglarlo
en `tenemosfilo-api`.

**Se respeta `prefers-reduced-motion`** en el vídeo del banner, el titular
que se escribe y la aparición de las secciones.

## Idioma

Interfaz, comentarios y nombres de variables en español, con acentos. Los
nombres que vienen del API (`companyId`, `basePrice`, `weeklySchedule`) se
dejan como están para no perder la correspondencia con el contrato.
