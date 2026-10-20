# Implementation Plan: Escritura libre en Emergencia con asistente de IA

**Branch**: `003-rediseno-emergencia-agente` (spec `004-asistente-ia-emergencia`; ver Riesgos) | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la funcionalidad en `/specs/004-asistente-ia-emergencia/spec.md`

## Summary

Emergencia pasa a abrir con una invitación a escribir con palabras propias. La persona acepta un consentimiento aparte y escribe. Un filtro en el dispositivo bloquea números de tarjeta o cuenta y códigos, y ayuda a reescribir montos y fechas. Lo que pasa el filtro se envía, junto con el intercambio previo con la IA, a un único webhook de n8n, que responde con texto plano marcado como generado por IA. Sin conexión, sin consentimiento, sin configuración o cuando el asistente falla, la persona llega a las guías de la spec 003, que se suman a la misma conversación.

**Enfoque técnico** ([research.md](./research.md)):
- Dos módulos nuevos en `/src/logic`: `FiltroDatosSensibles` (expresiones regulares probadas, R3) y `AsistenteIA` (cliente del webhook con `fetch` inyectado, 20 s y resultados sin excepciones, R4).
- `ConversacionEmergencia` se amplía con la etapa de escritura (R5), así sigue habiendo una sola conversación.
- Un componente nuevo, `EscrituraIA` (R7).
- La URL del webhook llega en el build (`VITE_URL_ASISTENTE_IA`). Sin ella, la escritura se desactiva (R1), y la CSP se arma con su origen (R2).
- El flujo de n8n se documenta como contrato, no como código del repositorio (R9).

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSX; Node.js 22 LTS, solo para desarrollo y build

**Primary Dependencies**: las mismas de la 001 y la 003 (React 19, Vite 7, Tailwind CSS 4, `lucide-react`, `@fontsource/plus-jakarta-sans`). Sin dependencias nuevas: se usan `fetch` y `AbortController` nativos

**Storage**: ninguno. Consentimiento, borrador y conversación viven en memoria (FR-005, FR-015)

**Testing**: Vitest (entorno `node`) para `FiltroDatosSensibles`, `AsistenteIA` (con `fetch` falso y temporizadores falsos) y la ampliación de `ConversacionEmergencia`. La interfaz y n8n se validan con [quickstart.md](./quickstart.md)

**Target Platform**: navegadores modernos, celular y computador. Backend: flujo de n8n (alojamiento pendiente, TODO HOSTING_N8N)

**Project Type**: SPA estática más un flujo de n8n externo (el único backend permitido)

**Performance Goals**: respuesta del asistente en menos de 10 s en el 90 % de los casos (SC-002), con espera máxima de 20 s; el filtro es instantáneo, menos de 5 ms por mensaje

**Constraints**:
- Solo el intercambio con la IA sale del dispositivo, y solo después del consentimiento (FR-009, SC-004).
- `connect-src` limitado al origen del webhook.
- Nada se guarda en el navegador ni en n8n.
- Texto plano siempre.
- WCAG 2.1 AA.
- Tokens e íconos de §7 (sin ícono de "enviar": ChevronRight con texto).

**Scale/Scope**: 1 pantalla ampliada (Emergencia), 2 módulos de lógica nuevos, 1 ampliado, 1 componente nuevo y 2 tipos de mensaje nuevos, más el flujo de n8n

Nada queda en NEEDS CLARIFICATION: el proveedor de IA y el alojamiento de n8n no bloquean el diseño (R1), pero sí la publicación.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principio / regla | Cómo lo cumple el plan | Estado |
|---|---|---|---|
| I | Privacidad; única excepción: el asistente de emergencia | Solo salen los textos del intercambio con la IA (FR-009; sin guías, diagnóstico, ids ni almacenamiento). Aviso antes del primer mensaje (FR-006). Bloqueo en el cliente de 13 a 19 dígitos y de códigos de 4 a 8 dígitos, sin forma de saltarlo (R3, aclaración 2026-10-20). Nada guardado en el navegador ni en n8n (FR-015, [n8n-flujo.md](./contracts/n8n-flujo.md)). | ✅ |
| II | Consentimiento propio y aparte | Tarjeta de consentimiento antes del campo, que explica n8n, el proveedor posiblemente fuera de Colombia, que no se guarda y para qué se usa (FR-004). Se pide en cada visita (FR-005). Texto final: equipo. | ✅ (texto pendiente) |
| III | Contenido fijo; la IA no lo reemplaza | Las respuestas de la IA no tocan `/src/data`, el cálculo ni el plan. Las guías de la 003 siguen siendo contenido fijo. | ✅ |
| IV | Único backend: n8n por un único webhook HTTPS; claves en n8n; CSP; límite de peticiones; instrucciones del asistente | URL por variable de entorno, solo `https://` (R1, R2). CSP `connect-src` igual al origen del webhook. Sin claves en el frontend. Límite e instrucciones en el contrato del flujo (R9). | ✅ |
| V | Código limpio y verificado | Lógica en `/logic` con JSDoc y Vitest; los componentes solo dibujan; constantes con nombre (`TIEMPO_ESPERA_MS`, `LIMITES_TARJETA`…). | ✅ |
| VI | Ayuda siempre disponible; fallos → mensaje amable que remite a las guías | Guías sin conexión, sin consentimiento, sin configuración y ante cualquier fallo (FR-003, FR-013, FR-014; R6). `AsistenteIA` nunca lanza errores hacia la interfaz. | ✅ |
| §7 | Sistema de diseño | Burbujas de la 003; chip "Respuesta generada por IA" como el chip de paso; íconos Lock y ChevronRight de §7.9; `<mark>` con `advertencia-suave`/`advertencia-texto`. Elementos nuevos (tarjeta de consentimiento, campo de texto, chip de IA) documentados en R7 y R8 para avisar al equipo (§7.1). | ✅ (anotado) |
| Gob. | Todo cambio en el asistente verifica qué datos salen, la CSP y que las guías funcionen sin conexión | Quickstart 2, 4, 5, 11 y 17; build con y sin URL. | ✅ |

**Resultado del gate (antes de Phase 0)**: PASA.

**Re-evaluación tras Phase 1**: PASA.
- Los contratos ([webhook.md](./contracts/webhook.md), [n8n-flujo.md](./contracts/n8n-flujo.md)) envían solo `mensajes`.
- El modelo ([data-model.md](./data-model.md)) no persiste nada.
- La única duda es `scripts/webhook-prueba.mjs` (servidor local solo para desarrollo, nunca publicado), que se consulta al equipo bajo el principio IV (Riesgos).

## Project Structure

### Documentation (this feature)

```text
specs/004-asistente-ia-emergencia/
├── spec.md
├── plan.md              # Este archivo
├── research.md          # R1–R10
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── webhook.md       # petición y respuestas del webhook
│   ├── n8n-flujo.md     # lo que debe cumplir el flujo de n8n
│   ├── logica.md        # FiltroDatosSensibles, AsistenteIA y ConversacionEmergencia ampliada
│   └── pantallas.md     # Emergencia con escritura
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── data/
│   └── asistenteIA.js            # NUEVO: CONSENTIMIENTO_IA (PENDIENTE del equipo)
├── logic/
│   ├── FiltroDatosSensibles.js   # NUEVO: detectarDatoSensible (R3)
│   ├── AsistenteIA.js            # NUEVO: cliente del webhook, TEXTOS_IA, escrituraConfigurada (R4)
│   └── ConversacionEmergencia.js # AMPLIAR: etapa escritura, mensajes de IA, abrirGuias/volverAEscribir (R5)
├── components/
│   ├── EscrituraIA.jsx           # NUEVO: consentimiento, campo, aviso, bloqueo, enviar (R7)
│   └── MensajeConversacion.jsx   # AMPLIAR: escrito, respuestaIA, esperandoIA, falloIA (R8)
└── pages/
    └── Emergencia.jsx            # AMPLIAR: modo inicial (R6), envío, foco, "Prefiero escribirlo"

vite.config.js                    # AMPLIAR: CSP con el origen de VITE_URL_ASISTENTE_IA (R2)
scripts/webhook-prueba.mjs        # NUEVO (solo desarrollo, sujeto a aprobación): webhook simulado
n8n/asistente-emergencia.json     # FUTURO: exportación sin credenciales cuando exista el flujo

tests/
├── logic/FiltroDatosSensibles.test.js   # NUEVO
├── logic/AsistenteIA.test.js            # NUEVO
└── logic/ConversacionEmergencia.test.js # AMPLIAR
```

**Structure Decision**: mismo proyecto y estructura de la constitución. No se crea un servidor propio: el backend es el flujo de n8n. El script de webhook de prueba solo existe para desarrollo, si el equipo lo aprueba.

## Riesgos y dependencias

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Proveedor de IA y alojamiento de n8n sin definir (TODOs de la constitución) | No se puede publicar la escritura | Diseño independiente del proveedor (R1); sin URL, Emergencia sigue en las guías |
| Texto del consentimiento sin aprobar (Ley 1581) | No se puede publicar la escritura | `CONSENTIMIENTO_IA` como PENDIENTE; la validación de contenido lo reporta |
| El filtro bloquea montos y fechas solo con números | Fricción para la víctima | La explicación resalta el número y propone cómo reescribirlo (aclaración 2026-10-20) |
| El filtro no detecta contraseñas escritas como palabras | Puede salir una contraseña | Aviso fijo (FR-006); el flujo instruye no pedir ni repetir datos; nada se guarda |
| El asistente responde algo inadecuado | Mala orientación | Instrucciones del sistema (R9), etiqueta de IA y recordatorio "No reemplaza…"; las guías siempre a un toque |
| `scripts/webhook-prueba.mjs` podría leerse como "servidor propio" (principio IV) | Conflicto de gobernanza | Solo desarrollo, fuera de `src/` y del build; consultar al equipo antes de crearlo |
| La rama activa es `003-rediseno-emergencia-agente` | Mezcla de features | Crear la rama `004-asistente-ia-emergencia` antes de `/speckit-implement` |
| La spec 003 tiene su plan y tareas sin la mención a FR-042 | Desfase documental | La 004 implementa FR-042; actualizar la 003 en la fase de cierre de las tareas |

## Complexity Tracking

No hay violaciones de la constitución que justificar.
