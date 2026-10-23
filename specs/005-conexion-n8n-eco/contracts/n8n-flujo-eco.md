# Contrato: flujo de n8n de eco

Primera versión del flujo de [../../004-asistente-ia-emergencia/contracts/n8n-flujo.md](../../004-asistente-ia-emergencia/contracts/n8n-flujo.md). La llamada al proveedor de IA se sustituye por un eco; todo lo demás (webhook, validación, límite, no guardar) ya rige.

**Archivo**: `n8n/asistente-emergencia.json`. Se escribe en el repositorio y se importa en n8n Cloud; si se edita en n8n, se exporta de nuevo y se reemplaza (R8).

## Nodos

1. **Webhook**
   - Método `POST`; ruta: un UUID aleatorio (R6).
   - Responder: "Using 'Respond to Webhook' node".
   - Opción *Allowed Origins (CORS)*: `http://localhost:5173`.
2. **Code** "Validar, limitar y hacer eco" (modo *Run Once for All Items*). Sale con un solo ítem `{ estado, cuerpo }`:
   - aplica el límite de [data-model.md](../data-model.md) con `$getWorkflowStaticData("global")` → `{ estado: 429, cuerpo: { error: "limite" } }`;
   - valida el cuerpo según [webhook-eco.md](./webhook-eco.md) → `{ estado: 400, cuerpo: { error: "peticion_invalida" } }`;
   - si todo está bien → `{ estado: 200, cuerpo: { respuesta: "Eco: " + último texto } }`.
   - Constantes con nombre (`LIMITE_POR_MINUTO = 30`, `VENTANA_MS = 60000`, `MAXIMO_MENSAJES = 20`, `MAXIMO_CARACTERES = 4000`). No usa `console.log` ni guarda textos.
3. **Respond to Webhook**
   - *Respond With*: JSON, cuerpo `={{ $json.cuerpo }}`.
   - Opción *Response Code*: `={{ $json.estado }}`.
   - Si la versión de n8n no acepta el código por expresión, se usa un Switch por `estado` con tres Respond to Webhook (R2).

## Configuración del flujo (`settings`)

| Ajuste | Valor |
|---|---|
| `saveDataSuccessExecution` | `"none"` |
| `saveDataErrorExecution` | `"none"` |
| `saveManualExecutions` | `false` |
| `saveExecutionProgress` | `false` |

## Reglas del JSON versionado

- Ningún nodo tiene `credentials`; el eco no las necesita.
- `pinData` vacío o ausente.
- Sin la URL de la instancia de n8n Cloud.
- Se valida con `tests/n8n/asistenteEmergencia.test.js` (R8).

## Verificación en n8n Cloud

- El flujo está **activo** y se usa la URL de producción.
- Después de las pruebas, el panel *Executions* del flujo no muestra ejecuciones guardadas.
