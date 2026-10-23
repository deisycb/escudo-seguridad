// src/logic/ClienteN8n.js
const URL_WEBHOOK = import.meta.env.VITE_N8N_URL;
const TIEMPO_MAXIMO_MS = 60000; // 60 segundos

/**
 * Envía el texto libre al agente de n8n y devuelve su respuesta.
 * @param {string} mensaje Texto ya limpio de números.
 * @returns {Promise<string>}
 */
export async function enviarMensajeEscudo(mensaje) {
  const texto = (mensaje || "").trim();
  if (!texto) throw new Error("El mensaje no puede estar vacío.");
  if (!URL_WEBHOOK) throw new Error("Falta configurar VITE_N8N_URL.");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const respuesta = await fetch(URL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: texto }),
      signal: controlador.signal,
    });
    if (!respuesta.ok) throw new Error("Error del servidor: " + respuesta.status);

    const data = await respuesta.json();
    const item = Array.isArray(data) ? data[0] : data;
    const resultado = item && (item.text || item.output);
    if (!resultado) throw new Error("El agente no devolvió respuesta.");
    return resultado;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("La respuesta tardó demasiado. Intenta de nuevo.");
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}