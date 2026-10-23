---

description: "Tareas de implementación: Tips de seguridad interactivos (006)"

---

# Tasks: Tips de seguridad interactivos

**Input**: Documentos de diseño en `/specs/006-tips/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Pedidas explícitamente: estructura de `tips.js`, `RetoTips` y `Almacenamiento` (Vitest).

**Orden**: el pedido por el equipo (contenido → lógica → guardado → componentes de menor a mayor → pantalla → comparación → accesibilidad). Cada tarea termina con `npx vitest run <pruebas tocadas>`, `npm run lint` y `npx prettier --check <archivos tocados>` en verde, y un commit.

**Referencia**: `scripts/prototipos/prototipo-tips.html`. Diferencias permitidas solo las de "Decisiones frente al prototipo" en la spec.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Contenido (base de todas las historias)

- [X] T001 Reescribir `src/data/tips.js` con el arreglo `TIPS` del prototipo según [data-model.md](./data-model.md): campos `id` (conservar los 8 ids actuales), `canal` (`"sms" | "llamada" | "correo" | "whatsapp"`), `tipo`, `titulo`, `remitente`, `hora`, `mensaje` (trampas con `[[ ]]`, también en `remitente`), `trampas[3]`, `senales[3]`, `pasos[3]`, `reto { pregunta, opciones[3] { texto, esCorrecta }, acierto }`, `dato`; textos copiados exactamente del prototipo (incluye las comillas de los títulos 3 y 7 y de "técnico"). Exportar también `REGLA_DE_ORO`, `CANALES_TIPS` y `TEXTOS_TIPS` según [contracts/pantalla.md](./contracts/pantalla.md). Agregar `TOTAL_TRAMPAS_POR_TIP = 3` y `MENSAJE_FALLO` en `src/logic/constantes.js`.
- [X] T002 Crear `tests/logic/tips.test.js`: 8 tips, 2 por canal, `tipo` según canal, ids únicos, títulos y `REGLA_DE_ORO` exactos; por tip, el número de marcas `[[ ]]` en `remitente + mensaje` = `TOTAL_TRAMPAS_POR_TIP` = `trampas.length`, 3 señales, 3 pasos, 3 opciones con exactamente una `esCorrecta`, textos no vacíos. Quitar el bloque `describe("tips.js")` de `tests/logic/contenido.test.js` (la prueba de prohibiciones sigue incluyendo `TIPS`).

**Checkpoint**: contenido validado.

---

## Phase 2: Lógica y guardado (bloquea la interfaz)

- [ ] T003 Crear `src/logic/RetoTips.js` según [contracts/logica.md](./contracts/logica.md) (clase inmutable, JSDoc en clase y métodos públicos) y `tests/logic/RetoTips.test.js`: parseo de `[[ ]]` en mensaje y remitente (índices consecutivos, segmentos vacíos omitidos, texto sin marcas), `segmentosDelTip` del tip de correo (trampa 0 en remitente), `marcarTrampa` sin duplicados e índices inválidos, `responder` correcta e incorrecta (mensaje y `MENSAJE_FALLO`, una incorrecta no quita un superado), `progreso` (`superados`, `total`, `porcentaje`), `tipsDelCanal`, ids guardados desconocidos descartados, id inexistente lanza error.
- [ ] T004 Extender `src/logic/Almacenamiento.js` con `cargarRetosSuperados()` y `guardarRetosSuperados(ids)`, y hacer que `guardarDiagnostico` conserve `retosSuperados`, según [contracts/almacenamiento.md](./contracts/almacenamiento.md). Pruebas en `tests/logic/Almacenamiento.test.js`: carga vacía, carga válida, campo inválido ignorado sin volver corrupto el diagnóstico, guardar sin registro → `false`, escritura y lectura bloqueadas → `[]`/`false` sin lanzar, repetir diagnóstico conserva retos; y en `tests/logic/RetoTips.test.js` el flujo con almacenamiento bloqueado (el reto funciona en memoria).
- [ ] T005 Extender `src/hooks/useEstadoEscudo.js` con `tips` según [contracts/pantalla.md](./contracts/pantalla.md) (estado `reto`, `filtro`, `tipAbierto`; acciones `cambiarFiltro`, `alternarTip`, `marcarTrampa`, `responder` que guarda con `guardarRetosSuperados` y usa `avisarSiNoSeGuardo`). Agregar en `tailwind.config.js` los tokens `primario-suave: "#E6EDFC"`, `exito-suave: "#E3F4E8"` y la animación `pop` (research R7).

**Checkpoint**: toda la lógica probada; la interfaz puede empezar.

---

## Phase 3: Componentes (de menor a mayor)

- [ ] T006 [US1] Crear `src/components/FraseTrampa.jsx`: `span role="button"`, `tabIndex={0}`, Enter/Espacio, `aria-pressed`, punteado rojo / resaltado rojo al encontrarse, pop reiniciable sin perder el foco (research R6, R7).
- [ ] T007 [US1] Crear `src/components/MensajeEjemplo.jsx`: caja punteada `superficie`, "De:" o "Lo que te dicen:" (llamada), hora, "Ejemplo", burbuja `fondo` (esquinas iguales en llamada), segmentos con `FraseTrampa`, `overflow-wrap:anywhere`.
- [ ] T008 [P] [US2] Crear `src/components/MiniReto.jsx`: caja `primario-suave`, pregunta en `primario-oscuro`, 3 opciones (44 px, ≥ 16 px), fallo → borde/fondo `peligro`, deshabilitada; acierto → borde/fondo `exito`, todas deshabilitadas; mensaje en `aria-live="polite"`.
- [ ] T009 [P] [US2] Crear `src/components/BarraProgreso.jsx`: texto "X de 8 retos superados" + barra `pista`/`primario` con ancho `porcentaje`, `motion-reduce:transition-none`.
- [ ] T010 [P] [US3] Crear `src/components/FiltrosCanal.jsx`: `role="group"` con `aria-label`, chips píldora 44 px, activo `primario` con texto blanco y `aria-pressed`.
- [ ] T011 [US1] Reescribir `src/components/TarjetaTip.jsx`: cabecera (ícono de canal en cuadro de color: SMS `primario-suave`/`primario`, Llamada `peligro-suave`/`peligro`, Correo `advertencia-suave`/`advertencia`, WhatsApp `exito-suave`/`exito`; "Canal · Tipo"; "· Reto superado" en `exito`; título; ChevronDown que gira) con `aria-expanded`/`aria-controls`; cuerpo con "Así se ve" + contador, `MensajeEjemplo`, caja "Trampa:" en `aria-live`, ayuda, "Cómo reconocerla" (punto `peligro`), "Qué hacer" (círculo `primario` numerado), `MiniReto`, "Dato:".

**Checkpoint**: piezas listas, sin textos escritos a mano.

---

## Phase 4: Pantalla

- [ ] T012 [US3] Reescribir `src/pages/Tips.jsx` (título, subtítulo, Regla de oro con ShieldCheck sobre `primario`, `BarraProgreso`, `FiltrosCanal`, lista de `TarjetaTip`, botón TriangleAlert a Emergencia) y pasar `escudo.tips` desde `src/App.jsx`. Sin cálculos en la pantalla.

**Checkpoint**: US1, US2 y US3 funcionando de punta a punta.

---

## Phase 5: Pulido y verificación

- [ ] T013 Comparar lado a lado con `scripts/prototipos/prototipo-tips.html` a 390 px (escenarios 1–8 de [quickstart.md](./quickstart.md)) y ajustar diferencias que no estén en "Decisiones frente al prototipo".
- [ ] T014 Revisión de accesibilidad: teclado en todo (incluidas frases trampa), `aria-expanded`, `aria-live`, 44 px, foco visible, contraste ≥ 4.5:1 de los pares de research R8 (calcularlo), `prefers-reduced-motion`; corregir lo que falle.

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → (T006 → T007) y (T008, T009, T010 en paralelo) → T011 → T012 → T013 → T014.
- US1 (trampas) depende de T006, T007, T011; US2 (reto) de T008, T009, T011; US3 (filtros/acordeón) de T010, T012.

## Parallel Example

```text
T008 MiniReto.jsx  |  T009 BarraProgreso.jsx  |  T010 FiltrosCanal.jsx
```

## Implementation Strategy

MVP = Phases 1–4 con US1 + US2 (aprender y jugar). US3 (filtros y acordeón) completa la experiencia; el pulido cierra la comparación con el prototipo y la accesibilidad.
