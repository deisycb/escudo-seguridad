# Research — Asistente guiado de emergencia (003-rediseno-emergencia-agente)

**Fecha**: 2026-10-20 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

El stack ya está fijado por la constitución y la feature 001 (React 19 + Vite 7 + Tailwind CSS 4 + JavaScript + Vitest). No hay incógnitas de tecnología. Este documento resuelve las decisiones de diseño que la spec deja abiertas.

---

## R1. Dónde vive la lógica de la conversación

- **Decisión**: una clase nueva e inmutable, `ConversacionEmergencia`, en `src/logic/ConversacionEmergencia.js`, con el mismo estilo que `PlanAccion`: cada acción (`elegir`, `mostrarLineasBancarias`, `mostrarCanalesDenuncia`, `reiniciar`) devuelve una conversación nueva. La pantalla guarda la instancia en `useState` y solo la dibuja.
- **Justificación**: la constitución (V) pide modelar las reglas en clases de `/logic` probadas con Vitest y que los componentes no tengan lógica de negocio. El flujo (situación → seguimiento → guía → paso N → cierre, más las acciones rápidas que no pierden el paso) es la parte con más casos borde (FR-012, FR-017) y así se prueba sin navegador. La inmutabilidad encaja con `useState` y evita duplicados por doble toque.
- **Alternativas consideradas**: `useReducer` dentro de la página (lógica sin pruebas unitarias, contradice V); una máquina de estados con librería (dependencia "por si acaso", contradice IV).

## R2. Forma del contenido y relación situación → seguimiento → guía

- **Decisión**: `emergencias.js` pasa a exportar, además de lo que ya tiene:
  - `MENSAJES_ASISTENTE`: saludo, cierre de guía, despedida, introducción de líneas bancarias, introducción de denuncia y mensaje de contenido pendiente.
  - `SITUACIONES_EMERGENCIA`: las 7 situaciones en orden fijo. Cada una tiene `id`, `texto` y **o bien** `guia` (id de guía) **o bien** `seguimiento` (`pregunta` + `respuestas`, cada respuesta con `id`, `texto` y `guia`).
  - `GUIAS_EMERGENCIA` se mantiene (id, titulo, pasos) y admite más de 3 guías.
  Detalle en [contracts/contenido-emergencias.md](./contracts/contenido-emergencias.md).
- **Justificación**: FR-013 exige que textos y relaciones salgan del archivo. Referenciar guías por id permite que varias situaciones compartan una guía (Key Entities) sin duplicar pasos. Una sola pregunta de seguimiento por situación cubre lo que pide la spec ("hace una pregunta de seguimiento o va a la guía") sin construir un árbol genérico.
- **Alternativas consideradas**: árbol de profundidad libre (más complejo de validar y no lo pide la spec); pasos dentro de cada situación (duplica contenido entre situaciones).

## R3. Contenido pendiente y textos provisionales

- **Decisión**:
  - Los ids de las 7 situaciones son fijos (`tarjeta-banco`, `enlace-falso`, `codigo-compartido`, `whatsapp-perdido`, `suplantacion`, `pago-estafador`, `duda`).
  - Mientras el equipo no entregue el texto, cada situación lleva como `texto` provisional su descripción de la spec (FR-007), marcada `PROVISIONAL`. No se inventan preguntas de seguimiento: todas las situaciones apuntan provisionalmente a una de las 3 guías existentes (`tarjetas`, `whatsapp`, `phishing`), y `duda` también, hasta que el equipo defina su pregunta.
  - Los mensajes del asistente quedan vacíos (`""`) con comentario `PENDIENTE`. La clase usa `MENSAJES_ASISTENTE.contenidoPendiente` cuando un texto, una guía, las líneas o los canales están vacíos; si ese mensaje también está vacío, la pantalla muestra un respaldo fijo de la interfaz.
- **Estado**: aprobado en la spec (Clarifications 2026-10-20 y FR-013), con el límite descrito arriba.
- **Justificación**: el principio III prohíbe inventar contenido, pero la conversación debe poder recorrerse para probarla (igual que R13 de la 001). Los textos de las situaciones salen de la spec aprobada, no se inventan. Que una situación quede sin texto o un mensaje vacío nunca rompe la pantalla (Edge Case "Contenido pendiente").
- **Respaldo fijo**: "Esta parte de la guía aún no está lista. Usa los botones de abajo para llamar a tu banco o ver cómo denunciar." Es un texto de interfaz y se avisa al equipo para que lo apruebe o lo reemplace con `contenidoPendiente`.
- **Alternativas consideradas**: dejar las situaciones sin texto (la conversación no se puede probar); escribir saludo y pasos de ejemplo (viola el principio III).

## R4. Acciones rápidas al pie: "Llamar" + "Más ayuda" (actualizado tras la clarificación del 2026-10-20)

- **Decisión**: un bloque `sticky` al pie de la columna, encima de la barra inferior cuando esta existe (`bottom-barra`) o al borde inferior si no. Fondo `superficie`, borde superior `borde`, relleno de 8 px. Una sola fila:
  - "Llamar a la línea de mi banco": estilo primario, `flex-1`, alto mínimo 52 px, ícono Phone; el texto puede ocupar dos líneas.
  - "Más ayuda": estilo secundario, ancho según su texto, alto mínimo 52 px, ícono ChevronDown que gira 180° cuando está abierto. `<button aria-expanded aria-controls="panel-mas-ayuda">`.
  - Panel `#panel-mas-ayuda`: cuando está abierto aparece encima de la fila, dentro del mismo bloque fijo. Tiene dos botones secundarios de ancho completo (alto mínimo 44 px): "Cómo denunciar en Colombia" y "Empezar de nuevo". Se cierra al volver a tocar "Más ayuda", al elegir una de las dos o con Esc, y en ese caso el foco vuelve a "Más ayuda".
  Cerrado ocupa unos 68 px; abierto, unos 170 px. La conversación lleva un relleno inferior igual al alto del bloque cerrado, y los mensajes tienen `scroll-margin-bottom`, para que nada quede tapado.
- **Justificación**: FR-014 (clarificado) deja fija solo la acción más urgente y agrupa las otras dos. Una sola fila recupera altura para la conversación en 390 px. "Empezar de nuevo" detrás de un toque extra también reduce los toques accidentales (FR-018).
- **Alternativas consideradas**: tres acciones fijas en dos filas (unos 120 px, la versión anterior a la clarificación); poner "Llamar" y "Más ayuda" en filas separadas (gasta altura sin necesidad).

## R5. Anuncios a lectores de pantalla y foco

- **Decisión**:
  - La lista de mensajes es un `<ol role="log" aria-live="polite" aria-label="Conversación con el asistente">`. Cada mensaje es un `<li>` con un prefijo solo para lectores de pantalla ("El asistente dice:" o "Tú elegiste:"), clase `sr-only`.
  - El chip "Paso N de M" es texto real dentro del mensaje, así se anuncia junto con el paso.
  - Tras cada elección, el foco pasa a la **primera opción pendiente**. Si no hay opciones (después de "Eso es todo, gracias"), pasa al último mensaje del asistente (`tabIndex={-1}`).
  - Las opciones ya respondidas no se dibujan como botones: la elección queda como mensaje de la persona. Así nunca existe un botón "no disponible" con foco.
  - Al reiniciar, el foco va a la primera de las 7 situaciones.
- **Justificación**: `role="log"` es cortés por defecto y no interrumpe la lectura (FR-024). Llevar el foco a la siguiente acción evita que el usuario de teclado vuelva a recorrer la página (FR-025). El prefijo cubre FR-026 (no solo color ni posición).
- **Riesgo**: algunos lectores pueden anunciar primero el botón enfocado y después el mensaje. Se valida con VoiceOver (iOS/macOS) y NVDA en [quickstart.md](./quickstart.md); si el orden confunde, el foco pasa al mensaje nuevo en lugar de a la opción.
- **Alternativas consideradas**: mover el foco siempre al mensaje (más lecturas dobles con la región viva); no mover el foco (se pierde al desaparecer el botón tocado).

## R6. Desplazamiento y movimiento reducido

- **Decisión**: tras cada cambio, `scrollIntoView({ block: "nearest" })` sobre el último mensaje, con `behavior: "smooth"` solo si `matchMedia("(prefers-reduced-motion: reduce)")` no está activo. Sin indicador de "escribiendo" ni retardos (FR-023). Los botones y mensajes tienen `scroll-margin-bottom` igual al alto de las acciones rápidas.
- **Justificación**: el foco ya hace que el navegador lleve la opción a la vista; el desplazamiento asegura que también se vea el mensaje anterior a ella.

## R7. Navegación, "atrás" y confirmación de salida (actualizado tras la clarificación del 2026-10-20)

- **Decisión**:
  - La pantalla `emergencia` deja de usar `vista` (`menu`, `guia:<id>`, `bancos`, `denuncia`). La conversación vive en el estado local de la página y se descarta al desmontarse (FR-027). `irAEmergencia()` navega a `{ pantalla: "emergencia" }`. "Atrás" nunca deshace pasos.
  - **Una sola guarda de salida** para las tres vías de FR-031:
    - Emergencia registra con `registrarInterceptorAtras(fn)`, que ya existe en `useNavegacion` y usa Diagnóstico, una función `interceptarSalida(destino)`. Si `conversacion.tieneProgreso()` es verdadero, guarda `destino`, abre el diálogo y devuelve `true`; si no, devuelve `false`.
    - "Atrás": `useNavegacion` ya llama al interceptor en `popstate` y, si devuelve `true`, vuelve a poner el estado actual en el historial.
    - Barra inferior: `useNavegacion` expone `navegarConGuarda(destino)`, que consulta el mismo interceptor antes de `navegar`. `App.navegarDesdeBarra` pasa a usarla. Es seguro porque la barra no se muestra durante el Diagnóstico.
    - "Volver al inicio": la misma `interceptarSalida({ pantalla: "inicio" })`, llamada dentro de la página.
  - **Diálogo** (componente `Dialogo` existente): título "¿Salir del asistente?", texto "Perderás el paso en que vas.", botones "Salir" (secundario) y "Seguir aquí" (primario, con el foco inicial). "Salir" navega al destino guardado; "Seguir aquí", la X o Esc cierran el diálogo sin cambios.
  - `tieneProgreso()` es verdadero en cuanto existe algún mensaje de la persona, incluido tocar "Llamar a la línea de mi banco" o "Cómo denunciar en Colombia": hay algo en pantalla que se perdería. Solo con el saludo, se sale sin preguntar.
  - Recargar o cerrar la pestaña no pide confirmación (spec FR-031): no se usa `beforeunload`.
- **Justificación**: reutiliza el mecanismo de "atrás" de la 001 en lugar de crear otro, y una sola función decide para las tres vías, así se comportan igual (clarificación 2026-10-20). "Seguir aquí" lleva el estilo primario y el foco inicial porque es la opción segura para alguien nervioso.
- **Alternativas consideradas**: un estado del historial por mensaje (deja la conversación en `history.state`); `beforeunload` (solo permite el aviso genérico del navegador y la spec lo excluye); una guarda aparte para la barra en `App` (duplicaría la regla).

## R12. Confirmación de "Empezar de nuevo" (clarificación del 2026-10-20)

- **Decisión**: "Empezar de nuevo", dentro de "Más ayuda", abre el mismo `Dialogo` con el título "¿Empezar de nuevo?", el texto "Perderás el paso en que vas." y los botones "Empezar de nuevo" (secundario) y "Seguir aquí" (primario, con el foco inicial). Al confirmar: `reiniciar()`, panel cerrado y foco en la primera situación. Si `tieneProgreso()` es falso, no hace nada (ya está en el saludo).
- **Justificación**: FR-018 la pide igual a la de FR-031. Un solo estado `confirmacion` (`null | { tipo: "salir", destino } | { tipo: "reiniciar" }`) y un solo `Dialogo` en la página cubren los dos casos sin duplicar código.

## R8. Botón de emergencia de dos líneas

- **Decisión**: nueva clase `BOTON_EMERGENCIA_ASISTENTE` en `botones.js`, igual a `BOTON_EMERGENCIA` pero con `min-h-[52px] py-2` en lugar de `h-[52px]`. Contenido: ícono TriangleAlert (20 px) y un `<span>` en columna con "Tengo una emergencia ahora" (16 px/700) y "Un asistente te guía paso a paso" (13 px/500, mismo color `peligro`). El nombre accesible sale del texto visible ("Tengo una emergencia ahora Un asistente te guía paso a paso"). `BOTON_EMERGENCIA` sigue igual para el acceso de Tips.
- **Justificación**: FR-002 pide alto mínimo de 52 px que crece. `peligro` sobre blanco tiene contraste 6,6:1 y cumple AA también a 13 px. No cambiar la clase compartida evita tocar Tips, que no está en el alcance.

## R9. Estilo de burbujas, opciones y chip

- **Decisión** (interpretación de §7 que se avisa al equipo, como pide §7.1):
  - **Burbuja del asistente**: alineada a la izquierda, ancho máximo 88 %, fondo `fondo`, borde 1 px `borde`, radio 16 px (`rounded-tarjeta`), relleno 16 px, texto 16 px `texto`, interlineado 1,5.
  - **Burbuja de la persona**: alineada a la derecha, ancho máximo 80 %, fondo `primario`, texto blanco 16 px/600, mismo radio y relleno. El contraste blanco sobre `primario` es 6,7:1.
  - **Opciones**: debajo de la última burbuja del asistente, botones de ancho completo de la columna, fondo `fondo`, borde 1 px `borde`, radio 12 px, alto mínimo 52 px, texto 16 px/600 `texto` a la izquierda y ChevronRight 20 px `texto-suave` a la derecha; foco visible con anillo `primario`.
  - **Chip "Paso N de M"**: píldora, fondo `pista`, texto `texto-secundario` 12 px/700 (como el chip neutro de §7.5), encima del texto del paso.
  - **Presentación del asistente**: círculo de 44 px `primario` con ShieldCheck blanco de 24 px; "Asistente de emergencias" 16 px/700 `texto`; frase 14 px/500 `texto-secundario`.
  - **Líneas bancarias y canales de denuncia** dentro de la conversación: se reutilizan las tarjetas actuales de `Emergencia.jsx` (`tel:` con número visible, R10 de la 001) dentro de una burbuja del asistente.
- **Justificación**: solo tokens de §7.2, radios de §7.4 e íconos de §7.9 (ShieldCheck, TriangleAlert, ChevronRight, Phone, FileText). Todo pasa contraste AA (R15 de la 001).

## R10. Sin conexión y privacidad

- **Decisión**: no se agrega ninguna petición. La CSP de producción (`connect-src 'none'`) no cambia. La conversación no toca `Almacenamiento` ni `history.state`. El contenido va en el bundle, así que funciona en modo avión una vez cargada la app (SC-004).
- **Nota**: la constitución 2.0.0 prevé un webhook de n8n para un asistente de IA. Está fuera de alcance aquí; cuando se implemente, ampliará `connect-src` solo a ese origen y no debe afectar a este asistente.

## R11. Pruebas

- **Decisión**:
  - `tests/logic/ConversacionEmergencia.test.js` usa contenido de prueba propio (`tests/fixtures/emergenciasPrueba.js`, con una situación con seguimiento, otra directa, una guía de 1 paso y otra vacía) y cubre:
    - el saludo inicial;
    - la elección directa y con seguimiento;
    - avanzar los pasos con "Paso N de M" y llegar al cierre;
    - las tres opciones de cierre;
    - las acciones rápidas que conservan las opciones pendientes, incluso repetidas y después de la despedida;
    - reiniciar;
    - ignorar ids de opción que no están pendientes (doble toque);
    - el contenido pendiente.
  - `validarContenidoEmergencias(contenido)` (función exportada por el mismo módulo) comprueba los 7 ids en orden y que cada `guia` exista. Se prueba con fixtures; contra el contenido real se ejecuta en una prueba aparte que hoy marca lo pendiente.
  - La interfaz se valida a mano ([quickstart.md](./quickstart.md)) y con axe DevTools o Lighthouse.
- **Justificación**: lo mismo que R11 de la 001. Agregar Testing Library y jsdom sería "por si acaso" (IV).

## Dependencia abierta (no bloquea el plan, sí la publicación)

- **Pendiente de entregar por el equipo**:
  - el texto definitivo de las 7 situaciones;
  - qué situaciones llevan pregunta de seguimiento, con sus respuestas y la guía de cada una;
  - los pasos de todas las guías y las guías nuevas que hagan falta (código compartido, suplantación, pago a un estafador…);
  - los mensajes del asistente;
  - el texto del aviso "No borres nada";
  - las líneas bancarias y los canales de denuncia.
- **Pendiente de aprobar**: el respaldo fijo de R3, la interpretación visual de R4 y R9, y los textos de los botones de los diálogos de R7 y R12 ("Salir", "Seguir aquí").
