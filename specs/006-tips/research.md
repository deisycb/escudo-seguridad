# Research: Tips de seguridad interactivos (006)

Cada decisión resuelve una duda técnica del plan. Formato: Decisión / Razón / Alternativas.

## R1. `RetoTips` es inmutable

- **Decisión**: `marcarTrampa` devuelve una instancia nueva; `responder` devuelve `{ correcta, mensaje, reto }`, donde `reto` es la instancia nueva (la misma si no hubo cambio). La consulta (`trampasEncontradas`, `progreso`, `estaSuperado`) no cambia nada.
- **Razón**: igual que `PlanAccion` (spec 001): React detecta el cambio con `setState(nuevo)` y las pruebas no dependen del orden de llamadas. Se respeta la firma pedida (`{ correcta, mensaje }`) y solo se agrega `reto`.
- **Alternativas**: clase mutable dentro de `useRef` más un contador para forzar el render (rechazada: estado oculto, fácil de desincronizar).

## R2. Las trampas se marcan con `[[ ]]` y el índice sigue del remitente al mensaje

- **Decisión**: `partirEnSegmentos(texto, indiceInicial = 0)` devuelve `[{ texto, esTrampa, indice }]` (`indice` es `null` en los segmentos normales). `segmentosDelTip(idTip)` parte primero el remitente y continúa la numeración en el mensaje. Así, en "Tu cuenta será suspendida" la trampa 0 es el correo del remitente y 1 y 2 están en el mensaje, igual que en el prototipo.
- **Razón**: el contenido sigue siendo texto plano legible y la prueba de estructura puede contar las marcas.
- **Alternativas**: guardar posiciones de caracteres (frágil al editar textos); arreglos de segmentos escritos a mano (difíciles de revisar por el equipo).

## R3. Guardado de retos dentro de `escudo.v1`, sin cambiar la versión

- **Decisión**: el registro gana el campo opcional `retosSuperados: string[]`. `cargarRetosSuperados()` devuelve solo strings únicos (lo inválido se ignora, no vuelve corrupto el registro). `guardarRetosSuperados(ids)` reescribe solo ese campo y devuelve `false` si no hay registro o falla la escritura. `guardarDiagnostico` conserva los retos ya guardados. `VERSION_ALMACENAMIENTO` sigue en 1.
- **Razón**: Tips solo existe con diagnóstico (FR-006 de la 001), así que el registro siempre está. Un campo opcional no rompe registros viejos, y un dato de juego dañado no debe borrar el diagnóstico de la persona.
- **Alternativas**: clave nueva `escudo.tips.v1` (rechazada: el pedido es usar la clave existente); subir a versión 2 (rechazada: obligaría a migrar o borrar diagnósticos válidos).

## R4. Los ids desconocidos se descartan en `RetoTips`

- **Decisión**: el constructor de `RetoTips` filtra los ids guardados que no existen en `TIPS`.
- **Razón**: si el equipo cambia un id, la barra nunca muestra "9 de 8".

## R5. Estado de la pantalla en `useEstadoEscudo`

- **Decisión**: el hook guarda `reto` (instancia de `RetoTips`), `filtroTips` y `tipAbierto` y expone `tipsVisibles`, `progresoTips`, `cambiarFiltroTips`, `alternarTip`, `marcarTrampa` y `responderReto`. Como el hook vive en `App`, el estado se conserva al navegar y se pierde al recargar (FR-011, FR-005). Si guardar falla, se reutiliza `avisarSiNoSeGuardo` (aviso amigable existente).
- **Razón**: es lo pedido y mantiene `Tips.jsx` sin cálculos.
- **Estado local permitido en componentes** (solo presentación, no reglas): en `TarjetaTip`, cuál fue la última trampa tocada (para la caja "Trampa:"); en `MiniReto`, las opciones falladas y la acertada en este intento. Ambos se reinician al cerrar la tarjeta, como en el prototipo (FR-016).

## R6. Frases trampa como `<span role="button">` en línea

- **Decisión**: `FraseTrampa` es un `span` con `role="button"`, `tabIndex={0}`, `onClick` y `onKeyDown` (Enter y Espacio, con `preventDefault` en Espacio para no desplazar la página), `aria-pressed` según si ya se encontró y foco visible del estilo global.
- **Razón**: un `<button>` no parte su texto entre líneas dentro de un párrafo a 390 px; el prototipo usa `mark role="button"`. `jsx-a11y` lo acepta con rol, foco y teclado.
- **Área táctil**: las frases están dentro de una oración, caso que WCAG exceptúa de los tamaños mínimos (inline); el resto de controles sí mide 44 px (FR-041).

## R7. Animación "pop" visible en texto en línea

- **Decisión**: keyframes `pop` en `tailwind.config.js` (`animation.pop`) que animan un `box-shadow` del color `peligro-suave` (crece y desaparece) en 350 ms; se aplica con `motion-safe:animate-pop`. Para repetirla al volver a tocar, `FraseTrampa` quita la clase, fuerza el reflujo y la vuelve a poner sobre su `ref` (como el prototipo), sin remontar el elemento para no perder el foco.
- **Razón**: `transform: scale` no se aplica a elementos en línea, así que el "pop" del prototipo no se veía en frases partidas; `box-shadow` sí se pinta en cada fragmento de línea. `motion-safe` cumple `prefers-reduced-motion` (FR-043); además `motion-reduce:transition-none` en flecha y barra.
- **Alternativas**: `display:inline-block` (rompe el ajuste de línea de frases largas).

## R8. Tokens nuevos

- **Decisión**: se agregan `primario-suave` `#E6EDFC` (caja del reto, cuadro de SMS) y `exito-suave` `#E3F4E8` (opción correcta, cuadro de WhatsApp), los mismos tonos del prototipo. Correspondencias: azul `primario`, texto azul `primario-oscuro`, rojo `peligro`/`peligro-suave`, ámbar `advertencia`/`advertencia-suave`, verde `exito`/`exito-suave`, burbuja `superficie`, tarjeta `fondo`, línea `borde`, gris `texto-suave`, pista de barra `pista`.
- **Contraste** (medido en T014): `peligro`/`peligro-suave` 5.75, `primario-oscuro`/`primario-suave` 8.82, `texto-suave`/`superficie` 4.97, `peligro`/`primario-suave` 5.60, blanco 80 %/`primario` 4.89. El mensaje de acierto en `exito` sobre `primario-suave` daba 4.27:1 (falla AA, igual en el prototipo), así que se agregó el token `exito-texto` `#166534` (6.07:1) para ese texto. Íconos (3:1): `advertencia`/`advertencia-suave` 4.30, `exito`/`exito-suave` 4.39.
- **Razón**: constitución §7.2 (solo tokens). Agregar tokens amplía la paleta sin escribir hex en componentes.

## R9. Todo texto visible sale de `tips.js`

- **Decisión**: `tips.js` exporta `TIPS`, `REGLA_DE_ORO`, `CANALES_TIPS` (nombre visible y orden de filtros) y `TEXTOS_TIPS` (títulos, subtítulo, ayudas, encabezados, "Ejemplo", "De", "Lo que te dicen", "Trampa:", "¡Las encontraste todas!", "Reto superado", "Dato:", acceso a Emergencia y las plantillas de contador como funciones). `MENSAJE_FALLO` y `TOTAL_TRAMPAS_POR_TIP` van en `constantes.js`, como se pidió, porque los usa `RetoTips`.
- **Razón**: FR-018; los componentes no escriben textos.

## R10. Pruebas de estructura en archivo propio

- **Decisión**: `tests/logic/tips.test.js` valida `tips.js` (8 tips, 2 por canal, ids, 3 marcas que coinciden con `trampas`, 3 señales, 3 pasos, 3 opciones con una correcta, textos no vacíos, títulos y regla de oro exactos). El bloque `tips.js` de `contenido.test.js` se elimina (quedaría con los textos viejos); la prueba de prohibiciones de ese archivo sigue cubriendo `TIPS`.
- **Razón**: el pedido indica una prueba de estructura propia.
