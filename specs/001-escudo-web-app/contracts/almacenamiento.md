# Contrato: almacenamiento local (`localStorage`)

## Clave y esquema

- **Clave única**: `escudo.v1` (`CLAVE_ALMACENAMIENTO`).
- **Valor**: JSON con esta forma:

```json
{
  "version": 1,
  "diagnostico": {
    "respuestas": ["a", "c", "b", "a", "a", "c", "b", "a", "b", "c", "a", "a", "b", "c"],
    "fecha": "2026-10-15T14:32:00.000Z"
  },
  "accionesHechas": [2, 6]
}
```

| Campo | Regla de validación |
|---|---|
| `version` | `=== 1` |
| `diagnostico.respuestas` | arreglo de exactamente 14 elementos, cada uno `"a"`, `"b"` o `"c"` |
| `diagnostico.fecha` | string con `Date.parse` válido |
| `accionesHechas` | arreglo (puede estar vacío) de enteros únicos 1–14; cada uno es una pregunta cuya respuesta tiene puntaje mayor a 0 |

**No se guarda**: porcentajes, nivel del semáforo, textos, consentimiento, respuestas parciales, identificadores de usuario, información del navegador ni nada más. El resultado se recalcula al cargar.

## Estados de `cargar()`

| Estado | Condición | Efecto en la app |
|---|---|---|
| `vacio` | la clave no existe | Inicio, sin aviso |
| `valido` | JSON válido que cumple todas las reglas | Resultado, con barra |
| `corrupto` | JSON ilegible o que incumple cualquier regla | Se borra la clave; aviso amigable ("No pudimos recuperar tu diagnóstico anterior. Puedes hacerlo de nuevo."); Inicio |
| `no-disponible` | acceder a `localStorage` o la prueba de escritura lanza un error | Aviso amigable ("Tu navegador no permite guardar. Puedes usar Escudo, pero tu resultado no se guardará al cerrar."); Inicio; la app funciona en memoria |

## Escrituras

| Momento | Escritura |
|---|---|
| Se completa la pregunta 14 | `{ version, diagnostico: { respuestas, fecha }, accionesHechas: [] }` (reemplaza todo) |
| Se marca o desmarca una acción | se reescribe el registro con el nuevo `accionesHechas` |
| Repetición abandonada | **ninguna** (se conserva lo anterior) |

Si cualquier escritura lanza un error (cuota llena, bloqueo), `Almacenamiento` pasa a `no-disponible`, la app muestra el aviso y sigue en memoria. **Nunca** se muestra el error técnico.

## Privacidad

Los datos guardados son letras a/b/c, una fecha y números de pregunta. No contienen información identificable ni sensible (constitución I, FR-039).
