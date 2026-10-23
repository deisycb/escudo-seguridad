# Implementation Plan: Tips de seguridad interactivos

**Branch**: `006-tips` | **Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la funcionalidad en `/specs/006-tips/spec.md`

## Summary

La pantalla Tips pasa de una lista de texto a un juego de reconocimiento: cada tip muestra un mensaje de ejemplo con 3 frases trampa tocables, señales, pasos, un mini reto y un dato; una barra cuenta los retos superados. Referencia: `scripts/prototipos/prototipo-tips.html`.

**Enfoque técnico**:
- Contenido real del prototipo en `src/data/tips.js`, con trampas marcadas con `[[ ]]` y todos los textos de pantalla ([R2](./research.md), [R9](./research.md)).
- Reglas en una clase inmutable nueva, `RetoTips`, probada con Vitest ([R1](./research.md)).
- `Almacenamiento` guarda solo `retosSuperados` dentro de `escudo.v1` ([R3](./research.md)).
- `useEstadoEscudo` expone el estado de Tips; `Tips.jsx` y 6 componentes solo muestran y reaccionan ([R5](./research.md)).
- Frases trampa accesibles en línea y "pop" con `box-shadow` + `motion-safe` ([R6](./research.md), [R7](./research.md)); 2 tokens nuevos ([R8](./research.md)).

## Technical Context

**Language/Version**: JavaScript (ES2022+), JSX; Node.js 22 LTS solo para desarrollo y build

**Primary Dependencies**: las existentes, sin agregar ninguna: React 19, Vite 7, Tailwind CSS 4, `lucide-react`. En desarrollo: Vitest 3, ESLint 9 (`jsx-a11y`), Prettier 3

**Storage**: `localStorage`, clave existente `escudo.v1`, nuevo campo opcional `retosSuperados`

**Testing**: Vitest (entorno `node`) para `RetoTips`, `Almacenamiento` y la estructura de `tips.js`; la interfaz con [quickstart.md](./quickstart.md), axe DevTools y comparación lado a lado con el prototipo

**Target Platform**: navegadores modernos en celular y computador; hosting estático (Netlify)

**Project Type**: web app de frontend (SPA estática)

**Performance Goals**: respuesta inmediata a cada toque (< 100 ms); el bundle crece < 6 KB gzip

**Constraints**: sin peticiones de red (CSP sin cambios); solo tokens; solo tema claro; texto de lectura ≥ 16 px; 44 px en controles; `prefers-reduced-motion`; 390 px mobile-first, columna 560 px

**Scale/Scope**: 1 pantalla reescrita, 1 clase nueva, 5 componentes nuevos + `TarjetaTip` reescrito, 8 tips de contenido

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Verificación | Estado |
|---|---|---|
| I. Privacidad | Solo se guardan ids de retos en el dispositivo; nada sale; ningún campo pide datos. Remitentes y dominios inventados (FR-021). | ✅ |
| II. Consentimiento | Sin cambios: Tips sigue detrás del diagnóstico. | ✅ |
| III. Contenido fijo | El equipo entregó el contenido real (prototipo + mensaje); reemplaza el borrador PROVISIONAL. No se inventan textos; diferencias mensaje/prototipo se resuelven con el prototipo, como pidió el equipo. El cálculo de riesgo no se toca. | ✅ |
| IV. Simplicidad | Todo en el navegador; sin dependencias nuevas; CSP `connect-src` sin cambios. | ✅ |
| V. Código limpio | Clase en `/logic` con JSDoc y pruebas; componentes funcionales; constantes con nombre (`TOTAL_TRAMPAS_POR_TIP`); nombres en español. | ✅ |
| VI. Lenguaje sencillo | Textos del equipo; sin errores crudos (fallo de guardado → aviso amigable existente). | ✅ |
| §7 Diseño | Tokens (2 nuevos, R8), solo tema claro, tipografía ≥ 16 px, radios y rellenos de §7.4, íconos de §7.9, WCAG AA. Diferencias con el prototipo documentadas en la spec. | ✅ |

**Re-check post-diseño**: sin cambios; ninguna violación que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/006-tips/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── logica.md
│   ├── almacenamiento.md
│   └── pantalla.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── data/tips.js                    # reescrito: TIPS, REGLA_DE_ORO, CANALES_TIPS, TEXTOS_TIPS
├── logic/
│   ├── RetoTips.js                 # nuevo
│   ├── Almacenamiento.js           # + cargarRetosSuperados / guardarRetosSuperados
│   └── constantes.js               # + TOTAL_TRAMPAS_POR_TIP, MENSAJE_FALLO
├── hooks/useEstadoEscudo.js        # + estado de Tips
├── components/
│   ├── FraseTrampa.jsx             # nuevo
│   ├── MensajeEjemplo.jsx          # nuevo
│   ├── MiniReto.jsx                # nuevo
│   ├── BarraProgreso.jsx           # nuevo
│   ├── FiltrosCanal.jsx            # nuevo
│   └── TarjetaTip.jsx              # reescrito
├── pages/Tips.jsx                  # reescrito
└── App.jsx                         # pasa escudo.tips a Tips
tailwind.config.js                  # + primario-suave, exito-suave, animación pop

tests/
├── logic/tips.test.js              # nuevo: estructura del contenido
├── logic/RetoTips.test.js          # nuevo
├── logic/Almacenamiento.test.js    # + retos
└── logic/contenido.test.js         # se quita el bloque viejo de tips.js
```

**Structure Decision**: se mantiene la estructura plana de la constitución (`/data`, `/logic`, `/hooks`, `/components`, `/pages`).

## Riesgo conocido del entorno

En el árbol de trabajo hay un cambio sin commit ajeno a esta funcionalidad: `src/data/asistenteIA.js` se movió a `scripts/asistenteIA.js`. Mientras siga así, `contenido.test.js` y el build fallan al importar ese archivo. No se toca; las verificaciones de cada tarea se reportan separando ese fallo.
