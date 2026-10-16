# Implementation Plan: Escudo — Diagnóstico de riesgo digital, plan de acción, tips y primeros auxilios

**Branch**: `001-escudo-web-app` | **Date**: 2026-10-15 (actualizado 2026-10-16: sistema de diseño) | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la funcionalidad en `/specs/001-escudo-web-app/spec.md`

## Summary

Escudo es una SPA de React (Vite + Tailwind CSS, JavaScript) que se ejecuta solo en el navegador:

- Pide consentimiento (Ley 1581 de 2012).
- Aplica un prediagnóstico de 14 preguntas de contenido fijo.
- Calcula de forma determinista el riesgo total y el de cada dimensión, y lo muestra en un semáforo accesible.
- Genera un plan de acción con progreso que se guarda en localStorage.
- Ofrece tips por canal y una sección de primeros auxilios disponible sin diagnóstico.

Las reglas de negocio viven en cuatro clases de `/src/logic` probadas con Vitest. La interfaz son componentes funcionales con Hooks. La navegación es propia (estado de React + History API, sin react-router).

**Actualización 2026-10-16 — Sistema de diseño "Confianza institucional"** (constitución §7, spec FR-036b–FR-036d): la interfaz se rehace con la paleta de 15 tokens definida en `tailwind.config.js` (cargado desde CSS con `@config`), la fuente Plus Jakarta Sans empaquetada en la app (`@fontsource`), íconos de `lucide-react`, el semáforo de barra segmentada 40/30/30 (reemplaza el anillo circular), barras de riesgo por canal, etiquetas de prioridad, barra inferior de 72 px y una columna centrada de máximo 560 px. Las clases de `/src/logic` no cambian; solo se añade el campo `etiqueta` a `DIMENSIONES` en `constantes.js` (nombre visible, FR-008). Ver [R14–R18](./research.md). En localStorage solo se guardan las respuestas, la fecha y las acciones hechas; el resultado se recalcula al cargar. Ver [research.md](./research.md).

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSX; Node.js 22 LTS o superior, solo para desarrollo y build

**Primary Dependencies**: React 19, Vite 7 (`@vitejs/plugin-react`), Tailwind CSS 4 (`@tailwindcss/vite`), `lucide-react` (íconos, §7.9) y `@fontsource/plus-jakarta-sans` (fuente empaquetada, §7.3). En desarrollo: Vitest 3, ESLint 9 (`react-hooks`, `react-refresh`, `jsx-a11y`), Prettier 3

**Storage**: `localStorage` del navegador, una sola clave `escudo.v1` ([contracts/almacenamiento.md](./contracts/almacenamiento.md)). Sin backend ni base de datos

**Testing**: Vitest (entorno `node`) para todas las clases de `/src/logic`, más una prueba de validación del contenido de `/src/data`. La interfaz se valida con escenarios manuales ([quickstart.md](./quickstart.md)) y auditorías con axe DevTools o Lighthouse

**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox y Safari en sus dos últimas versiones), en celular y computador; publicado en hosting estático

**Project Type**: Web app de frontend únicamente (SPA estática)

**Performance Goals**: Primera carga en menos de 2 s en 4G con un celular de gama media; JS + CSS por debajo de 150 KB gzip; respuesta inmediata (menos de 100 ms) al marcar opciones y acciones

**Constraints**: Ningún dato sale del dispositivo (CSP `connect-src 'none'` en producción); sin fuentes ni CDN externos (Plus Jakarta Sans se sirve desde la propia app); WCAG 2.1 AA; mobile-first a 390 px, columna máxima de 560 px, de 360 a 1440 px sin scroll horizontal; solo tema claro; colores solo mediante tokens (sin hex sueltos en componentes); funciona aunque localStorage esté bloqueado o corrupto; contenido intocable

**Scale/Scope**: 6 pantallas (Inicio, Diagnóstico, Resultado, Mi plan, Tips, Emergencia con 3 guías + bancos + denuncia), 14 preguntas, 8 tips, 4 clases de dominio; un solo usuario por dispositivo

Ningún punto queda en NEEDS CLARIFICATION: todo está resuelto en [research.md](./research.md). El único pendiente externo es el **contenido**: el equipo debe validar los valores provisionales de las preguntas y entregar el contenido que falta (ver Riesgos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principio / regla | Cómo lo cumple el plan | Estado |
|---|---|---|---|
| I | Privacidad ante todo (NO NEGOCIABLE) | Sin backend, `fetch` ni analítica; en localStorage solo van respuestas (a/b/c), fecha y acciones hechas; CSP `connect-src 'none'` en build; fuente empaquetada (sin Google Fonts); ningún campo de texto libre (FR-038, FR-039) | ✅ |
| II | Consentimiento y Ley 1581 | La pantalla Diagnóstico solo se abre con `consentimientoAceptado`; el resultado solo se crea con 14 respuestas válidas y consentimiento (el constructor de `Diagnostico` rechaza respuestas incompletas); sin cuentas (FR-002, FR-003, FR-012) | ✅ |
| III | Contenido fijo y cálculo determinista | Contenido en `/src/data` sin modificar; `Diagnostico` calcula suma ÷ máximo con constantes `LIMITE_RIESGO_MEDIO`/`LIMITE_RIESGO_ALTO`; la prueba de contenido valida la estructura; las pruebas de lógica cubren semáforo, redondeo y empates. Los puntajes provisionales son una excepción temporal aprobada en la spec (Clarifications 2026-10-16, [R13](./research.md)) | ✅ (anotado) |
| IV | Solo navegador, sin código sombra | Hosting estático; sin react-router ni librerías de estado; se construye solo lo de la spec; estructura plana | ✅ |
| V | Código limpio y verificado | Clases POO en `/src/logic` con JSDoc; componentes funcionales que no calculan riesgo; nombres en español; Vitest + ESLint + Prettier desde la primera tarea | ✅ |
| VI | Lenguaje sencillo, ayuda siempre disponible | Emergencia accesible desde Inicio sin consentimiento ni diagnóstico; errores traducidos a avisos amigables (`AvisoAlmacenamiento`); sin *stack traces* | ✅ |
| — | Stack (React + Vite + Tailwind, JS, localStorage) | Se usa tal cual | ✅ |
| §7 | Sistema de diseño "Confianza institucional" | Tokens de §7.2 en `tailwind.config.js`; tipografía §7.3; formas §7.4; componentes base §7.5 (`Semaforo` de barra segmentada, `RiesgoPorCanal`, `Prioridad`, botones, `BarraNavegacion`); §7.6 columna de 560 px y solo tema claro; §7.7 accesibilidad (contraste verificado, R15); §7.9 solo `lucide-react`. Sin mockups en `/docs/diseno/`: §7 es la referencia (spec, Clarifications) | ✅ |
| — | Estructura `/data`, `/logic`, `/pages`, `/components` | Se respeta. Se agrega `/src/hooks` (2 hooks) para sacar el estado y la navegación de `App.jsx`; no es un patrón complejo | ✅ (anotado) |

**Resultado del gate (antes de Phase 0)**: PASA, sin violaciones.

**Re-evaluación tras Phase 1 (2026-10-16, sistema de diseño)**: PASA. Las dos dependencias nuevas (`lucide-react`, `@fontsource/plus-jakarta-sans`) las exige §7.9 y §7.3 de la constitución y no hacen conexiones externas. `tailwind.config.js` lo exige §7.2. El componente nuevo `RiesgoPorCanal` y los módulos de clases `botones.js` / `estilos.js` evitan duplicar estilos (principio V).

**Re-evaluación tras Phase 1 (2026-10-15)**: PASA. El modelo de datos ([data-model.md](./data-model.md)) se limita a las cuatro clases de la constitución más constantes; los contratos no introducen servicios externos; el esquema de almacenamiento no contiene datos sensibles. Las adiciones (`/src/hooks`, `politica.js` en `/data`, componentes `Dialogo` y `AvisoAlmacenamiento`) son necesarias para requisitos explícitos (FR-002, FR-011, FR-040) y no requieren justificación de complejidad.

## Project Structure

### Documentation (this feature)

```text
specs/001-escudo-web-app/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones de diseño
├── data-model.md        # Phase 1: entidades, clases y estados
├── quickstart.md        # Phase 1: guía de validación
├── contracts/
│   ├── contenido.md     # Forma de los archivos de /src/data (lo que entrega el equipo)
│   ├── almacenamiento.md# Esquema de localStorage y reglas de validación
│   ├── logica.md        # API pública de las clases de /src/logic
│   └── pantallas.md     # Pantallas, navegación, guardas y textos fijos de la UI
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
index.html               # <html lang="es">, punto de entrada de Vite
package.json
vite.config.js           # React + Tailwind + plugin CSP solo en build; config de Vitest
tailwind.config.js       # Tokens de color, fuente, radios y tamaños del sistema de diseño (§7)
eslint.config.js         # ESLint 9 flat: react-hooks, react-refresh, jsx-a11y, prettier
.prettierrc

src/
├── main.jsx             # Monta <App />
├── App.jsx              # Compone hooks, decide pantalla, muestra barra y avisos
├── index.css            # @import "tailwindcss"; @config; @fontsource Plus Jakarta Sans; foco visible
├── data/                # Contenido fijo (entregado por el equipo, no se inventa)
│   ├── preguntas.js     # 14 preguntas, opciones, puntajes, criticidad, descripción del hábito
│   ├── recomendaciones.js # Por pregunta: título, "Qué hacer ahora", "Cómo prevenirlo"
│   ├── tips.js          # Regla de oro + 8 tarjetas
│   ├── emergencias.js   # 3 guías, líneas bancarias, canales de denuncia
│   └── politica.js      # Texto de la política de privacidad (Ley 1581)
├── logic/
│   ├── constantes.js    # LIMITE_RIESGO_MEDIO, LIMITE_RIESGO_ALTO, DIMENSIONES, PRIORIDADES, NIVELES…
│   ├── Pregunta.js
│   ├── Diagnostico.js
│   ├── PlanAccion.js
│   └── Almacenamiento.js
├── hooks/
│   ├── useNavegacion.js # Pantalla actual + History API (pushState/popstate)
│   └── useEstadoEscudo.js # Diagnóstico, progreso y modo sin guardar; usa Almacenamiento
├── pages/
│   ├── Inicio.jsx
│   ├── Diagnostico.jsx
│   ├── Resultado.jsx
│   ├── PlanAccion.jsx
│   ├── Tips.jsx
│   └── Emergencia.jsx
└── components/
    ├── Semaforo.jsx     # Porcentaje grande + chip de nivel + barra segmentada 40/30/30
    ├── RiesgoPorCanal.jsx # Barras de progreso por dimensión
    ├── Prioridad.jsx    # Etiqueta Urgente / Importante / Revisa
    ├── botones.js       # Clases de botón primario, secundario, de emergencia y enlace (tokens)
    ├── estilos.js       # Clases compartidas de tarjeta, chip y título (tokens)
    ├── iconosDimension.js # Ícono de cada dimensión (§7.9); lo usan TarjetaPregunta y RiesgoPorCanal, evita duplicar el mapa (principio V)
    ├── TextoContenido.jsx # Muestra un texto del contenido como párrafo o lista; lo usan TarjetaAccion y TarjetaTip (principio V)
    ├── TarjetaPregunta.jsx
    ├── TarjetaAccion.jsx
    ├── TarjetaTip.jsx
    ├── BarraNavegacion.jsx
    ├── Dialogo.jsx      # <dialog> nativo: confirmar salida y política
    └── AvisoAlmacenamiento.jsx

tests/
├── fixtures/
│   └── contenidoPrueba.js # Contenido sintético solo para pruebas
└── logic/
    ├── Pregunta.test.js
    ├── Diagnostico.test.js
    ├── PlanAccion.test.js
    ├── Almacenamiento.test.js
    └── contenido.test.js  # Valida /src/data contra contracts/contenido.md
```

**Structure Decision**: un solo proyecto de frontend en la raíz del repositorio (junto a `specs/` y `.specify/`), con la estructura de `/src` que fija la constitución. Las pruebas van en `tests/logic/` para que `/src` contenga solo código de la app.

## Riesgos y dependencias

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Puntajes, criticidades, descripciones de hábitos y recomendaciones son provisionales ([R13](./research.md)) | El riesgo mostrado no refleja pesos validados; no se puede publicar | Los valores provisionales están aprobados en la spec y marcados `PROVISIONAL` en `/src/data`; reemplazarlos solo toca el contenido, porque el máximo se calcula (R4) |
| Falta el contenido de tips, guías de emergencia, bancos, denuncia y política | Esas pantallas se ven vacías; `contenido.test.js` falla en esas reglas | La lógica y la UI se prueban con fixtures; **no se inventa ese contenido** |
| El contenido trae textos de acción distintos por opción (b vs c) | El contrato de contenido cambia | Se resuelve agregando un campo opcional por opción ([contracts/contenido.md](./contracts/contenido.md)); las clases no cambian |
| Navegador con localStorage bloqueado | Se pierde el progreso al cerrar | Modo sin guardar + aviso (FR-040), cubierto en las pruebas de `Almacenamiento` |
| La rama git activa es `cambio_de_diseño` y no `001-escudo-web-app` | Confusión al crear los commits de implementación | Implementar el rediseño en `cambio_de_diseño` y fusionarlo a `main` al terminar |
| La UI actual (en `main`) sigue el diseño anterior: anillo SVG, colores de Tailwind sueltos, fuentes del sistema | El código no cumple §7 de la constitución | Rehacer solo `/src/components`, `/src/pages`, `index.css` y añadir `tailwind.config.js`; `/src/logic` y sus pruebas no se tocan |
| No existen mockups en `/docs/diseno/` | Elementos sin regla en §7 (estilo de filtros de Tips, tarjeta resumen de Mi plan) | Se resuelven con los tokens y componentes de §7 y se avisa al equipo antes de crear algo nuevo (R18) |

## Complexity Tracking

No hay violaciones de la constitución que justificar.
