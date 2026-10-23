# Contrato: webhook del asistente de IA

Único punto de conexión externo de la web app (constitución IV). Lo implementa el flujo de n8n ([n8n-flujo.md](./n8n-flujo.md)) y lo consume `AsistenteIA` ([logica.md](./logica.md)).

## Petición

```http
POST {VITE_URL_ASISTENTE_IA}
Content-Type: application/json
```

```json
{
  "mensajes": [
    { "rol": "persona", "texto": "me llegó un mensaje del banco y puse mi clave en un link" },
    { "rol": "asistente", "texto": "…" },
    { "rol": "persona", "texto": "¿y ahora qué hago con la tarjeta?" }
  ]
}
```

| Regla | Detalle |
|---|---|
| Único campo | `mensajes`; nada más (ni ids, ni fecha, ni idioma, ni datos del diagnóstico) — FR-009 |
| `rol` | `"persona"` o `"asistente"` |
| `texto` | persona: 1–1.000 caracteres, ya pasó `detectarDatoSensible`; asistente: respuestas previas de la IA |
| Orden | cronológico; el último es siempre de la persona |
| Tamaño | máximo 20 mensajes (los más recientes); si hay más, se envían los últimos 20 |
| Fetch | `credentials: "omit"`, `referrerPolicy: "no-referrer"`, sin encabezados extra |

## Respuestas

| Estado | Cuerpo | Interpretación en la web app |
|---|---|---|
| 200 | `{ "respuesta": "<texto>" }` (1–4.000 caracteres) | `{ ok: true, texto }` |
| 200 con otro cuerpo, vacío o > 4.000 | — | `motivo: "invalida"` |
| 429 | cualquiera | `motivo: "limite"` |
| otro estado | cualquiera | `motivo: "red"` |
| sin respuesta en 20 s | — | `motivo: "tiempo"` |
| fallo de red / CORS | — | `motivo: "red"` |

La respuesta se muestra siempre como texto plano.

## Mensajes amables por motivo (`TEXTOS_IA`)

| `motivo` | Texto | Opción |
|---|---|---|
| `tiempo`, `red`, `invalida` | "No pude responderte en este momento. Mientras tanto, estas guías te pueden ayudar." | "Ver guías" |
| `limite` | "Recibí muchos mensajes seguidos. Espera un momento o mira las guías." | "Ver guías" |
