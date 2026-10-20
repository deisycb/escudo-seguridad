# Modelo de datos — Conexión de Escudo con n8n (eco local)

**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

La web app no cambia su modelo: los mensajes, el consentimiento y la conversación son los de [../004-asistente-ia-emergencia/data-model.md](../004-asistente-ia-emergencia/data-model.md) y viven solo en memoria. Aquí solo se describe lo que maneja el flujo de n8n.

## Petición (lo que recibe n8n)

| Campo | Tipo | Regla |
|---|---|---|
| `mensajes` | lista | 1 a 20 elementos; único campo del cuerpo |
| `mensajes[].rol` | texto | `"persona"` o `"asistente"` |
| `mensajes[].texto` | texto | 1 a 4.000 caracteres (la web app limita la persona a 1.000) |

- El último mensaje es siempre de la persona.
- Cualquier otro campo, una lista vacía o un `rol` desconocido → `400`.
- No se guarda: ni en el flujo ni en el historial de ejecuciones (R5).

## Respuesta (lo que devuelve n8n)

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `200` | `{ "respuesta": "Eco: <texto>" }` | petición válida dentro del límite |
| `400` | `{ "error": "peticion_invalida" }` | la petición no cumple las reglas anteriores |
| `429` | `{ "error": "limite" }` | más de 30 peticiones en la ventana de un minuto |

La web app no muestra el cuerpo de error: lo traduce a sus mensajes amables (`motivo` `red` o `limite`).

## Estado del límite (datos estáticos del flujo)

| Campo | Tipo | Regla |
|---|---|---|
| `inicioVentana` | número (ms) | inicio del minuto en curso |
| `cantidad` | número | peticiones en la ventana; se reinicia a 0 cuando pasa un minuto |

No contiene IPs, textos ni ningún dato de la persona (R4).

### Transiciones

```text
petición → (ahora − inicioVentana ≥ 60 000) ? reiniciar ventana : seguir
         → cantidad + 1 > 30 ? 429 : validar → (inválida ? 400 : 200 eco)
```
