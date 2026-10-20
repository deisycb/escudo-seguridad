import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", "node_modules/", "specs/", ".specify/", ".claude/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Componentes en PascalCase usados solo en JSX (también los desestructurados, como `Icono`).
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Constitución §7.2: los colores solo salen de los tokens de tailwind.config.js.
    files: ["src/components/**/*.{js,jsx}", "src/pages/**/*.{js,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...[
          "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          "Literal[value=/\\b(bg|text|border|fill|stroke|accent|divide|ring|outline)-(gray|slate|blue|red|amber|green)-\\d/]",
          "TemplateElement[value.raw=/\\b(bg|text|border|fill|stroke|accent|divide|ring|outline)-(gray|slate|blue|red|amber|green)-\\d/]",
        ].map((selector) => ({
          selector,
          message: "Usa un token de tailwind.config.js (constitución §7.2).",
        })),
      ],
    },
  },
  {
    files: ["tests/**/*.js", "scripts/**/*.mjs", "*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  prettier,
];
