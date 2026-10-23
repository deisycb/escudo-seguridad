---

description: "Lista de tareas: asistente guiado de emergencia (spec 003)"
---

# Tasks: Asistente guiado de emergencia

**Input**: Documentos de diseño en `/specs/003-rediseno-emergencia-agente/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: se incluyen pruebas Vitest para todo lo nuevo de `/src/logic`, porque la constitución (principio V) las exige para cada clase de `/logic`. La interfaz se valida con los escenarios manuales de [quickstart.md](./quickstart.md), sin Testing Library ni jsdom ([R11](./research.md)).

**Organización**: por historia de usuario de la spec. US1 y US2 son P1; US3 es P2.

**Reglas para todas las tareas** (constitución §7 y V, [contracts/pantallas.md](./contracts/pantallas.md)):
- Solo tokens de `tailwind.config.js`: nada de hex ni clases de paleta de Tailwind.
- Íconos de `lucide-react` con `strokeWidth={2}` y `aria-hidden="true"`.
- Nombres en español.
- JSDoc en cada método público.
- Funciones de menos de 20 líneas cuando sea posible.
- Nada de `localStorage`, `history.state`, `fetch` ni campos de texto en Emergencia.
- Una tarea solo está terminada cuando `npm run lint` no da errores y `npm test` no tiene **fallos nuevos**. Los únicos fallos permitidos son los de contenido pendiente de `tests/logic/contenido.test.js`, registrados en T001 (hoy son 6 de 84: pasos de guías, aviso, bancos, canales y tips). Nunca se escribe contenido para hacer pasar una prueba (principio III).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin depender de tareas pendientes)
- **[Story]**: US1, US2 o US3

---

## Phase 1: Setup

**Purpose**: confirmar el punto de partida; no se instala nada nuevo.

- [X] T001 Confirmar con el equipo en qué rama se implementa (hoy `conexion-n8n`; el plan sugiere una rama propia `003-rediseno-emergencia-agente`, ver Riesgos en `specs/003-rediseno-emergencia-agente/plan.md`) y correr `npm test` y `npm run lint` antes de empezar. Copiar al final de este archivo, en una sección "Fallos permitidos (contenido pendiente)", la lista exacta de pruebas que fallan hoy (6 de 84, todas en `tests/logic/contenido.test.js`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: contenido con la forma nueva, constantes y validación. US1 y US2 dependen de esto.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [X] T002 [P] Crear `tests/fixtures/emergenciasPrueba.js` con contenido sintético (comentario inicial "CONTENIDO SINTÉTICO SOLO PARA PRUEBAS", igual que `tests/fixtures/contenidoPrueba.js`) que exporte `contenidoEmergenciasPrueba = { mensajes, situaciones, guias, lineas, canales }`:
  - las 7 situaciones con los ids de `IDS_SITUACIONES` en orden; `tarjeta-banco` directa a una guía de 3 pasos; `duda` con `seguimiento` de 2 respuestas que llevan a guías distintas; `whatsapp-perdido` directa a una guía de 1 paso; `suplantacion` directa a una guía con `pasos: []` (caso de contenido pendiente);
  - todos los mensajes con texto, 2 líneas bancarias y 2 canales de denuncia.

  Exportar además una variante `contenidoEmergenciasVacio` con mensajes `""`, `lineas: []` y `canales: []`.
- [X] T003 [P] Ampliar `src/data/emergencias.js` según [contracts/contenido-emergencias.md](./contracts/contenido-emergencias.md):
  - `MENSAJES_ASISTENTE` con `saludo`, `cierreGuia`, `despedida`, `introLineasBancarias`, `introCanalesDenuncia` y `contenidoPendiente`, todos `""` con comentario `// PENDIENTE: lo entrega el equipo`.
  - `SITUACIONES_EMERGENCIA` con las 7 situaciones de la tabla "Estado provisional" (texto y guía exactamente como en la tabla), cada línea con `// PROVISIONAL` (spec FR-013, Clarifications 2026-10-20).
  - `GUIAS_EMERGENCIA`, `AVISO_NO_BORRES`, `LINEAS_BANCARIAS` y `CANALES_DENUNCIA` sin cambios.
  - Actualizar el comentario de cabecera para referenciar la spec 003. No escribir pasos, mensajes, números ni canales inventados.
- [X] T004 Crear `src/logic/ConversacionEmergencia.js` solo con las constantes exportadas `IDS_SITUACIONES` (`"tarjeta-banco", "enlace-falso", "codigo-compartido", "whatsapp-perdido", "suplantacion", "pago-estafador", "duda"`, en ese orden) y `TEXTOS_ASISTENTE`, con los textos exactos de [contracts/logica-conversacion.md](./contracts/logica-conversacion.md) (`siguiente` "Listo, ¿qué sigue?", `denunciar`, `otraCosa`, `terminar`, `llamarBanco`, `comoDenunciar`, `empezarDeNuevo`, `masAyuda` "Más ayuda", `confirmarSalirTitulo`, `confirmarReiniciarTitulo`, `confirmarTexto` "Perderás el paso en que vas.", `confirmarSalir` "Salir", `seguirAqui` "Seguir aquí" y `respaldoPendiente`)
- [X] T005 Escribir en `tests/logic/ConversacionEmergencia.test.js` un bloque `describe("validarContenidoEmergencias")` con contenido de `tests/fixtures/emergenciasPrueba.js` que cubra:
  - **Sin errores:** el contenido de prueba válido devuelve `errores: []`.
  - **Errores:**
    - ids de situación distintos de los 7 fijos o en otro orden;
    - una situación con `guia` y `seguimiento` a la vez;
    - una situación sin ninguno de los dos;
    - `guia` inexistente;
    - un seguimiento con menos de 2 respuestas;
    - ids de respuesta repetidos;
    - ids de guía repetidos.
  - **Pendientes:**
    - mensajes vacíos;
    - una guía referenciada con `pasos: []`;
    - `lineas` y `canales` vacíos.

  Las pruebas deben fallar antes de T006.
- [X] T006 Implementar `export function validarContenidoEmergencias({ mensajes, situaciones, guias, lineas, canales })` en `src/logic/ConversacionEmergencia.js`. Debe devolver `{ errores: string[], pendientes: string[] }` con mensajes en español que digan qué id falla y aplicar estas reglas de [data-model.md](./data-model.md):
  - "Exactamente 7, en orden fijo".
  - "`texto` no vacío".
  - "No puede tener `guia` y `seguimiento` a la vez".
  - "al menos 2 respuestas".
  - "`id` único dentro de su pregunta".
  - "`guia` debe existir".
  - "`id` único" de guía.
  - "vacío = contenido pendiente".

  Con JSDoc. Hacer pasar T005.
- [X] T007 Actualizar el `describe("emergencias.js")` de `tests/logic/contenido.test.js`:
  - Reemplazar la prueba "tiene exactamente las 3 guías…" por una que exija que existan las guías `tarjetas`, `whatsapp` y `phishing` con sus títulos.
  - Agregar una prueba que llame a `validarContenidoEmergencias` con `MENSAJES_ASISTENTE`, `SITUACIONES_EMERGENCIA`, `GUIAS_EMERGENCIA`, `LINEAS_BANCARIAS` y `CANALES_DENUNCIA` y exija `errores` vacío.
  - Mantener las pruebas existentes de pasos, aviso, bancos y canales, que siguen marcando el contenido pendiente igual que hoy.

**Checkpoint**: contenido con la forma nueva, validación probada y `npm test` sin errores nuevos de estructura.

---

## Phase 3: User Story 1 - Recibir una guía paso a paso para lo que me pasó (Priority: P1) 🎯 MVP

**Goal**: botón de dos líneas en Inicio; la pantalla de Emergencia como conversación con 7 situaciones, seguimiento, pasos "Paso N de M" y cierre; confirmación al salir a mitad de la conversación (FR-041).

**Independent Test**: desde Inicio sin consentimiento, tocar el botón, elegir cada situación (y cada respuesta de seguimiento) y recorrer la guía hasta las tres opciones de cierre (quickstart 1, 2, 3, 6 y 8). A mitad de una guía, salir con "atrás", con la barra y con "Volver al inicio" y verificar la confirmación (quickstart 9a, 9b y 9c).

### Tests for User Story 1 ⚠️

> Escribirlas primero y comprobar que fallan.

- [X] T008 [US1] Agregar a `tests/logic/ConversacionEmergencia.test.js` un `describe("ConversacionEmergencia — flujo")` con las filas de [contracts/logica-conversacion.md](./contracts/logica-conversacion.md):
  - `iniciar`: 1 mensaje (saludo) y 7 opciones con ids `situacion:<id>` y los textos del contenido, en orden.
  - Situación directa: elección de la persona con el texto exacto, paso con `numero: 1, total: 3` y opciones `[siguiente]`.
  - Situación con seguimiento y luego respuesta: llega al paso 1 de su guía.
  - `siguiente` hasta el último paso: muestra `cierreGuia` y opciones `denunciar`, `otraCosa` y `terminar`.
  - Guía de 1 paso: "1 de 1" y luego el cierre.
  - `denunciar`: agrega `canalesDenuncia` y deja opciones `[otraCosa, terminar]`.
  - `otraCosa`: el historial se conserva y vuelven las 7 situaciones.
  - `terminar`: agrega la despedida, deja opciones `[]` y `estaTerminada()`.
  - Un id no pendiente o ya usado devuelve la misma instancia (`toBe`).
  - Contenido pendiente: guía con `pasos: []` → mensaje `contenidoPendiente` y etapa `cierre`; con `contenidoEmergenciasVacio`, `respaldoPendiente` y nunca un texto vacío.
  - `tieneProgreso()`: `false` tras `iniciar` y `true` tras cualquier elección.
  - `obtenerMensajes()` y `obtenerOpciones()` devuelven copias (modificarlas no altera la instancia).

### Implementation for User Story 1

- [X] T009 [US1] Implementar la clase inmutable `ConversacionEmergencia` en `src/logic/ConversacionEmergencia.js`:
  - Campos privados `#contenido`, `#mensajes`, `#opciones`, `#posicion` y `#siguienteId`.
  - Métodos `static iniciar(contenido)`, `elegir(idOpcion)`, `obtenerMensajes()`, `obtenerOpciones()`, `estaTerminada()` y `tieneProgreso()`.
  - Etapas `situaciones`, `seguimiento`, `paso`, `cierre`, `cierreTrasDenuncia` y `terminada`, con las transiciones de [data-model.md](./data-model.md).
  - Mensajes con `{ id, autor, tipo, ... }` y tipos `texto`, `paso` (`numero`, `total`), `canalesDenuncia` y `eleccion`.
  - Un texto vacío se reemplaza por `contenidoPendiente` o, si también está vacío, por `TEXTOS_ASISTENTE.respaldoPendiente`.
  - Mismo patrón que `src/logic/PlanAccion.js` (métodos privados `#con…` que devuelven una instancia nueva). Con JSDoc. Hacer pasar T008.
- [X] T010 [P] [US1] Agregar `BOTON_EMERGENCIA_ASISTENTE` en `src/components/botones.js`: igual que `BOTON_EMERGENCIA` pero con `min-h-[52px] py-2` en lugar de `h-[52px]` ([R8](./research.md)). No cambiar `BOTON_EMERGENCIA`, que sigue usando `src/pages/Tips.jsx`.
- [X] T011 [US1] Cambiar el botón de emergencia en `src/pages/Inicio.jsx`:
  - usar `BOTON_EMERGENCIA_ASISTENTE`;
  - contenido: `TriangleAlert` de 20 px y un `<span className="flex flex-col text-left">` con "Tengo una emergencia ahora" (`text-base font-bold`) y "Un asistente te guía paso a paso" (`text-[13px] font-medium`);
  - sin `aria-label`: el nombre accesible sale del texto visible (spec FR-001 a FR-003).
- [X] T012 [P] [US1] Crear `src/components/MensajeConversacion.jsx`, que recibe un `mensaje` de la conversación y dibuja un `<li>`:
  - **Asistente:** alineado a la izquierda, `max-w-[88%]`, `rounded-tarjeta border border-borde bg-fondo p-4 text-base leading-normal text-texto`.
  - **Persona:** alineada a la derecha (`self-end`), `max-w-[80%]`, `rounded-tarjeta bg-primario p-4 font-semibold text-white`.
  - **Tipo `paso`:** chip "Paso {numero} de {total}" con `CHIP` de `estilos.js` más `bg-pista text-texto-secundario` encima del texto.
  - **Tipo `canalesDenuncia`:** la introducción y la lista de canales, reutilizando el marcado de `Denuncia` de `src/pages/Emergencia.jsx`, con enlace externo opcional.
  - Exportar el componente por defecto con JSDoc de props ([R9](./research.md), spec FR-019 y FR-021).
- [X] T013 [P] [US1] Crear `src/components/OpcionesConversacion.jsx`. Dibuja la lista de opciones pendientes como `<button type="button">` de ancho completo:
  - clases: `flex min-h-[52px] w-full items-center gap-3 rounded-boton border border-borde bg-fondo px-4 text-left font-semibold text-texto focus-visible:outline-2 focus-visible:outline-primario`;
  - texto en `flex-1` y `ChevronRight` de 20 px `text-texto-suave`;
  - props `opciones` y `onElegir(id)`; reenviar una `ref` a la primera opción (`ref` como prop en React 19).

  Spec FR-020.
- [X] T014 [US1] Reescribir `src/pages/Emergencia.jsx` como conversación ([contracts/pantallas.md](./contracts/pantallas.md), puntos 1 a 6):
  - Estado: `const [conversacion, setConversacion] = useState(() => ConversacionEmergencia.iniciar(CONTENIDO))`. `CONTENIDO` se arma desde `src/data/emergencias.js` con los nombres `mensajes`, `situaciones`, `guias`, `lineas` y `canales`.
  - `<h1 tabIndex={-1}>` "Respira. Vamos paso a paso." y la presentación del asistente: círculo de 44 px `bg-primario` con `ShieldCheck` blanco de 24 px, "Asistente de emergencias" (16 px/700) y "Nunca te pediré claves, códigos ni datos de tu tarjeta" (14 px/500 `text-texto-secundario`).
  - Mantener `AvisoNoBorres` tal cual.
  - `<ol className="flex flex-col gap-3">` con `MensajeConversacion` por cada mensaje y `OpcionesConversacion` debajo.
  - Eliminar `Menu`, `Guia`, `Bancos`, `VistaActual`, `PREFIJO_GUIA`, `ICONOS_GUIA` y la prop `vista`. Mantener las funciones de bancos y denuncia solo si `MensajeConversacion` las reutiliza; si no, moverlas allí.
  - Sin `<input>`, `<textarea>` ni retardos (spec FR-004 a FR-012, FR-023).
- [X] T015 [US1] En `src/App.jsx`, cambiar `irAEmergencia()` a `navegar({ pantalla: "emergencia" })` sin `vista`, y dejar de pasar `vista` y `navegar` a `<Emergencia>`. Pasar `hayDiagnostico`, `onVolverAlInicio` y `registrarInterceptorAtras` ([R7](./research.md)).
- [X] T016 [US1] Agregar `navegarConGuarda(destino)` a `src/hooks/useNavegacion.js`: si `interceptorAtras.current?.(destino)` devuelve `true`, no navega; si no, llama a `navegar(destino)`. Con `useCallback`, devolverla junto a las demás y documentarla con JSDoc ([contracts/pantallas.md](./contracts/pantallas.md), "Cambio en `useNavegacion`").
- [X] T017 [US1] En `src/App.jsx`, hacer que `navegarDesdeBarra` use `navegarConGuarda` en lugar de `navegar` (también al ir a Emergencia), para que la barra inferior pase por la guarda de salida (spec FR-041).
- [X] T018 [US1] Implementar la guarda de salida en `src/pages/Emergencia.jsx` ([R7](./research.md), [contracts/pantallas.md](./contracts/pantallas.md) punto 8):
  - Estado `confirmacion` (`null | { tipo: "salir", destino }`).
  - `useEffect` que registra con `registrarInterceptorAtras` una función `interceptarSalida(destino)`: devuelve `false` si `!conversacion.tieneProgreso()`; si no, guarda `{ tipo: "salir", destino }` y devuelve `true`. Debe depender de `conversacion` y liberar el interceptor al desmontarse, igual que `src/pages/Diagnostico.jsx`.
  - "Volver al inicio" llama a `interceptarSalida({ pantalla: "inicio" })` y, si devuelve `false`, a `onVolverAlInicio()`.
  - Un `Dialogo` con título `TEXTOS_ASISTENTE.confirmarSalirTitulo`, texto `confirmarTexto` y acciones "Seguir aquí" (`BOTON_PRINCIPAL`, cierra) y "Salir" (`BOTON_SECUNDARIO`, navega al `destino` guardado). La X y Esc cierran sin cambios.
  - No usar `beforeunload` (spec FR-041).
- [ ] T019 [US1] Validar US1 con [quickstart.md](./quickstart.md) escenarios 1, 2, 3, 6, 8, 9a, 9b y 9c en un celular de 390 px (DevTools), anotando cualquier desviación como tarea nueva

**Checkpoint**: la guía completa funciona de punta a punta con el ratón y la salida pide confirmación. Es el MVP que se puede demostrar.

---

## Phase 4: User Story 2 - Llamar a mi banco o saber cómo denunciar en cualquier momento (Priority: P1)

**Goal**: "Llamar a la línea de mi banco" y "Más ayuda" fijos al pie; "Más ayuda" despliega "Cómo denunciar en Colombia" y "Empezar de nuevo" (este último con confirmación). Ninguna de estas acciones hace perder el paso.

**Independent Test**: en el paso 2 de una guía, tocar "Llamar a la línea de mi banco" y seguir al paso 3. Durante una pregunta de seguimiento, "Más ayuda" → "Cómo denunciar en Colombia" y seguir con las mismas respuestas. Luego, "Más ayuda" → "Empezar de nuevo", cancelando y confirmando (quickstart 4, 5, 7 y 9).

### Tests for User Story 2 ⚠️

- [X] T020 [US2] Agregar a `tests/logic/ConversacionEmergencia.test.js` un `describe("ConversacionEmergencia — acciones rápidas")`:
  - `mostrarLineasBancarias()` en las etapas `situaciones`, `seguimiento`, `paso` y `cierre`: agrega la elección "Llamar a la línea de mi banco" y un mensaje `lineasBancarias` con la introducción y las 2 líneas. `obtenerOpciones()` y el número de paso quedan iguales (`toEqual` con lo anterior).
  - Lo mismo para `mostrarCanalesDenuncia()` con "Cómo denunciar en Colombia".
  - Una acción repetida dos veces agrega 4 mensajes.
  - Tras `terminar`, la acción agrega el mensaje y las opciones siguen `[]`.
  - Con `contenidoEmergenciasVacio` se usa el texto de pendiente, nunca una lista vacía sin explicación.
  - `reiniciar()` equivale a `iniciar` y deja `tieneProgreso()` en `false`.
  - `tieneProgreso()` es `true` tras una acción rápida.

### Implementation for User Story 2

- [X] T021 [US2] Implementar `mostrarLineasBancarias()`, `mostrarCanalesDenuncia()` y `reiniciar()` en `src/logic/ConversacionEmergencia.js`: agregan la elección y el mensaje sin tocar `#opciones` ni `#posicion`, y el mensaje de tipo `lineasBancarias` lleva `{ texto, lineas }`. Reutilizar el armado del mensaje de canales de `denunciar` (T009) para no duplicar código. Con JSDoc. Hacer pasar T020.
- [X] T022 [US2] Dibujar el tipo `lineasBancarias` en `src/components/MensajeConversacion.jsx`: introducción y lista de `<a href={`tel:${encodeURIComponent(numero)}`}>` con banco y número visibles (`Phone` 20 px, `min-h-11`), reutilizando el marcado de `Bancos` del `Emergencia.jsx` anterior (spec FR-015; R10 de la 001).
- [X] T023 [P] [US2] Crear `src/components/AccionesRapidas.jsx` ([R4](./research.md), [contracts/pantallas.md](./contracts/pantallas.md) punto 7):
  - Contenedor `<nav aria-label="Acciones rápidas">` con `sticky` y posición `bottom-barra` si `hayBarra`, si no `bottom-0`; además `-mx-6 border-t border-borde bg-superficie px-6 py-2`.
  - Fila con "Llamar a la línea de mi banco" (estilo primario, `flex-1 min-h-[52px] h-auto`, `Phone`) y "Más ayuda" (estilo secundario, `ChevronDown` con `rotate-180` cuando está abierto, `aria-expanded` y `aria-controls="panel-mas-ayuda"`).
  - Panel `#panel-mas-ayuda` encima de la fila, solo si está abierto, con "Cómo denunciar en Colombia" y "Empezar de nuevo" (secundarios, ancho completo, `min-h-11`).
  - El panel se cierra al elegir, al volver a tocar "Más ayuda" o con Esc (con `onKeyDown` en el `nav`), y el foco vuelve a "Más ayuda".
  - Props: `hayBarra`, `onLlamarBanco`, `onComoDenunciar` y `onEmpezarDeNuevo`. Textos tomados de `TEXTOS_ASISTENTE`.
- [X] T024 [US2] Integrar `AccionesRapidas` al final de `src/pages/Emergencia.jsx`:
  - `onLlamarBanco` → `setConversacion(c => c.mostrarLineasBancarias())`.
  - `onComoDenunciar` → `mostrarCanalesDenuncia()`.
  - `hayBarra={hayDiagnostico}`.
  - Agregar `pb-20` (o el alto real del bloque cerrado) al contenedor de la conversación y `scroll-mb-24` a mensajes y opciones para que el bloque fijo no tape la última opción (spec FR-014, FR-017).
- [X] T025 [US2] Confirmación de "Empezar de nuevo" en `src/pages/Emergencia.jsx` ([R12](./research.md)):
  - Ampliar `confirmacion` con `{ tipo: "reiniciar" }`. `onEmpezarDeNuevo` no hace nada si `!conversacion.tieneProgreso()`; si no, abre la confirmación.
  - El mismo `Dialogo` muestra `confirmarReiniciarTitulo` y `confirmarTexto` con los botones "Seguir aquí" (`BOTON_PRINCIPAL`) y "Empezar de nuevo" (`BOTON_SECUNDARIO`, llama a `setConversacion(c => c.reiniciar())` y cierra).
  - Elegir título y acciones del diálogo según `confirmacion.tipo`, sin un segundo `Dialogo` (spec FR-018).
- [ ] T026 [US2] Validar US2 con [quickstart.md](./quickstart.md) escenarios 4, 5, 7 y 9, con y sin diagnóstico guardado (barra inferior visible / no visible)

**Checkpoint**: US1 y US2 funcionan juntas; las acciones rápidas nunca pierden el paso.

---

## Phase 5: User Story 3 - Usar el asistente con lector de pantalla o teclado (Priority: P2)

**Goal**: cada mensaje nuevo se anuncia, el foco cae siempre en la siguiente acción útil y nada depende solo del color o de la posición.

**Independent Test**: con VoiceOver o NVDA y solo teclado, recorrer una situación con seguimiento, usar "Llamar a la línea de mi banco" a mitad de la guía, abrir y cerrar "Más ayuda" y los dos diálogos (quickstart 13, 14, 15 y 17).

### Implementation for User Story 3

- [X] T027 [US3] En `src/pages/Emergencia.jsx`, convertir la lista de mensajes en `<ol role="log" aria-live="polite" aria-label="Conversación con el asistente">`. Las opciones quedan fuera del `log` (spec FR-024, [R5](./research.md)).
- [X] T028 [P] [US3] En `src/components/MensajeConversacion.jsx`, anteponer a cada mensaje un `<span className="sr-only">` con "El asistente dice:" o "Tú elegiste:". El chip "Paso N de M" debe ser texto real dentro del `<li>` y el último mensaje del asistente debe poder recibir foco (`tabIndex={-1}`, `ref` como prop) (spec FR-026).
- [X] T029 [US3] Manejo del foco en `src/pages/Emergencia.jsx`:
  - `useEffect` que depende de `conversacion` y, tras cada cambio que no sea el montaje inicial, enfoca la primera opción pendiente (ref de `OpcionesConversacion`) o, si no hay opciones, el último mensaje del asistente.
  - Tras `reiniciar()`, enfocar la primera situación.
  - Usar un `useRef` para saltar el primer render, porque al entrar el foco ya va al `<h1>` vía `useNavegacion` (spec FR-025, [R5](./research.md)).
- [X] T030 [US3] Desplazamiento en `src/pages/Emergencia.jsx`: tras cada cambio de `conversacion`, llamar a `scrollIntoView({ block: "nearest", behavior })` sobre el último mensaje. `behavior` es `"smooth"` salvo que `window.matchMedia("(prefers-reduced-motion: reduce)").matches`, en cuyo caso es `"auto"`. Sin animaciones CSS nuevas (spec FR-023, [R6](./research.md)).
- [X] T031 [US3] Revisar el foco de los diálogos en `src/pages/Emergencia.jsx`: el foco inicial va a "Seguir aquí" (`autoFocus` o ref), y al cancelar vuelve al control que abrió el diálogo ("Más ayuda" o el botón de la barra o "Volver al inicio" que se tocó). Si `Dialogo` no lo permite, agregar en `src/components/Dialogo.jsx` una prop opcional `alCerrarEnfocar` sin cambiar su uso actual en Inicio y Diagnóstico.
- [ ] T032 [US3] Validar US3 con [quickstart.md](./quickstart.md) escenarios 13, 14, 15 y 17 con VoiceOver (macOS o iOS) y, si se puede, NVDA. Si el orden de anuncio entre el foco y la región viva confunde, aplicar la alternativa de R5 (enfocar el mensaje nuevo en lugar de la opción) y anotarlo en `specs/003-rediseno-emergencia-agente/research.md`.

**Checkpoint**: las tres historias funcionan y son accesibles.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T033 [P] Actualizar `specs/001-escudo-web-app/contracts/pantallas.md`:
  - Cambiar la fila `emergencia` de la tabla a `{ pantalla: "emergencia" }`, sin `vista`, y con "FR-030…FR-034 → spec 003".
  - Cambiar la fila "Vista interna de Emergencia" de la tabla de "atrás" a "Confirmación de salida (spec 003, FR-041)".
  - Agregar en la sección de Emergencia un enlace a `../../003-rediseno-emergencia-agente/contracts/pantallas.md`.
- [X] T034 [P] Actualizar `specs/001-escudo-web-app/contracts/contenido.md`: reemplazar el bloque `## \`emergencias.js\`` por una línea que remita a `../../003-rediseno-emergencia-agente/contracts/contenido-emergencias.md`.
- [X] T035 [P] Actualizar en `specs/001-escudo-web-app/tasks.md` las tareas T036 y T087 para que validen "3 toques o menos" (SC-002 aclarado el 2026-10-20, spec 003 SC-001).
- [X] T036 Revisar que `src/pages/Emergencia.jsx`, `src/components/MensajeConversacion.jsx`, `src/components/OpcionesConversacion.jsx` y `src/components/AccionesRapidas.jsx`:
  - no tengan hex, `style=`, `<input>`, `<textarea>`, `localStorage`, `history.state` ni `fetch`;
  - usen solo íconos de §7.9 (ShieldCheck, TriangleAlert, ChevronRight, ChevronDown, Phone, FileText, X);
  - no tengan código muerto de la versión anterior (`vista`, `PREFIJO_GUIA`).
- [X] T037 Ejecutar `npm test`, `npm run lint`, `npm run format:check` y `npm run build`. Corregir cualquier fallo que no esté en la lista de T001 (nunca escribiendo contenido para hacer pasar una prueba, principio III) y confirmar que la CSP del build sigue con `connect-src 'none'` en `dist/index.html`.
- [ ] T038 Validar los escenarios restantes de [quickstart.md](./quickstart.md):
  - 10: modo sin conexión y cero peticiones en Network.
  - 11: nada guardado en Local Storage tras salir.
  - 12: movimiento reducido.
  - 16: 1440 px.
  - SC-006: 360 px sin desplazamiento horizontal, incluido el botón de dos líneas con zoom de texto al 200 %.
- [X] T039 Escribir el resumen para el equipo (en la descripción del commit o del PR) con:
  - lo que queda pendiente de entregar en `src/data/emergencias.js` (salida de `validarContenidoEmergencias` contra el contenido real);
  - lo que queda pendiente de aprobar: el respaldo de R3, el estilo de R4 y R9, y los textos "Salir" / "Seguir aquí" (aprobados por el equipo el 2026-10-20).

  Recordar que no se publica con contenido `PROVISIONAL` ni `PENDIENTE` (spec FR-013).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de T001; bloquea todas las historias.
- **US1 (Phase 3)**: depende de la fase 2.
- **US2 (Phase 4)**: depende de la fase 2. Su parte de lógica (T020–T021) puede ir en paralelo con US1, pero T022, T024 y T025 tocan `MensajeConversacion.jsx` y `Emergencia.jsx`, creados en T012 y T014.
- **US3 (Phase 5)**: depende de T012, T013 y T014 (US1) y de T023–T025 (US2), porque ajusta el foco de todos esos controles.
- **Polish (Phase 6)**: T033–T035 se pueden hacer en cualquier momento después de la fase 2; T036–T039, al final.

### Dentro de cada historia

- Las pruebas (T008, T020) se escriben y fallan antes de implementar (T009, T021).
- La lógica (`/src/logic`) va antes que los componentes que la usan.
- En US1: T010–T013 antes de T014; T014 antes de T015–T018; T016 antes de T017.
- Validación manual (T019, T026, T032) al cerrar cada historia.

### Archivos compartidos (evitar conflictos)

- `src/logic/ConversacionEmergencia.js`: T004 → T006 → T009 → T021 (en serie).
- `tests/logic/ConversacionEmergencia.test.js`: T005 → T008 → T020 (en serie).
- `src/pages/Emergencia.jsx`: T014 → T018 → T024 → T025 → T027 → T029 → T030 → T031 (en serie).
- `src/App.jsx`: T015 → T017.

### Parallel Opportunities

- Fase 2: T002 y T003 en paralelo.
- US1: T010, T012 y T013 en paralelo entre sí (archivos distintos), mientras T008→T009 avanzan en la lógica.
- US2: T023 en paralelo con T020→T021.
- US3: T028 en paralelo con T027.
- Polish: T033, T034 y T035 en paralelo.

---

## Parallel Example: User Story 1

```text
# Lógica (en serie, un solo archivo):
T008 → T009  (pruebas y clase ConversacionEmergencia)

# Al mismo tiempo, interfaz en archivos distintos:
T010  BOTON_EMERGENCIA_ASISTENTE en src/components/botones.js
T012  src/components/MensajeConversacion.jsx
T013  src/components/OpcionesConversacion.jsx

# Después, en serie:
T011 (Inicio) · T014 (Emergencia) → T015 (App) → T016 (useNavegacion) → T017 (App) → T018 (guarda) → T019 (validar)
```

## Parallel Example: User Story 2

```text
T020 → T021        (lógica de acciones rápidas)
T023               (AccionesRapidas.jsx, en paralelo)
T022 → T024 → T025 (integración en MensajeConversacion y Emergencia)
T026               (validar)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 y fase 2 (contenido, constantes y validación).
2. Fase 3 (US1): botón de dos líneas, conversación completa y confirmación de salida.
3. **Parar y validar** con T019: se puede demostrar la guía paso a paso aunque falten las acciones rápidas. La pantalla anterior queda reemplazada, así que las líneas bancarias y la denuncia solo vuelven con US2. No publicar solo con US1.

### Incremental Delivery

1. Fases 1 y 2 → base lista.
2. US1 → demo interna del flujo.
3. US2 → se recupera el acceso a bancos y denuncia (el mínimo publicable, porque la spec 001 los exigía).
4. US3 → accesibilidad completa (obligatoria por WCAG 2.1 AA antes de publicar).
5. Polish → documentos de la 001, build y validación final.

### Nota sobre publicación

No se publica hasta que el equipo entregue el contenido real de `src/data/emergencias.js` y `validarContenidoEmergencias` no reporte pendientes (spec FR-013, plan "Riesgos y dependencias").

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- Hacer un commit local por tarea o grupo lógico. El push lo hace el equipo.
- Ante una contradicción con la constitución o la spec, detenerse y avisar antes de tocar código (constitución, reglas del agente).
- No inventar contenido en `src/data/emergencias.js` fuera de lo aprobado en FR-013.

---

## Fallos permitidos (contenido pendiente)

Registrados en T001 (2026-10-20, rama `003-rediseno-emergencia-agente`). `npm run lint` sin errores; `npm test`: 6 fallos de 84, todos en `tests/logic/contenido.test.js` y todos por contenido que el equipo aún no entrega:

1. `politica.js > tiene título y al menos 1 sección con subtítulo y texto`
2. `emergencias.js > tiene exactamente las 3 guías con sus ids, títulos y pasos` (T007 la divide: la de títulos pasa; queda pendiente `emergencias.js > cada guía tiene pasos no vacíos`)
3. `emergencias.js > AVISO_NO_BORRES tiene el título exacto y texto`
4. `emergencias.js > LINEAS_BANCARIAS: al menos 1, número con solo dígitos, espacios, +, #, *, -`
5. `emergencias.js > CANALES_DENUNCIA: al menos 1; si hay enlace, empieza por https://`
6. `tips.js > comoReconocerla y queHacer no están vacíos`
