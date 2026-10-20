# Implementation Plan: Asistente guiado de emergencia

**Branch**: `conexion-n8n` (spec `003-rediseno-emergencia-agente`) | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la funcionalidad en `/specs/003-rediseno-emergencia-agente/spec.md`

## Summary

La pantalla de Emergencia deja de ser un menú de 3 guías y pasa a ser una conversación guiada que solo funciona con botones:

- el asistente saluda y ofrece 7 situaciones;
- según la situación, hace una pregunta de seguimiento o va directo a una guía;
- entrega la guía un paso a la vez ("Paso N de M" / "Listo, ¿qué sigue?");
- termina con tres opciones de cierre.

Al pie quedan fijos "Llamar a la línea de mi banco" y "Más ayuda", que despliega "Cómo denunciar en Colombia" y "Empezar de nuevo"; ninguno hace perder el paso. Salir de la pantalla a mitad de la conversación ("atrás", barra inferior o "Volver al inicio") y "Empezar de nuevo" piden confirmación. El botón de Inicio pasa a tener dos líneas.

**Enfoque técnico**:
- El flujo se modela en una clase inmutable nueva, `ConversacionEmergencia`, en `/src/logic`, probada con Vitest ([R1](./research.md)).
- El contenido se amplía en `emergencias.js` con situaciones, seguimientos y mensajes que referencian guías por id ([R2](./research.md)).
- `Emergencia.jsx` se reescribe como vista de la conversación: región `role="log"`, foco en la siguiente opción y acciones rápidas `sticky` con panel "Más ayuda" ([R4–R6](./research.md)).
- Una sola guarda de salida reutiliza `registrarInterceptorAtras` de `useNavegacion`, que gana `navegarConGuarda` para la barra inferior; un solo `Dialogo` sirve para confirmar la salida y el reinicio ([R7](./research.md), [R12](./research.md)).
- La conversación vive solo en el estado de React: sin `localStorage`, sin `history.state` y sin red ([R7](./research.md), [R10](./research.md)).

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSX; Node.js 22 LTS o superior, solo para desarrollo y build

**Primary Dependencies**: las de la 001, sin agregar ninguna: React 19, Vite 7, Tailwind CSS 4, `lucide-react` y `@fontsource/plus-jakarta-sans`. En desarrollo: Vitest 3, ESLint 9 (con `jsx-a11y`) y Prettier 3

**Storage**: ninguno para esta funcionalidad. La conversación es estado en memoria de la página y no toca `localStorage` (FR-027)

**Testing**: Vitest (entorno `node`) para `ConversacionEmergencia` y `validarContenidoEmergencias`, con fixtures propios. La interfaz se valida con escenarios manuales ([quickstart.md](./quickstart.md)) y con axe DevTools o Lighthouse

**Target Platform**: navegadores modernos en celular y computador; hosting estático (Netlify)

**Project Type**: web app de frontend únicamente (SPA estática)

**Performance Goals**: respuesta inmediata a cada toque (menos de 100 ms, sin retardos simulados); el bundle crece en menos de 5 KB gzip

**Constraints**:
- Solo botones, sin campos de texto.
- Cero peticiones de red (la CSP `connect-src 'none'` no cambia).
- Funciona sin conexión una vez cargada.
- Contenido intocable (principio III).
- WCAG 2.1 AA con región viva y manejo de foco.
- Tokens e íconos de §7.
- 390 px mobile-first y columna de 560 px.

**Scale/Scope**: 2 pantallas tocadas (Inicio: solo el botón; Emergencia: reescrita), 1 clase nueva, 7 situaciones y N guías de contenido

No queda nada en NEEDS CLARIFICATION: todo está resuelto en [research.md](./research.md). Lo único pendiente es el **contenido** de emergencias, que debe entregar el equipo (ver Riesgos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principio / regla | Cómo lo cumple el plan | Estado |
|---|---|---|---|
| I | Privacidad ante todo | Este "Asistente de emergencias" no es el asistente de IA de la constitución (spec FR-004): no envía nada, así que la excepción del principio I no aplica. Sin campos de texto (FR-005, FR-029). La conversación no se guarda en `localStorage` ni en `history.state` y no hace peticiones (R7, R10). El asistente se presenta con "Nunca te pediré claves, códigos ni datos de tu tarjeta". No usa la excepción del asistente de IA: no sale ningún dato | ✅ |
| II | Consentimiento | Emergencia sigue sin pedir consentimiento ni diagnóstico (FR-003). El consentimiento propio del principio II es para el asistente de IA; este asistente guiado no lo requiere (spec FR-004). No hace falta el consentimiento del asistente de IA porque no se procesa nada fuera del dispositivo (spec, Assumptions) | ✅ |
| III | Contenido fijo | Todos los textos y relaciones salen de `emergencias.js` (FR-013). Los textos provisionales de las 7 situaciones vienen de la spec aprobada (FR-007). Los mensajes, pasos, líneas y canales se dejan vacíos con `PENDIENTE` y se muestra el mensaje de contenido pendiente; no se inventan ([R3](./research.md)) | ✅ (anotado) |
| IV | Navegador primero; backend solo para emergencias | No usa backend ni n8n; todo ocurre en el navegador. Sin librerías nuevas (ni máquina de estados ni Testing Library). El chat de IA queda fuera de alcance (R10) | ✅ |
| V | Código limpio y verificado | Clase POO inmutable en `/logic` con JSDoc y pruebas Vitest; la página solo dibuja. Textos fijos de interfaz como constantes con nombre (`TEXTOS_ASISTENTE`) | ✅ |
| VI | Lenguaje sencillo, ayuda siempre disponible | Accesible desde Inicio sin diagnóstico. Guías, líneas y denuncia funcionan sin conexión. Contenido pendiente o fallas → mensaje amigable, nunca errores crudos | ✅ |
| §7 | Sistema de diseño | Botón de emergencia §7.5 con alto mínimo de 52 px. Tokens de §7.2, radios de §7.4 e íconos de §7.9 (ShieldCheck, TriangleAlert, ChevronRight, ChevronDown, Phone, FileText, X del diálogo). §7.6 columna de 560 px. §7.7 contraste verificado (R8, R9). Elementos sin regla en §7 (burbujas, chip de paso, acciones fijas): interpretación documentada en R4 y R9 para avisar al equipo (§7.1) | ✅ (anotado) |
| — | Estructura `/data`, `/logic`, `/pages`, `/components` | Se respeta: clase en `/logic`, contenido en `/data`, componentes de la conversación en `/components` | ✅ |

**Resultado del gate (antes de Phase 0)**: PASA, sin violaciones.

**Re-evaluación tras Phase 1**: PASA.
- El modelo ([data-model.md](./data-model.md)) no tiene datos persistentes ni sensibles.
- Los contratos no añaden servicios externos.
- La única desviación de la 001 es quitar `vista` de la navegación de Emergencia (R7), que simplifica.
- Las dos anotaciones (contenido provisional e interpretación visual) quedan como dependencias para el equipo, no como violaciones.

**Re-evaluación tras las clarificaciones de la spec 003 (2026-10-20, 5 preguntas)**: PASA. El contenido provisional queda aprobado en FR-013 con límite (III). Las confirmaciones de salida y reinicio no guardan nada: el destino pendiente vive en el estado de la página y no se usa `beforeunload` (I). Solo se agrega un método a un hook existente y se reutiliza `Dialogo` (IV y V). El ícono nuevo, ChevronDown, está en §7.9.

**Re-evaluación tras la clarificación de la spec 001 (2026-10-20)**: PASA. La spec 001 registra que FR-030, FR-031, FR-033 y FR-034 pasan a esta spec y que SC-002 sube a 3 toques, lo que coincide con SC-001 de esta spec y con el escenario 3 de [quickstart.md](./quickstart.md). La carpeta pasó de `002-asistente-emergencia` a `003-rediseno-emergencia-agente`, sin cambios de contenido. Se agregan al alcance las actualizaciones de los contratos y tareas de la 001 que describían el menú de 3 guías (ver Source Code).

## Project Structure

### Documentation (this feature)

```text
specs/003-rediseno-emergencia-agente/
├── spec.md
├── plan.md              # Este archivo
├── research.md          # Phase 0 (R1–R11)
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── contenido-emergencias.md   # forma de emergencias.js y validación
│   ├── logica-conversacion.md     # API de ConversacionEmergencia
│   └── pantallas.md               # cambios en Inicio y Emergencia
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
src/
├── data/
│   └── emergencias.js            # MODIFICAR: + MENSAJES_ASISTENTE, SITUACIONES_EMERGENCIA
├── logic/
│   └── ConversacionEmergencia.js # NUEVO: clase + validarContenidoEmergencias + TEXTOS_ASISTENTE
├── components/
│   ├── botones.js                # MODIFICAR: + BOTON_EMERGENCIA_ASISTENTE
│   ├── MensajeConversacion.jsx   # NUEVO: burbuja asistente/persona, chip "Paso N de M", bancos, denuncia
│   └── AccionesRapidas.jsx       # NUEVO: bloque sticky "Llamar" + "Más ayuda" con su panel
├── pages/
│   ├── Inicio.jsx                # MODIFICAR: botón de dos líneas
│   └── Emergencia.jsx            # REESCRIBIR: presentación + aviso + conversación + opciones
├── hooks/
│   └── useNavegacion.js          # MODIFICAR: + navegarConGuarda(destino) (R7)
└── App.jsx                       # MODIFICAR: irAEmergencia sin `vista`; barra con navegarConGuarda; pasar hayDiagnostico y registrarInterceptorAtras a Emergencia

tests/
├── fixtures/emergenciasPrueba.js       # NUEVO
└── logic/ConversacionEmergencia.test.js # NUEVO

specs/001-escudo-web-app/               # documentos de la 001 que quedan desfasados
├── contracts/pantallas.md              # MODIFICAR: fila `emergencia` sin `vista`; "atrás" sale de Emergencia; sección Emergencia → enlace a contracts/pantallas.md de esta spec
├── contracts/contenido.md              # MODIFICAR: sección `emergencias.js` → enlace a contracts/contenido-emergencias.md
└── tasks.md                            # MODIFICAR: T036 y T087 validan "3 toques o menos" (SC-002 aclarado el 2026-10-20)
```

**Structure Decision**: el mismo proyecto de frontend de la 001, con la estructura de `/src` que fija la constitución. `Pregunta`, `Diagnostico`, `PlanAccion` y `Almacenamiento` no cambian. La navegación con historial pierde la vista interna de Emergencia (R7). `Tips.jsx` no cambia: su acceso sigue llevando a Emergencia.

## Riesgos y dependencias

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Falta el contenido: saludo, seguimientos, pasos, guías nuevas, mensajes, líneas y canales ([R3](./research.md)) | La conversación muestra el mensaje de contenido pendiente; no se puede publicar | Situaciones provisionales con texto de la spec y destino provisional marcado `PROVISIONAL`; `validarContenidoEmergencias` lista lo pendiente; no se inventa nada |
| El destino provisional de cada situación (tabla en [contenido-emergencias.md](./contracts/contenido-emergencias.md)) puede no coincidir con lo que decida el equipo | Hay que cambiar el contenido | Solo cambia `emergencias.js`; la clase no depende de qué guía sea |
| Orden de anuncios entre la región viva y el foco varía por lector de pantalla (R5) | Lecturas dobles o en orden raro | Validar con VoiceOver y NVDA (quickstart 14); alternativa documentada: enfocar el mensaje |
| Las acciones fijas restan altura útil en celulares pequeños (R4) | Menos conversación visible | Una sola fila (unos 68 px); el panel "Más ayuda" solo ocupa espacio mientras está abierto; relleno inferior y `scroll-margin` |
| `navegarConGuarda` comparte el interceptor con Diagnóstico (R7) | Una guarda podría actuar en la pantalla equivocada | Cada página registra y libera su interceptor al montarse y desmontarse (patrón existente); la barra no existe durante el Diagnóstico |
| Elementos visuales nuevos sin mockup (R9) | El equipo puede querer otro estilo | Interpretación de §7 documentada; cambiarla solo toca clases de Tailwind |
| La rama activa es `conexion-n8n`, no `003-rediseno-emergencia-agente` | Mezcla con el trabajo de n8n | Decidir con el equipo si se crea una rama propia antes de `/speckit-implement` |
| La constitución 2.0.0 prevé un chat de IA en Emergencia | Posible choque de diseño cuando se agregue | Este asistente es la ayuda que funciona sin conexión; el chat de IA será un complemento aparte (spec, Assumptions) |

## Complexity Tracking

No hay violaciones de la constitución que justificar.
