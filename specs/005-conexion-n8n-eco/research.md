# Research — Conexión de Escudo con n8n (eco local)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## R1. Qué cambia en la web app

- **Decision**: nada en `src/`. Se reutilizan tal cual el cliente `AsistenteIA` (20 s, últimos 20 mensajes, `credentials: "omit"`, resultados sin excepciones), el campo de 1.000 caracteres con contador, el consentimiento, el bloqueo de datos sensibles y el respaldo con guías de la spec 004. Solo se actualiza el comentario de `.env.example` para nombrar n8n Cloud.
- **Rationale**: la spec se monta sobre la 004 y conserva sus valores (aclaración 2026-10-20). FR-001 a FR-009 ya están implementados y probados en `tests/logic/AsistenteIA.test.js`.
- **Alternatives considered**: un cliente nuevo solo para el eco (duplica código, constitución V); cambiar los límites a 500 caracteres y 10 s (descartado en la aclaración).

## R2. Estructura del flujo en n8n Cloud

- **Decision**: tres nodos: **Webhook** (`POST`, responde con nodo, CORS solo `http://localhost:5173`) → **Code** "Validar, limitar y hacer eco" → **Respond to Webhook** (código de estado y cuerpo tomados de la salida del Code).
- **Rationale**: es la versión mínima del flujo de [../004-asistente-ia-emergencia/contracts/n8n-flujo.md](../004-asistente-ia-emergencia/contracts/n8n-flujo.md): mismo webhook, misma validación y mismo límite, y la llamada al proveedor de IA se sustituye por el eco. Cuando llegue el agente, se reemplaza el eco sin tocar la web app. Un solo nodo Code deja la lógica en un lugar que se puede probar fuera de n8n (R8).
- **Alternatives considered**: un nodo Switch con tres Respond to Webhook (200, 400, 429). Es más visual pero tiene más nodos; queda como respaldo si el código de estado por expresión no funciona en la versión de n8n Cloud.

## R3. Texto del eco

- **Decision**: `{ "respuesta": "Eco: <texto del último mensaje de la persona>" }`.
- **Rationale**: contiene el texto enviado (US1, escenario 1). El prefijo deja claro en pantalla que no es una orientación real. La respuesta pasa la validación de `AsistenteIA` (1 a 4.000 caracteres), porque el mensaje de la persona tiene como máximo 1.000.
- **Alternatives considered**: devolver el cuerpo completo recibido (expondría el historial y no es texto plano); devolver el texto sin prefijo (se confunde con una respuesta del asistente).

## R4. Límite de peticiones

- **Decision**: límite **global** de 30 peticiones por minuto, contado en los datos estáticos del flujo (`$getWorkflowStaticData("global")`), que guardan solo `inicioVentana` (número) y `cantidad` (número). Si se supera, responde `429`.
- **Rationale**: la constitución IV exige limitar peticiones. Un límite global no guarda IPs ni ningún dato de la persona (constitución I; Ley 1581). Con el eco no hay costo de proveedor, así que un límite holgado basta para la prueba local.
- **Alternatives considered**: límite por IP (guarda un dato personal, aunque sea temporal); sin límite en esta etapa (incumple el principio IV).

## R5. No guardar datos de ejecución

- **Decision**: en la configuración del flujo, `saveDataSuccessExecution: "none"`, `saveDataErrorExecution: "none"`, `saveManualExecutions: false` y `saveExecutionProgress: false`. El JSON exportado se revisa con una prueba automática (R8) y el panel de ejecuciones de n8n se revisa a mano después de probar (quickstart).
- **Rationale**: constitución I y FR-011. La verificación de qué viaja se hace en el navegador (aclaración 2026-10-20), no en las ejecuciones de n8n.
- **Alternatives considered**: activar el guardado solo durante la prueba (descartado en la aclaración).

## R6. URL de producción del webhook

- **Decision**: usar la URL de producción (`https://<instancia>.app.n8n.cloud/webhook/<ruta>`) con el flujo **activo**. La ruta es un UUID aleatorio.
- **Rationale**: la URL de prueba (`/webhook-test/`) solo responde una vez por cada "Listen for test event" y genera ejecuciones manuales. Un UUID dificulta que alguien encuentre el webhook por azar. No es un secreto: queda en el bundle de la web app.
- **Alternatives considered**: la URL de prueba (incómoda y deja ejecuciones manuales); autenticación en el webhook (no sirve, porque la clave quedaría en el frontend; constitución IV).

## R7. Configuración local

- **Decision**: `VITE_URL_ASISTENTE_IA=<URL de producción>` en `.env.local`, que ya está en `.gitignore` (`*.local`, `.env*`). `npm run dev` lo lee sin cambiar código (FR-006).
- **Rationale**: es el mecanismo que ya existe desde la 004. En desarrollo no se aplica la CSP; en `npm run build` la CSP queda con `connect-src https://<instancia>.app.n8n.cloud` porque la URL es `https://`.
- **Alternatives considered**: escribir la URL en el código (incumple FR-006); subir `.env` al repositorio (expone la instancia sin necesidad).

## R8. Versionar y probar el flujo

- **Decision**: el flujo se escribe como JSON en `n8n/asistente-emergencia.json` (la ruta que ya prevé la spec 004) y se **importa** en n8n Cloud. Si se edita en n8n, se vuelve a exportar y se reemplaza el archivo. Una prueba de Vitest, `tests/n8n/asistenteEmergencia.test.js`, comprueba en el JSON:
  - configuración de R5;
  - sin `credentials` en ningún nodo y `pinData` vacío (podría contener mensajes de prueba);
  - CORS solo `http://localhost:5173`;
  - el código del nodo Code, ejecutado con `$input` y `$getWorkflowStaticData` simulados: eco correcto, `400` con cuerpos inválidos y `429` al pasar el límite.
- **Rationale**: el repositorio es la fuente de verdad (supuesto de la spec), y la gobernanza exige verificar qué datos salen en todo cambio que toque el asistente. La prueba evita que una exportación futura suba credenciales o reactive el guardado sin que nadie lo note.
- **Alternatives considered**: exportar desde n8n sin revisar (puede incluir `pinData` con datos de prueba); no probar el JSON (los errores de privacidad solo se verían a mano).

## R9. Tiempo de respuesta

- **Decision**: no se agrega nada. El eco no llama a servicios externos; el objetivo es menos de 3 s (SC-001), y la web app sigue cortando a los 20 s.
- **Rationale**: el tiempo que queda depende de la red y de que la instancia de n8n Cloud esté activa. Si la primera petición tarda más, se repite y se registra en el quickstart.
- **Alternatives considered**: mantener la instancia "despierta" con peticiones periódicas (tráfico innecesario).

## R10. Rama de trabajo

- **Decision**: crear la rama `005-conexion-n8n-eco` desde `004-asistente-ia-emergencia` antes de `/speckit-implement`.
- **Rationale**: la rama activa es la de la 004, y la `002-asistente-emergencia-n8n` del encabezado de la spec no existe. Esta feature depende del código de la 004, que todavía no está en `main`.
- **Alternatives considered**: trabajar en la rama de la 004 (mezcla features); usar la rama `conexion-n8n` (no se sabe de qué punto parte); crear la rama desde `main` (le falta el código de la 004).
