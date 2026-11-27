import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored agent tooling and generated output
    ".claude/**",
    ".playwright/**",
    "graphify-out/**",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    rules: {
      // Ponytail: no loose types; prefer unknown + narrow at trust boundaries
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Vendored shadcn-registry code (Bklit, Kokonut): these React Compiler rules flag its
    // ref-in-render and self-scheduling rAF patterns, which are intentional upstream. We keep
    // the files close to upstream so `shadcn add --overwrite` stays reviewable.
    files: ["components/charts/**", "components/kokonutui/**"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
