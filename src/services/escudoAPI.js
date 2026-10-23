const URL_WEBHOOK = "https://seguridad-aplicacion.app.n8n.cloud/webhook/escudo-seguridad";
const TIEMPO_MAXIMO_MS = 60000;

export async function enviarMensajeEscudo(mensaje) {
  const texto = (mensaje || "").trim();
  if (!texto) throw new Error("El mensaje no puede estar vacío.");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const res = await fetch(URL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: texto }),
      signal: controlador.signal,
    });

    if (!res.ok) throw new Error("Error del servidor: " + res.status);

    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : data;
    const respuesta = item && (item.text || item.output);
    if (!respuesta) throw new Error("El agente no devolvió respuesta.");
    return respuesta;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La respuesta tardó demasiado. Intenta de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}