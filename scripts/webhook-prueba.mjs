// SOLO DESARROLLO. No se publica ni se incluye en el build (spec 004, T002 y T020).
// Simula el webhook de n8n del asistente de IA según specs/004-asistente-ia-emergencia/contracts/webhook.md.
// Uso: npm run webhook:prueba  y en otra terminal  VITE_URL_ASISTENTE_IA=http://localhost:8787 npm run dev
// Para simular fallos, apunta la variable a http://localhost:8787/?modo=429|500|lento|invalida
import { createServer } from "node:http";

const PUERTO = 8787;
const ORIGENES = ["http://localhost:5173", "http://localhost:5179"];
const ESPERA_LENTA_MS = 25000;

function encabezadosCors(origen) {
  const permitido = ORIGENES.includes(origen) ? origen : ORIGENES[0];
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function responder(res, estado, cuerpo, cors) {
  res.writeHead(estado, { "Content-Type": "application/json", ...cors });
  res.end(JSON.stringify(cuerpo));
}

async function leerCuerpo(req) {
  let datos = "";
  for await (const parte of req) datos += parte;
  return JSON.parse(datos || "{}");
}

createServer(async (req, res) => {
  const cors = encabezadosCors(req.headers.origin);
  if (req.method === "OPTIONS") return responder(res, 204, {}, cors);
  if (req.method !== "POST") return responder(res, 405, {}, cors);
  const modo = new URL(req.url, `http://localhost:${PUERTO}`).searchParams.get("modo");
  if (modo === "429") return responder(res, 429, {}, cors);
  if (modo === "500") return responder(res, 500, {}, cors);
  if (modo === "invalida") return responder(res, 200, { otra: "cosa" }, cors);
  if (modo === "lento") await new Promise((listo) => setTimeout(listo, ESPERA_LENTA_MS));
  const { mensajes = [] } = await leerCuerpo(req).catch(() => ({}));
  // No se registra el contenido de los mensajes (spec 004 FR-015).
  const texto = `Respuesta de prueba: recibí ${mensajes.length} mensajes.\nNo compartas claves ni códigos con nadie.`;
  return responder(res, 200, { respuesta: texto }, cors);
}).listen(PUERTO, () => console.log(`Webhook de prueba en http://localhost:${PUERTO}`));
