# Contrato: pantallas y navegación (UI)

La navegación es propia (`useNavegacion`, R1). Cada cambio de pantalla hace `history.pushState({ pantalla, pregunta?, vista? })` y mueve el foco al `<h1>` de la pantalla nueva.

## Sistema de diseño (constitución §7)

Todas las pantallas usan los tokens, la tipografía y los componentes base de la constitución §7 (detalle en [R14–R18](../research.md)). Resumen de lo que verifica la revisión visual:

| Elemento | Regla |
|---|---|
| Fondo de pantalla | Inicio y Diagnóstico: `fondo`. Resultado, Mi plan, Tips y Emergencia: `superficie` |
| Columna | Mobile-first 390px; máximo 560px centrada; márgenes laterales 24px |
| Títulos | Bienvenida 38px/800; pantalla 28px/800; sección 16–18px/700–800; espaciado de letras −0.02em a −0.03em |
| Texto de lectura | ≥ 16px, peso 400–500, interlineado 1.5 |
| Tarjetas | Fondo `fondo`, borde 1px `borde`, radio 16px, relleno 20–22px, separación 10–14px, sin sombras |
| Botón primario | `primario` (hover/presionado `primario-oscuro`), texto blanco, 56px de alto, ancho completo de la columna, peso 700, radio 12px |
| Botón de emergencia | Blanco, borde 1.5px `peligro`, texto `peligro`, ícono TriangleAlert, 52px de alto, radio 12px. En Inicio: dos líneas y mínimo 52px que crece (excepción, spec 003 FR-002) |
| Prioridad | Urgente: `peligro` + blanco; Importante: `advertencia-suave` + `advertencia-texto`; Revisa: `pista` + `texto-secundario`; radio 6px |
| Íconos | Solo `lucide-react`, 20–24px (16px en chips), `strokeWidth` 2 |
| Tema | Solo claro; sin emojis ni ilustraciones |

## Pantallas, guardas y barra inferior

| Pantalla (`pantalla`) | Requiere | Barra inferior | Origen | FR |
|---|---|---|---|---|
| `inicio` | — | Solo si hay diagnóstico | carga sin diagnóstico; "Repetir diagnóstico" | FR-001…FR-006 |
| `diagnostico` (+ `pregunta` 1–14) | consentimiento aceptado en esta visita a Inicio | **Nunca** | Inicio → "Empezar diagnóstico" | FR-007…FR-012 |
| `resultado` | diagnóstico | Sí | carga con diagnóstico; fin de la encuesta; barra | FR-013…FR-018 |
| `plan` | diagnóstico | Sí | Resultado → botón; barra | FR-019…FR-024 |
| `tips` | diagnóstico | Sí | barra | FR-025…FR-029 |
| `emergencia` (sin `vista`; la conversación es estado local) | — | Solo si hay diagnóstico | Inicio → "Tengo una emergencia ahora"; Tips → acceso; barra | FR-030…FR-034 → spec 003 |

**Guardas**: si se pide `resultado`, `plan` o `tips` sin diagnóstico, se muestra `inicio`. Si se pide `diagnostico` sin consentimiento, se muestra `inicio`.

## Botón "atrás" del navegador (`popstate`)

| Situación | Comportamiento |
|---|---|
| Pregunta k > 1 | Va a la pregunta k−1 con la respuesta conservada |
| Pregunta 1 | Vuelve a empujar el estado y abre el diálogo "¿Salir del diagnóstico?" (igual que "Salir") |
| Emergencia con una guía a medias | Confirmación de salida (spec 003, FR-041); también desde la barra inferior |
| Otra pantalla | Vuelve a la pantalla anterior del historial, aplicando las guardas |

## Elementos y textos fijos por pantalla

Los textos entre comillas son exactos (vienen de la spec). El resto del texto sale de `/src/data`.

### Inicio
- Encabezado: cuadro de 36px fondo `primario`, radio 10px, con ShieldCheck blanco, junto a "Escudo" (20px/800); a la derecha, chip "Gratis · 5 min" (12px/600, `texto-secundario` sobre `pista`, píldora).
- Etiqueta "DIAGNÓSTICO DE SEGURIDAD DIGITAL" (13px/700, `primario`, mayúsculas por CSS, espaciado 0.08em), `<h1>` "¿Qué tan fácil sería estafarte?" (38px/800, −0.03em) y el párrafo "Responde 14 preguntas sobre tus hábitos y te mostramos tu nivel de riesgo y qué corregir primero." (17px, `texto-secundario`, interlineado 1.5).
- Tres tarjetas de garantías en una fila (3 columnas, separación 10px; fondo `superficie`, borde 1px `borde`, radio 16px, relleno 12px), ícono 22px `primario` arriba y texto 13px/600 abajo: Lock "Nunca pedimos contraseñas", User "Respuestas anónimas", Smartphone "No entramos a tu celular". Las palabras no se parten.
- Espacio flexible que empuja el consentimiento, los botones y el pie hacia abajo.
- Casilla nativa `<input type="checkbox">` de consentimiento (Ley 1581 de 2012), **siempre desmarcada al entrar**, dentro de una tarjeta (`superficie`, borde), con área táctil de 44×44 px. Justo después del texto va el botón-enlace "Ver política", **fuera del `<label>`** (abrirlo no cambia la casilla), que abre `Dialogo` con `POLITICA_PRIVACIDAD`. Al cerrar el diálogo, la casilla conserva su estado.
- Botón "Empezar diagnóstico": usa `disabled` mientras la casilla no esté marcada.
- Botón "Empezar diagnóstico" con estilo de botón primario.
- Botón "Tengo una emergencia ahora" / "Un asistente te guía paso a paso": siempre visible, con estilo de botón de emergencia (§7.5) en dos líneas (spec 003, FR-001 y FR-002).
- Pie centrado "Basado en NIST CSF 2.0 y CIS Controls v8.1" (12px, `texto-suave`).

### Diagnóstico (`TarjetaPregunta`)
- "Pregunta X de 14", barra de avance (`<progress value={X} max={14}>`, pista `pista`, relleno `primario`) con etiqueta accesible, y la dimensión con su ícono y nombre visible (`etiqueta`: "Correo (Phishing)", "SMS y WhatsApp (Smishing)", "Llamadas (Vishing)", "Hábitos generales").
- Cada opción es una tarjeta seleccionable (radio nativo, borde `texto-suave`; seleccionada: borde 2px `primario`).
- `<fieldset><legend>{texto}</legend>` con 3 radios (a, b, c) que llevan el texto exacto de cada opción.
- Botones "Anterior" (desde X ≥ 2), "Siguiente" (`disabled` sin selección) y "Salir".
- Diálogo de salida con dos botones: confirmar (descarta las respuestas y vuelve a la pantalla previa) y cancelar.

### Resultado
- `Semaforo`: porcentaje 64px/800, chip píldora con el nivel en texto ("Riesgo bajo" / "Riesgo medio" / "Riesgo alto") y barra segmentada 40/30/30 con marcador oscuro en la posición del puntaje; tramo activo pleno, los demás al 35 %. Debajo de cada tramo: "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 %+" (sin leyenda aparte). `aria-label` "Riesgo total N %, nivel X".
- `RiesgoPorCanal`: 4 barras de progreso, una por dimensión, con su `etiqueta` y su porcentaje encima.
- Sección "Dónde estás en riesgo": cada ítem muestra el número de pregunta, la descripción, la prioridad (texto + estilo) y los puntos. Si no hay hábitos, se muestra un mensaje positivo.
- Botón que lleva al Plan de Acción y botón "Repetir diagnóstico".

### Mi plan (`TarjetaAccion`)
- Tarjeta resumen con el riesgo actual (`Semaforo` compacto: porcentaje + chip de nivel + barra) y "X de N hechas".
- Lista de acciones en el orden de los hábitos. Cada acción muestra título, etiqueta `Prioridad` y "Baja N %". Un `<button aria-expanded>` con ChevronDown despliega "Qué hacer ahora" (ícono Zap) y "Cómo prevenirlo".
- Acción hecha: ícono y texto en `exito`.
- Botón "Ya lo hice", que alterna el estado. Cuando la acción está hecha, el botón cambia de texto y tiene `aria-pressed="true"`.
- Si N = 0: mensaje positivo y "0 de 0 hechas".

### Tips (`TarjetaTip`)
- Regla de oro destacada (`REGLA_DE_ORO`).
- Filtros como grupo de botones píldora con `aria-pressed` (activo: fondo `primario`, texto blanco): "Todos" (por defecto), "SMS", "Llamadas", "Correo", "WhatsApp".
- Ícono de canal en cada tarjeta: MessageSquare (SMS), Phone (Llamada), Mail (Correo), MessageCircle (WhatsApp). Regla de oro con ícono Lightbulb.
- Tarjetas con canal · tipo de ataque y título. Al tocar una, se despliega "cómo reconocerla" y "qué hacer".
- Enlace-botón "¿Ya caíste en una? Ve a primeros auxilios", que lleva a `emergencia`.

### Emergencia
- Reemplazada por el asistente guiado: ver [../../003-rediseno-emergencia-agente/contracts/pantallas.md](../../003-rediseno-emergencia-agente/contracts/pantallas.md) (spec 003).

### Barra inferior (`BarraNavegacion`)
- `<nav aria-label="Secciones">` de 72px de alto, fondo blanco y borde superior `borde`, con 4 botones con ícono y texto: Resultado (ShieldCheck), Mi plan (ListChecks), Tips (Lightbulb) y Emergencia (TriangleAlert).
- La sección actual va en `primario`, con `aria-current="page"` y peso 700, además del color; las inactivas en `texto-suave`.
- Emergencia va siempre en `peligro`, activa o no (activa: peso 700 y `aria-current`). Las áreas táctiles miden al menos 44×44 px.

### Avisos globales (`AvisoAlmacenamiento`)
- `role="status"`, se pueden cerrar y usan los textos de [almacenamiento.md](./almacenamiento.md). Nunca muestran detalles técnicos.

## Diseño adaptable

- Mobile-first a 390px. Una columna de ancho máximo de 560px, centrada, con márgenes laterales de 24px. La barra queda fija abajo y, en computador, centrada dentro de la misma columna. Ningún contenido usa ancho fijo mayor que 360 px (SC-006). No se estiran tarjetas ni botones a todo el ancho del monitor.
