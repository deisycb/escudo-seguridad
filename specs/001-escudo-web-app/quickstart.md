# Quickstart — validar Escudo de punta a punta

**Plan**: [plan.md](./plan.md) · Contratos: [pantallas](./contracts/pantallas.md), [lógica](./contracts/logica.md), [almacenamiento](./contracts/almacenamiento.md), [contenido](./contracts/contenido.md)

## Requisitos previos

- Node.js 22 LTS o superior y npm.
- Un navegador moderno (Chrome o Edge para las DevTools y Lighthouse) y, si es posible, un celular real.
- La extensión axe DevTools (opcional) y un lector de pantalla (VoiceOver en macOS o NVDA en Windows).
- Los archivos de contenido de `/src/data`. `preguntas.js` y `recomendaciones.js` ya tienen contenido provisional ([R13](./research.md)), así que el diagnóstico, el resultado y el plan se pueden validar de punta a punta. Mientras falte el resto (tips, emergencias, política), `contenido.test.js` falla en esas reglas y esas pantallas no se pueden validar con datos reales.

## Instalación y comandos

```bash
npm install
npm run lint        # ESLint: 0 errores
npm run format:check# Prettier: sin diferencias
npm test            # Vitest: todas las pruebas de tests/logic en verde
npm run dev         # Servidor de desarrollo (http://localhost:5173)
npm run build && npm run preview   # Build de producción con CSP (http://localhost:4173)
```

**Resultado esperado**: lint y format sin errores, todas las pruebas pasan, y el build termina sin advertencias con un paquete JS + CSS por debajo de 150 KB gzip.

El escenario 8 se hace sobre `npm run preview`, porque ahí está activa la CSP; los demás sirven en `dev` o en `preview`. Antes de empezar cada escenario: DevTools → Application → Local Storage → borrar `escudo.v1`.

## Escenarios de validación

### 1. Diagnóstico completo (US1, SC-001, SC-003)
1. Abre la app. Debes ver Inicio con las 3 garantías y "Empezar diagnóstico" deshabilitado. No hay barra inferior ni acceso a Tips.
2. Marca la casilla y el botón se habilita. Desmárcala y se deshabilita. Abre "Ver política", ciérrala y la casilla conserva su estado.
3. Responde las 14 preguntas cronometrando el tiempo. Comprueba "Pregunta X de 14", la barra de avance, la dimensión correcta según el rango y que "Siguiente" esté deshabilitado sin opción.
4. En la pregunta 5, vuelve atrás con "Anterior" y luego con el botón atrás del navegador. La respuesta previa sigue marcada.
5. Al terminar, el porcentaje total, el de cada dimensión, el nivel y el orden de "Dónde estás en riesgo" deben coincidir con el cálculo manual hecho con los puntajes del contenido (suma ÷ máximo × 100, redondeado). **Tiempo total menor de 5 min.**
6. Recarga la página. Debe aparecer el Resultado directamente.

### 2. Salir a mitad de la encuesta (FR-011, casos borde)
- En la pregunta 7 pulsa "Salir" → Cancelar: sigues en la 7 con tus respuestas. Pulsa "Salir" → Confirmar: vuelves a Inicio.
- En la pregunta 1 pulsa atrás en el navegador: aparece el diálogo de confirmación.
- A mitad de la encuesta recarga la página: vuelves a Inicio (o al resultado anterior) sin respuestas parciales.

### 3. Emergencia sin diagnóstico (US2, SC-002)
- Desde Inicio, sin marcar la casilla: "Tengo una emergencia ahora" (1 toque) → "Fui víctima de phishing" (2 toques) → ves los pasos numerados.
- Revisa las 3 guías, el aviso "No borres nada", la lista de bancos y "Cómo denunciar". En el celular, tocar un banco abre el marcador. En el computador, el número se ve en pantalla.
- "Volver al inicio" funciona y no aparece la barra inferior.

### 4. Plan de acción (US3, SC-005)
- Con un diagnóstico de al menos 2 hábitos: "Mi plan" muestra "0 de N hechas" y el riesgo actual igual al total.
- Despliega una acción y comprueba que aparecen "Qué hacer ahora" y "Cómo prevenirlo". Pulsa "Ya lo hice": el riesgo baja aproximadamente "Baja N %" (±1) y el contador sube.
- Desmarca la acción y los valores vuelven. Marca dos acciones, cierra la pestaña y vuelve a abrir: el progreso se conserva. El porcentaje de Resultado **no cambia**.
- Marca todas las acciones: riesgo actual 0 % y nivel Bajo.

### 5. Tips y navegación (US4, US5)
- La barra aparece en Resultado, Mi plan, Tips y Emergencia. La sección actual está resaltada y no solo por el color. Emergencia se ve en rojo.
- En Tips: la Regla de oro está destacada, hay 8 tarjetas, y cada filtro muestra solo 2. Abre una tarjeta y revisa su detalle. "¿Ya caíste en una?…" lleva a Emergencia.
- Repetir diagnóstico: la casilla vuelve desmarcada. Abandona la encuesta y el resultado y el progreso anteriores siguen intactos. Complétala con otras respuestas: el resultado nuevo reemplaza al anterior y el plan vuelve a "0 de N".

### 6. Casos borde de cálculo
- Todas las respuestas "a" (si su puntaje es 0): 0 % Bajo, mensaje positivo en "Dónde estás en riesgo" y en Mi plan, "0 de 0 hechas".
- Las fronteras 39/40/69/70 y el redondeo de x,5 se verifican en `tests/logic/Diagnostico.test.js` (`npm test`).

### 7. Almacenamiento bloqueado o corrupto (SC-008, FR-040)
- **Corrupto**: en DevTools pon `escudo.v1` = `{"version":1,"diagnostico":{"respuestas":["z"]}}` y recarga. Debe aparecer un aviso amigable en Inicio y la clave debe haberse borrado.
- **Bloqueado**: en Chrome, Configuración → Cookies → bloquear datos de sitios para `localhost` (o usa la navegación privada de Safari) y recarga. Debe aparecer el aviso "no se guardará". Haz el diagnóstico, el plan y los tips: todo funciona durante la sesión, sin pantallas en blanco ni errores técnicos.

### 8. Privacidad de red (SC-004, FR-038)
- En `npm run preview`, abre DevTools → Network, marca "Preserve log" y recorre todos los escenarios 1, 3, 4 y 5.
- **Esperado**: solo hay peticiones a `localhost:4173` por archivos estáticos (HTML, JS, CSS, fuentes `.woff2` de Plus Jakarta Sans). Ninguna a `fonts.googleapis.com` ni `fonts.gstatic.com`. No hay ninguna petición con respuestas, resultados o progreso, ni ningún dominio externo.
- En la consola, `fetch('https://example.com')` debe quedar bloqueado por la CSP.

### 9. Diseño adaptable y accesibilidad (SC-006, SC-006a, FR-036a)
- Con el modo dispositivo de DevTools prueba 360, 768, 1024 y 1440 px en cada pantalla: no hay scroll horizontal ni elementos cortados.
- Recorre toda la app **solo con teclado** (Tab, Shift+Tab, Espacio, Enter, flechas en los radios, Esc en los diálogos). El foco siempre es visible y al cambiar de pantalla pasa al título.
- Con el lector de pantalla: el semáforo se anuncia como "Riesgo total N %, nivel X"; la prioridad y la sección activa se anuncian como texto.
- Lighthouse → Accessibility = 100, y axe DevTools sin incumplimientos, en cada pantalla.

### 10. Sistema de diseño (constitución §7, FR-036b–FR-036d)
Compara cada pantalla con la tabla "Sistema de diseño" de [contracts/pantallas.md](./contracts/pantallas.md):
- **Fuente**: DevTools → Elements → Computed → `font-family` renderiza "Plus Jakarta Sans".
- **Colores**: `grep -rnE "#[0-9a-fA-F]{3,6}" src/components src/pages` no devuelve nada; los colores solo vienen de `tailwind.config.js`.
- **Fondos**: Inicio y preguntas en blanco; Resultado, Mi plan, Tips y Emergencia en `superficie` (#F2F5FA).
- **Semáforo**: con un riesgo de 52 % se ve "52 %", el chip "Riesgo medio", la barra 40/30/30 con el tramo Medio pleno, el marcador a la mitad del tramo Medio y las etiquetas "Bajo 0–39 %", "Medio 40–69 %", "Alto 70 %+". No hay anillo circular.
- **Dimensiones**: la pregunta 6 muestra "SMS y WhatsApp (Smishing)"; Resultado muestra 4 barras con "Correo (Phishing)", "SMS y WhatsApp (Smishing)", "Llamadas (Vishing)", "Hábitos generales".
- **Barra inferior**: 72px; ítem activo azul; Emergencia en rojo aunque no esté activa.
- **Columna**: a 1440px el contenido y la barra miden como máximo 560px y quedan centrados.
- **Botones**: primario de 56px y emergencia de 52px con borde rojo; sin sombras ni degradados; sin emojis.

## Criterio de aceptación global

Todos los escenarios anteriores pasan, `npm run lint` y `npm test` están en verde, y SC-007 (comprensión del resultado por al menos el 80 % de los usuarios) se mide aparte con usuarios de prueba.
