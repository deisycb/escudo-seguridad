---

description: "Lista de tareas para implementar Escudo (001-escudo-web-app)"
---

# Tasks: Escudo — Diagnóstico de riesgo digital, plan de acción, tips y primeros auxilios

**Input**: Documentos de diseño en `/specs/001-escudo-web-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (contenido, almacenamiento, logica, pantallas), quickstart.md

**Tests**: SÍ se incluyen. La constitución (principio V) exige pruebas Vitest para todas las clases de `/src/logic`, y el plan agrega `tests/logic/contenido.test.js` para validar `/src/data`. La interfaz se valida con los escenarios manuales de `quickstart.md` (sin Testing Library ni jsdom, R11).

**Organization**: Las tareas se agrupan por historia de usuario para que cada una se pueda implementar y probar por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1…US5)
- Todas las rutas son relativas a la raíz del repositorio (proyecto único de frontend: `src/`, `tests/`)

## ⚠️ Reglas que aplican a TODAS las tareas

- **Contenido intocable (constitución III)**: los archivos de `src/data/` se llenan SOLO con el contenido entregado por el equipo. Los únicos textos que se pueden escribir sin esa entrega son los que la spec fija literalmente (títulos de tips, Regla de oro, títulos de guías, "No borres nada", garantías, textos de la UI). Si el contenido no ha llegado: **detenerse y pedirlo**, nunca inventarlo ni usar texto de relleno. Las tareas que dependen de esa entrega están marcadas con 🔒. **Excepción aprobada (spec, Clarifications 2026-10-16; research R13)**: `preguntas.js` usa los textos reales con puntajes y criticidades provisionales (a = 0 / `null`, b = 1 / `"importante"`, c = 2 / `"urgente"`), y `descripcionHabito` y `recomendaciones.js` son borradores marcados `PROVISIONAL`. La excepción no se extiende a ningún otro archivo.
- **Privacidad (constitución I)**: ningún `fetch`, analítica, fuente externa, CDN ni campo de texto libre.
- **Componentes sin cálculo**: ninguna página o componente calcula riesgo; todo sale de `Diagnostico` y `PlanAccion`.
- **Nombres en español**, `camelCase` / `PascalCase` / `MAYUSCULAS_CON_GUION`; JSDoc en cada clase y método público de `src/logic`; sin números mágicos (usar `src/logic/constantes.js`).
- **Rama**: antes de empezar, trabajar en la rama `001-escudo-web-app` (la actual es `cr-adicionar-preguntas`).
- Una tarea está terminada solo cuando `npm test` y `npm run lint` pasan.

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: Inicializar el proyecto Vite + React + Tailwind + Vitest + ESLint + Prettier en la raíz del repositorio.

- [X] T001 Crear `package.json` en la raíz con `"type": "module"`, `"private": true`, `"name": "escudo"`; scripts `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `test` (`vitest run`), `test:watch` (`vitest`), `lint` (`eslint .`), `format` (`prettier --write .`), `format:check` (`prettier --check .`); dependencias `react@^19`, `react-dom@^19`; devDependencias `vite@^7`, `@vitejs/plugin-react`, `tailwindcss@^4`, `@tailwindcss/vite`, `vitest@^3`, `eslint@^9`, `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`, `prettier@^3`, `eslint-config-prettier`. Ejecutar `npm install` para generar `package-lock.json` (requiere Node.js 22 LTS o superior)
- [X] T002 [P] Crear `.gitignore` con `node_modules/`, `dist/`, `.DS_Store` y `*.local`
- [X] T003 [P] Crear `vite.config.js` con los plugins `react()` y `tailwindcss()`, más un plugin propio `cspSoloEnBuild` (`apply: "build"`, hook `transformIndexHtml`) que inyecte en `<head>` la meta `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'">` (R9; no debe aplicarse en `dev` para no romper el HMR). Agregar `test: { environment: "node", include: ["tests/**/*.test.js"] }` para Vitest
- [X] T004 [P] Crear `eslint.config.js` (configuración *flat* de ESLint 9) con `@eslint/js` recommended, `eslint-plugin-react-hooks` (recommended), `eslint-plugin-react-refresh` (`only-export-components` en warn), `eslint-plugin-jsx-a11y` (recommended) y `eslint-config-prettier` al final; `globals.browser` para `src/**/*.{js,jsx}` y `globals.node` para `tests/**` y archivos de configuración; ignorar `dist/`
- [X] T005 [P] Crear `.prettierrc` (por ejemplo `{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100 }`) y `.prettierignore` con `dist/`, `package-lock.json` y `specs/`
- [X] T006 [P] Crear `index.html` con `<html lang="es">`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `<title>Escudo</title>`, `<div id="root"></div>` y `<script type="module" src="/src/main.jsx"></script>`. Sin fuentes ni scripts externos
- [X] T007 [P] Crear `src/index.css` con `@import "tailwindcss";`, la pila de fuentes del sistema en `body` (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; sin Google Fonts), `overflow-x: hidden` en `body` y un estilo de foco visible global (`:focus-visible { outline: 3px solid; outline-offset: 2px; }`) para WCAG 2.1 AA
- [X] T008 Crear `src/main.jsx` que importe `./index.css` y monte `<App />` dentro de `<StrictMode>` en `#root`, y un `src/App.jsx` provisional que renderice `<main><h1>Escudo</h1></main>`. Verificar que `npm run dev`, `npm run build` y `npm run lint` funcionan

---

## Phase 2: Foundational (prerrequisitos que bloquean todas las historias)

**Purpose**: Constantes, la clase `Pregunta`, la clase `Almacenamiento`, la navegación propia, los componentes globales y el esqueleto de `App.jsx`.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta terminar esta fase.

- [X] T009 [P] Crear `src/logic/constantes.js` exportando exactamente (data-model.md): `TOTAL_PREGUNTAS = 14`; `OPCIONES_VALIDAS = ["a", "b", "c"]`; `LIMITE_RIESGO_MEDIO = 40`; `LIMITE_RIESGO_ALTO = 70`; `NIVELES_SEMAFORO = { BAJO: "Bajo", MEDIO: "Medio", ALTO: "Alto" }`; `DIMENSIONES = [{ id: "phishing", nombre: "Phishing", desde: 1, hasta: 4 }, { id: "smishing", nombre: "Smishing", desde: 5, hasta: 8 }, { id: "vishing", nombre: "Vishing", desde: 9, hasta: 12 }, { id: "habitos", nombre: "Hábitos generales", desde: 13, hasta: 14 }]`; `PRIORIDADES = { urgente: { etiqueta: "Urgente", orden: 3 }, importante: { etiqueta: "Importante", orden: 2 }, revisa: { etiqueta: "Revisa", orden: 1 } }`; `CLAVE_ALMACENAMIENTO = "escudo.v1"`; `VERSION_ALMACENAMIENTO = 1`. Usar `Object.freeze` en objetos y arreglos
- [X] T010 [P] Crear `tests/fixtures/contenidoPrueba.js` (contenido SINTÉTICO solo para pruebas, con un comentario que lo diga; nunca se importa desde `src/`): (1) función `crearDatosPreguntas(puntajes)` que recibe 14 tríos `[a, b, c]` y devuelve 14 objetos con la forma de `contracts/contenido.md` (`numero`, `dimension` según `DIMENSIONES`, `texto: "Pregunta de prueba N"`, `descripcionHabito: "Hábito de prueba N"`, `opciones` con `criticidad: null` si el puntaje es 0 y si no `"revisa"`/`"importante"`/`"urgente"` creciente de a → c); (2) `DATOS_PREGUNTAS_PRUEBA` con puntajes `[0, 2, 4]` en las 14 preguntas; (3) `RECOMENDACIONES_PRUEBA` con una entrada por pregunta (`titulo`, `queHacerAhora`, `comoPrevenirlo` no vacíos); (4) clase `AlmacenFalso` con la interfaz de `Storage` (`getItem`, `setItem`, `removeItem`) sobre un `Map`, con opciones `{ fallarAlLeer, fallarAlEscribir }` que hacen lanzar un error
- [X] T011 [P] Escribir `tests/logic/Pregunta.test.js` (Vitest): expone `numero`, `dimension`, `texto`, `descripcionHabito`, `opciones`; `obtenerOpcion("b")` devuelve `{ texto, puntaje, criticidad }`; `obtenerOpcion("d")`, `obtenerOpcion(null)` y `obtenerOpcion("")` lanzan un error; `obtenerPuntaje(letra)` devuelve el puntaje; `obtenerPuntajeMaximo()` devuelve el mayor puntaje de las 3 opciones (probar también con `[0, 0, 0]` → 0). Usar `tests/fixtures/contenidoPrueba.js`
- [X] T012 Implementar `src/logic/Pregunta.js` según `contracts/logica.md`: clase `Pregunta` con constructor `(datos)` que copia `numero`, `dimension`, `texto`, `descripcionHabito`, `opciones`; métodos `obtenerOpcion(letra)` (lanza `Error` si la letra no está en `OPCIONES_VALIDAS`), `obtenerPuntaje(letra)` y `obtenerPuntajeMaximo()`. JSDoc en la clase y en cada método (depende de T009; hacer pasar T011)
- [X] T013 [P] Escribir `tests/logic/Almacenamiento.test.js` (Vitest, con `AlmacenFalso` y las preguntas de prueba): `estaDisponible()` es `false` si `setItem` lanza error; `cargar()` devuelve `vacio` si no existe la clave; `valido` con `{ respuestas, fecha, accionesHechas }` para el JSON de ejemplo de `contracts/almacenamiento.md`; `corrupto` **y borra la clave** en cada uno de estos casos: JSON ilegible, `version !== 1`, `respuestas` con longitud distinta de 14, una letra fuera de `"a" | "b" | "c"`, `fecha` con `Date.parse` inválido, `accionesHechas` que no es arreglo, con repetidos, con números fuera de 1–14, no enteros o que apuntan a una pregunta cuya respuesta tiene puntaje 0; `no-disponible` si `getItem` lanza error. `guardarDiagnostico(respuestas, fecha)` escribe `{ version: 1, diagnostico: { respuestas, fecha }, accionesHechas: [] }` y devuelve `true`; `guardarProgreso([2, 6])` reescribe solo `accionesHechas`; si `setItem` lanza error ambos devuelven `false` y el estado pasa a `no-disponible`; `borrar()` nunca lanza error; ningún método lanza error hacia afuera
- [X] T014 Implementar `src/logic/Almacenamiento.js` según `contracts/logica.md` y `contracts/almacenamiento.md`: constructor `(almacen = globalThis.localStorage)` protegido con `try/catch` (acceder a `localStorage` puede lanzar error); `estaDisponible()` escribe y borra una clave de prueba; `cargar(preguntas)` devuelve `{ estado: "vacio" | "valido" | "corrupto" | "no-disponible", datos? }` con las reglas de validación **literales** del contrato (`version === 1`; `diagnostico.respuestas` "arreglo de exactamente 14 elementos, cada uno "a", "b" o "c""; `diagnostico.fecha` "string con Date.parse válido"; `accionesHechas` "arreglo (puede estar vacío) de enteros únicos 1–14; cada uno es una pregunta cuya respuesta tiene puntaje mayor a 0", comprobado con `Pregunta.obtenerPuntaje`); si es `corrupto`, borra la clave; `guardarDiagnostico(respuestas, fecha)`, `guardarProgreso(accionesHechas)` (relee el registro actual y reemplaza solo `accionesHechas`) y `borrar()`. Solo guarda los campos del esquema (nada de porcentajes, textos ni consentimiento). Funciones de validación privadas cortas (menos de 20 líneas). JSDoc completo (depende de T009, T012; hacer pasar T013)
- [X] T015 [P] Crear `src/hooks/useNavegacion.js` (R1, `contracts/pantallas.md`): estado `{ pantalla, pregunta?, vista? }` inicializado con un valor recibido como parámetro y registrado con `history.replaceState`; `navegar(destino)` hace `history.pushState(destino, "")` y actualiza el estado; `reemplazar(destino)` usa `replaceState`; escucha `popstate` y aplica `event.state`; expone `registrarInterceptorAtras(fn)` / limpieza para que una pantalla pueda interceptar el "atrás" (si `fn(estadoNuevo)` devuelve `true`, el hook vuelve a empujar el estado actual y no cambia de pantalla). Tras cada cambio de pantalla o vista, mover el foco al `<h1>` de la pantalla (`document.querySelector("main h1")?.focus()` dentro de un `useEffect`). Sin react-router ni cambios de ruta en la URL
- [X] T016 [P] Crear `src/components/Dialogo.jsx`: envuelve el `<dialog>` nativo; props `abierto`, `titulo`, `onCerrar`, `children`, `acciones` (nodos de botones); llama `showModal()` / `close()` en un `useEffect` según `abierto`; escucha el evento `close` (Esc) para llamar `onCerrar`; `aria-labelledby` apuntando al título; botones con área táctil ≥ 44×44 px; contenido con scroll interno y ancho máximo que no supere la pantalla de 360 px
- [X] T017 [P] Crear `src/components/AvisoAlmacenamiento.jsx`: props `tipo` (`"corrupto" | "no-disponible"`) y `onCerrar`; contenedor con `role="status"`; textos exactos de `contracts/almacenamiento.md`: corrupto → "No pudimos recuperar tu diagnóstico anterior. Puedes hacerlo de nuevo."; no-disponible → "Tu navegador no permite guardar. Puedes usar Escudo, pero tu resultado no se guardará al cerrar."; botón "Cerrar aviso" (≥ 44×44 px). Nunca muestra detalles técnicos
- [X] T018 Reemplazar el `src/App.jsx` provisional por el esqueleto de la app: `<main>` de una columna centrada con ancho máximo de unos 40 rem (`max-w-2xl mx-auto px-4`), un `switch` sobre `estado.pantalla` de `useNavegacion` (de momento solo `inicio` con un marcador temporal) y el espacio para `AvisoAlmacenamiento` arriba del contenido. Sin lógica de riesgo (depende de T015, T017)

**Checkpoint**: `npm test` pasa (Pregunta, Almacenamiento), `npm run lint` sin errores y la app arranca. Ya se pueden empezar las historias de usuario.

---

## Phase 3: User Story 1 — Hacer el diagnóstico y conocer mi nivel de riesgo (Priority: P1) 🎯 MVP

**Goal**: Inicio con consentimiento → 14 preguntas → Resultado con semáforo, riesgo por dimensión y "Dónde estás en riesgo", guardado en el dispositivo y mostrado al volver a abrir.

**Independent Test**: Quickstart escenarios 1, 2 y 6: abrir sin datos, aceptar el consentimiento, responder las 14 preguntas y comprobar que el porcentaje, el color, los porcentajes por dimensión y el orden de "Dónde estás en riesgo" coinciden con el cálculo manual; recargar y ver el Resultado directamente.

### Tests for User Story 1 ⚠️

> Escribir primero y comprobar que fallan antes de implementar.

- [X] T019 [P] [US1] Escribir `tests/logic/Diagnostico.test.js` (Vitest, con `tests/fixtures/contenidoPrueba.js`): el constructor lanza error con menos de 14 respuestas, con más de 14, con `null` o con una letra inválida; `respuestas` devuelve una copia (modificarla no altera el diagnóstico); `calcularPuntajeObtenido()` y `calcularPuntajeMaximo()` (suma de `obtenerPuntajeMaximo()` de cada pregunta); `calcularRiesgoTotal()` = `Math.round(puntos * 100 / maximo)`; `Diagnostico.calcularPorcentaje(x, 0) === 0`; `Diagnostico.clasificarNivel`: 0 → "Bajo", 39 → "Bajo", 40 → "Medio", 69 → "Medio", 70 → "Alto", 100 → "Alto"; un caso con valor exacto 39,5 que se redondea a 40 y da "Medio" (y uno con 69,5 → 70 → "Alto"), construidos con `crearDatosPreguntas`; `calcularRiesgoPorDimension()` devuelve `{ phishing, smishing, vishing, habitos }` con el cálculo dentro de cada rango (1–4, 5–8, 9–12, 13–14); todas las respuestas "a" con puntaje 0 → riesgo 0, "Bajo" y hábitos `[]`; `obtenerHabitosDeRiesgo()` solo incluye puntajes > 0, ordenados por `puntos` descendente y en empate por `numeroPregunta` ascendente, con `prioridad` = etiqueta de `PRIORIDADES` según la criticidad de la opción elegida; determinismo (dos instancias con las mismas respuestas dan resultados iguales)
- [X] T020 [P] [US1] Crear `tests/logic/contenido.test.js` con un bloque `describe("preguntas.js")` que valide `src/data/preguntas.js` contra `contracts/contenido.md`: exactamente 14 preguntas con `numero` 1..14 únicos y en orden; `dimension` igual al `id` de `DIMENSIONES` cuyo rango contiene el número; `texto` y `descripcionHabito` strings no vacíos; opciones con exactamente las claves `a`, `b`, `c` y `texto` no vacío; "Los puntajes son enteros ≥ 0 y no bajan: a ≤ b ≤ c"; "criticidad === null si y solo si puntaje === 0" y, si no es null, vale `"revisa"`, `"importante"` o `"urgente"`; "La criticidad no baja de a → b → c (orden: revisa < importante < urgente)"; "El puntaje máximo total es mayor que 0". Agregar un bloque `describe("politica.js")`: `POLITICA_PRIVACIDAD` con `titulo` no vacío y "al menos 1 sección" con `subtitulo` y `texto` no vacíos; y una verificación de prohibiciones: ningún valor de contenido contiene `<script` ni `http://`. (Esta prueba falla hasta que el equipo entregue el contenido; es lo esperado)

### Implementation for User Story 1

- [X] T021 [US1] Implementar `src/logic/Diagnostico.js` según `contracts/logica.md`: constructor `(preguntas, respuestas, fecha)` que valida 14 respuestas en `OPCIONES_VALIDAS` (lanza `Error` con mensaje en español si no) y guarda copias; getters `respuestas` (copia) y `fecha`; `calcularPuntajeObtenido()`, `calcularPuntajeMaximo()`, `calcularRiesgoTotal()`, `calcularRiesgoPorDimension()` (recorre `DIMENSIONES`), `obtenerNivelSemaforo()`, `obtenerHabitosDeRiesgo()` (`[{ numeroPregunta, descripcion, prioridad, puntos }]`); estáticos `calcularPorcentaje(puntos, maximo)` (multiplicar antes de dividir, `Math.round`, 0 si `maximo === 0`) y `clasificarNivel(porcentaje)` (menor que `LIMITE_RIESGO_MEDIO` → Bajo, menor que `LIMITE_RIESGO_ALTO` → Medio, si no Alto, sobre el valor ya redondeado). Métodos cortos, sin números mágicos, JSDoc completo (depende de T009, T012; hacer pasar T019)
- [X] T022 [P] [US1] 🔒 Crear `src/data/preguntas.js` exportando `PREGUNTAS` con la forma exacta de `contracts/contenido.md` (`numero`, `dimension`, `texto`, `descripcionHabito`, `opciones: { a, b, c }` con `texto`, `puntaje`, `criticidad`) y **solo** con el contenido entregado por el equipo, copiado sin reformular. Si no se ha entregado, detenerse y pedirlo. Hacer pasar el bloque `preguntas.js` de T020. *Hecho 2026-10-16 con textos reales y puntajes provisionales (R13); los valores definitivos se ponen en T063*
- [ ] T023 [P] [US1] 🔒 Crear `src/data/politica.js` exportando `POLITICA_PRIVACIDAD = { titulo, secciones: [{ subtitulo, texto }] }` con el texto de la política (Ley 1581 de 2012) entregado por el equipo, sin inventarlo. Hacer pasar el bloque `politica.js` de T020
- [X] T024 [US1] Crear `src/hooks/useEstadoEscudo.js`: a nivel de módulo, `const PREGUNTAS_ESCUDO = PREGUNTAS.map((datos) => new Pregunta(datos))`; en el hook, una sola instancia de `Almacenamiento` (`useRef`/`useState` perezoso) y en la carga inicial `cargar(PREGUNTAS_ESCUDO)` → si `valido`, crea `new Diagnostico(PREGUNTAS_ESCUDO, datos.respuestas, datos.fecha)` (envuelto en `try/catch`: si lanza error, `borrar()` y tratar como `corrupto`); expone `preguntas`, `diagnostico` (o `null`), `aviso` (`null | "corrupto" | "no-disponible"`), `cerrarAviso()`, `estadoInicial` (`"valido"` u otro, para decidir la primera pantalla) y `completarDiagnostico(respuestas)`, que crea `new Diagnostico(PREGUNTAS_ESCUDO, respuestas, new Date().toISOString())`, lo guarda con `guardarDiagnostico` (si devuelve `false`, `aviso = "no-disponible"` y sigue en memoria) y reemplaza el diagnóstico en el estado (depende de T014, T021, T022)
- [X] T025 [P] [US1] Crear `src/components/TarjetaPregunta.jsx`: props `pregunta` (instancia de `Pregunta`), `numero`, `nombreDimension`, `respuesta`, `onResponder(letra)`; muestra "Pregunta X de 14", `<progress value={X} max={14} aria-label="Avance del diagnóstico">`, el nombre de la dimensión y `<fieldset><legend>{pregunta.texto}</legend>` con 3 `<input type="radio">` nativos (`name` por pregunta) cuyo `<label>` completo contiene el texto exacto de cada opción y mide al menos 44 px de alto. Solo presentación (FR-007, FR-008)
- [X] T026 [P] [US1] Crear `src/components/Semaforo.jsx`: props `porcentaje` y `nivel` (`"Bajo" | "Medio" | "Alto"`, ya calculados por `Diagnostico`); anillo SVG proporcional al porcentaje con el número y la etiqueta del nivel en texto; ícono de forma distinta por nivel (Bajo círculo, Medio triángulo, Alto octágono) con `aria-hidden="true"`; colores verde/ámbar/rojo tono 700 de Tailwind; contenedor con `role="img"` y `aria-label={\`Riesgo total ${porcentaje} %, nivel ${nivel}\`}`. Prop opcional `etiquetaAccesible` para reutilizarlo en "Mi plan" (FR-015, FR-036a, R8)
- [X] T027 [US1] Crear `src/pages/Inicio.jsx` (FR-001…FR-005, `contracts/pantallas.md`): `<h1 tabIndex={-1}>Escudo</h1>`, la frase que explica qué hace la app, lista de las 3 garantías con el texto exacto "Nunca te pedimos contraseñas", "Respuestas anónimas", "No accedemos a tu celular ni a tus cuentas"; casilla nativa `<input type="checkbox">` controlada por props `consentimiento` / `onCambiarConsentimiento` (desmarcada al entrar) con su etiqueta sobre el tratamiento de las respuestas según la Ley 1581 de 2012 y un botón "Ver política" que abre `Dialogo` con `POLITICA_PRIVACIDAD` (al cerrar, la casilla conserva su estado); botón "Empezar diagnóstico" con `disabled={!consentimiento}` que llama `onEmpezar`; botón "Tengo una emergencia ahora" siempre visible, estilo de alerta (rojo 700), que llama `onEmergencia`. Áreas táctiles ≥ 44×44 px (depende de T016, T023)
- [X] T028 [US1] Crear `src/pages/Diagnostico.jsx` (FR-007…FR-012): estado local `respuestas` = arreglo de 14 `null` (nunca se guarda parcialmente); la pregunta actual viene de `estado.pregunta` de `useNavegacion` (cada "Siguiente" hace `navegar({ pantalla: "diagnostico", pregunta: k + 1 })` para que el "atrás" del navegador vuelva a k−1 con la respuesta conservada); renderiza `TarjetaPregunta`; botones "Anterior" (desde la pregunta 2), "Siguiente" (`disabled` sin selección) y "Salir"; "Salir" abre `Dialogo` "¿Salir del diagnóstico?" con confirmar (descarta las respuestas y llama `onSalir`, que vuelve a Resultado si ya hay diagnóstico o a Inicio si no) y cancelar (sigue en la misma pregunta); usa `registrarInterceptorAtras` para que el "atrás" en la pregunta 1 abra ese mismo diálogo; en la pregunta 14, "Siguiente" llama `onCompletar(respuestas)` (depende de T015, T016, T025)
- [X] T029 [US1] Crear `src/pages/Resultado.jsx` (FR-013…FR-018): recibe `diagnostico`; `<h1 tabIndex={-1}>` "Tu resultado"; `Semaforo` con `calcularRiesgoTotal()` y `obtenerNivelSemaforo()`; leyenda con el texto exacto "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 % en adelante"; lista de las 4 dimensiones (nombres de `DIMENSIONES`) con su porcentaje de `calcularRiesgoPorDimension()`; sección `<h2>` "Dónde estás en riesgo" con `obtenerHabitosDeRiesgo()`: cada ítem muestra número de pregunta, descripción, prioridad en texto + estilo (no solo color) y puntos; si la lista está vacía, un mensaje positivo; botón "Ver mi plan de acción" (`onVerPlan`) y botón "Repetir diagnóstico" (`onRepetir`). Sin cálculos propios (depende de T021, T026)
- [X] T030 [US1] Conectar US1 en `src/App.jsx`: usar `useEstadoEscudo` y `useNavegacion` con pantalla inicial `resultado` si `estadoInicial === "valido"` o `inicio` en otro caso; estado `consentimiento` (se pone en `false` cada vez que se entra a `inicio`); guardas de `contracts/pantallas.md` (sin diagnóstico, `resultado`/`plan`/`tips` muestran `inicio`; sin consentimiento, `diagnostico` muestra `inicio`, lo que también cubre la recarga a mitad de la encuesta); `onEmpezar` → `navegar({ pantalla: "diagnostico", pregunta: 1 })`; `onCompletar` → `completarDiagnostico` y `navegar({ pantalla: "resultado" })`; `onRepetir` → `inicio` con la casilla desmarcada; mostrar `AvisoAlmacenamiento` cuando `aviso` no sea `null` (depende de T024, T027, T028, T029)
- [ ] T031 [US1] Validar US1 con `quickstart.md` escenarios 1, 2 y 6 (con el contenido real; sin él, solo `npm test` de lógica). Confirmar `npm test` y `npm run lint` en verde

**Checkpoint**: US1 funciona sola: diagnóstico completo, resultado correcto, guardado y recarga.

---

## Phase 4: User Story 2 — Pedir ayuda inmediata ante una emergencia (Priority: P1)

**Goal**: Desde Inicio, sin consentimiento ni diagnóstico, llegar en 2 toques a la guía de la emergencia, ver las líneas bancarias (llamada con un toque) y los canales de denuncia.

**Independent Test**: Quickstart escenario 3: desde Inicio sin casilla marcada ni diagnóstico, "Tengo una emergencia ahora" → una guía; recorrer las 3 guías, "No borres nada", bancos y denuncia; "Volver al inicio" funciona.

### Tests for User Story 2 ⚠️

- [X] T032 [P] [US2] Agregar a `tests/logic/contenido.test.js` un bloque `describe("emergencias.js")`: `GUIAS_EMERGENCIA` tiene exactamente los ids y títulos `tarjetas` / "Bloquear mis tarjetas", `whatsapp` / "Reportar fraude en WhatsApp", `phishing` / "Fui víctima de phishing", cada una con `pasos` no vacío de strings no vacíos; `AVISO_NO_BORRES.titulo === "No borres nada"` y `texto` no vacío; `LINEAS_BANCARIAS` "al menos 1", con `banco` no vacío y `numero` "con solo dígitos, espacios, +, #, *, -" (`/^[\d\s+#*-]+$/`); `CANALES_DENUNCIA` "al menos 1", con `entidad` y `contacto` no vacíos y, "si hay enlace, empieza por https://"

### Implementation for User Story 2

- [ ] T033 [P] [US2] 🔒 Crear `src/data/emergencias.js` exportando `GUIAS_EMERGENCIA` (ids y títulos exactos de FR-031; los `pasos` de cada guía los entrega el equipo), `AVISO_NO_BORRES` (`titulo: "No borres nada"`; `texto` del equipo, que menciona guardar capturas, números y comprobantes y la Ley 1273 de 2009), `LINEAS_BANCARIAS` (`[{ banco, numero }]` del equipo) y `CANALES_DENUNCIA` (`[{ entidad, contacto, enlace? }]` del equipo). No inventar pasos, números ni canales: si no se han entregado, detenerse y pedirlos. Hacer pasar T032
- [X] T034 [US2] Crear `src/pages/Emergencia.jsx` (FR-030…FR-034): la vista viene de `estado.vista` de `useNavegacion` (`menu` por defecto, `guia:<id>`, `bancos`, `denuncia`; cada cambio con `navegar` para que el "atrás" del navegador vuelva a `menu`); `<h1 tabIndex={-1}>Respira. Vamos paso a paso.</h1>` y la indicación de elegir lo que le pasó; 3 botones con los títulos de `GUIAS_EMERGENCIA`; vista de guía con `<ol>` de pasos y botón para volver al menú; aviso `AVISO_NO_BORRES` visible en todas las vistas; botón "Llamar a la línea de mi banco" → lista de `<a href={\`tel:${encodeURIComponent(numero)}\`}>` con el nombre del banco y el número visible como texto (R10); botón "Cómo denunciar en Colombia" → lista de `CANALES_DENUNCIA` (enlace, si existe, con `target="_blank" rel="noopener noreferrer"`); prop `hayDiagnostico`: si es `false`, botón "Volver al inicio" (R7). Áreas táctiles ≥ 44×44 px (depende de T015, T033)
- [X] T035 [US2] Conectar US2 en `src/App.jsx`: pantalla `emergencia` sin guardas (disponible sin consentimiento ni diagnóstico); `onEmergencia` de Inicio → `navegar({ pantalla: "emergencia", vista: "menu" })`; "Volver al inicio" → `inicio` (depende de T030, T034)
- [ ] T036 [US2] Validar US2 con `quickstart.md` escenario 3 (3 toques o menos hasta el primer paso de la guía, SC-002 aclarado el 2026-10-20 y spec 003 SC-001; enlace `tel:` en celular y número visible en computador)

**Checkpoint**: US1 y US2 funcionan cada una por su lado.

---

## Phase 5: User Story 3 — Seguir mi plan de acción y ver bajar mi riesgo (Priority: P2)

**Goal**: "Mi plan" con una acción por hábito de riesgo, detalle desplegable, "Ya lo hice" / desmarcar, riesgo actual y contador guardados en el dispositivo.

**Independent Test**: Quickstart escenario 4: con un diagnóstico de al menos 2 hábitos, marcar y desmarcar acciones, recargar y comprobar el riesgo actual, "X de N hechas" y que el Resultado no cambia.

### Tests for User Story 3 ⚠️

- [X] T037 [P] [US3] Escribir `tests/logic/PlanAccion.test.js` (Vitest, con `DATOS_PREGUNTAS_PRUEBA` y `RECOMENDACIONES_PRUEBA`): `obtenerAcciones()` devuelve `{ numeroPregunta, titulo, prioridad, puntos, bajaPorcentaje, queHacerAhora, comoPrevenirlo, hecha }` en el mismo orden que `obtenerHabitosDeRiesgo()`; `bajaPorcentaje = Math.round(puntos * 100 / puntajeMaximoTotal)`; sin acciones hechas, `calcularRiesgoActual()` es igual a `calcularRiesgoTotal()`; `marcarHecha(n)` devuelve una instancia **nueva** (la original no cambia), resta los puntos y sube `contarHechas()`; marcar dos veces es idempotente; `desmarcar(n)` devuelve el riesgo a su valor inicial; con todas hechas, riesgo 0 y nivel "Bajo"; `contarTotal()` = número de hábitos; `obtenerAccionesHechas()` devuelve los números ordenados; el constructor lanza error si una acción hecha no es un hábito del diagnóstico; el `Diagnostico` no se modifica (FR-024); diagnóstico sin hábitos → `contarTotal() === 0`, `contarHechas() === 0`
- [X] T038 [P] [US3] Agregar a `tests/logic/contenido.test.js` un bloque `describe("recomendaciones.js")`: "Existe una entrada por cada pregunta que tenga alguna opción con puntaje mayor a 0, con los tres campos no vacíos" (`titulo`; `queHacerAhora` y `comoPrevenirlo` como string no vacío o lista no vacía de strings no vacíos)

### Implementation for User Story 3

- [X] T039 [P] [US3] 🔒 Crear `src/data/recomendaciones.js` exportando `RECOMENDACIONES` indexado por número de pregunta (`{ titulo, queHacerAhora, comoPrevenirlo }`, cada uno string o lista de strings) con el contenido entregado por el equipo, sin inventar ni reformular. Si llega con textos distintos por opción, usar la extensión `{ b: {…}, c: {…} }` de `contracts/contenido.md` y avisar antes de seguir. Hacer pasar T038. *Hecho 2026-10-16 con borradores provisionales (R13); los textos definitivos se ponen en T063*
- [X] T040 [US3] Implementar `src/logic/PlanAccion.js` según `contracts/logica.md`: constructor `(diagnostico, recomendaciones, accionesHechas = [])` que valida que cada acción hecha esté en `obtenerHabitosDeRiesgo()` (lanza `Error` si no) y guarda un `Set`; `obtenerAcciones()`, `marcarHecha(numero)` y `desmarcar(numero)` inmutables (devuelven `new PlanAccion(...)`), `calcularRiesgoActual()` = `Diagnostico.calcularPorcentaje(Σ puntos de los hábitos − Σ puntos de los hechos, diagnostico.calcularPuntajeMaximo())` desde los puntos sin redondear, `obtenerNivelActual()` con `Diagnostico.clasificarNivel`, `contarHechas()`, `contarTotal()`, `obtenerAccionesHechas()` ordenado. JSDoc completo (depende de T021; hacer pasar T037)
- [X] T041 [US3] Ampliar `src/hooks/useEstadoEscudo.js`: estado `plan` = `new PlanAccion(diagnostico, RECOMENDACIONES, datos.accionesHechas)` al cargar (si el constructor lanza error, `borrar()`, `diagnostico = null` y `aviso = "corrupto"`); `completarDiagnostico` crea el plan con `[]` (reinicia el progreso); nueva función `alternarAccion(numero)` que usa `marcarHecha` o `desmarcar` según el estado de la acción, actualiza `plan` y llama `guardarProgreso(plan.obtenerAccionesHechas())` (si devuelve `false`, `aviso = "no-disponible"` y sigue en memoria) (depende de T024, T039, T040)
- [X] T042 [P] [US3] Crear `src/components/TarjetaAccion.jsx`: props `accion` (objeto de `obtenerAcciones()`) y `onAlternar`; muestra título, prioridad en texto + estilo (no solo color) y "Baja N %" (con `accion.bajaPorcentaje`); `<button aria-expanded aria-controls>` que despliega dos bloques con `<h3>` "Qué hacer ahora" y "Cómo prevenirlo" (si el texto es una lista, `<ul>`); botón "Ya lo hice" con `aria-pressed={accion.hecha}` cuyo texto cambia cuando está hecha (por ejemplo "Hecho ✓ · Desmarcar"). Áreas táctiles ≥ 44×44 px
- [X] T043 [US3] Crear `src/pages/PlanAccion.jsx` (FR-019…FR-024): `<h1 tabIndex={-1}>Mi plan</h1>`; tarjeta resumen con el riesgo actual (`Semaforo` con `calcularRiesgoActual()` / `obtenerNivelActual()` y `etiquetaAccesible` "Riesgo actual N %, nivel X") y el texto `${contarHechas()} de ${contarTotal()} hechas`; lista de `TarjetaAccion` en el orden de `obtenerAcciones()`; si `contarTotal() === 0`, mensaje positivo y "0 de 0 hechas". Sin cálculos propios (depende de T026, T042)
- [X] T044 [US3] Conectar US3 en `src/App.jsx`: pantalla `plan` (con la guarda de diagnóstico) que recibe `plan` y `alternarAccion`; `onVerPlan` de Resultado → `navegar({ pantalla: "plan" })` (depende de T030, T041, T043)
- [ ] T045 [US3] Validar US3 con `quickstart.md` escenario 4 (incluye SC-005: cerrar y volver a abrir conserva el progreso; el porcentaje de Resultado no cambia)

**Checkpoint**: US1, US2 y US3 funcionan de forma independiente.

---

## Phase 6: User Story 4 — Aprender a reconocer las estafas más comunes (Priority: P3)

**Goal**: Sección Tips con la Regla de oro, 8 tarjetas filtrables por canal, detalle de cada una y acceso a primeros auxilios; solo disponible con diagnóstico.

**Independent Test**: Quickstart escenario 5 (parte de Tips): con un diagnóstico guardado, abrir Tips; Regla de oro destacada, 8 tarjetas, cada filtro muestra 2, detalle de una tarjeta y acceso a Emergencia; sin diagnóstico no hay acceso a Tips.

### Tests for User Story 4 ⚠️

- [X] T046 [P] [US4] Agregar a `tests/logic/contenido.test.js` un bloque `describe("tips.js")`: `REGLA_DE_ORO` es exactamente "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo"; `TIPS` tiene "8 en total, 2 por canal"; `canal` ∈ `"sms" | "llamada" | "correo" | "whatsapp"`; `tipoAtaque` según "sms→Smishing, llamada→Vishing, correo→Phishing, whatsapp→Suplantación"; `id` únicos; los 8 títulos coinciden exactamente con la tabla de `contracts/contenido.md` (FR-026); `comoReconocerla` y `queHacer` no vacíos (string o lista)

### Implementation for User Story 4

- [ ] T047 [P] [US4] 🔒 Crear `src/data/tips.js` exportando `REGLA_DE_ORO` (texto exacto de FR-025) y `TIPS` con 8 objetos `{ id, canal, tipoAtaque, titulo, comoReconocerla, queHacer }`: `id`, `canal`, `tipoAtaque` y `titulo` según FR-026 (sms: "Tu paquete está retenido", "Descuento o premio en tu plan de celular"; llamada: "Le hablamos del banco por un movimiento sospechoso", "Falso técnico o asesor de tu operador"; correo: "Tu cuenta será suspendida", "Factura o recibo que no esperabas"; whatsapp: "Cambié de número, necesito un favor", "Te piden el código de 6 dígitos"); `comoReconocerla` y `queHacer` SOLO con el texto del equipo. Hacer pasar T046
- [X] T048 [P] [US4] Crear `src/components/TarjetaTip.jsx`: prop `tip`; muestra `canal · tipoAtaque` (etiqueta visible: SMS, Llamada, Correo, WhatsApp) y `titulo`; `<button aria-expanded aria-controls>` que despliega "Cómo reconocerla" y "Qué hacer" (lista `<ul>` si el texto es una lista). Área táctil ≥ 44×44 px
- [X] T049 [US4] Crear `src/pages/Tips.jsx` (FR-025…FR-029): `<h1 tabIndex={-1}>Tips de seguridad</h1>`; `REGLA_DE_ORO` destacada (bloque con borde y fondo de contraste AA); grupo de filtros (`role="group"`, `aria-label="Filtrar por canal"`) con botones `aria-pressed`: "Todos" (por defecto), "SMS" → `sms`, "Llamadas" → `llamada`, "Correo" → `correo`, "WhatsApp" → `whatsapp`; lista de `TarjetaTip` filtrada; botón-enlace "¿Ya caíste en una? Ve a primeros auxilios" que llama `onIrAEmergencia` (depende de T047, T048)
- [X] T050 [US4] Conectar US4 en `src/App.jsx`: pantalla `tips` con la guarda de diagnóstico (sin diagnóstico muestra `inicio`, FR-006); `onIrAEmergencia` → `navegar({ pantalla: "emergencia", vista: "menu" })` (depende de T030, T035, T049)
- [ ] T051 [US4] Validar US4 con `quickstart.md` escenario 5 (parte de Tips) y comprobar que sin diagnóstico no existe ningún acceso a Tips

**Checkpoint**: US1–US4 funcionan de forma independiente.

---

## Phase 7: User Story 5 — Moverme entre secciones y repetir el diagnóstico (Priority: P3)

**Goal**: Barra inferior con Resultado, Mi plan, Tips y Emergencia cuando hay diagnóstico; repetir el diagnóstico reemplaza el resultado y reinicia el plan, y abandonarlo conserva lo anterior.

**Independent Test**: Quickstart escenario 5 (navegación y repetición): recorrer las 4 secciones desde la barra en 360 px y 1440 px; repetir el diagnóstico, abandonarlo (se conserva lo anterior) y luego completarlo (se reemplaza y el plan vuelve a "0 de N").

### Implementation for User Story 5

- [X] T052 [P] [US5] Crear `src/components/BarraNavegacion.jsx` (FR-035, R8): `<nav aria-label="Secciones">` con 4 botones "Resultado", "Mi plan", "Tips", "Emergencia" (ícono SVG `aria-hidden` + texto); prop `pantallaActual` y `onNavegar(pantalla)`; la sección actual tiene `aria-current="page"` y un indicador de forma (borde superior o subrayado grueso) además del color; Emergencia en rojo 700 siempre; cada botón ≥ 44×44 px; fija abajo en celular (`fixed bottom-0 inset-x-0`) y centrada con el mismo ancho máximo de la columna en computador
- [X] T053 [US5] Conectar la barra en `src/App.jsx`: mostrar `BarraNavegacion` solo si hay diagnóstico **y** la pantalla no es `diagnostico` (se oculta durante la encuesta, R7); agregar `padding-bottom` al `<main>` para que la barra no tape contenido; `onNavegar` → `navegar({ pantalla })` (Emergencia con `vista: "menu"`) (depende de T030, T052)
- [X] T054 [US5] Revisar el flujo de repetición en `src/App.jsx` y `src/hooks/useEstadoEscudo.js` (FR-005, US5 escenarios 3 y 4): "Repetir diagnóstico" lleva a `inicio` con la casilla desmarcada y la barra visible; salir de la encuesta (botón "Salir", "atrás" en la pregunta 1 o recarga) no escribe nada y vuelve a `resultado` con el resultado y el progreso anteriores intactos; completar la encuesta reemplaza el diagnóstico y reinicia el plan (`accionesHechas: []`). Corregir lo que falte (depende de T041, T053)
- [ ] T055 [US5] Validar US5 con `quickstart.md` escenario 5 (navegación y repetición) en 360 px y 1440 px

**Checkpoint**: Todas las historias de usuario funcionan de forma independiente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Calidad, accesibilidad, rendimiento y privacidad sobre toda la app.

- [X] T056 [P] Revisar `src/logic/Pregunta.js`, `src/logic/Diagnostico.js`, `src/logic/PlanAccion.js` y `src/logic/Almacenamiento.js`: JSDoc en cada clase y método público (`@param`, `@returns`, `@throws`), funciones de menos de 20 líneas, sin números mágicos ni código duplicado, comentarios solo para explicar el "por qué"
- [X] T057 [P] Revisar que ningún archivo de `src/pages/` ni `src/components/` calcule riesgo, porcentajes ni orden de hábitos (todo debe salir de `Diagnostico` / `PlanAccion`), y que no exista ningún `fetch`, `XMLHttpRequest`, `<input type="text|password|number|tel">` ni recurso externo en `src/` e `index.html` (constitución I y V; FR-038, FR-039)
- [ ] T058 Pasada de accesibilidad en `src/pages/*.jsx` y `src/components/*.jsx` (FR-036a, SC-006a, quickstart escenario 9): contraste ≥ 4.5:1 (tonos 700 sobre blanco), foco visible, recorrido completo solo con teclado, foco en el `<h1>` al cambiar de pantalla, nombres accesibles, áreas táctiles ≥ 44×44 px, semáforo / prioridad / sección activa comunicados también con texto o forma. Lighthouse Accessibility = 100 y axe DevTools sin incumplimientos en cada pantalla
- [ ] T059 Revisión de diseño adaptable en `src/App.jsx` y las páginas de `src/pages/` (FR-036, SC-006): sin scroll horizontal ni elementos cortados en 360, 768, 1024 y 1440 px; ningún ancho fijo mayor de 360 px
- [ ] T060 Ejecutar `npm run build` y verificar en `dist/index.html` la meta CSP de T003 y que JS + CSS quedan por debajo de 150 KB gzip; con `npm run preview`, hacer `quickstart.md` escenario 8 (red: solo peticiones a `localhost:4173`, `fetch('https://example.com')` bloqueado por la CSP; SC-004) *(2026-10-16: build OK, meta CSP presente, JS + CSS = 85 KB gzip, sin APIs de red en `src/`; falta la revisión de red en el navegador del escenario 8)*
- [ ] T061 Hacer `quickstart.md` escenario 7 (almacenamiento corrupto y bloqueado; FR-040, SC-008) y corregir en `src/hooks/useEstadoEscudo.js` o `src/App.jsx` cualquier pantalla en blanco o error técnico visible
- [ ] T062 Ejecutar `npm run lint`, `npm run format:check` y `npm test` en la raíz (todo en verde, incluido `tests/logic/contenido.test.js` con el contenido real) y recorrer el criterio de aceptación global de `specs/001-escudo-web-app/quickstart.md` (hacer antes T063)
- [ ] T063 🔒 Reemplazar el contenido provisional (R13) por el validado por el equipo: en `src/data/preguntas.js`, los `puntaje` (enteros ≥ 0, "a ≤ b ≤ c") y `criticidad` ("`criticidad === null` si y solo si `puntaje === 0`"; si no, `"revisa"`, `"importante"` o `"urgente"`, sin bajar de a → b → c) y cada `descripcionHabito`; en `src/data/recomendaciones.js`, `titulo`, `queHacerAhora` y `comoPrevenirlo`. Los textos de preguntas y opciones no se tocan. Quitar los comentarios `PROVISIONAL`, cambiar en `specs/001-escudo-web-app/spec.md` (Assumptions, "Puntajes provisionales") y en `contracts/contenido.md` la nota de excepción por los valores definitivos, y confirmar que `npm test` sigue en verde en los bloques `preguntas.js` y `recomendaciones.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; se empieza ya.
- **Foundational (Phase 2)**: depende de Setup y **bloquea** todas las historias.
- **US1 (Phase 3)** y **US2 (Phase 4)**: ambas P1; dependen solo de Foundational y son independientes entre sí.
- **US3 (Phase 5)**: necesita `Diagnostico` (T021) y `useEstadoEscudo` (T024) de US1.
- **US4 (Phase 6)**: necesita un diagnóstico guardado (US1) para entrar a Tips y `Emergencia` (US2) para el acceso a primeros auxilios.
- **US5 (Phase 7)**: integra las pantallas de US1–US4; T054 necesita T041 (US3).
- **Polish (Phase 8)**: depende de las historias que se quieran entregar.
- **🔒 Contenido del equipo**: T023, T033 y T047 dependen de la entrega del contenido. T022 y T039 están hechas con contenido provisional, y T063 (validar ese contenido) bloquea T062 y cualquier publicación. La lógica (T009–T014, T019, T021, T037, T040) se puede terminar y probar antes con fixtures.

### User Story Dependencies

```text
Setup → Foundational ─┬─> US1 (P1) ──┬─> US3 (P2) ──┐
                      │              ├─> US4 (P3) ──┼─> US5 (P3) ─> Polish
                      └─> US2 (P1) ──┴──────────────┘
```

### Within Each User Story

- Pruebas primero (deben fallar), luego contenido y clases de `src/logic`, luego hooks, componentes, páginas y, al final, la conexión en `src/App.jsx`.
- `src/App.jsx` y `tests/logic/contenido.test.js` se modifican en varias historias: esas tareas no son [P] entre sí y se hacen en orden.

### Parallel Opportunities

- Setup: T002–T007 en paralelo después de T001.
- Foundational: T009, T010, T011, T013, T015, T016 y T017 en paralelo; T012 tras T011; T014 tras T012 y T013.
- US1: T019, T020, T022, T023, T025 y T026 en paralelo.
- US2 completa en paralelo con US1 (otra persona), salvo T035, que toca `App.jsx`.
- US3: T037, T038, T039 y T042 en paralelo.
- US4: T046, T047 y T048 en paralelo.
- Polish: T056 y T057 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Escribir tests/logic/Diagnostico.test.js"
Task: "Crear tests/logic/contenido.test.js (preguntas.js y politica.js)"

# Contenido y componentes de presentación juntos:
Task: "Crear src/data/preguntas.js (contenido del equipo)"
Task: "Crear src/data/politica.js (contenido del equipo)"
Task: "Crear src/components/TarjetaPregunta.jsx"
Task: "Crear src/components/Semaforo.jsx"
```

## Parallel Example: User Story 3

```bash
Task: "Escribir tests/logic/PlanAccion.test.js"
Task: "Crear src/data/recomendaciones.js (contenido del equipo)"
Task: "Crear src/components/TarjetaAccion.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (bloquea todo).
3. Phase 3: US1.
4. **Parar y validar**: quickstart escenarios 1, 2 y 6.
5. Hacer demo si está listo. Como US2 también es P1 y es pequeña, se recomienda incluirla antes de cualquier publicación: la constitución (principio VI) exige que la ayuda de emergencia esté disponible desde Inicio.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → demo (MVP).
3. US2 → validar → **primera versión publicable** (diagnóstico + emergencia).
4. US3 → validar → demo.
5. US4 → validar → demo.
6. US5 → validar → Polish → versión final.

### Parallel Team Strategy

1. El equipo hace Setup + Foundational junto.
2. Luego: persona A con US1 (y después US3); persona B con US2 (y después US4); persona C prepara y revisa el contenido de `src/data/` con el equipo.
3. US5 y Polish al final, cuando las pantallas existan.

---

## Notes

- [P] = archivos distintos y sin dependencias pendientes.
- [USn] relaciona la tarea con su historia para poder rastrearla.
- 🔒 = depende del contenido del equipo; nunca se rellena con texto inventado.
- Hacer commit después de cada tarea o grupo lógico, con `npm test` y `npm run lint` en verde.
- Al terminar cada tarea, explicar en lenguaje sencillo qué archivos cambiaron y por qué (constitución, reglas SDD).
- Si una tarea choca con la constitución o con la spec, detenerse y avisar antes de tocar el código.

---

## Phase 9: Convergence

- [X] T064 Impedir en `src/pages/Diagnostico.jsx` que el diagnóstico se complete con respuestas faltantes: en `siguiente()`, si es la pregunta 14 y alguna respuesta es `null`, navegar a la primera pregunta sin responder en lugar de llamar a `onCompletar`; así, saltar preguntas con el botón "adelante" del navegador ya no provoca el error de `new Diagnostico` ni una pantalla en blanco per FR-012, SC-008 (contradicts)
- [X] T065 Corregir en `src/App.jsx` que una entrada vieja del historial `{ pantalla: "diagnostico" }` (por ejemplo, tocar "atrás" desde Resultado) reabra la encuesta al marcar la casilla: cuando `resolverPantalla` redirige a otra pantalla, reemplazar la entrada con `reemplazar` de `useNavegacion` para que `estado.pantalla` coincida con la pantalla mostrada, y que la encuesta solo empiece con "Empezar diagnóstico" en la pregunta 1 per FR-003, US1/AC2 (contradicts)

---

# Rediseño 2026-10-16 — Sistema de diseño "Confianza institucional"

**Input**: constitución §7 (v1.1.0), spec FR-008, FR-015, FR-035, FR-036, FR-036b–FR-036d (Clarifications 2026-10-16), research R14–R18, [contracts/pantallas.md](./contracts/pantallas.md) (tabla "Sistema de diseño").

**Alcance**: solo la capa visual. Las clases de `src/logic/` (`Pregunta`, `Diagnostico`, `PlanAccion`, `Almacenamiento`) y sus pruebas **no cambian**; el único cambio fuera de la UI es el campo `etiqueta` de `DIMENSIONES`. Rama de trabajo: `cambio_de_diseño`.

**Reglas extra para estas tareas**:

- Colores SOLO con las clases de los tokens de `tailwind.config.js` (`bg-superficie`, `text-peligro`, `border-borde`…). Prohibido escribir hex (`#…`) o clases de la paleta de Tailwind (`gray-`, `blue-`, `red-`, `amber-`, `green-`) en `src/components/` y `src/pages/` (§7.2).
- Íconos SOLO de `lucide-react`, importados uno por uno, `size` 20–24 (16 en chips), `strokeWidth={2}`, `aria-hidden="true"` cuando acompañan texto y `aria-label` en botones solo-ícono (§7.7, §7.9). Se eliminan todos los `<svg>` escritos a mano.
- Sin sombras, degradados, emojis ni ilustraciones (§7.4, §7.8). Solo tema claro.
- Ningún componente calcula riesgo: porcentajes y niveles vienen de `Diagnostico` / `PlanAccion` (incluido `Diagnostico.clasificarNivel(porcentaje)` para el nivel de cada canal).
- Si un elemento no está cubierto por §7 ni por [contracts/pantallas.md](./contracts/pantallas.md), avisar antes de inventarlo (§7.1).

## Phase 10: Setup del rediseño

- [X] T066 Instalar las dependencias del sistema de diseño con `npm install lucide-react @fontsource/plus-jakarta-sans` (quedan en `dependencies` de `package.json` y fijadas en `package-lock.json`; ambas gratuitas, sin conexiones externas, R17)
- [X] T067 [P] Crear `tailwind.config.js` en la raíz (`export default { theme: { extend: { … } } }`) con: `colors` exactamente iguales a §7.2 → `fondo: "#FFFFFF"`, `superficie: "#F2F5FA"`, `borde: "#E1E7F0"`, `pista: "#E9EEF5"`, `texto: "#0B1B33"`, `"texto-secundario": "#3A4A63"`, `"texto-suave": "#5B6B82"`, `primario: "#1D4ED8"`, `"primario-oscuro": "#1E3A8A"`, `peligro: "#B42318"`, `"peligro-suave": "#FDECEA"`, `advertencia: "#B45309"`, `"advertencia-texto": "#7A3E06"`, `"advertencia-suave": "#FCEBD3"`, `exito: "#15803D"`; `fontFamily.sans: ["\"Plus Jakarta Sans\"", "system-ui", "sans-serif"]`; `borderRadius: { boton: "12px", tarjeta: "16px", etiqueta: "6px" }`; `maxWidth.columna: "560px"`; `spacing.barra: "72px"`; `fontSize: { bienvenida: ["38px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "800" }], pantalla: ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "800" }], riesgo: ["64px", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "800" }] }`. Con comentario JSDoc que remita a la constitución §7 (R14)
- [X] T068 Actualizar `src/index.css`: después de `@import "tailwindcss";` añadir `@config "../tailwind.config.js";`; borrar la pila de fuentes del sistema y el `body { background-color: #fff; }`; dejar en `@layer base` `body` con `@apply bg-fondo font-sans text-base leading-normal text-texto;` y `overflow-x: hidden`; cambiar `:focus-visible` a `outline: 3px solid var(--color-primario); outline-offset: 2px;` (comprobar el nombre de la variable que genera Tailwind; si no existe, usar `@apply outline-3 outline-primario outline-offset-2`). Mantener la regla `h1[tabindex="-1"]:focus { outline: none; }`. Depende de T067
- [X] T069 [P] Importar la fuente empaquetada en `src/main.jsx`, antes de `./index.css`: `@fontsource/plus-jakarta-sans/latin-400.css`, `latin-500.css`, `latin-600.css`, `latin-700.css` y `latin-800.css` (solo subconjunto latino, R17; ninguna URL de Google Fonts en `index.html`). Depende de T066
- [X] T070 [P] Añadir a `eslint.config.js` un bloque para `files: ["src/components/**/*.{js,jsx}", "src/pages/**/*.{js,jsx}"]` con la regla `no-restricted-syntax` que marque como error: (a) `Literal[value=/#[0-9a-fA-F]{3,8}\\b/]` y `TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]` con mensaje "Usa un token de tailwind.config.js (constitución §7.2)"; (b) `Literal[value=/\\b(bg|text|border|fill|stroke|accent|divide|ring|outline)-(gray|slate|blue|red|amber|green)-\\d/]` y su equivalente `TemplateElement` con el mismo mensaje. `npm run lint` debe reportar los colores viejos (se corrigen en las fases siguientes)

---

## Phase 11: Foundational del rediseño (bloquea todas las historias)

**⚠️ CRÍTICO**: estas piezas las usan todas las pantallas.

- [X] T071 Añadir el campo `etiqueta` a cada objeto de `DIMENSIONES` en `src/logic/constantes.js`, sin tocar `id`, `nombre`, `desde` ni `hasta`: `phishing` → `"Correo (Phishing)"`, `smishing` → `"SMS y WhatsApp (Smishing)"`, `vishing` → `"Llamadas (Vishing)"`, `habitos` → `"Hábitos generales"` (data-model: "nombre visible en la interfaz: canal + término técnico, spec FR-008"). Actualizar el JSDoc de la constante
- [X] T072 [P] Añadir en `tests/logic/contenido.test.js` una prueba "cada dimensión tiene su etiqueta visible" que compruebe las 4 etiquetas exactas de T071 en orden. `npm test` en verde
- [X] T073 [P] Reescribir `src/components/botones.js` con tokens (§7.4, §7.5): `BASE` = `inline-flex items-center justify-center gap-2 rounded-boton px-4 font-bold disabled:cursor-not-allowed disabled:opacity-50`; `BOTON_PRINCIPAL` = `${BASE} h-14 w-full bg-primario text-white hover:bg-primario-oscuro active:bg-primario-oscuro`; `BOTON_SECUNDARIO` = `${BASE} h-14 w-full border border-primario bg-fondo text-primario`; `BOTON_EMERGENCIA` = `${BASE} h-[52px] w-full border-[1.5px] border-peligro bg-fondo text-peligro`; `BOTON_ENLACE` = `min-h-11 font-semibold text-primario underline underline-offset-2`. Renombrar `BOTON_ALERTA` → `BOTON_EMERGENCIA` y actualizar sus importaciones (`grep -rn BOTON_ALERTA src`). Actualizar el comentario de cabecera (ya no "tonos 700")
- [X] T074 [P] Crear `src/components/estilos.js` con las clases compartidas (sin hex): `TARJETA` = `rounded-tarjeta border border-borde bg-fondo p-5`; `LISTA_TARJETAS` = `flex flex-col gap-3`; `CHIP` = `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold`; `TITULO_PANTALLA` = `text-pantalla text-texto`; `TITULO_SECCION` = `text-lg font-extrabold text-texto`; `TEXTO_LECTURA` = `text-base leading-normal text-texto-secundario`; `ETIQUETA_SUAVE` = `text-xs font-semibold text-texto-suave`. Comentario de cabecera que remita a la constitución §7.3–§7.4
- [X] T075 [P] Reescribir `src/components/Prioridad.jsx` (§7.5): `ESTILOS` = `Urgente: "bg-peligro text-white"`, `Importante: "bg-advertencia-suave text-advertencia-texto"`, `Revisa: "bg-pista text-texto-secundario"`; `<span className="inline-block rounded-etiqueta px-2 py-0.5 text-xs font-bold …">{prioridad}</span>`, sin borde. El texto sigue visible (no solo color, §7.7)
- [X] T076 Reescribir `src/components/Semaforo.jsx` según R16 y §7.5, eliminando el anillo SVG y las formas: props `{ porcentaje, nivel, etiquetaAccesible, compacto = false }`; contenedor `role="img"` con `aria-label={etiquetaAccesible ?? \`Riesgo total ${porcentaje} %, nivel ${nivel}\`}`; porcentaje con clase `text-riesgo` (o `text-4xl font-extrabold` si `compacto`); chip `CHIP` con `"Riesgo " + nivel.toLowerCase()` e ícono 16px (Alto: `TriangleAlert`, fondo `peligro-suave`, texto `peligro`; Medio: `TriangleAlert`, `advertencia-suave` / `advertencia-texto`; Bajo: `ShieldCheck`, `bg-fondo border border-borde` / `exito`); barra `relative flex h-3 w-full` con 3 tramos de ancho `LIMITE_RIESGO_MEDIO %`, `(LIMITE_RIESGO_ALTO − LIMITE_RIESGO_MEDIO) %` y `(100 − LIMITE_RIESGO_ALTO) %` (importar de `constantes.js`, sin números mágicos) en `bg-exito`, `bg-advertencia`, `bg-peligro`, el del nivel con `opacity-100` y los demás `opacity-35`; marcador `absolute` de 4px × 20px `bg-texto rounded-full` con `style={{ left: \`${porcentaje}%\` }}` y `-translate-x-1/2`; debajo de cada tramo, en `ETIQUETA_SUAVE`, "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 %+" (construidos con las constantes). Todo el interior con `aria-hidden="true"`. Depende de T074
- [X] T077 [P] Crear `src/components/RiesgoPorCanal.jsx` (§7.5, R16): props `{ canales }` = arreglo `[{ id, etiqueta, porcentaje, nivel }]` ya calculado; `<ul>` con `LISTA_TARJETAS`; cada `<li>`: fila superior con ícono 20px (`phishing`: `Mail`, `smishing`: `MessageSquare`, `vishing`: `Phone`, `habitos`: `Lock`), la `etiqueta` en `font-semibold text-texto` y el porcentaje `font-bold` a la derecha; debajo, barra `h-2 rounded-full bg-pista` con relleno `rounded-full` de ancho `${porcentaje}%` en `bg-exito` / `bg-advertencia` / `bg-peligro` según `nivel`. La barra es decorativa (`aria-hidden`); el nombre y el porcentaje van en texto. Depende de T074
- [X] T078 Rehacer el diseño general en `src/App.jsx` (§7.6, FR-036, FR-036d): constante `PANTALLAS_EN_SUPERFICIE = ["resultado", "plan", "tips", "emergencia"]`; envolver todo en `<div className={\`min-h-dvh ${PANTALLAS_EN_SUPERFICIE.includes(pantalla) ? "bg-superficie" : "bg-fondo"}\`}>`; `<main>` con `mx-auto w-full max-w-columna px-6 py-6 text-texto` y, si `mostrarBarra`, `pb-[calc(theme(spacing.barra)+24px)]` (o `pb-24` equivalente ≥ 96px); quitar `max-w-2xl`, `px-4`, `text-gray-900`. Emergencia usa `superficie` también sin diagnóstico
- [X] T079 Reescribir `src/components/BarraNavegacion.jsx` (§7.5, FR-035): `SECCIONES` con íconos de `lucide-react` (`resultado`: `ShieldCheck`, `plan`: `ListChecks`, `tips`: `Lightbulb`, `emergencia`: `TriangleAlert`), eliminando los `path` SVG; `<nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 h-barra border-t border-borde bg-fondo">`; `<ul className="mx-auto flex h-full max-w-columna">`; cada botón `min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 text-xs`, ícono 24px `strokeWidth={2}`; color: `emergencia` siempre `text-peligro`, el resto `text-primario` si está activa y `text-texto-suave` si no; activa además `font-bold` y `aria-current="page"` (no solo color, FR-036a); inactiva `font-semibold`. Sin `border-t-4`

**Checkpoint**: `npm test` en verde; la app arranca con la fuente nueva, la columna de 560px y los fondos por pantalla; `npm run lint` todavía puede señalar colores viejos en páginas y tarjetas.

---

## Phase 12: User Story 1 — Diagnóstico y resultado (Priority: P1) 🎯 MVP

**Goal**: Inicio, encuesta y Resultado con el sistema de diseño (FR-001…FR-018, FR-036b).

**Independent Test**: `quickstart.md` escenarios 1 y 10 (fuente, colores, fondo blanco en Inicio y preguntas, semáforo de barra con "52 %" → chip "Riesgo medio", 4 barras por canal con sus etiquetas).

- [X] T080 [P] [US1] Rediseñar `src/pages/Inicio.jsx` (§7.3, §7.5, §7.9, contracts/pantallas.md "Inicio"): encabezado con `ShieldCheck` 24px `text-primario` y `<h1 tabIndex={-1} className="text-bienvenida text-texto">Escudo</h1>`; frase en `TEXTO_LECTURA`; garantías como `<ul>` con íconos 20px `text-primario` (`Lock` "Nunca te pedimos contraseñas", `User` "Respuestas anónimas", `Smartphone` "No accedemos a tu celular ni a tus cuentas") en lugar del SVG de check; bloque de consentimiento en `TARJETA` con la casilla `size-5 accent-primario` y el botón "Ver política" con `BOTON_ENLACE`; "Empezar diagnóstico" con `BOTON_PRINCIPAL`; "Tengo una emergencia ahora" con `BOTON_EMERGENCIA` y `<TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />` antes del texto. Separación vertical `gap-6`. Textos exactos sin cambios
- [X] T081 [P] [US1] Rediseñar `src/components/TarjetaPregunta.jsx`: cambiar la prop `nombreDimension` por `dimension` (`{ id, etiqueta }`); `<h1>` con `ETIQUETA_SUAVE` grande o `text-sm font-semibold text-texto-suave` para "Pregunta X de 14" (es el `<h1>` que recibe el foco; mantener `tabIndex={-1}`); `<progress>` con `h-2 w-full appearance-none rounded-full [&::-webkit-progress-bar]:bg-pista [&::-webkit-progress-value]:bg-primario [&::-moz-progress-bar]:bg-primario bg-pista`; línea de dimensión con su ícono 20px (`Mail`/`MessageSquare`/`Phone`/`Lock`, mismo mapa que T077) y `dimension.etiqueta` en `font-semibold text-primario`; `<legend>` en `text-pantalla` o `text-xl font-extrabold text-texto`; cada opción `<label>` como tarjeta `min-h-11 rounded-boton border border-texto-suave bg-fondo p-4 has-checked:border-2 has-checked:border-primario` con radio `size-5 accent-primario` (borde con contraste ≥ 3:1, R15)
- [X] T082 [US1] Actualizar `src/pages/Diagnostico.jsx`: reemplazar `nombreDimension(id)` por una función que devuelva el objeto de `DIMENSIONES` (`{ id, etiqueta }`) y pasarlo como `dimension` a `TarjetaPregunta`; botones "Siguiente" con `BOTON_PRINCIPAL`, "Anterior" con `BOTON_SECUNDARIO` e ícono `ChevronLeft`, "Salir" con `BOTON_ENLACE` e ícono `X` (con texto visible "Salir"); quitar cualquier clase de paleta. Depende de T081
- [X] T083 [P] [US1] Rediseñar `src/components/Dialogo.jsx`: panel `rounded-tarjeta border border-borde bg-fondo p-6 max-w-columna w-[calc(100%-48px)]`, `backdrop:bg-texto/50`, título `TITULO_SECCION`, botón de cierre solo-ícono `X` 24px con `aria-label="Cerrar"` y área ≥ 44×44 px; sin sombras
- [X] T084 [US1] Rediseñar `src/pages/Resultado.jsx` (FR-015, FR-016, R16): borrar `LEYENDA` y su `<ul>`; `<h1>` con `TITULO_PANTALLA`; `<Semaforo>` dentro de una `TARJETA`; reemplazar la lista "Riesgo por dimensión" por `<RiesgoPorCanal canales={DIMENSIONES.map(({ id, etiqueta }) => ({ id, etiqueta, porcentaje: riesgoPorDimension[id], nivel: Diagnostico.clasificarNivel(riesgoPorDimension[id]) }))} />` bajo el título "Riesgo por canal" (`TITULO_SECCION`), importando la clase `Diagnostico` de `src/logic/Diagnostico.js`; cada hábito de "Dónde estás en riesgo" como `TARJETA` con "Pregunta N" en `ETIQUETA_SUAVE`, descripción en `font-semibold text-texto`, `<Prioridad>` y los puntos en `text-texto-secundario`; mensaje positivo con ícono `ShieldCheck` `text-exito`; "Ver mi plan de acción" con `BOTON_PRINCIPAL` y "Repetir diagnóstico" con `BOTON_SECUNDARIO`, apilados (`flex-col gap-3`). Depende de T076, T077
- [ ] T085 [US1] Validar US1 con `quickstart.md` escenarios 1 y 10 (partes de Inicio, preguntas y Resultado) en 390px y 1440px; `npm test` y `npm run lint` sin errores en los archivos tocados

**Checkpoint**: el MVP se ve con el sistema de diseño de punta a punta.

---

## Phase 13: User Story 2 — Emergencia (Priority: P1)

**Goal**: Primeros auxilios con fondo `superficie`, íconos y botones del sistema (FR-030…FR-034).

**Independent Test**: `quickstart.md` escenario 3 y la parte de Emergencia del escenario 10, sin diagnóstico (fondo `superficie`, sin barra).

- [X] T086 [US2] Rediseñar `src/pages/Emergencia.jsx` (contracts/pantallas.md "Emergencia"): `<h1>` "Respira. Vamos paso a paso." con `TITULO_PANTALLA`; las 3 situaciones como botones-tarjeta (`TARJETA` + `w-full min-h-11 text-left flex items-center gap-3`) con íconos 24px `CreditCard` ("Bloquear mis tarjetas"), `MessageCircle` ("Reportar fraude en WhatsApp"), `Mail` ("Fui víctima de phishing") y `ChevronRight` al final; aviso "No borres nada" en `TARJETA` con ícono `FileText` `text-peligro`; "Llamar a la línea de mi banco" con `BOTON_PRINCIPAL` e ícono `Phone`; "Cómo denunciar en Colombia" con `BOTON_SECUNDARIO`; pasos de cada guía en `<ol>` numerada dentro de `TARJETA` con `TEXTO_LECTURA`; enlaces `tel:` con el número visible en `font-bold text-primario`; botón volver con `ChevronLeft`; "Volver al inicio" con `BOTON_SECUNDARIO`. Reemplazar los 6 colores de paleta y cualquier SVG a mano
- [ ] T087 [US2] Validar US2 con `quickstart.md` escenario 3 (3 toques o menos hasta el primer paso de la guía, SC-002 aclarado el 2026-10-20) y comprobar fondo `superficie` y botón de emergencia de Inicio (borde rojo 1.5px, 52px)

---

## Phase 14: User Story 3 — Mi plan (Priority: P2)

**Goal**: plan de acción con `Semaforo` compacto, etiquetas de prioridad y acordeones con íconos (FR-019…FR-024).

**Independent Test**: `quickstart.md` escenario 4; la tarjeta resumen muestra porcentaje + chip + barra y el riesgo baja al marcar acciones.

- [X] T088 [P] [US3] Rediseñar `src/components/TarjetaAccion.jsx`: tarjeta `TARJETA`; cabecera `<button aria-expanded aria-controls>` con título `font-bold text-texto`, `<Prioridad>`, "Baja N %" en `ETIQUETA_SUAVE` y `ChevronDown` 20px (rotado `rotate-180` cuando está abierta) en lugar del SVG; bloques "Qué hacer ahora" (ícono `Zap` `text-primario`) y "Cómo prevenirlo" (ícono `ShieldCheck`) con `TITULO_SECCION` pequeño y `TEXTO_LECTURA`; botón "Ya lo hice" con `BOTON_SECUNDARIO` y `aria-pressed`; cuando está hecha, ícono `ListChecks` o `ShieldCheck` y texto en `text-exito` (con el texto del estado visible, no solo color)
- [X] T089 [US3] Rediseñar `src/pages/PlanAccion.jsx`: `<h1>` "Mi plan" con `TITULO_PANTALLA`; tarjeta resumen `TARJETA` con `<Semaforo compacto porcentaje={riesgo} nivel={nivel} etiquetaAccesible={…} />` y "X de N hechas" en `font-bold text-texto`; lista con `LISTA_TARJETAS`; mensaje positivo con `ShieldCheck` `text-exito` si N = 0. Depende de T076, T088
- [ ] T090 [US3] Validar US3 con `quickstart.md` escenario 4 (marcar, desmarcar, recargar) en 390px

---

## Phase 15: User Story 4 — Tips (Priority: P3)

**Goal**: Tips con Regla de oro destacada, filtros píldora e íconos por canal (FR-025…FR-029).

**Independent Test**: `quickstart.md` escenario 5 (parte de Tips) y escenario 10.

- [X] T091 [P] [US4] Rediseñar `src/components/TarjetaTip.jsx`: `TARJETA`; ícono de canal 20px (`SMS`: `MessageSquare`, `Llamada`: `Phone`, `Correo`: `Mail`, `WhatsApp`: `MessageCircle`) con "canal · tipo de ataque" en `ETIQUETA_SUAVE`; título `font-bold text-texto`; `ChevronDown` en lugar del SVG del acordeón; detalle en `TEXTO_LECTURA`
- [X] T092 [US4] Rediseñar `src/pages/Tips.jsx`: `<h1>` con `TITULO_PANTALLA`; Regla de oro en `TARJETA` con borde izquierdo `border-l-4 border-l-primario` e ícono `Lightbulb` `text-primario`; filtros como `CHIP` dentro de botones `min-h-11` con `aria-pressed` (activo `bg-primario text-white`, inactivo `border border-borde bg-fondo text-texto-secundario`) — interpretación de §7 anotada en R18; lista con `LISTA_TARJETAS`; "¿Ya caíste en una? Ve a primeros auxilios" con `BOTON_EMERGENCIA` e ícono `TriangleAlert`. Depende de T091
- [ ] T093 [US4] Validar US4 con `quickstart.md` escenario 5 (parte de Tips): Regla de oro, 8 tarjetas, cada filtro muestra 2

---

## Phase 16: User Story 5 — Navegación y avisos (Priority: P3)

**Goal**: barra inferior y avisos globales con el sistema de diseño (FR-035, FR-040).

**Independent Test**: `quickstart.md` escenarios 5 y 7, y la parte de barra del escenario 10.

- [X] T094 [P] [US5] Rediseñar `src/components/AvisoAlmacenamiento.jsx`: `TARJETA` con `bg-advertencia-suave border-advertencia text-advertencia-texto`, ícono `TriangleAlert` 20px, texto en `font-semibold`, botón de cierre solo-ícono `X` con `aria-label="Cerrar aviso"` (área ≥ 44×44 px); se mantiene `role="status"`
- [ ] T095 [US5] Validar US5 con `quickstart.md` escenario 5 (navegación y repetición) y escenario 10 (barra de 72px, activo en `primario`, Emergencia siempre en `peligro`, barra centrada en 560px a 1440px)

---

## Phase 17: Polish del rediseño

- [X] T096 [P] Revisar con `grep -rnE "#[0-9a-fA-F]{3,6}\b|(bg|text|border|fill|accent|divide)-(gray|slate|blue|red|amber|green)-[0-9]|<svg" src/components src/pages src/App.jsx` que no quede ningún color suelto ni SVG a mano; `npm run lint` sin errores (incluida la regla de T070)
- [ ] T097 [P] Pasada de accesibilidad del rediseño (FR-036a, §7.7, R15): solo las combinaciones de contraste de R15; foco visible `primario` en todos los controles; áreas táctiles ≥ 44×44 px; botones solo-ícono con `aria-label`; Lighthouse Accessibility = 100 y axe sin incumplimientos en las 6 pantallas (`quickstart.md` escenario 9)
- [X] T098 Ejecutar `npm run build` y comprobar en `dist/` que los `.woff2` de Plus Jakarta Sans se sirven desde el propio origen, que la meta CSP sigue presente y que JS + CSS quedan por debajo de 150 KB gzip; con `npm run preview`, `quickstart.md` escenario 8 sin peticiones a `fonts.googleapis.com` ni `fonts.gstatic.com` (SC-004)
- [ ] T099 Recorrer `quickstart.md` escenario 10 completo y el escenario 9 (360, 768, 1024 y 1440px), y ejecutar `npm run lint`, `npm run format:check` y `npm test` en verde

---

## Dependencias del rediseño

- **Phase 10 (Setup)**: T066 → T069; T067 → T068. T070 es independiente.
- **Phase 11 (Foundational)**: depende de Phase 10. T071 → T072. T074 → T076, T077. T073, T074, T075 en paralelo. T078 y T079 después de T067/T068.
- **Phase 12 (US1)**: depende de Phase 11. T081 → T082. T076 + T077 → T084.
- **Phase 13 (US2)**, **Phase 14 (US3)**, **Phase 15 (US4)**, **Phase 16 (US5)**: dependen solo de Phase 11; se pueden hacer en paralelo con US1 (archivos distintos). En US3: T088 → T089. En US4: T091 → T092.
- **Phase 17 (Polish)**: al final.

### Ejemplo en paralelo (tras Phase 11)

```text
T080 [US1] src/pages/Inicio.jsx
T081 [US1] src/components/TarjetaPregunta.jsx
T083 [US1] src/components/Dialogo.jsx
T088 [US3] src/components/TarjetaAccion.jsx
T091 [US4] src/components/TarjetaTip.jsx
T094 [US5] src/components/AvisoAlmacenamiento.jsx
```

### Estrategia

1. **MVP del rediseño**: Phases 10 + 11 + 12 (US1). Validar con los escenarios 1 y 10 y hacer commit.
2. Luego US2 (Emergencia, también P1), US3, US4 y US5, cada una validada por separado.
3. Polish al final. Hacer commit tras cada fase con `npm test` y `npm run lint` en verde.

---

## Phase 18: Convergence

- [X] T100 Añadir en `src/components/BarraNavegacion.jsx` un indicador de forma para la sección activa además del color y el peso (por ejemplo, una barra superior de 3px en el color de la sección o una píldora `bg-superficie` detrás del ícono), de modo que Emergencia activa se distinga de Emergencia inactiva sin depender del color per FR-036a, US5/AC1 (partial)
- [X] T101 Limitar el `<nav>` de `src/components/BarraNavegacion.jsx` a la columna centrada (`mx-auto max-w-columna`, con borde superior `borde` y, en pantallas mayores a 560px, bordes laterales) para que la barra no se estire a todo el ancho del monitor per contracts/pantallas.md "Diseño adaptable", Constitution §7.6 (partial)
- [X] T102 Incluir los rangos del semáforo en el nombre accesible de `src/components/Semaforo.jsx` (por ejemplo, "Riesgo total 54 %, nivel Medio. Rangos: Bajo 0–39 %, Medio 40–69 %, Alto 70 % o más"), construidos con `LIMITE_RIESGO_MEDIO` y `LIMITE_RIESGO_ALTO`, para que el lector de pantalla también los anuncie per FR-015, FR-036a (partial)
- [X] T103 Documentar `src/components/iconosDimension.js` (mapa de íconos por dimensión, §7.9) y `src/components/TextoContenido.jsx` (texto o lista del contenido) en la estructura de `specs/001-escudo-web-app/plan.md`, justificándolos por evitar duplicación (principio V) per plan: Project Structure (unrequested)

---

# Rediseño de Inicio 2026-10-16 — Pantalla de bienvenida

**Input**: spec FR-001, FR-002 y escenario 1 de la US1 (Clarifications 2026-10-16: referencia de Inicio, textos de garantías, "Ver política" y relleno de las tarjetas), constitución §7.3–§7.9, [contracts/pantallas.md](./contracts/pantallas.md) "Inicio".

**Alcance**: solo la capa visual de Inicio. **No cambian** la lógica del consentimiento (`consentimiento`, `onCambiarConsentimiento`, casilla siempre desmarcada al entrar, `disabled` de "Empezar diagnóstico"), la navegación (`onEmpezar`, `onEmergencia`, guardas de `App.jsx`) ni el diálogo de la política (`Dialogo` + `POLITICA_PRIVACIDAD`). Ningún archivo de `src/data/` cambia: los textos de Inicio son textos de la UI fijados por la spec y viven en `src/pages/Inicio.jsx` (no existen en `src/data/`). No hay pruebas automáticas de UI (R11); se valida con `quickstart.md` y con `npm test` / `npm run lint`.

**Reglas extra**: las mismas del rediseño anterior (solo tokens de `tailwind.config.js`, nada de hex ni clases de paleta, íconos de `lucide-react` con `strokeWidth={2}` y `aria-hidden="true"`). Los tamaños sin token (13px, 17px, 22px, 36px, 10px) se escriben como valores arbitrarios de Tailwind (`text-[13px]`, `rounded-[10px]`…), nunca como `style`. El mockup `docs/diseno/01-inicio.png` no existe: la referencia es la estructura de FR-001/FR-002; si el PNG se agrega después, manda (§7.1).

## Phase 19: User Story 1 — Rediseño de la pantalla de Inicio (Priority: P1)

**Goal**: Inicio muestra, de arriba a abajo, encabezado (logo + "Escudo" + chip "Gratis · 5 min"), etiqueta "DIAGNÓSTICO DE SEGURIDAD DIGITAL", título "¿Qué tan fácil sería estafarte?", párrafo, tres tarjetas de garantías en una fila, espacio flexible, consentimiento en tarjeta, botón primario, botón de emergencia y pie "Basado en NIST CSF 2.0 y CIS Controls v8.1".

**Independent Test**: `quickstart.md` escenario 1 (parte de Inicio) en 390px y 1440px: orden y textos exactos de FR-001; "Empezar diagnóstico" deshabilitado hasta marcar la casilla; tocar "Ver política" abre el diálogo y **no** cambia la casilla; al cerrarlo, la casilla conserva su estado; "Tengo una emergencia ahora" lleva a Emergencia sin consentimiento; sin desplazamiento horizontal.

- [X] T104 [US1] Hacer que la columna ocupe todo el alto de la pantalla en `src/App.jsx`, sin tocar `resolverPantalla`, la navegación ni las props: el contenedor externo pasa de `min-h-dvh ${fondo}` a `flex min-h-dvh flex-col ${fondo}` y el `<main>` añade `flex-1` a sus clases actuales (`mx-auto flex w-full max-w-columna flex-col gap-4 px-6 py-6 text-texto …`). Así el espacio flexible de Inicio (T105) puede empujar el consentimiento y los botones hacia abajo. Comprobar que las demás pantallas se ven igual que antes
- [X] T105 [US1] Reestructurar la raíz y la cabecera de `src/pages/Inicio.jsx` (FR-001, §7.3, §7.9): la raíz pasa a `<div className="flex flex-1 flex-col gap-6">`. (1) Encabezado `<header className="flex items-center justify-between">`: a la izquierda `<div className="flex items-center gap-2.5">` con un cuadro `<span className="flex size-9 items-center justify-center rounded-[10px] bg-primario">` que contiene `<ShieldCheck size={20} strokeWidth={2} aria-hidden="true" className="text-white" />` y el texto `<span className="text-xl font-extrabold text-texto">Escudo</span>` (ya **no** es el `<h1>`); a la derecha el chip `<span className="rounded-full bg-pista px-3 py-1 text-xs font-semibold text-texto-secundario">Gratis · 5 min</span>`. (2) Bloque de presentación `<div className="flex flex-col gap-3">` con: la etiqueta `<p className="text-[13px] font-bold uppercase tracking-[0.08em] text-primario">Diagnóstico de seguridad digital</p>` (mayúsculas por CSS para que el lector de pantalla no deletree); el título `<h1 tabIndex={-1} className="text-bienvenida text-texto">¿Qué tan fácil sería estafarte?</h1>` (conserva `tabIndex={-1}`, es el elemento que recibe el foco al navegar); y el párrafo `<p className="text-[17px] leading-normal text-texto-secundario">Responde 14 preguntas sobre tus hábitos y te mostramos tu nivel de riesgo y qué corregir primero.</p>`. Quitar la importación de `TEXTO_LECTURA` si queda sin uso
- [X] T106 [US1] Reemplazar la lista de garantías de `src/pages/Inicio.jsx` por tres tarjetas en una fila (FR-001, Clarifications 2026-10-16): `GARANTIAS` = `[{ texto: "Nunca pedimos contraseñas", Icono: Lock }, { texto: "Respuestas anónimas", Icono: User }, { texto: "No entramos a tu celular", Icono: Smartphone }]`; `<ul className="grid grid-cols-3 gap-2.5">`, cada `<li className="flex flex-col gap-2 rounded-tarjeta border border-borde bg-superficie p-3">` con `<Icono size={22} strokeWidth={2} aria-hidden="true" className="text-primario" />` arriba y `<span className="text-[13px] font-semibold leading-snug text-texto">{texto}</span>` abajo. Esquinas 16px y borde 1px `borde` según §7.4; relleno 12px (excepción aprobada a §7.4). **No** usar `break-all`, `break-words` ni `hyphens-auto`: las palabras no se parten. Mantener 3 columnas también en celular. Depende de T105 (mismo archivo)
- [X] T107 [US1] Añadir el espacio flexible y rehacer el consentimiento en `src/pages/Inicio.jsx` (FR-002, Clarifications 2026-10-16), sin cambiar su lógica: después de las tarjetas, `<div className="flex-1" aria-hidden="true" />`; luego un `<div className="flex flex-col gap-3">` con: (a) la tarjeta `<div className="rounded-tarjeta border border-borde bg-superficie p-5">` que contiene `<div className="flex items-start gap-3">` con la tarjeta `relative` y un `<p className="pl-8 text-sm text-texto">` que contiene `<label className="-my-3 cursor-pointer py-3">` con la casilla `<input type="checkbox" checked={consentimiento} onChange={(evento) => onCambiarConsentimiento(evento.target.checked)} className="absolute top-5 left-5 size-5 accent-primario" />` y el texto "Acepto el tratamiento de mis respuestas según la Ley 1581 de 2012.", seguido de `{" "}<button type="button" className="-my-3 inline-block py-3 font-semibold text-primario underline underline-offset-2" onClick={() => setPoliticaAbierta(true)}>Ver política</button>` (una etiqueta vacía alrededor de la casilla incumple `jsx-a11y/label-has-associated-control`; por eso la casilla va dentro de la etiqueta del texto). El botón queda **fuera** del `<label>` (abrirlo no marca ni desmarca la casilla) y su área táctil llega a 44px de alto sin separar las líneas (§7.7); (b) "Empezar diagnóstico" con `BOTON_PRINCIPAL`, `disabled={!consentimiento}` y `onClick={onEmpezar}` como hoy; (c) "Tengo una emergencia ahora" con `BOTON_EMERGENCIA`, `<TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />` y `onClick={onEmergencia}` como hoy. Quitar las importaciones de `TARJETA` y `BOTON_ENLACE` si quedan sin uso. El `<Dialogo>` de la política no cambia. Depende de T106 (mismo archivo)
- [X] T108 [US1] Añadir el pie al final de `src/pages/Inicio.jsx`, después de los botones y antes del `<Dialogo>`: `<footer className="text-center text-xs text-texto-suave">Basado en NIST CSF 2.0 y CIS Controls v8.1</footer>` (texto respaldado por la constitución, línea 22). Depende de T107 (mismo archivo)
- [X] T109 [P] [US1] Actualizar la sección "Inicio" de `specs/001-escudo-web-app/contracts/pantallas.md` para que coincida con FR-001/FR-002: encabezado (cuadro 36px `primario` con ShieldCheck blanco + "Escudo" 20px/800 + chip "Gratis · 5 min" en `pista`), etiqueta "DIAGNÓSTICO DE SEGURIDAD DIGITAL", `<h1>` "¿Qué tan fácil sería estafarte?" (38px/800), párrafo, tres tarjetas de garantías en una fila con los textos nuevos ("Nunca pedimos contraseñas", "Respuestas anónimas", "No entramos a tu celular"; relleno 12px), espacio flexible, consentimiento en tarjeta con "Ver política" fuera del `<label>`, botones y pie "Basado en NIST CSF 2.0 y CIS Controls v8.1". Quitar los textos viejos ("Nunca te pedimos contraseñas", "No accedemos a tu celular ni a tus cuentas", `<h1>` "Escudo")
- [ ] T110 [US1] Validar Inicio con `quickstart.md` escenario 1 en 390px, 360px y 1440px: orden y textos exactos; foco de teclado visible en la casilla, "Ver política" y los dos botones; tocar "Ver política" no cambia la casilla; columna centrada de 560px en computador; fondo `fondo`; sin desplazamiento horizontal. Si en 360px "contraseñas" no cabe en su tarjeta, **detenerse y avisar al equipo** (no partir la palabra ni cambiar el relleno por cuenta propia). Ejecutar `npm test`, `npm run lint` y `npm run format:check` en verde, y confirmar con `grep -nE "#[0-9a-fA-F]{3,6}\b" src/pages/Inicio.jsx src/App.jsx` que no hay hexadecimales. Depende de T104–T108

**Checkpoint**: Inicio se ve con el diseño nuevo; consentimiento, "Empezar diagnóstico", "Ver política" y "Tengo una emergencia ahora" se comportan igual que antes.

### Dependencias de la Phase 19

- T104 (`App.jsx`) es independiente de T105–T108 y se puede hacer en paralelo con ellas, pero el espacio flexible solo se nota cuando ambas están hechas.
- T105 → T106 → T107 → T108: mismo archivo (`src/pages/Inicio.jsx`), en orden.
- T109 (documentación) es [P]: archivo distinto, sin dependencias.
- T110 al final.

```text
En paralelo: T104 (src/App.jsx) · T105…T108 (src/pages/Inicio.jsx) · T109 (contracts/pantallas.md)
```

**Estrategia**: es un incremento pequeño de la US1 (MVP). Hacer T104–T108, validar con T110 y hacer commit solo cuando el equipo lo pida.

---

## Phase 20: Convergence

- [X] T111 Eliminar la zona muerta entre la casilla de consentimiento y su texto en `src/pages/Inicio.jsx`: hoy la casilla (`absolute top-5 left-5 size-5`) solo mide 20×20 px y entre ella y el texto hay ~12 px que no responden al toque, de modo que el control no alcanza el área táctil de 44×44 px que exigen §7.7 y FR-036a (y que ya afirma `contracts/pantallas.md` "Inicio"). Añadir al `<label>` inline `-ml-8 pl-8` (además de `-my-3 py-3`) para que su caja en la primera línea empiece en la casilla y cubra casilla + hueco + texto con ≥ 44 px de alto, sin mover el texto ni sacar "Ver política" del `<p>`; comprobar con capturas en 360 y 390px que el diseño no cambia y que tocar "Ver política" sigue sin cambiar la casilla per FR-036a, Constitution §7.7 (partial) — Hecho con `-ml-8 pl-8 py-[13px]` (el `py-3` daba 42px de alto; `-my-3` no tiene efecto en un elemento inline y se quitó). Medido en 360 y 390px: etiqueta y "Ver política" de 44px; casilla, hueco y zona superior responden; "Ver política" abre el diálogo sin cambiar la casilla
