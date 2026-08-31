import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 se publica en el formato antiguo, asi que se adapta
// con FlatCompat. Al subir a Next 16 esto se puede sustituir por los imports
// directos de "eslint-config-next/core-web-vitals".
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
