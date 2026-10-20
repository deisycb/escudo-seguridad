# Data Model — Asistente guiado de emergencia

**Fecha**: 2026-10-20 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

No hay datos persistentes. Todo es **contenido fijo** (en `src/data/emergencias.js`) o **estado en memoria** (la conversación, que se descarta al salir de la pantalla).

## Contenido fijo

Forma exacta y reglas de validación en [contracts/contenido-emergencias.md](./contracts/contenido-emergencias.md).

| Entidad | Campos | Reglas |
|---|---|---|
| **Situación** | `id`, `texto`, y **o bien** `guia` **o bien** `seguimiento` | Exactamente 7, en orden fijo (R3). `texto` no vacío. No puede tener `guia` y `seguimiento` a la vez |
| **Pregunta de seguimiento** | `pregunta`, `respuestas[]` | `pregunta` no vacía; al menos 2 respuestas |
| **Respuesta de seguimiento** | `id`, `texto`, `guia` | `id` único dentro de su pregunta; `guia` debe existir |
| **Guía** | `id`, `titulo`, `pasos[]` | `id` único; `pasos` con al menos 1 texto no vacío para publicar (vacío = contenido pendiente) |
| **Mensajes del asistente** | `saludo`, `cierreGuia`, `despedida`, `introLineasBancarias`, `introCanalesDenuncia`, `contenidoPendiente` | Textos; vacíos mientras estén pendientes |
| **Línea bancaria** | `banco`, `numero` | Sin cambios respecto a la 001 |
| **Canal de denuncia** | `entidad`, `contacto`, `enlace?` | Sin cambios respecto a la 001 |
| **Aviso "No borres nada"** | `titulo`, `texto` | Sin cambios respecto a la 001 |

Relaciones: Situación —(0..1)→ Pregunta de seguimiento —(2..n)→ Respuesta; Situación o Respuesta —(1)→ Guía. Varias situaciones o respuestas pueden apuntar a la misma guía.

## Estado en memoria: `ConversacionEmergencia`

API en [contracts/logica-conversacion.md](./contracts/logica-conversacion.md).

| Campo (privado) | Tipo | Significado |
|---|---|---|
| `mensajes` | `Mensaje[]` | Historial que se dibuja, en orden |
| `opciones` | `Opcion[]` | Opciones pendientes (las únicas que se pueden elegir) |
| `posicion` | `Posicion` | Dónde va el flujo |

**Mensaje** (lo que dibuja la pantalla):

| `tipo` | Autor | Campos extra |
|---|---|---|
| `texto` | asistente | `texto` |
| `paso` | asistente | `texto`, `numero` (N), `total` (M) |
| `lineasBancarias` | asistente | `texto` (introducción), `lineas[]` |
| `canalesDenuncia` | asistente | `texto` (introducción), `canales[]` |
| `eleccion` | persona | `texto` (texto exacto del botón o acción rápida) |

Todos llevan `id` (contador creciente, sirve de `key` en React) y `autor` (`"asistente"` | `"persona"`).

**Opcion**: `{ id, texto }`. Ids posibles: `situacion:<id>`, `respuesta:<id>`, `siguiente`, `denunciar`, `otraCosa`, `terminar`.

**Posicion**:

| `etapa` | Datos | Opciones pendientes |
|---|---|---|
| `situaciones` | — | las 7 situaciones |
| `seguimiento` | `situacionId` | respuestas de esa situación |
| `paso` | `guiaId`, `numero` | `siguiente` ("Listo, ¿qué sigue?") |
| `cierre` | — | `denunciar`, `otraCosa`, `terminar` |
| `cierreTrasDenuncia` | — | `otraCosa`, `terminar` |
| `terminada` | — | ninguna |

## Transiciones

```text
inicio ──► situaciones ──situación con seguimiento──► seguimiento ──respuesta──► paso 1
                │                                                                   ▲
                └──situación directa────────────────────────────────────────────────┘
paso N ──siguiente (N < M)──► paso N+1
paso M ──siguiente──► cierre
cierre ──denunciar──► cierreTrasDenuncia      (agrega mensaje canalesDenuncia)
cierre | cierreTrasDenuncia ──otraCosa──► situaciones   (conserva el historial)
cierre | cierreTrasDenuncia ──terminar──► terminada     (agrega despedida)

cualquier etapa ──mostrarLineasBancarias / mostrarCanalesDenuncia──► misma etapa
     (agrega elección + mensaje con la información; las opciones pendientes no cambian)
cualquier etapa ──reiniciar──► situaciones con historial vacío (solo saludo)
```

**Progreso**: la conversación "tiene progreso" en cuanto existe algún mensaje de la persona (elección o acción rápida). Con progreso, salir de la pantalla y "Empezar de nuevo" piden confirmación (spec FR-018, FR-031). Esa confirmación es estado de la pantalla, no de la clase.

Cada elección válida agrega primero un mensaje `eleccion` de la persona y después los mensajes del asistente. Un id que no está entre las opciones pendientes no cambia nada (devuelve la misma instancia). Una guía sin pasos lleva directamente al mensaje de contenido pendiente y a la etapa `cierre`.
