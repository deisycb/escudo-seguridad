# Contrato: pantallas y navegación (UI)

La navegación es propia (`useNavegacion`, R1). Cada cambio de pantalla hace `history.pushState({ pantalla, pregunta?, vista? })` y mueve el foco al `<h1>` de la pantalla nueva.

## Pantallas, guardas y barra inferior

| Pantalla (`pantalla`) | Requiere | Barra inferior | Origen | FR |
|---|---|---|---|---|
| `inicio` | — | Solo si hay diagnóstico | carga sin diagnóstico; "Repetir diagnóstico" | FR-001…FR-006 |
| `diagnostico` (+ `pregunta` 1–14) | consentimiento aceptado en esta visita a Inicio | **Nunca** | Inicio → "Empezar diagnóstico" | FR-007…FR-012 |
| `resultado` | diagnóstico | Sí | carga con diagnóstico; fin de la encuesta; barra | FR-013…FR-018 |
| `plan` | diagnóstico | Sí | Resultado → botón; barra | FR-019…FR-024 |
| `tips` | diagnóstico | Sí | barra | FR-025…FR-029 |
| `emergencia` (+ `vista`: `menu` \| `guia:<id>` \| `bancos` \| `denuncia`) | — | Solo si hay diagnóstico | Inicio → "Tengo una emergencia ahora"; Tips → acceso; barra | FR-030…FR-034 |

**Guardas**: si se pide `resultado`, `plan` o `tips` sin diagnóstico, se muestra `inicio`. Si se pide `diagnostico` sin consentimiento, se muestra `inicio`.

## Botón "atrás" del navegador (`popstate`)

| Situación | Comportamiento |
|---|---|
| Pregunta k > 1 | Va a la pregunta k−1 con la respuesta conservada |
| Pregunta 1 | Vuelve a empujar el estado y abre el diálogo "¿Salir del diagnóstico?" (igual que "Salir") |
| Vista interna de Emergencia | Vuelve a `menu` |
| Otra pantalla | Vuelve a la pantalla anterior del historial, aplicando las guardas |

## Elementos y textos fijos por pantalla

Los textos entre comillas son exactos (vienen de la spec). El resto del texto sale de `/src/data`.

### Inicio
- `<h1>` "Escudo", la frase que explica qué hace la app, y una lista de las 3 garantías: "Nunca te pedimos contraseñas", "Respuestas anónimas", "No accedemos a tu celular ni a tus cuentas".
- Casilla nativa `<input type="checkbox">` de consentimiento (Ley 1581 de 2012), **siempre desmarcada al entrar**, con el botón-enlace "Ver política", que abre `Dialogo` con `POLITICA_PRIVACIDAD`. Al cerrar el diálogo, la casilla conserva su estado.
- Botón "Empezar diagnóstico": usa `disabled` mientras la casilla no esté marcada.
- Botón "Tengo una emergencia ahora": siempre visible, con estilo de alerta.

### Diagnóstico (`TarjetaPregunta`)
- "Pregunta X de 14", `<progress value={X} max={14}>` con etiqueta accesible, y el nombre de la dimensión.
- `<fieldset><legend>{texto}</legend>` con 3 radios (a, b, c) que llevan el texto exacto de cada opción.
- Botones "Anterior" (desde X ≥ 2), "Siguiente" (`disabled` sin selección) y "Salir".
- Diálogo de salida con dos botones: confirmar (descarta las respuestas y vuelve a la pantalla previa) y cancelar.

### Resultado
- `Semaforo`: anillo con el porcentaje, la etiqueta del nivel y un ícono de forma distinta por nivel; `aria-label` "Riesgo total N %, nivel X".
- Leyenda: "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 % en adelante".
- Lista de las 4 dimensiones con su porcentaje.
- Sección "Dónde estás en riesgo": cada ítem muestra el número de pregunta, la descripción, la prioridad (texto + estilo) y los puntos. Si no hay hábitos, se muestra un mensaje positivo.
- Botón que lleva al Plan de Acción y botón "Repetir diagnóstico".

### Mi plan (`TarjetaAccion`)
- Tarjeta resumen con el riesgo actual (porcentaje + nivel en texto) y "X de N hechas".
- Lista de acciones en el orden de los hábitos. Cada acción muestra título, prioridad y "Baja N %". Un `<button aria-expanded>` despliega "Qué hacer ahora" y "Cómo prevenirlo".
- Botón "Ya lo hice", que alterna el estado. Cuando la acción está hecha, el botón cambia de texto y tiene `aria-pressed="true"`.
- Si N = 0: mensaje positivo y "0 de 0 hechas".

### Tips (`TarjetaTip`)
- Regla de oro destacada (`REGLA_DE_ORO`).
- Filtros como grupo de botones con `aria-pressed`: "Todos" (por defecto), "SMS", "Llamadas", "Correo", "WhatsApp".
- Tarjetas con canal · tipo de ataque y título. Al tocar una, se despliega "cómo reconocerla" y "qué hacer".
- Enlace-botón "¿Ya caíste en una? Ve a primeros auxilios", que lleva a `emergencia`.

### Emergencia
- `<h1>` "Respira. Vamos paso a paso.".
- Tres botones con los títulos de las guías, que llevan a `guia:<id>` con una lista `<ol>` de pasos.
- Aviso "No borres nada" siempre visible (`AVISO_NO_BORRES`).
- Botón "Llamar a la línea de mi banco", que lleva a `bancos`: lista de `<a href="tel:…">` con el nombre del banco y el número visible.
- Botón "Cómo denunciar en Colombia", que lleva a `denuncia`: lista de `CANALES_DENUNCIA`.
- Sin diagnóstico: botón "Volver al inicio" (R7).

### Barra inferior (`BarraNavegacion`)
- `<nav aria-label="Secciones">` con 4 botones: Resultado, Mi plan, Tips y Emergencia.
- La sección actual tiene `aria-current="page"` y un indicador visual (borde o subrayado), además del color.
- Emergencia usa el color de alerta (rojo 700). Las áreas táctiles miden al menos 44×44 px.

### Avisos globales (`AvisoAlmacenamiento`)
- `role="status"`, se pueden cerrar y usan los textos de [almacenamiento.md](./almacenamiento.md). Nunca muestran detalles técnicos.

## Diseño adaptable

- Una columna de ancho máximo de unos 40 rem, centrada. La barra queda fija abajo en celular y centrada en computador. Ningún contenido usa ancho fijo mayor que 360 px (SC-006).
