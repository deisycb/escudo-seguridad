---

description: "Lista de tareas de la spec 005: conexión de Escudo con n8n (eco local)"
---

# Tasks: Conexión de Escudo con n8n (eco local)

**Input**: Documentos de diseño en `/specs/005-conexion-n8n-eco/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: se incluyen. El plan (R8) y la gobernanza de la constitución exigen verificar qué datos salen en todo cambio del asistente. La prueba es `tests/n8n/asistenteEmergencia.test.js`.

**Organization**: por historia de usuario. La web app no cambia (R1); el trabajo está en el flujo de n8n, su prueba y la validación manual.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia de usuario de [spec.md](./spec.md) (US1, US2)

## Path Conventions

Proyecto único en la raíz del repositorio:
- flujo en `n8n/`;
- pruebas en `tests/`;
- la web app en `src/` no se toca.

---

## Phase 1: Setup

**Purpose**: rama de trabajo y configuración documentada

- [X] T001 Crear la rama `005-conexion-n8n-eco` desde `004-asistente-ia-emergencia` (`git switch -c 005-conexion-n8n-eco`), **previa confirmación del usuario** (R10). Luego cambiar el encabezado `**Feature Branch**` de `specs/005-conexion-n8n-eco/spec.md` de `002-asistente-emergencia-n8n` a `005-conexion-n8n-eco`, y el `**Branch**` de `specs/005-conexion-n8n-eco/plan.md` a `005-conexion-n8n-eco`. No incluir en ningún commit los cambios ajenos de `src/data/emergencias.js`.
- [X] T002 [P] Actualizar el comentario de `.env.example`:
  - indicar que la URL real es la **Production URL** del flujo activo en n8n Cloud (`https://<instancia>.app.n8n.cloud/webhook/<uuid>`), que va en `.env.local` y nunca se sube;
  - mantener la referencia a `npm run webhook:prueba` para probar sin internet (R7);
  - no agregar ninguna URL real.

---

## Phase 2: Foundational (bloquea las historias)

**Purpose**: el archivo del flujo con su configuración de privacidad, y la prueba que la protege

**⚠️ CRITICAL**: sin esto no se puede importar nada en n8n Cloud

- [X] T003 Crear `tests/n8n/asistenteEmergencia.test.js` (Vitest, entorno `node`, mismo estilo que `tests/logic/AsistenteIA.test.js`). Debe leer `n8n/asistente-emergencia.json` con `readFileSync` + `JSON.parse` y comprobar ([n8n-flujo-eco.md](./contracts/n8n-flujo-eco.md)):
  - `settings.saveDataSuccessExecution === "none"`, `settings.saveDataErrorExecution === "none"`, `settings.saveManualExecutions === false` y `settings.saveExecutionProgress === false`;
  - ningún nodo tiene la propiedad `credentials`;
  - `pinData` ausente o `{}`;
  - el texto del archivo no contiene `.n8n.cloud`;
  - el nodo `n8n-nodes-base.webhook` tiene `httpMethod: "POST"`, `responseMode: "responseNode"`, `options.allowedOrigins === "http://localhost:5173"` y un `path` con formato UUID;
  - existen exactamente un nodo `n8n-nodes-base.code` y uno `n8n-nodes-base.respondToWebhook`, conectados Webhook → Code → Respond to Webhook en `connections`.

  Ejecutar `npm test` y verificar que falla porque el archivo aún no existe.
- [X] T004 Crear `n8n/asistente-emergencia.json` (formato de exportación de n8n: `name`, `nodes`, `connections`, `settings`, `pinData: {}`, sin `id` de instancia ni `meta.instanceId`) con tres nodos:
  - **"Webhook"** (`n8n-nodes-base.webhook`): `httpMethod: "POST"`, `path` = UUID v4 nuevo (generar con `node -e "console.log(crypto.randomUUID())"`), `webhookId` = el mismo UUID, `responseMode: "responseNode"` y `options.allowedOrigins: "http://localhost:5173"`.
  - **"Validar, limitar y hacer eco"** (`n8n-nodes-base.code`, `mode: "runOnceForAllItems"`): por ahora con un `jsCode` provisional que devuelva `[{ json: { estado: 200, cuerpo: { respuesta: "Eco: " } } }]`.
  - **"Responder"** (`n8n-nodes-base.respondToWebhook`): `respondWith: "json"`, `responseBody: "={{ $json.cuerpo }}"` y `options.responseCode: "={{ $json.estado }}"`.

  Agregar `settings` con los cuatro valores de T003 y `executionOrder: "v1"`. Ejecutar `npm test`: deben pasar las comprobaciones de T003.

**Checkpoint**: el JSON existe, no guarda ejecuciones ni tiene credenciales, y su prueba pasa.

---

## Phase 3: User Story 1 - Enviar texto y ver respuesta (Priority: P1) 🎯 MVP

**Goal**: con la app en local, escribir "hola", enviar y ver "Eco: hola", con solo los textos viajando a n8n Cloud.

**Independent Test**: quickstart 1 a 8, 14 y 16 con el flujo activo en n8n Cloud.

### Tests for User Story 1

- [X] T005 [US1] Agregar a `tests/n8n/asistenteEmergencia.test.js` un `describe` que ejecute el `jsCode` del nodo Code fuera de n8n:
  - construirlo con `new (Object.getPrototypeOf(async function () {}).constructor)("$input", "$getWorkflowStaticData", jsCode)`;
  - `$input` simulado: `{ first: () => ({ json: { body } }) }`;
  - `$getWorkflowStaticData` simulado: devuelve siempre el mismo objeto `{}` de la prueba;
  - usar `vi.useFakeTimers()` / `vi.setSystemTime` para `Date.now()`.

  Casos ([webhook-eco.md](./contracts/webhook-eco.md), [data-model.md](./data-model.md)):
  - `{ mensajes: [{ rol: "persona", texto: "hola" }] }` → `{ estado: 200, cuerpo: { respuesta: "Eco: hola" } }`;
  - persona "hola", asistente "Eco: hola", persona "otra vez" → `"Eco: otra vez"`;
  - `400` con `{ error: "peticion_invalida" }` para cada uno de estos cuerpos:
    - `{ mensajes: [] }`;
    - sin `mensajes`;
    - `mensajes` que no es lista;
    - más de 20 elementos ("1 a 20 elementos");
    - campo extra (`{ mensajes: [...], id: "abc" }`; "único campo del cuerpo");
    - `rol: "sistema"` (`"persona"` o `"asistente"`);
    - `texto` vacío, que no es texto o de 4.001 caracteres ("1 a 4.000 caracteres");
    - último mensaje con `rol: "asistente"` ("El último mensaje es siempre de la persona");
    - `body` `null`.

  Verificar que fallan con el `jsCode` provisional.
- [X] T006 [US1] Agregar a la misma prueba que el objeto de datos estáticos, tras varias peticiones, solo tiene las claves `inicioVentana` y `cantidad`, ambas numéricas: no contiene textos ni IPs (R4).

### Implementation for User Story 1

- [X] T007 [US1] Escribir el `jsCode` definitivo del nodo "Validar, limitar y hacer eco" en `n8n/asistente-emergencia.json` (una sola cadena JSON con `\n`). Requisitos:
  - constantes con nombre: `LIMITE_POR_MINUTO = 30`, `VENTANA_MS = 60000`, `MAXIMO_MENSAJES = 20`, `MAXIMO_CARACTERES = 4000`, `ROLES = ["persona", "asistente"]`;
  - funciones cortas `aplicarLimite(datos, ahora)` y `esPeticionValida(cuerpo)`;
  - orden: límite (con `$getWorkflowStaticData("global")`: si `ahora - inicioVentana >= VENTANA_MS`, reiniciar `inicioVentana = ahora` y `cantidad = 0`; luego `cantidad + 1`, y si supera 30 → `{ estado: 429, cuerpo: { error: "limite" } }`) → validación (→ `400`) → eco (`{ estado: 200, cuerpo: { respuesta: "Eco: " + último texto } }`);
  - devuelve `[{ json: { estado, cuerpo } }]`;
  - sin `console.log`; no guarda textos en los datos estáticos.

  `npm test` debe pasar completo (T003, T005, T006).
- [ ] T008 [US1] **Manual, la hace el usuario con su cuenta**:
  - en n8n Cloud, *Import from File* → `n8n/asistente-emergencia.json`;
  - revisar en *Settings* que no se guarda ningún dato de ejecución;
  - **activar** el flujo y copiar la Production URL;
  - crear `.env.local` con `VITE_URL_ASISTENTE_IA=<Production URL>` ([quickstart.md](./quickstart.md), "Preparar n8n Cloud");
  - confirmar con `git status` que `.env.local` no aparece.
- [ ] T009 [US1] Con `npm run dev`, ejecutar los escenarios 1 a 8 de [quickstart.md](./quickstart.md):
  - eco "Eco: hola" en menos de 3 s;
  - payload solo con `mensajes`, sin cookies ni `Referer`;
  - segunda pregunta;
  - doble envío bloqueado;
  - 10 envíos (anotar los tiempos);
  - solo espacios;
  - 1.000 caracteres con contador;
  - tarjeta bloqueada sin petición.

  Anotar los resultados en una sección "Resultados" al final de `specs/005-conexion-n8n-eco/quickstart.md`.
- [ ] T010 [US1] Ejecutar los escenarios 14 y 16 de [quickstart.md](./quickstart.md): sin ejecuciones guardadas en n8n Cloud, y el JSON sin credenciales, sin `pinData` y sin la URL de la instancia. Si se reexportó el flujo desde n8n, reemplazar `n8n/asistente-emergencia.json`, volver a correr `npm test` y anotar en "Resultados".

**Checkpoint**: US1 funciona de punta a punta con n8n Cloud (MVP).

---

## Phase 4: User Story 2 - El servicio no responde (Priority: P1)

**Goal**: si el servicio falla, tarda o limita, la persona ve un aviso amable y las guías funcionan.

**Independent Test**: quickstart 9 a 13 y 15.

### Implementation for User Story 2

- [ ] T011 [US2] Ejecutar el escenario 15 de [quickstart.md](./quickstart.md) contra la Production URL, con un bucle de 31 peticiones válidas en menos de un minuto:

  ```bash
  for i in $(seq 31); do curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"mensajes":[{"rol":"persona","texto":"prueba"}]}' "$VITE_URL_ASISTENTE_IA"; done
  ```

  Las 30 primeras deben dar `200` y la 31, `429`. Enviar también `{"mensajes":[]}`, que debe dar `400`.

  Si n8n Cloud devuelve `200` en lugar de `400`/`429` (no acepta el código por expresión), aplicar el respaldo de R2 en `n8n/asistente-emergencia.json`:
  - un nodo `n8n-nodes-base.switch` por `{{ $json.estado }}`;
  - tres nodos `respondToWebhook` con `responseCode` fijo 200, 400 y 429;
  - ajustar las comprobaciones de nodos y conexiones de `tests/n8n/asistenteEmergencia.test.js`;
  - reimportar en n8n Cloud.

  Anotar el resultado en "Resultados".
- [ ] T012 [US2] Ejecutar los escenarios 9 a 13 de [quickstart.md](./quickstart.md):
  - ruta inexistente: aviso amable y guías completas hasta el final;
  - *Offline*;
  - latencia de 25 s: aviso a los 20 s;
  - flujo desactivado en n8n Cloud (reactivarlo después);
  - sin `VITE_URL_ASISTENTE_IA`: abre en las guías.

  Verificar que en ningún caso se ven detalles técnicos y anotar en "Resultados".

**Checkpoint**: US1 y US2 validadas; la app nunca queda en blanco.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T013 Ejecutar `npm test`, `npm run lint` y `npm run build` con `.env.local`. Verificar en `dist/index.html` que la meta CSP tiene `connect-src https://<instancia>.app.n8n.cloud` y anotar en "Resultados" (sin escribir la URL de la instancia; usar `<instancia>`).
- [X] T014 [P] Actualizar `specs/004-asistente-ia-emergencia/contracts/n8n-flujo.md`: al inicio, una nota que indique que la primera versión (eco) del flujo está en `n8n/asistente-emergencia.json` y se describe en `specs/005-conexion-n8n-eco/contracts/n8n-flujo-eco.md`. En `specs/004-asistente-ia-emergencia/quickstart.md`, cambiar el punto "**Real**" de Requisitos para enlazar al quickstart de la 005.
- [ ] T015 [P] Actualizar la sección "Riesgos y dependencias" de `specs/005-conexion-n8n-eco/plan.md` con lo que se observó: si hizo falta el respaldo del Switch (T011) y los tiempos medidos para SC-001 (T009).
- [ ] T016 Hacer commit local en la rama `005-conexion-n8n-eco` con:
  - `n8n/asistente-emergencia.json`;
  - `tests/n8n/asistenteEmergencia.test.js`;
  - `.env.example`;
  - `specs/005-conexion-n8n-eco/`;
  - los cambios de la spec 004.

  Excluir `.env.local` y `src/data/emergencias.js`. **No hacer push**: lo hace el usuario.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 necesita la confirmación del usuario; T002 es independiente.
- **Foundational (Phase 2)**: T003 → T004. Bloquea US1 y US2.
- **US1 (Phase 3)**: T005, T006 → T007 → T008 (manual) → T009, T010.
- **US2 (Phase 4)**: necesita T008 (flujo activo y `.env.local`). T011 → T012, porque T011 puede cambiar el flujo.
- **Polish (Phase 5)**: después de US1 y US2; T016 al final.

### User Story Dependencies

- **US1**: depende solo de Foundational.
- **US2**: comparte el flujo importado en T008. Se puede validar sin la US1 completa: basta con T007 y T008.

### Parallel Opportunities

- T002 en paralelo con T003 y T004.
- T005 y T006 tocan el mismo archivo: van seguidas, no en paralelo.
- T014 y T015 en paralelo entre sí.
- T009/T010 (US1) y T012 (US2) son validaciones manuales independientes una vez hecha T008. T011 puede cambiar el flujo, así que conviene hacerla antes de T009 si se sospecha el problema del código de estado.

---

## Parallel Example: Setup y Foundational

```bash
Task: "T002 Actualizar el comentario de .env.example"
Task: "T003 Crear tests/n8n/asistenteEmergencia.test.js"   # luego T004
```

## Parallel Example: Polish

```bash
Task: "T014 Enlazar la 005 desde specs/004-asistente-ia-emergencia/contracts/n8n-flujo.md y quickstart.md"
Task: "T015 Actualizar Riesgos de specs/005-conexion-n8n-eco/plan.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001 y T002.
2. T003 y T004: JSON con privacidad garantizada por la prueba.
3. T005 a T007: eco probado fuera de n8n.
4. T008: el usuario importa y activa en n8n Cloud.
5. T009 y T010: **detenerse y validar** "Eco: hola" en local.

### Incremental Delivery

1. MVP (US1) → la conexión real funciona.
2. US2 → fallos, límite y respaldo validados.
3. Polish → build con CSP, specs enlazadas y commit local.

---

## Notes

- `src/` no cambia en esta feature (R1). Si una tarea parece requerir tocarlo, detenerse y revisar el plan.
- T008 y los escenarios manuales necesitan la cuenta de n8n Cloud del usuario.
- La URL de la instancia nunca se escribe en archivos versionados.
- Commit solo local; el push lo hace el usuario.
