# Contrato: retos superados en `escudo.v1`

Amplía `specs/001-escudo-web-app/contracts/almacenamiento.md` (research R3).

| Campo nuevo | Regla |
|---|---|
| `retosSuperados` | Opcional. Arreglo de ids de tip. Si falta o no es arreglo → `[]`. Se ignoran los elementos que no son string y los repetidos. **Nunca** vuelve corrupto el registro. |

| Método nuevo / cambiado | Comportamiento |
|---|---|
| `cargarRetosSuperados()` | Devuelve `string[]` (puede ser `[]`). Si el almacén no está disponible o el JSON no se lee, devuelve `[]`. Nunca lanza. |
| `guardarRetosSuperados(ids)` | Reescribe solo `retosSuperados` del registro actual. Devuelve `false` si no hay registro, no está disponible o la escritura falla. Nunca lanza. |
| `guardarDiagnostico(respuestas, fecha)` | Igual que antes, pero conserva `retosSuperados` del registro anterior si existía. |
| `cargar(preguntas)` | Sin cambios: valida solo diagnóstico y acciones. |

**No se guarda**: trampas encontradas, respuestas incorrectas, filtro, tarjeta abierta.
