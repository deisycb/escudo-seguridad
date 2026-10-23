# Contrato: `RetoTips` (`src/logic/RetoTips.js`)

Clase inmutable (research R1). JSDoc en la clase y en cada método público.

| Método | Entrada | Salida | Reglas |
|---|---|---|---|
| `constructor(tips, retosSuperados = [])` | arreglo de Tip; ids guardados | — | Descarta ids que no existen en `tips` (R4). |
| `partirEnSegmentos(texto, indiceInicial = 0)` | string | `{ texto, esTrampa, indice }[]` | Parte por `[[ ]]`; índices consecutivos desde `indiceInicial`; omite segmentos vacíos; un texto sin marcas devuelve un solo segmento normal. |
| `segmentosDelTip(idTip)` | id | `{ remitente: Segmento[], mensaje: Segmento[] }` | La numeración del mensaje sigue la del remitente. |
| `tipsDelCanal(canal)` | canal o `null` | Tip[] | `null` = todos, en el orden del contenido. |
| `marcarTrampa(idTip, indice)` | id, entero | `RetoTips` | Índice fuera de 0..`TOTAL_TRAMPAS_POR_TIP`-1 o repetido → misma instancia. |
| `trampasEncontradas(idTip)` | id | `number[]` ordenado | Sin duplicados. |
| `responder(idTip, indiceOpcion)` | id, entero | `{ correcta, mensaje, reto }` | Correcta → `mensaje = reto.acierto` y el reto queda superado. Incorrecta → `mensaje = MENSAJE_FALLO`, `reto` es la misma instancia. |
| `estaSuperado(idTip)` | id | boolean | |
| `retosSuperados()` | — | `string[]` | Para guardar; en el orden del contenido. |
| `progreso()` | — | `{ superados, total, porcentaje }` | `porcentaje` entero 0–100. |

Un `idTip` que no existe lanza `Error` (error de programación, nunca llega a la interfaz).

Constantes en `src/logic/constantes.js`:
- `TOTAL_TRAMPAS_POR_TIP = 3`
- `MENSAJE_FALLO = "Esa opción te deja expuesto. Intenta otra."`
