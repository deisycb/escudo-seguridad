# Research — Escudo (001-escudo-web-app)

**Fecha**: 2026-10-15 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

El stack lo fija la constitución (React + Vite + Tailwind CSS + JavaScript + localStorage + Vitest + ESLint/Prettier), así que no hay incógnitas de tecnología. Este documento resuelve las decisiones de diseño que la spec deja abiertas.

---

## R1. Navegación entre pantallas y botón "atrás" del navegador

- **Decisión**: navegación propia con estado de React y la History API (`history.pushState` + evento `popstate`), en un hook `useNavegacion`. **No se usa react-router.** La URL no cambia de ruta: cada pantalla guarda su estado en `history.state` (`{ pantalla, pregunta?, vista? }`).
- **Justificación**:
  - El caso borde "atrás en la pregunta 1 = Salir con confirmación" obliga a interceptar `popstate`, volver a empujar el estado y abrir el diálogo. Con estado propio son pocas líneas. Con react-router hace falta un *data router* y `useBlocker`, que es más complejo.
  - Como no hay URLs profundas, las guardas de FR-006 (sin diagnóstico no hay Resultado, Plan ni Tips) se cumplen solas: no hay URL que lleve a esas pantallas.
  - El hosting estático no necesita reglas de *rewrite* para una SPA (sirve igual en GitHub Pages, Netlify o Vercel).
  - Es una dependencia menos (principio IV).
- **Alternativas consideradas**: react-router con `HashRouter` (agrega una dependencia, deja escribir URLs a mano y exige guardas explícitas); estado sin History API (el botón "atrás" saldría de la app, lo que incumple el caso borde de la spec).

## R2. Qué se guarda en localStorage

- **Decisión**: una sola clave, `escudo.v1`, con `{ version: 1, diagnostico: { respuestas: ["a"…14], fecha: ISO-8601 }, accionesHechas: [números de pregunta] }`. **No se guardan los porcentajes**: el resultado se recalcula al cargar desde las respuestas y el contenido fijo.
- **Justificación**: es lo mínimo que hay que guardar (principio I). El cálculo es determinista (principio III), así que recalcular da exactamente el mismo resultado (FR-024, SC-003). Además no pueden quedar porcentajes guardados que contradigan las respuestas.
- **Alternativas consideradas**: guardar también los resultados calculados (es información duplicada y abre la puerta a incoherencias si alguien los edita); usar IndexedDB (más complejo y sin ningún beneficio para unos pocos bytes).
- Detalle completo en [contracts/almacenamiento.md](./contracts/almacenamiento.md).

## R3. Detectar almacenamiento bloqueado y datos corruptos

- **Decisión**: la clase `Almacenamiento` recibe el objeto de almacenamiento por constructor (por defecto `globalThis.localStorage`). Prueba si está disponible escribiendo y borrando una clave de prueba dentro de `try/catch`. `cargar()` devuelve uno de cuatro estados: `vacio`, `valido`, `corrupto` o `no-disponible`. Si el estado es `corrupto`, borra la clave. Si cualquier escritura falla (cuota llena o bloqueo), la app pasa a modo "sin guardar" y muestra el aviso.
- **Justificación**: cumple FR-040 y SC-008. La inyección de dependencia permite probar todo con un almacenamiento falso en Vitest, sin jsdom.
- **Validación estricta**: si el JSON no se puede leer, si la versión no es 1, si no hay exactamente 14 respuestas en {a, b, c}, si la fecha no es válida, o si hay acciones repetidas, fuera de 1–14 o que no corresponden a un hábito de riesgo, todo el registro se considera corrupto. Así lo pide la spec ("los descarta").

## R4. Redondeo y semáforo

- **Decisión**: `porcentaje = Math.round((puntos * 100) / maximo)`. Si `maximo === 0`, el porcentaje es 0. El nivel se asigna **sobre el valor redondeado**: menor que `LIMITE_RIESGO_MEDIO` (40) es Bajo, menor que `LIMITE_RIESGO_ALTO` (70) es Medio y el resto es Alto.
- **Justificación**: multiplicar antes de dividir reduce el error de coma flotante con puntajes enteros. `Math.round` redondea x,5 hacia arriba (39,5 → 40 → Medio), así que el número y el color siempre coinciden (caso borde de la spec).
- "Baja X %" por acción: `Math.round(puntosAccion * 100 / maximo)`. El riesgo actual se calcula siempre desde los puntos sin redondear (FR-020).
- El puntaje máximo **se calcula** a partir del contenido (suma del mayor puntaje de cada pregunta). No se fija a mano, para no tener números mágicos.

## R5. Acciones del plan: ¿por pregunta o por pregunta y opción?

- **Decisión**: hay **una acción por pregunta**. Las opciones b y c de una misma pregunta comparten la descripción del hábito, el título y los textos "Qué hacer ahora" / "Cómo prevenirlo". Lo que varía según la opción elegida es el **puntaje** y la **criticidad** (la prioridad).
- **Justificación**: la spec pone la "descripción corta del hábito" en la entidad *Pregunta* y define un hábito por respuesta con puntaje mayor a cero. Como solo se elige una opción por pregunta, nunca hay dos acciones de la misma pregunta.
- **Confirmar con el equipo**: si el contenido entregado trae textos distintos para b y c, el contrato de contenido se amplía sin cambiar las clases (ver [contracts/contenido.md](./contracts/contenido.md)).

## R6. Criticidad y prioridad

- **Decisión**: cada opción con puntaje mayor a cero tiene `criticidad: "revisa" | "importante" | "urgente"` en `preguntas.js`. Las etiquetas visibles ("Revisa", "Importante", "Urgente") salen de una constante `PRIORIDADES`. Si el puntaje es 0, la criticidad es `null`.
- **Justificación**: FR-017 dice que los valores los define el equipo y que la criticidad crece de a a c. Una prueba de contenido verifica que no baje de b a c.

## R7. Barra inferior y salidas de cada pantalla

- **Decisión**:
  - Con diagnóstico, la barra se muestra en Inicio, Resultado, Mi plan, Tips y Emergencia, y se **oculta durante la encuesta**. Si se mostrara en la encuesta, se podría salir sin la confirmación que exige FR-011.
  - Sin diagnóstico, la barra nunca se muestra y Emergencia tiene un botón "Volver al inicio".
  - "Repetir diagnóstico" (en Resultado) lleva a Inicio con la casilla desmarcada. Desde ahí se vuelve con la barra.
- **Justificación**: FR-035 pide la barra "cuando existe un diagnóstico" y FR-011 exige confirmación para salir de la encuesta. Sin diagnóstico, el usuario que entra a Emergencia necesita una salida visible además del botón "atrás". Es navegación mínima, no una función nueva.

## R8. Accesibilidad (WCAG 2.1 AA)

- **Decisión**:
  - Preguntas: `<fieldset>` + `<legend>` + `<input type="radio">` nativos, con la etiqueta completa como área táctil (≥ 44 px).
  - Diálogos de confirmación y política: elemento nativo `<dialog>` con `showModal()`, que ya atrapa el foco, cierra con Esc y devuelve el foco al cerrar.
  - Al cambiar de pantalla, el foco se mueve al `<h1>` (`tabIndex={-1}`) para que los lectores de pantalla anuncien el cambio.
  - Detalle de acciones y de tips: `<button aria-expanded aria-controls>`.
  - Semáforo (actualizado 2026-10-16, ver R16): porcentaje grande + chip con el nivel en texto + barra segmentada 40/30/30; el contenedor tiene `role="img"` y un `aria-label` como "Riesgo total 52 %, nivel Medio". Reemplaza al anillo SVG.
  - Barra inferior: `<nav aria-label="Secciones">` con `aria-current="page"` y un subrayado o borde, además del color.
  - Contraste: solo tokens de la constitución §7.2 (verificados en R15). Avisos con `role="status"`.
  - `<html lang="es">`.
- **Justificación**: los elementos nativos dan teclado y lector de pantalla sin librerías extra. FR-036a prohíbe que el estado dependa solo del color.
- **Herramientas**: `eslint-plugin-jsx-a11y` (estático, ya forma parte de ESLint) y auditorías manuales con axe DevTools o Lighthouse en el navegador, sin dependencia en el proyecto (SC-006a).

## R9. Garantizar que no salen datos del dispositivo (SC-004)

- **Decisión**:
  - Sin fuentes externas: Plus Jakarta Sans se empaqueta con la app (R17); Google Fonts haría una petición a un tercero.
  - Sin CDN: todo va empaquetado por Vite.
  - Sin analítica.
  - El build de producción inyecta una meta CSP (`default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'`) con un pequeño plugin `transformIndexHtml` que solo se aplica en `build`. Así no rompe el HMR de desarrollo.
- **Justificación**: aunque alguien agregue sin querer un `fetch`, el navegador lo bloquea. Esto refuerza el principio I con unas pocas líneas de configuración y sin servicios nuevos.
- **Alternativas consideradas**: poner la CSP en los encabezados del hosting (depende del proveedor elegido; la meta funciona en cualquiera).

## R10. Enlaces de llamada

- **Decisión**: `<a href="tel:…">` con el número visible como texto del enlace. Los caracteres especiales se codifican con `encodeURIComponent` (`#` → `%23`, necesario para códigos cortos de operador como `#xxx`).
- **Justificación**: FR-033 y el caso borde del computador: el número siempre se ve, y si el dispositivo no puede llamar, el usuario lo marca a mano.

## R11. Pruebas

- **Decisión**:
  - Vitest en entorno `node` para todas las clases de `/logic`: `Pregunta`, `Diagnostico`, `PlanAccion` y `Almacenamiento` con un almacenamiento falso.
  - Una prueba de **contenido** (`contenido.test.js`) que valida los archivos reales de `/data` contra el contrato: 14 preguntas, 3 opciones, puntajes que no bajan de a a c, criticidad, dimensiones por rango, una recomendación por pregunta, 8 tips (2 por canal) y 3 guías.
  - Las pruebas de lógica usan **contenido de prueba propio** (fixtures), no el contenido real, porque ese contenido aún no se ha entregado y la constitución prohíbe inventarlo.
  - La interfaz se valida con los escenarios manuales de [quickstart.md](./quickstart.md).
- **Justificación**: la constitución exige Vitest para `/logic`. Agregar Testing Library y jsdom para la interfaz sería "por si acaso" (principio IV).

## R12. Versiones y herramientas

- **Decisión**: Node.js 22 LTS (o superior) + npm; React 19; Vite 7 con `@vitejs/plugin-react`; Tailwind CSS 4 con `@tailwindcss/vite` y `tailwind.config.js` vía `@config` (R14); `lucide-react` y `@fontsource/plus-jakarta-sans` (R17); Vitest 3; ESLint 9 (configuración *flat*) con `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` y `eslint-plugin-jsx-a11y`; Prettier 3 con `eslint-config-prettier`. Las versiones exactas quedan fijadas en `package-lock.json` al instalar.
- **Justificación**: son las versiones estables vigentes de lo que fija la constitución. Tailwind 4 se integra como plugin de Vite, sin archivo de configuración de PostCSS.

## R13. Contenido provisional de preguntas y recomendaciones (2026-10-16)

- **Decisión**:
  - `preguntas.js` lleva los **textos reales** de las 14 preguntas y opciones (spec, "Banco de preguntas").
  - Los puntajes y criticidades son **provisionales**, aprobados en la spec (Clarifications 2026-10-16): a = 0 / `null`, b = 1 / `"importante"`, c = 2 / `"urgente"`. El puntaje máximo calculado es 28.
  - `descripcionHabito` y `recomendaciones.js` son **borradores** para poder probar el plan de acción.
  - Cada archivo indica en un comentario `PROVISIONAL` qué partes falta validar.
- **Justificación**: el equipo pidió poder empezar a evaluar mientras define los valores. La constitución III prohíbe inventar puntajes, así que la excepción quedó registrada primero en `spec.md`, como exigen las reglas del agente. Como el puntaje máximo y el riesgo de cada acción se calculan desde el contenido (R4), reemplazar los valores no cambia ninguna clase.
- **Alternativas consideradas**: dejar `/src/data` vacío hasta tener los valores definitivos (bloquea las pruebas de punta a punta); puntajes distintos por pregunta (sería inventar pesos sin criterio del equipo).

## R14. Tokens de diseño con Tailwind CSS 4 (2026-10-16)

- **Decisión**: crear `tailwind.config.js` con `theme.extend` que define los 15 colores de §7.2 con sus nombres exactos (`fondo`, `superficie`, `borde`, `pista`, `texto`, `texto-secundario`, `texto-suave`, `primario`, `primario-oscuro`, `peligro`, `peligro-suave`, `advertencia`, `advertencia-texto`, `advertencia-suave`, `exito`), la familia `sans` = Plus Jakarta Sans, los radios (`boton` 12px, `tarjeta` 16px, `etiqueta` 6px; los chips usan `rounded-full`) y el ancho `columna` = 560px. `index.css` lo carga con `@config "../tailwind.config.js";`.
- **Justificación**: §7.2 exige que los tokens vivan en `tailwind.config.js`. Tailwind 4 configura por CSS (`@theme`), pero mantiene `@config` para archivos JS, así que se cumple la constitución sin cambiar de versión. Los componentes usan clases como `bg-superficie` o `text-peligro`; nunca hex sueltos.
- **Alternativas consideradas**: `@theme` en CSS (más idiomático en v4, pero contradice el texto literal de §7.2); volver a Tailwind 3 (degrada el stack sin beneficio).
- **Control**: una regla de ESLint `no-restricted-syntax` sobre literales `#xxxxxx` en `src/components` y `src/pages` evita colores sueltos.

## R15. Contraste de la paleta (§7.7, FR-036a)

- **Decisión**: se usan solo estas combinaciones de texto, todas verificadas con la fórmula de WCAG:

| Texto / fondo | Contraste |
|---|---|
| `texto-suave` sobre `fondo` / `superficie` | 5.43 / 4.97 |
| `texto-secundario` sobre `superficie` / `pista` | 8.21 / 7.70 |
| blanco sobre `primario` / `peligro` | 6.70 / 6.57 |
| `advertencia-texto` sobre `advertencia-suave` | 7.13 |
| `peligro` sobre `peligro-suave` | 5.75 |
| `peligro` / `advertencia` / `exito` sobre `fondo` | 6.57 / 5.02 / 5.02 |
| `peligro` / `advertencia` / `exito` / `primario` sobre `superficie` | 6.02 / 4.60 / 4.59 / 6.13 |

- `borde` (1.24:1 sobre blanco) es solo decorativo: los controles de formulario (radios, casilla) usan borde `texto-suave` para cumplir 3:1 en componentes (WCAG 1.4.11). El foco visible usa un contorno `primario` de 3px.
- Los tramos atenuados del semáforo (35 % de opacidad) son decorativos: el nivel lo comunican el porcentaje y el chip en texto.

## R16. Semáforo y riesgo por canal (§7.5, FR-015)

- **Decisión**: `Semaforo` recibe `porcentaje` y `nivel` (ya calculados por `Diagnostico`; el componente no calcula). Muestra el porcentaje a 64px peso 800, un chip píldora con ícono y texto ("Riesgo bajo/medio/alto") y una barra de 3 tramos con anchos 40 % / 30 % / 30 % (`exito`, `advertencia`, `peligro`). El tramo del nivel va al 100 % de opacidad y los otros al 35 %. Un marcador oscuro (`texto`) se posiciona con `left: {porcentaje}%`. Debajo de cada tramo: "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 %+"; no hay leyenda aparte.
- Los anchos 40/30/30 salen de las constantes `LIMITE_RIESGO_MEDIO` y `LIMITE_RIESGO_ALTO` (sin números mágicos).
- Chip por nivel: Alto = fondo `peligro-suave`, texto `peligro`, ícono TriangleAlert; Medio = `advertencia-suave` / `advertencia-texto`; Bajo = `superficie` con borde / `exito`, ícono ShieldCheck.
- `RiesgoPorCanal`: una fila por dimensión con el nombre visible (R18) y el porcentaje encima de una barra (`pista` de fondo, relleno con el color del nivel de esa dimensión).
- Mi plan usa el mismo `Semaforo` en versión compacta para el riesgo actual, así no se crea un componente nuevo.

## R17. Fuente e íconos (§7.3, §7.9)

- **Decisión**: `@fontsource/plus-jakarta-sans` (pesos 400, 500, 600, 700 y 800, solo subconjunto latino) importado en `main.jsx`; Vite copia los `.woff2` al build y se sirven desde el mismo origen (la CSP `default-src 'self'` lo permite). Íconos: `lucide-react` con importaciones individuales (`import { ShieldCheck } from "lucide-react"`) para que el build solo incluya los ~18 íconos del mapa de §7.9; tamaño 20–24px (16px en chips), `strokeWidth={2}`, `aria-hidden` cuando acompañan texto y `aria-label` en botones solo-ícono (por ejemplo, cerrar con X).
- **Justificación**: aclaración de la spec (2026-10-16): la fuente no se carga desde Google. Ambas librerías son gratuitas (SIL OFL e ISC) y no hacen peticiones de red.
- **Impacto en tamaño**: unos 20 KB por peso de fuente en woff2 (≈100 KB en total, no cuentan en el JS) y unos pocos KB de íconos; el JS + CSS sigue por debajo de 150 KB gzip.

## R18. Disposición, fondos y nombres visibles (§7.4, §7.6, FR-008, FR-036d)

- **Decisión**:
  - Columna `max-w-columna` (560px) centrada, márgenes laterales de 24px, mobile-first a 390px. La barra inferior (72px, fija) queda dentro de la misma columna en pantallas grandes, y el contenido deja 72px + margen al final para no quedar tapado.
  - Fondos: Inicio y Diagnóstico `fondo`; Resultado, Mi plan, Tips y Emergencia `superficie` (también Emergencia sin diagnóstico). Tarjetas en `fondo` con borde 1px `borde`, radio 16px, relleno 20–22px, separación 10–14px; sin sombras ni degradados.
  - Nombres visibles de las dimensiones: `DIMENSIONES` gana un campo `etiqueta` ("Correo (Phishing)", "SMS y WhatsApp (Smishing)", "Llamadas (Vishing)", "Hábitos generales"), usado en la pregunta y en el resultado. Ícono por dimensión: Mail, MessageSquare, Phone, Lock.
  - Elementos sin regla en §7 (filtros de Tips, tarjeta resumen de Mi plan): filtros como chips píldora (`primario` relleno si activo, borde `borde` si no) y tarjeta resumen con el `Semaforo` compacto. Se avisan al equipo como interpretación de §7 (spec, Clarifications 2026-10-16).
- **Alternativas consideradas**: barra a todo el ancho del monitor (contradice §7.6).

## Dependencia abierta (no bloquea el plan, sí la publicación)

- **Pendiente de validar**: los puntajes y criticidades definitivos, las descripciones de hábitos y las recomendaciones (hoy son provisionales, R13).
- **Pendiente de entregar**: los textos de los tips ("cómo reconocerla" y "qué hacer"), los pasos de las tres guías, el aviso "No borres nada", las líneas bancarias, los canales de denuncia y la política de privacidad.

La forma de todo este contenido está en [contracts/contenido.md](./contracts/contenido.md). Fuera de lo aprobado en R13, **no se debe poner contenido inventado en `/src/data`**. No se publica hasta que el equipo valide el contenido provisional.
