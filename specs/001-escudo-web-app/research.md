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
  - Semáforo: anillo SVG con el porcentaje y la etiqueta en texto, más un ícono de forma distinta por nivel (círculo, triángulo, octágono) con `aria-hidden`; el contenedor tiene `role="img"` y un `aria-label` como "Riesgo total 52 %, nivel Medio".
  - Barra inferior: `<nav aria-label="Secciones">` con `aria-current="page"` y un subrayado o borde, además del color.
  - Contraste: tonos 700 de Tailwind sobre blanco (verde, ámbar, rojo; ≥ 4.5:1). Avisos con `role="status"`.
  - `<html lang="es">`.
- **Justificación**: los elementos nativos dan teclado y lector de pantalla sin librerías extra. FR-036a prohíbe que el estado dependa solo del color.
- **Herramientas**: `eslint-plugin-jsx-a11y` (estático, ya forma parte de ESLint) y auditorías manuales con axe DevTools o Lighthouse en el navegador, sin dependencia en el proyecto (SC-006a).

## R9. Garantizar que no salen datos del dispositivo (SC-004)

- **Decisión**:
  - Sin fuentes externas: se usa la pila de fuentes del sistema (Google Fonts, por ejemplo, haría una petición a un tercero).
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

- **Decisión**: Node.js 22 LTS (o superior) + npm; React 19; Vite 7 con `@vitejs/plugin-react`; Tailwind CSS 4 con `@tailwindcss/vite`; Vitest 3; ESLint 9 (configuración *flat*) con `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` y `eslint-plugin-jsx-a11y`; Prettier 3 con `eslint-config-prettier`. Las versiones exactas quedan fijadas en `package-lock.json` al instalar.
- **Justificación**: son las versiones estables vigentes de lo que fija la constitución. Tailwind 4 se integra como plugin de Vite, sin archivo de configuración de PostCSS.

## Dependencia abierta (no bloquea el plan, sí la implementación del contenido)

Los archivos de contenido (textos de preguntas y opciones, puntajes, criticidades, descripciones de hábitos, recomendaciones, textos de tips, pasos de las guías, líneas bancarias, canales de denuncia y política de privacidad) **todavía no existen** y debe entregarlos el equipo. El plan define su forma en [contracts/contenido.md](./contracts/contenido.md). Hasta recibirlos se puede implementar y probar toda la lógica y la interfaz con fixtures, pero **no se debe poner contenido inventado en `/src/data`**.
