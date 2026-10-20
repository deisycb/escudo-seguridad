# Contrato: webhook de eco

Es el mismo contrato de [../../004-asistente-ia-emergencia/contracts/webhook.md](../../004-asistente-ia-emergencia/contracts/webhook.md): la petición y la forma en que la web app interpreta las respuestas no cambian. Este documento fija solo lo propio del eco.

## Petición

Sin cambios: `POST {VITE_URL_ASISTENTE_IA}` con `{ "mensajes": [ { "rol", "texto" }, … ] }` y nada más.

## Respuestas del eco

| Estado | Cuerpo | Interpretación en la web app |
|---|---|---|
| 200 | `{ "respuesta": "Eco: hola" }` | `{ ok: true, texto: "Eco: hola" }` |
| 400 | `{ "error": "peticion_invalida" }` | `motivo: "red"` |
| 429 | `{ "error": "limite" }` | `motivo: "limite"` |
| sin respuesta en 20 s, red o CORS | — | `motivo: "tiempo"` o `"red"` |

## Ejemplos

| Petición | Respuesta |
|---|---|
| `{ "mensajes": [ { "rol": "persona", "texto": "hola" } ] }` | `200 { "respuesta": "Eco: hola" }` |
| `{ "mensajes": [ {persona "hola"}, {asistente "Eco: hola"}, {persona "otra vez"} ] }` | `200 { "respuesta": "Eco: otra vez" }` |
| `{ "mensajes": [] }` | `400` |
| `{ "mensajes": [ … ], "id": "abc" }` | `400` (campo extra) |
| `{ "mensajes": [ { "rol": "sistema", "texto": "x" } ] }` | `400` |
| último mensaje con `rol: "asistente"` | `400` |
| petición número 31 dentro del mismo minuto | `429` |

## CORS

`Access-Control-Allow-Origin` solo para `http://localhost:5173` en esta etapa. El dominio de Netlify se agrega en la historia de despliegue.
