import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const POLITICA_CSP =
  "default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";

/**
 * Inyecta la Content-Security-Policy solo en el build (R9).
 * En desarrollo no se aplica para no romper el HMR de Vite.
 */
function cspSoloEnBuild() {
  return {
    name: "csp-solo-en-build",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: POLITICA_CSP },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cspSoloEnBuild()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
