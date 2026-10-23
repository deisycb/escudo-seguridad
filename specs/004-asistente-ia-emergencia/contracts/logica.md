# Contrato: lógica nueva y ampliada (`/src/logic`)

JSDoc obligatorio en cada función y método público; pruebas Vitest para todo (constitución V).

## `FiltroDatosSensibles.js`

```js
export const LIMITES_TARJETA = { minimo: 13, maximo: 19 };
export const LIMITES_CODIGO = { minimo: 4, maximo: 8 };

/** @returns {null | { tipo: "tarjeta" | "codigo", fragmento: string, inicio: number, fin: number }} */
export function detectarDatoSensible(texto)
```

| Entrada | Resultado |
|---|---|
| `"mi tarjeta 4111 1111 1111 1111"` | `tarjeta` |
| `"4111-1111-1111-1111"` / `"4111111111111111"` | `tarjeta` |
| `"cuenta 0123456789012"` (13 dígitos) | `tarjeta` |
| `"me llegó el 482913"` / `"código 1234"` | `codigo` |
| `"me robaron 500000"` | `codigo` (se bloquea; la explicación sugiere "500 mil") |
| `"me robaron 500.000"` / `"500 mil"` | `null` |
| `"mi celular 3001234567"` (10 dígitos) | `null` |
| `"el 20 de octubre"` / `"123"` | `null` |
| tarjeta y código en el mismo texto | `tarjeta` (más grave primero) |

## `AsistenteIA.js`

```js
export const TIEMPO_ESPERA_MS = 20000;
export const MAXIMO_CARACTERES_MENSAJE = 1000;
export const MAXIMO_CARACTERES_RESPUESTA = 4000;
export const MAXIMO_MENSAJES_ENVIADOS = 20;
export const TEXTOS_IA = { /* etiquetas, avisos, bloqueos, fallos, "Ver guías", "Prefiero escribirlo", … */ };

export class AsistenteIA {
  /** @param {{ url: string, fetch?: typeof fetch, tiempoEsperaMs?: number }} opciones */
  constructor(opciones)
  /** @param {{ rol: string, texto: string }[]} intercambio @returns {Promise<{ ok: true, texto: string } | { ok: false, motivo: "tiempo"|"red"|"invalida"|"limite" }>} */
  responder(intercambio)   // nunca lanza; recorta a los últimos 20 mensajes
}

/** @returns {boolean} si la escritura está disponible (URL https configurada). */
export function escrituraConfigurada(url)
```

## `ConversacionEmergencia.js` (ampliación de la spec 003)

```js
static iniciarEscritura(contenido)        // etapa "escritura", sin mensajes
agregarMensajeEscrito(texto)              // solo en escritura/falloIA; si no, devuelve this
agregarRespuestaIA(texto)                 // solo en esperandoIA
agregarFalloIA(motivo)                    // solo en esperandoIA; agrega opción verGuias
abrirGuias()                              // saludo + 7 situaciones, sin borrar
volverAEscribir()                         // etapa escritura, sin opciones, sin borrar
estaEsperandoIA(): boolean
obtenerIntercambioIA(): { rol, texto }[]  // solo escrito y respuestaIA
// elegir("verGuias") ≡ abrirGuias() con la elección registrada
// reiniciar() vuelve al modo inicial (escritura o guías)
```

Las reglas de la 003 ([../../003-rediseno-emergencia-agente/contracts/logica-conversacion.md](../../003-rediseno-emergencia-agente/contracts/logica-conversacion.md)) siguen valiendo; sus pruebas no cambian.
