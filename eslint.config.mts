// eslint.config.mts
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1) Pastas/arquivos que não queremos lintar
  { ignores: ["node_modules/**", "dist/**", "coverage/**"] },

  // 2) Base recomendada do typescript-eslint (parser + regras TS)
  ...tseslint.configs.recommended,

  // 3) Regras/ambiente para arquivos TypeScript
  {
    files: ["**/*.{ts,cts,mts}"],
    languageOptions: {
      // Backend: globais do Node; não queremos 'window', 'document', etc.
      globals: globals.node,
      // Seu projeto está em CommonJS (tsconfig module=commonjs)
      parserOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    },
    rules: {
      // Parâmetros iniciados por "_" são intencionais (ex.: _req, _next)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // (Opcional) Se quiser apenas aviso para any explícito, troque para "warn"
      // "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // 4) Regras/ambiente para JS (se tiver algum arquivo .js)
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    },
  },
]);
