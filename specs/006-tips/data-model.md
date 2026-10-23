# Data Model: Tips de seguridad interactivos (006)

## Tip (`src/data/tips.js` → `TIPS`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | Único. Se conservan los 8 ids actuales (`sms-paquete`, `sms-premio`, `llamada-banco`, `llamada-tecnico`, `correo-suspension`, `correo-factura`, `whatsapp-numero`, `whatsapp-codigo`). |
| `canal` | `"sms" \| "llamada" \| "correo" \| "whatsapp"` | 2 tips por canal. |
| `tipo` | string | `Smishing` (sms), `Vishing` (llamada), `Phishing` (correo), `Suplantación` (whatsapp). |
| `titulo` | string | Texto del prototipo. |
| `remitente` | string | Puede contener frases `[[ ]]`. Inventado. |
| `hora` | string | Hora o estado ("Llamada entrante"). |
| `mensaje` | string | Contiene frases `[[ ]]`. |
| `trampas` | string[3] | Explicación de cada frase marcada, en el orden en que aparecen (remitente primero, luego mensaje). |
| `senales` | string[3] | "Cómo reconocerla". |
| `pasos` | string[3] | "Qué hacer". |
| `reto` | `{ pregunta: string, opciones: { texto: string, esCorrecta: boolean }[3], acierto: string }` | Exactamente una opción correcta. |
| `dato` | string | Frase final. |

Total de marcas `[[ ]]` en `remitente + mensaje` = `TOTAL_TRAMPAS_POR_TIP` (3) = `trampas.length`.

## Otros exports de `tips.js`

- `REGLA_DE_ORO`: string (texto de FR-002).
- `CANALES_TIPS`: `{ id: canal | null, filtro: string, nombre: string }[]` en orden de filtros: Todos, SMS, Llamadas, Correo, WhatsApp. `nombre` es el que va en la etiqueta "Canal · Tipo" (SMS, Llamada, Correo, WhatsApp).
- `TEXTOS_TIPS`: textos fijos de la pantalla (ver [contracts/pantalla.md](./contracts/pantalla.md)).

## Segmento (salida de `partirEnSegmentos`)

`{ texto: string, esTrampa: boolean, indice: number | null }` — `indice` 0..2 solo si `esTrampa`.

## Estado del reto (`RetoTips`, en memoria)

| Dato | Tipo | Se guarda |
|---|---|---|
| Trampas encontradas por tip | `Map<idTip, Set<number>>` | No (se reinicia al recargar). |
| Retos superados | `Set<idTip>` | Sí, como arreglo en `retosSuperados`. |

Transiciones:
- `marcarTrampa(id, i)`: agrega `i` si 0 ≤ i < 3 y no estaba; si no, devuelve la misma instancia.
- `responder(id, j)`: si `opciones[j].esCorrecta`, agrega `id` a superados (idempotente). Una respuesta incorrecta nunca quita un reto superado.

## Registro local (`escudo.v1`)

```json
{
  "version": 1,
  "diagnostico": { "respuestas": ["a", "…"], "fecha": "2026-10-15T14:32:00.000Z" },
  "accionesHechas": [2, 6],
  "retosSuperados": ["sms-paquete", "llamada-banco"]
}
```

`retosSuperados` es opcional; ver [contracts/almacenamiento.md](./contracts/almacenamiento.md).
