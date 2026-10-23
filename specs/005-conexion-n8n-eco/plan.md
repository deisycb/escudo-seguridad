# Implementation Plan: Conexión de Escudo con n8n (eco local)

**Branch**: `005-conexion-n8n-eco` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la funcionalidad en `/specs/005-conexion-n8n-eco/spec.md`

## Summary

La web app en local se conecta por primera vez a un webhook real de n8n Cloud. El flujo valida la petición, aplica un límite de peticiones, no guarda nada y devuelve un eco del último mensaje de la persona. Todo lo de la web app (escritura, consentimiento, bloqueo de datos sensibles, 20 s, 1.000 caracteres, respaldo con guías) ya existe desde la spec 004 y no cambia.

**Enfoque técnico** ([research.md](./research.md)):
- Sin cambios en `src/` (R1): la URL de producción del webhook va en `.env.local` (R6, R7).
- El flujo tiene 3 nodos: Webhook → Code → Respond to Webhook (R2). El eco es `"Eco: <texto>"` (R3), con un límite global de 30 peticiones por minuto que no guarda IPs (R4).
- El flujo no guarda datos de ejecución (R5).
- El flujo se versiona en `n8n/asistente-emergencia.json` y se importa en n8n Cloud. Una prueba de Vitest revisa su configuración de privacidad y ejecuta su código (R8).

## Technical Context

**Language/Version**: JavaScript (ES2022+); Node.js 22 LTS para desarrollo. El nodo Code de n8n también es JavaScript

**Primary Dependencies**: las de la 004, sin dependencias nuevas. n8n Cloud (nodos Webhook, Code y Respond to Webhook)

**Storage**: ninguno en la web app. En n8n solo están los datos estáticos del límite (`inicioVentana`, `cantidad`); no se guardan ejecuciones

**Testing**: Vitest (`node`). Se agrega `tests/n8n/asistenteEmergencia.test.js`. Las pruebas de `AsistenteIA` de la 004 no cambian. La integración real se valida con [quickstart.md](./quickstart.md)

**Target Platform**: web app en `http://localhost:5173` (desarrollo) y flujo en n8n Cloud por HTTPS

**Project Type**: SPA estática más el flujo de n8n (único backend permitido)

**Performance Goals**: respuesta del eco en menos de 3 s (SC-001)

**Constraints**:
- Solo salen los textos de la conversación con la IA.
- n8n no guarda ejecuciones.
- CORS solo para `http://localhost:5173`.
- Sin credenciales ni URL de la instancia en el repositorio.
- Corte a los 20 s.

**Scale/Scope**: 1 flujo de 3 nodos, 1 archivo JSON, 1 prueba nueva y 1 comentario en `.env.example`

Nada queda en NEEDS CLARIFICATION.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principio / regla | Cómo lo cumple el plan | Estado |
|---|---|---|---|
| I | Privacidad; solo salen los mensajes del chat; nada se guarda, tampoco en n8n | Se usa el cliente de la 004 sin cambios (solo `mensajes`, `credentials: "omit"`, `no-referrer`). Ejecuciones desactivadas en `settings` y probadas (R5, R8). El límite no guarda IPs (R4). Bloqueo de datos sensibles de la 004 vigente (FR-009). | ✅ |
| II | Consentimiento propio | Sin cambios: el de la 004 se pide antes de escribir. | ✅ |
| III | La IA no toca el contenido fijo ni el cálculo | El eco no toca `/src/data` ni la lógica de riesgo. | ✅ |
| IV | Único backend: n8n por un único webhook HTTPS; claves solo en n8n; CSP; límite de peticiones | URL de producción `https://` de n8n Cloud. El eco no tiene claves. CSP del build con el origen de la instancia (mecanismo de la 004). Límite de 30 peticiones por minuto con `429`. Resuelve TODO(HOSTING_N8N) para la etapa local. | ✅ |
| V | Código limpio y verificado | Constantes con nombre en el nodo Code. Prueba Vitest del JSON y de su código. ESLint sin errores. | ✅ |
| VI | Guías sin el asistente; fallos con mensaje amable | Sin cambios: `AsistenteIA` nunca lanza y la web app remite a las guías (quickstart 9 a 13). | ✅ |
| §7 | Sistema de diseño | Sin cambios de interfaz. | ✅ |
| Gob. | En todo cambio del asistente: qué datos salen, la CSP y las guías sin conexión | Quickstart 2, 10, 13 y 16; `npm run build` con la URL real. | ✅ |

**Resultado del gate (antes de Phase 0)**: PASA.

**Re-evaluación tras Phase 1**: PASA.
- [webhook-eco.md](./contracts/webhook-eco.md) no amplía la petición de la 004.
- [n8n-flujo-eco.md](./contracts/n8n-flujo-eco.md) fija el no guardado y la ausencia de credenciales.
- [data-model.md](./data-model.md) solo guarda dos números en n8n.

## Project Structure

### Documentation (this feature)

```text
specs/005-conexion-n8n-eco/
├── spec.md
├── plan.md              # Este archivo
├── research.md          # R1–R10
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── webhook-eco.md   # respuestas propias del eco (la petición es la de la 004)
│   └── n8n-flujo-eco.md # nodos, settings y reglas del JSON versionado
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
n8n/
└── asistente-emergencia.json        # NUEVO: flujo de eco, sin credenciales (R2, R5, R8)

tests/
└── n8n/asistenteEmergencia.test.js  # NUEVO: settings, credenciales, pinData, CORS y código del eco (R8)

.env.example                          # AJUSTAR: comentario con la URL de n8n Cloud (R7)
.env.local                            # LOCAL, no se sube: VITE_URL_ASISTENTE_IA

src/                                  # sin cambios (R1)
scripts/webhook-prueba.mjs            # sin cambios: sigue sirviendo para probar sin internet
```

**Structure Decision**: estructura actual del proyecto. Se agrega la carpeta `n8n/`, que la spec 004 ya preveía. `vitest` ya incluye `tests/**/*.test.js`, así que la nueva prueba no requiere configuración.

## Riesgos y dependencias

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La rama activa es `004-asistente-ia-emergencia`, y la `002-asistente-emergencia-n8n` del encabezado de la spec no existe | Mezcla de features | Crear `005-conexion-n8n-eco` desde la 004 antes de `/speckit-implement` (R10) y corregir el encabezado de la spec |
| La versión de n8n Cloud no acepta el código de estado por expresión | El 400 y el 429 salen como 200 | Switch con tres Respond to Webhook (R2); el quickstart 15 lo detecta |
| Una exportación desde n8n trae `pinData` o reactiva el guardado | Fuga de mensajes de prueba | Prueba automática del JSON (R8) |
| La instancia de n8n Cloud tarda en la primera petición | Incumple SC-001 | Repetir y anotar los tiempos (quickstart 5); el corte de 20 s protege a la persona |
| La URL del webhook es pública | Abuso del endpoint | Ruta UUID (R6) y límite de 30 peticiones por minuto (R4) |
| CORS de n8n solo para localhost | El despliegue no funcionaría | Fuera de alcance: se agrega el dominio de Netlify en la historia de despliegue |
| `src/data/emergencias.js` tiene cambios sin commit, ajenos a esta feature | Mezcla en el commit | No se incluye en los commits de la 005 |

## Complexity Tracking

No hay violaciones de la constitución que justificar.
