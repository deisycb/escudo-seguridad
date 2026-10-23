# Data Model — Escritura libre con asistente de IA

**Fecha**: 2026-10-20 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

No hay datos persistentes: ni en el navegador ni en n8n (FR-015). Todo vive en memoria mientras Emergencia está abierta.

## Contenido fijo nuevo: `src/data/asistenteIA.js`

| Export | Campos | Reglas |
|---|---|---|
| `CONSENTIMIENTO_IA` | `titulo`, `parrafos[]` | PENDIENTE del equipo; debe explicar lo de FR-004 (n8n, proveedor posiblemente fuera de Colombia, no se guarda, para qué se usa, alternativa de las guías) |

Los textos fijos de interfaz de la spec (avisos, etiquetas, mensajes de fallo y de bloqueo) van como constantes `TEXTOS_IA` en `src/logic/AsistenteIA.js`, igual que `TEXTOS_ASISTENTE` en la 003.

## Ampliación de `ConversacionEmergencia` (spec 003)

**Mensajes nuevos** (además de los de [../003-rediseno-emergencia-agente/data-model.md](../003-rediseno-emergencia-agente/data-model.md)):

| `tipo` | Autor | Campos | Se envía a la IA |
|---|---|---|---|
| `escrito` | persona | `texto` (1–1.000 caracteres, ya filtrado) | Sí, como `{ rol: "persona", texto }` |
| `respuestaIA` | asistente | `texto` (1–4.000 caracteres) | Sí, como `{ rol: "asistente", texto }` |
| `esperandoIA` | asistente | `texto` "El asistente está respondiendo…" | No (temporal; se reemplaza) |
| `falloIA` | asistente | `texto` (mensaje amable según `motivo`), `motivo` | No |

Los mensajes de la 003 (`texto`, `paso`, `eleccion`, `lineasBancarias`, `canalesDenuncia`) **nunca** se envían (FR-009).

**Etapas nuevas**:

| `etapa` | Opciones pendientes | Se puede escribir |
|---|---|---|
| `escritura` | ninguna | Sí (si hay consentimiento y no se espera respuesta) |
| `esperandoIA` | ninguna | No |
| `falloIA` | `[verGuias]` ("Ver guías") | Sí |

**Modo inicial** (`#modoInicial`): `"escritura"` o `"guias"`; `reiniciar()` vuelve a él.

## Transiciones

```text
iniciarEscritura ──► escritura
escritura ──agregarMensajeEscrito(t)──► esperandoIA   (+ escrito, + esperandoIA)
esperandoIA ──agregarRespuestaIA(t)──► escritura      (esperandoIA se reemplaza por respuestaIA)
esperandoIA ──agregarFalloIA(motivo)──► falloIA        (esperandoIA se reemplaza por falloIA)
falloIA ──agregarMensajeEscrito(t)──► esperandoIA      (reintento)
escritura | falloIA ──abrirGuias() o elegir("verGuias")──► situaciones (spec 003; + saludo y 7 opciones)
cualquier etapa de la 003 ──volverAEscribir()──► escritura (sin borrar)
cualquier etapa ──reiniciar()──► modo inicial, sin mensajes
```

`tieneProgreso()` sigue igual: verdadero si hay algún mensaje de la persona (incluye `escrito`).

## Estado de la página (no es de la clase)

| Estado | Valores | Regla |
|---|---|---|
| `consentimientoIA` | `false` / `true` | `false` al montar (FR-005); "Empezar de nuevo" no lo cambia |
| `escrituraDisponible` | calculado | URL configurada **y** `navigator.onLine` al montar (R6) |
| `borrador` | texto del `textarea` | se vacía al enviar con éxito; se conserva si se bloquea o falla |
| `bloqueo` | `null` / resultado de `detectarDatoSensible` | se limpia al editar el texto |
