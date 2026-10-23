import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * La única conexión permitida es el webhook del asistente de IA (constitución IV; spec 004 R2).
 * Sin webhook configurado, la app no se conecta a nada.
 * @param {string | undefined} urlAsistente Valor de VITE_URL_ASISTENTE_IA.
 * @returns {string} Contenido de la meta Content-Security-Policy.
 */
function crearPoliticaCsp(urlAsistente) {
  let conexiones = "'none'";
  if (urlAsistente) {
    if (!urlAsistente.startsWith("https://")) {
      throw new Error("VITE_URL_ASISTENTE_IA debe usar https://");
    }
    conexiones = new URL(urlAsistente).origin;
  }
  return `default-src 'self'; connect-src ${conexiones}; object-src 'none'; base-uri 'self'; form-action 'none'`;
}

/**
 * Inyecta la Content-Security-Policy solo en el build (R9).
 * En desarrollo no se aplica para no romper el HMR de Vite.
 * @param {string} politicaCsp
 */
function cspSoloEnBuild(politicaCsp) {
  return {
    name: "csp-solo-en-build",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: politicaCsp },
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const { VITE_URL_ASISTENTE_IA } = loadEnv(mode, process.cwd(), "VITE_");
  const politicaCsp = command === "build" ? crearPoliticaCsp(VITE_URL_ASISTENTE_IA) : "";
  return {
    plugins: [react(), tailwindcss(), cspSoloEnBuild(politicaCsp)],
    test: {
      environment: "node",
      include: ["tests/**/*.test.js"],
    },
  };
});
