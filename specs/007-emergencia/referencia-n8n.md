# Código de conexión entregado por n8n (referencia)

Original de n8n. No se copia tal cual: la URL va en `VITE_N8N_URL` y se convierte en la clase
`ClienteN8n` (spec 007, FR-023 y FR-024).

```js
// Conexión con el webhook de n8n (Escudo Emergencias)
const URL_WEBHOOK = "<VITE_N8N_URL>"; // la URL real no se escribe en el repositorio
const TIEMPO_MAXIMO_MS = 60000; // 60 segundos

async function enviarMensajeEscudo(mensaje) {
  const texto = (mensaje || "").trim();
  if (!texto) throw new Error("El mensaje no puede estar vacío.");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const respuesta = await fetch(URL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: texto }),
      signal: controlador.signal
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
```
