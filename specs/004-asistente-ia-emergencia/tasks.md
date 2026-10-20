---

description: "Lista de tareas: escritura libre en Emergencia con asistente de IA (spec 004)"
---

# Tasks: Escritura libre en Emergencia con asistente de IA

**Input**: Documentos de diseño en `/specs/004-asistente-ia-emergencia/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: se incluyen pruebas Vitest para todo lo nuevo o ampliado en `/src/logic`, porque la constitución (principio V) las exige. La interfaz y el flujo de n8n se validan con [quickstart.md](./quickstart.md).

**Organización**: por historia de usuario de la spec. US1, US2 y US3 son P1; US4 es P2.

**Reglas para todas las tareas** (constitución I, IV, V y §7; contratos de esta spec):
- Solo tokens de `tailwind.config.js`.
- Íconos de §7.9 con `strokeWidth={2}` y `aria-hidden="true"`.
- Nombres en español y JSDoc en todo lo público.
- Nada de `localStorage`, `sessionStorage`, `history.state` ni `dangerouslySetInnerHTML`.
- La única petición de red permitida es `AsistenteIA.responder`, y solo después del consentimiento.
- Una tarea está terminada cuando `npm run lint` no da errores y `npm test` no tiene fallos nuevos. Los fallos permitidos son los de contenido pendiente registrados en `specs/003-rediseno-emergencia-agente/tasks.md`, más el de `CONSENTIMIENTO_IA` que agrega T006.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin depender de tareas pendientes)
- **[Story]**: US1, US2, US3 o US4

---

## Phase 1: Setup

- [ ] T001 Crear la rama `004-asistente-ia-emergencia` desde `003-rediseno-emergencia-agente`, después de hacer commit local de los cambios de specs pendientes (`specs/001-escudo-web-app/spec.md`, `specs/003-rediseno-emergencia-agente/spec.md` y `specs/004-asistente-ia-emergencia/`). Correr `npm test` y `npm run lint` y confirmar que solo fallan las 6 pruebas de contenido pendiente registradas en la spec 003.
- [ ] T002 Confirmar con el equipo si se aprueba `scripts/webhook-prueba.mjs` (servidor local solo para desarrollo, nunca publicado; riesgo del principio IV en `specs/004-asistente-ia-emergencia/plan.md`) y anotar la decisión al final de este archivo, en una sección "Decisiones". Si no se aprueba, T020 se omite y las pruebas manuales con respuesta esperan al flujo real (T037).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: filtro de datos sensibles (condición de la constitución I para enviar cualquier cosa), configuración del webhook y CSP, constantes de texto y la base de la conversación con escritura.

**⚠️ CRITICAL**: ninguna historia empieza antes de terminar esta fase.

- [ ] T003 [P] Escribir `tests/logic/FiltroDatosSensibles.test.js` con la tabla de [contracts/logica.md](./contracts/logica.md):
  - **Bloquea como tarjeta:** "mi tarjeta 4111 1111 1111 1111"; "4111-1111-1111-1111"; "4111111111111111"; "cuenta 0123456789012" (13 dígitos); un número de 19 dígitos.
  - **Bloquea como código:** "me llegó el 482913", "código 1234", "me robaron 500000" y un número de 8 dígitos.
  - **Devuelve `null`:** "500.000", "500 mil", "3001234567" (10 dígitos), "el 20 de octubre", "123", 20 dígitos seguidos (fuera de los dos rangos).
  - **Mismo texto con tarjeta y código:** debe dar `tarjeta`.
  - **Resultado:** incluye `fragmento`, `inicio` y `fin` correctos para poder resaltarlo.

  Las pruebas deben fallar antes de T004.
- [ ] T004 Crear `src/logic/FiltroDatosSensibles.js`:
  - `LIMITES_TARJETA = { minimo: 13, maximo: 19 }` y `LIMITES_CODIGO = { minimo: 4, maximo: 8 }`.
  - `detectarDatoSensible(texto)` con las dos expresiones de [research.md](./research.md) R3. Revisa primero la tarjeta y luego el código, y devuelve `null | { tipo: "tarjeta" | "codigo", fragmento, inicio, fin }`.
  - Si se usan las expresiones con lookbehind, verificar que sigan cumpliendo los límites al construirlas desde las constantes. Con JSDoc.
  - Hacer pasar T003.
- [ ] T005 [P] Crear `src/logic/AsistenteIA.js` solo con:
  - Constantes: `TIEMPO_ESPERA_MS = 20000`, `MAXIMO_CARACTERES_MENSAJE = 1000`, `MAXIMO_CARACTERES_RESPUESTA = 4000` y `MAXIMO_MENSAJES_ENVIADOS = 20`.
  - `TEXTOS_IA`, con los textos exactos de la spec y los contratos:
    - Escritura: invitación "Cuéntame con tus palabras qué te pasó", aviso "No escribas contraseñas, números de tarjeta o de cuenta, ni códigos de verificación", botones "Acepto y quiero escribir", "No, prefiero ver las guías" y "Enviar", enlaces "No puedo o no quiero escribir: ver guías" y "Prefiero escribirlo".
    - Estados: "Respuesta generada por IA", "No reemplaza a tu banco ni a las autoridades", "El asistente está respondiendo…" y el aviso de sin conexión.
    - Bloqueos de tarjeta y de código (este con el ejemplo "500 mil" / "20 de octubre").
    - Fallos `general` y `limite`, y "Ver guías".
  - `escrituraConfigurada(url)`, que devuelve `true` solo si `url` empieza por `https://` (o `http://localhost` / `http://127.0.0.1` en desarrollo), con JSDoc. Agregar sus casos en `tests/logic/AsistenteIA.test.js`.
- [ ] T006 [P] Crear `src/data/asistenteIA.js` con `CONSENTIMIENTO_IA = { titulo: "", parrafos: [] }` y el comentario `// PENDIENTE: lo redacta y aprueba el equipo (spec 004 FR-004, Ley 1581 de 2012)`, que liste lo que debe explicar: n8n, proveedor de IA posiblemente fuera de Colombia, que no se guarda, para qué se usa y la alternativa de las guías. Agregar en `tests/logic/contenido.test.js` una prueba "CONSENTIMIENTO_IA tiene título y al menos 1 párrafo" (queda como fallo permitido) e incluir `CONSENTIMIENTO_IA` en la prueba de prohibiciones.
- [ ] T007 [P] Ampliar `cspSoloEnBuild` en `vite.config.js` ([research.md](./research.md) R2):
  - Leer `VITE_URL_ASISTENTE_IA` con `loadEnv`.
  - Si existe y empieza por `https://`, `connect-src` pasa a ser `new URL(url).origin`.
  - Si existe y no es `https://`, lanzar un error con el mensaje "VITE_URL_ASISTENTE_IA debe usar https://".
  - Si no existe, se queda en `'none'`.

  Documentar la variable en un `.env.example` nuevo, comentado y sin URL real.
- [ ] T008 Escribir en `tests/logic/ConversacionEmergencia.test.js` un `describe("ConversacionEmergencia — escritura (spec 004)")` que cubra:
  - `iniciarEscritura` deja la conversación sin mensajes, sin opciones, sin progreso y con `estaEsperandoIA()` en falso.
  - `abrirGuias()` agrega el saludo y las 7 situaciones sin borrar nada.
  - `volverAEscribir()` quita las opciones sin borrar mensajes.
  - `reiniciar()` vuelve al modo inicial: escritura si empezó con `iniciarEscritura`, guías si empezó con `iniciar`.
  - Las pruebas de la 003 siguen pasando sin cambios.

  Deben fallar antes de T009.
- [ ] T009 Ampliar `src/logic/ConversacionEmergencia.js` ([contracts/logica.md](./contracts/logica.md), [data-model.md](./data-model.md)):
  - Campo privado `#modoInicial` (`"escritura" | "guias"`); `iniciar` lo fija en `"guias"`.
  - `static iniciarEscritura(contenido)`: etapa `escritura`, sin mensajes ni opciones.
  - `abrirGuias()` reutiliza `#conSaludo([])`.
  - `volverAEscribir()`: etapa `escritura`, opciones vacías.
  - `estaEsperandoIA()`.
  - `reiniciar()` según `#modoInicial`.
  - Constantes de etapa `ESCRITURA`, `ESPERANDO_IA` y `FALLO_IA`. Con JSDoc. Hacer pasar T008.

**Checkpoint**: filtro probado, CSP configurable y conversación con modo escritura. `npm test` sin fallos nuevos.

---

## Phase 3: User Story 1 - Contar con mis palabras lo que me pasó y recibir orientación (Priority: P1) 🎯 MVP

**Goal**: con conexión y URL configurada, Emergencia abre en la escritura. La persona acepta el consentimiento, escribe, envía y recibe respuestas marcadas como IA en la misma conversación.

**Independent Test**: quickstart escenarios 2, 4, 5, 12, 13, 14, 15 y 17. Solo viajan los textos del intercambio y solo después del consentimiento.

### Tests for User Story 1 ⚠️

- [ ] T010 [P] [US1] Escribir `tests/logic/AsistenteIA.test.js` (`describe("AsistenteIA.responder")`), con `fetch` falso que registre la llamada:
  - El cuerpo es exactamente `{ mensajes }`, sin otros campos.
  - La petición usa `method: "POST"`, `credentials: "omit"`, `referrerPolicy: "no-referrer"` y `Content-Type: application/json`.
  - Con más de 20 mensajes se envían solo los últimos 20.
  - Una respuesta 200 con `{ respuesta: "hola" }` da `{ ok: true, texto: "hola" }`.
  - Una respuesta vacía, de más de 4.000 caracteres o sin el campo `respuesta` da `motivo: "invalida"`.
  - JSON inválido da `invalida`; 429 da `limite`; 500 da `red`; `fetch` que rechaza da `red`.
  - Pasados 20 s (con `vi.useFakeTimers()`), da `tiempo` y cancela la petición.
  - El método nunca lanza errores.
- [ ] T011 [P] [US1] Agregar a `tests/logic/ConversacionEmergencia.test.js` un `describe("ConversacionEmergencia — intercambio con IA")`:
  - `agregarMensajeEscrito("hola")` en `escritura` agrega `{ autor: "persona", tipo: "escrito", texto: "hola" }` y `{ autor: "asistente", tipo: "esperandoIA" }`, `estaEsperandoIA()` y `tieneProgreso()`.
  - `agregarRespuestaIA("r")` reemplaza `esperandoIA` por `{ tipo: "respuestaIA", texto: "r" }` y vuelve a `escritura`.
  - En una etapa que no corresponde, los dos métodos devuelven la misma instancia: escribir mientras se espera respuesta, o agregar una respuesta en `escritura`.
  - `obtenerIntercambioIA()` devuelve solo `{ rol, texto }` de los mensajes `escrito` y `respuestaIA`, en orden, aunque haya pasos de guías, elecciones o líneas bancarias en medio.
  - Un texto vacío o de más de 1.000 caracteres se rechaza devolviendo la misma instancia.

### Implementation for User Story 1

- [ ] T012 [US1] Implementar `class AsistenteIA` en `src/logic/AsistenteIA.js` ([research.md](./research.md) R4, [contracts/webhook.md](./contracts/webhook.md)):
  - Constructor `({ url, fetch = globalThis.fetch, tiempoEsperaMs = TIEMPO_ESPERA_MS })`.
  - `async responder(intercambio)` con `AbortController` y `setTimeout`. Debe recortar a `MAXIMO_MENSAJES_ENVIADOS`, validar la respuesta según la tabla del contrato y devolver siempre `{ ok, texto }` o `{ ok: false, motivo }`, sin lanzar errores.
  - Funciones privadas de menos de 20 líneas, con JSDoc. Hacer pasar T010.
- [ ] T013 [US1] Implementar en `src/logic/ConversacionEmergencia.js`:
  - `agregarMensajeEscrito(texto)`: solo en `escritura` o `falloIA`, texto con `trim` no vacío y de "1–1.000 caracteres".
  - `agregarRespuestaIA(texto)`: solo en `esperandoIA`; reemplaza el último mensaje `esperandoIA` conservando su id.
  - `obtenerIntercambioIA()`: mapea `escrito` → `rol: "persona"` y `respuestaIA` → `rol: "asistente"`.

  El texto `esperandoIA` sale de `TEXTOS_IA`. Hacer pasar T011.
- [ ] T014 [P] [US1] Ampliar `src/components/MensajeConversacion.jsx` ([contracts/pantallas.md](./contracts/pantallas.md), "Mensajes nuevos"):
  - **`escrito`:** burbuja de la persona con el prefijo `sr-only` "Tú escribiste:".
  - **`respuestaIA`:** burbuja del asistente con el chip `TEXTOS_IA` "Respuesta generada por IA" (`CHIP bg-pista text-texto-secundario`), el texto en `<p className="whitespace-pre-line">` y el pie "No reemplaza a tu banco ni a las autoridades" (`text-xs text-texto-suave`).
  - **`esperandoIA`:** burbuja del asistente con su texto.

  Sin `dangerouslySetInnerHTML`.
- [ ] T015 [US1] Crear `src/components/EscrituraIA.jsx` (versión US1; los bloqueos con resaltado van en US2):
  - Props `consentimiento`, `onAceptar`, `onVerGuias`, `onEnviar(texto)` y `esperando`.
  - **Sin consentimiento:** tarjeta `TARJETA` con `CONSENTIMIENTO_IA.titulo` y `parrafos` (o un párrafo "Texto del consentimiento pendiente" si está vacío, solo para que se vea en desarrollo) y botones "Acepto y quiero escribir" (`BOTON_PRINCIPAL`) y "No, prefiero ver las guías" (`BOTON_SECUNDARIO`).
  - **Con consentimiento:** `<label htmlFor>` con la invitación, `<textarea maxLength={MAXIMO_CARACTERES_MENSAJE} rows={3}>` (`rounded-boton border border-borde bg-fondo p-3 text-base`), el aviso de datos sensibles con `Lock` de 16 px, un contador cuando quedan 100 caracteres o menos y "Enviar" (`BOTON_PRINCIPAL` con `ChevronRight`), deshabilitado sin texto o mientras `esperando`.
  - Si `detectarDatoSensible(borrador)` no es `null`, no llama a `onEnviar` y muestra un texto genérico de bloqueo (US2 lo mejora).
  - Debajo, el enlace "No puedo o no quiero escribir: ver guías" (`BOTON_ENLACE`).
  - El borrador es estado local y se vacía solo cuando `onEnviar` confirma que se envió.
- [ ] T016 [US1] En `src/pages/Emergencia.jsx`, modo inicial según [research.md](./research.md) R6:
  - `const URL_IA = import.meta.env.VITE_URL_ASISTENTE_IA`.
  - `const asistente = useMemo(() => escrituraConfigurada(URL_IA) ? new AsistenteIA({ url: URL_IA }) : null, [])`.
  - El estado inicial usa `iniciarEscritura` si `asistente && navigator.onLine`; si no, `iniciar`.
  - `const [consentimientoIA, setConsentimientoIA] = useState(false)`, que nunca se guarda en el navegador (FR-005).
- [ ] T017 [US1] Envío en `src/pages/Emergencia.jsx`: función `enviarMensaje(texto)` que:
  1. no hace nada sin consentimiento o si `detectarDatoSensible(texto)` no es `null` (doble guarda, constitución I);
  2. aplica `agregarMensajeEscrito` y calcula el intercambio con la conversación resultante;
  3. hace `await asistente.responder(intercambio)`;
  4. aplica `agregarRespuestaIA(texto)` si `ok`.

  Los fallos se tratan en US3 (T026); hasta entonces, un fallo deja la conversación esperando. Usar la forma funcional de `setConversacion`. Mostrar `EscrituraIA` solo en las etapas `escritura`, `esperandoIA` y `falloIA`, entre las opciones y "Volver al inicio".
- [ ] T018 [US1] Foco en `src/pages/Emergencia.jsx` según la tabla "Foco y anuncios" de [contracts/pantallas.md](./contracts/pantallas.md): al aceptar el consentimiento y al recibir una respuesta, el foco pasa al `textarea` (ref expuesta por `EscrituraIA`). Ajustar el efecto de foco de la 003 para que en la etapa `escritura` no busque una primera opción.
- [ ] T019 [US1] "Empezar de nuevo" en `src/pages/Emergencia.jsx`: con el `reiniciar()` ampliado (T009) vuelve a la escritura vacía y `consentimientoIA` no cambia (FR-021). Verificar que la confirmación de salida de la 003 (FR-041) siga funcionando con mensajes `escrito`.
- [ ] T020 [P] [US1] Si T002 lo aprobó: crear `scripts/webhook-prueba.mjs` con `node:http`, sin dependencias, en el puerto 8787:
  - Responde `POST` con CORS para `http://localhost:5173` y `http://localhost:5179` y `{ respuesta: "Respuesta de prueba: recibí N mensajes." }`.
  - Con `?modo=429|500|lento|invalida` simula fallos (`lento` espera 25 s).
  - Comentario inicial: "SOLO DESARROLLO. No se publica ni se incluye en el build."
  - Excluirlo de `vite build` (está fuera de `src/`) y agregar el script `"webhook:prueba"` en `package.json`.
- [ ] T021 [US1] Validar US1 con [quickstart.md](./quickstart.md) escenarios 1, 2, 4, 5, 12, 13, 14 y 15 (con el webhook de prueba o el real) y anotar desviaciones como tareas nuevas.

**Checkpoint**: se puede escribir y recibir respuestas con el webhook de prueba.

---

## Phase 4: User Story 2 - Que no se me escape un dato sensible (Priority: P1)

**Goal**: explicaciones de bloqueo específicas, con el número resaltado y la sugerencia de reescritura.

**Independent Test**: quickstart escenarios 6 y 7. Cero peticiones con datos bloqueados.

- [ ] T022 [US2] En `src/components/EscrituraIA.jsx`, cambiar el bloqueo genérico por:
  - estado `bloqueo` (resultado de `detectarDatoSensible`), calculado al tocar "Enviar" y limpiado con `onChange`;
  - explicación en `<p id="explicacion-bloqueo" role="alert">` con el texto de `TEXTOS_IA` según `tipo`;
  - una vista del mensaje con `bloqueo.fragmento` dentro de `<mark className="rounded-etiqueta bg-advertencia-suave px-1 text-advertencia-texto">`;
  - para `codigo`, el ejemplo "500 mil" / "20 de octubre" (spec FR-008 y aclaración 2026-10-20).

  El texto queda en el campo y no hay ningún botón para enviarlo igual.
- [ ] T023 [US2] Validar US2 con [quickstart.md](./quickstart.md) escenarios 6 y 7 revisando en DevTools → Network que los mensajes bloqueados no generan peticiones.

**Checkpoint**: ningún dato con forma de tarjeta o código sale del dispositivo.

---

## Phase 5: User Story 3 - Recibir ayuda aunque falle la conexión o no quiera usar IA (Priority: P1)

**Goal**: guías como respaldo sin conexión, sin consentimiento, sin configuración o ante cualquier fallo, sumadas a la misma conversación, con vuelta a la escritura.

**Independent Test**: quickstart escenarios 1, 3, 8, 9, 10 y 11.

### Tests for User Story 3 ⚠️

- [ ] T024 [US3] Agregar a `tests/logic/ConversacionEmergencia.test.js` un `describe("ConversacionEmergencia — fallos y guías")`:
  - `agregarFalloIA("tiempo")` en `esperandoIA` reemplaza `esperandoIA` por `{ tipo: "falloIA", motivo: "tiempo", texto: TEXTOS_IA fallo general }`, con opciones `[{ id: "verGuias", texto: "Ver guías" }]`.
  - Con `"limite"` usa el texto de límite.
  - `elegir("verGuias")` agrega la elección, el saludo y las 7 situaciones.
  - Desde `falloIA` se puede volver a escribir con `agregarMensajeEscrito` (reintento).
  - Después de abrir las guías y volver con `volverAEscribir()`, `obtenerIntercambioIA()` sigue igual.

### Implementation for User Story 3

- [ ] T025 [US3] Implementar `agregarFalloIA(motivo)` y la opción `verGuias` en `src/logic/ConversacionEmergencia.js`. `elegir("verGuias")` se resuelve en `#elegirAccionFija`: registra la elección y llama a `abrirGuias`. Hacer pasar T024.
- [ ] T026 [US3] En `enviarMensaje` (`src/pages/Emergencia.jsx`), si `!resultado.ok` aplicar `agregarFalloIA(resultado.motivo)` (spec FR-013). El foco pasa a la opción "Ver guías" con la regla de foco de la 003.
- [ ] T027 [US3] En `src/pages/Emergencia.jsx`:
  - **Sin conexión con URL configurada (FR-003):** mostrar arriba de la conversación `<p role="status">` con `TEXTOS_IA` "No tienes conexión. Te muestro las guías, que funcionan sin internet."
  - **"No, prefiero ver las guías" y el enlace "No puedo o no quiero escribir: ver guías":** llaman a `abrirGuias()`.
  - **Vuelta a la escritura:** si `asistente` existe, `navigator.onLine` y la etapa es de la 003, mostrar debajo de las opciones el enlace "Prefiero escribirlo" (`BOTON_ENLACE`). Llama a `volverAEscribir()` y no toca `consentimientoIA` (FR-014).
- [ ] T028 [US3] Validar US3 con [quickstart.md](./quickstart.md) escenarios 1, 3, 8, 9, 10 y 11 (webhook de prueba con `?modo=` o, sin él, apagando la red en DevTools).

**Checkpoint**: nunca hay una pantalla sin ayuda.

---

## Phase 6: User Story 4 - Usar la escritura con lector de pantalla o teclado (Priority: P2)

**Goal**: etiqueta y aviso asociados al campo, anuncios correctos y foco predecible.

**Independent Test**: quickstart escenario 16.

- [ ] T029 [P] [US4] En `src/components/EscrituraIA.jsx`:
  - `aria-describedby` del `textarea` con `aviso-sensibles` (y `explicacion-bloqueo` cuando hay bloqueo);
  - contador con `aria-live="polite"` solo cuando aparece;
  - "Enviar" con `aria-disabled` coherente;
  - tras un bloqueo, el foco vuelve al `textarea` (spec FR-019).
- [ ] T030 [US4] Verificar en `src/pages/Emergencia.jsx` que `esperandoIA`, `respuestaIA` y `falloIA` se anuncian por el `role="log"` existente, y que el prefijo `sr-only` "El asistente dice:" no se duplica con el chip "Respuesta generada por IA". Ajustar `MensajeConversacion` si el orden de lectura confunde.
- [ ] T031 [US4] Validar US4 con [quickstart.md](./quickstart.md) escenario 16 con VoiceOver y, si se puede, NVDA, más axe DevTools o Lighthouse en la vista de escritura (SC-007).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Actualizar la documentación de la spec 003:
  - `specs/003-rediseno-emergencia-agente/plan.md`: en "Riesgos y dependencias", agregar que FR-042 lo implementa la spec 004.
  - `specs/003-rediseno-emergencia-agente/contracts/pantallas.md`: agregar al inicio un enlace a `../../004-asistente-ia-emergencia/contracts/pantallas.md` para la vista de escritura.
- [ ] T033 [P] Revisar `src/components/EscrituraIA.jsx`, `src/logic/AsistenteIA.js`, `src/logic/FiltroDatosSensibles.js` y los cambios en `src/pages/Emergencia.jsx` y `src/components/MensajeConversacion.jsx`. No debe haber hex, `style=`, `localStorage`, `sessionStorage`, `history.state` ni `dangerouslySetInnerHTML`, la única llamada a `fetch` debe estar en `AsistenteIA`, y solo deben usarse íconos de §7.9.
- [ ] T034 Ejecutar `npm test`, `npm run lint` y `npm run format:check`, y los tres builds de [quickstart.md](./quickstart.md):
  - sin la variable: `connect-src 'none'` en `dist/index.html`;
  - con una URL `https://`: `connect-src` igual a su origen;
  - con `http://`: el build debe fallar.
- [ ] T035 Validar los escenarios 17 (revisión de red con la URL real) y 15 (almacenamiento) de [quickstart.md](./quickstart.md) en un build de producción (`npm run build && npm run preview`).
- [ ] T036 [P] Agregar a `.gitignore` las líneas `.env` y `.env.*` excepto `.env.example`, para que nunca se suba una URL de webhook privada.
- [ ] T037 Cuando el equipo defina proveedor y alojamiento (TODOs de la constitución): configurar el flujo en n8n según [contracts/n8n-flujo.md](./contracts/n8n-flujo.md), verificar el escenario 18 de [quickstart.md](./quickstart.md) y exportar el flujo **sin credenciales** a `n8n/asistente-emergencia.json`.
- [ ] T038 Escribir el resumen para el equipo en el mensaje del commit final. Debe incluir lo pendiente para publicar: el proveedor y el alojamiento, `CONSENTIMIENTO_IA` y el contenido de emergencias de la 003. Y lo que hay que aprobar: los elementos visuales nuevos de R7 y R8 (tarjeta de consentimiento, campo y chip de IA) y los textos de interfaz de `TEXTOS_IA`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (fase 1)**: T001 primero; T002 es una consulta y no bloquea el código, solo T020.
- **Foundational (fase 2)**: depende de T001 y bloquea todas las historias. T003→T004 y T008→T009 van en serie; T005, T006 y T007 en paralelo.
- **US1 (fase 3)**: depende de la fase 2.
- **US2 (fase 4)**: depende de T015 (US1), porque mejora el bloqueo que este dibuja.
- **US3 (fase 5)**: su lógica (T024–T025) puede ir en paralelo con US1 después de T013; T026 y T027 dependen de T016–T017.
- **US4 (fase 6)**: depende de US1, US2 y US3, porque ajusta todos sus controles.
- **Polish (fase 7)**: T032 y T036 en cualquier momento; T033–T035 al final; T037 cuando existan proveedor y alojamiento.

### Archivos compartidos (en serie)

- `src/logic/ConversacionEmergencia.js`: T009 → T013 → T025.
- `tests/logic/ConversacionEmergencia.test.js`: T008 → T011 → T024.
- `src/logic/AsistenteIA.js`: T005 → T012.
- `tests/logic/AsistenteIA.test.js`: T005 → T010.
- `src/components/EscrituraIA.jsx`: T015 → T022 → T029.
- `src/pages/Emergencia.jsx`: T016 → T017 → T018 → T019 → T026 → T027 → T030.

### Parallel Opportunities

- Fase 2: T003, T005, T006 y T007 en paralelo.
- US1: T010 y T011 en paralelo; T014 y T020 en paralelo con T012 y T013.
- US3: T024 y T025 en paralelo con T014–T015 de US1.
- Polish: T032, T033 y T036 en paralelo.

---

## Parallel Example: Phase 2 + User Story 1

```text
# Fase 2, en paralelo:
T003 → T004   FiltroDatosSensibles
T005          constantes de AsistenteIA
T006          src/data/asistenteIA.js
T007          vite.config.js (CSP)
T008 → T009   ConversacionEmergencia (escritura)

# US1:
T010 → T012   AsistenteIA.responder        (en paralelo con)
T011 → T013   intercambio en la conversación
T014          MensajeConversacion          (en paralelo)
T015          EscrituraIA
T016 → T017 → T018 → T019   Emergencia.jsx
T021          validar
```

---

## Implementation Strategy

### MVP First

1. Fases 1 y 2 (el filtro de datos sensibles es base, no opcional).
2. US1: escribir y recibir respuesta con el webhook de prueba.
3. **No publicable aún**: falta el respaldo de US3, que exige el principio VI.

### Incremental Delivery

1. Fases 1 y 2 → base.
2. US1 → demo interna con el webhook de prueba.
3. US3 → respaldo completo (mínimo publicable en cuanto a comportamiento).
4. US2 → explicaciones de bloqueo completas (el bloqueo ya existe desde la fase 2 y T015).
5. US4 → accesibilidad (obligatoria antes de publicar).
6. Polish y T037 → flujo real de n8n.

### Nota sobre publicación

Sin `VITE_URL_ASISTENTE_IA`, la app se puede publicar en cualquier momento: Emergencia abre en las guías de la 003. **No se publica con la variable configurada** hasta que haya proveedor y alojamiento definidos, `CONSENTIMIENTO_IA` aprobado y T037 verificado.

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- Commits locales por tarea o grupo; el push lo hace el equipo.
- Ante una contradicción con la constitución o la spec, detenerse y avisar antes de tocar código.
- Nunca escribir contenido, ni el consentimiento ni las guías, para hacer pasar una prueba.
