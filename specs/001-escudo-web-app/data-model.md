# Data Model — Escudo (001-escudo-web-app)

**Fecha**: 2026-10-15 | **Plan**: [plan.md](./plan.md)

Hay dos tipos de datos:

- **Contenido fijo** (`/src/data`, lo entrega el equipo, solo lectura). Su forma está en [contracts/contenido.md](./contracts/contenido.md).
- **Estado del usuario** (en memoria y en localStorage). Su forma está en [contracts/almacenamiento.md](./contracts/almacenamiento.md).

Las reglas de negocio viven en clases de `/src/logic`. Su API pública está en [contracts/logica.md](./contracts/logica.md).

---

## Constantes (`/src/logic/constantes.js`)

| Constante | Valor | Origen |
|---|---|---|
| `TOTAL_PREGUNTAS` | `14` | Constitución III |
| `OPCIONES_VALIDAS` | `["a", "b", "c"]` | Constitución III |
| `LIMITE_RIESGO_MEDIO` | `40` | Semáforo: Medio desde 40 % |
| `LIMITE_RIESGO_ALTO` | `70` | Semáforo: Alto desde 70 % |
| `NIVELES_SEMAFORO` | `{ BAJO: "Bajo", MEDIO: "Medio", ALTO: "Alto" }` | FR-014 |
| `DIMENSIONES` | `[{ id: "phishing", nombre: "Phishing", etiqueta: "Correo (Phishing)", desde: 1, hasta: 4 }, { id: "smishing", nombre: "Smishing", etiqueta: "SMS y WhatsApp (Smishing)", desde: 5, hasta: 8 }, { id: "vishing", nombre: "Vishing", etiqueta: "Llamadas (Vishing)", desde: 9, hasta: 12 }, { id: "habitos", nombre: "Hábitos generales", etiqueta: "Hábitos generales", desde: 13, hasta: 14 }]` | FR-008 |
| `PRIORIDADES` | `{ urgente: { etiqueta: "Urgente", orden: 3 }, importante: { etiqueta: "Importante", orden: 2 }, revisa: { etiqueta: "Revisa", orden: 1 } }` | FR-016, FR-017 |
| `CLAVE_ALMACENAMIENTO` | `"escudo.v1"` | R2 |
| `VERSION_ALMACENAMIENTO` | `1` | R2 |

## Entidades de contenido (solo lectura)

### Dimensión
- `id`, `nombre`, `etiqueta` (nombre visible en la interfaz: canal + término técnico, spec FR-008), `desde`, `hasta` (rango inclusivo de números de pregunta). Se definen en `DIMENSIONES`.
- Cada pregunta pertenece a exactamente una dimensión, según su número.

### Pregunta → clase `Pregunta`
| Campo | Tipo | Regla |
|---|---|---|
| `numero` | entero 1–14 | único; las 14 están presentes |
| `dimension` | id de `DIMENSIONES` | debe coincidir con el rango del número |
| `texto` | string no vacío | texto exacto del contenido |
| `descripcionHabito` | string no vacío | descripción corta que se ve en "Dónde estás en riesgo" |
| `opciones` | objeto `{ a, b, c }` de **Opción** | exactamente 3 |

**Opción**
| Campo | Tipo | Regla |
|---|---|---|
| `texto` | string no vacío | exacto |
| `puntaje` | entero ≥ 0 | no baja de a → b → c |
| `criticidad` | `"revisa" \| "importante" \| "urgente" \| null` | `null` si y solo si `puntaje === 0`; el orden de prioridad no baja de a → c |

Derivados: `puntajeMaximo` (el mayor puntaje de sus opciones).

### Recomendación (acción)
Indexada por número de pregunta: `titulo`, `queHacerAhora` (string o lista de strings), `comoPrevenirlo` (string o lista de strings). Hay una por cada pregunta que tenga alguna opción con puntaje mayor a cero.

### Tip de estafa
`id`, `canal` (`"sms" | "llamada" | "correo" | "whatsapp"`), `tipoAtaque` (`"Smishing" | "Vishing" | "Phishing" | "Suplantación"`), `titulo`, `comoReconocerla`, `queHacer`. Son 8 en total, 2 por canal. Además está `REGLA_DE_ORO` (string).

### Guía de emergencia
`id` (`"tarjetas" | "whatsapp" | "phishing"`), `titulo` (el texto del botón de FR-031), `pasos` (lista ordenada de strings, al menos 1).

### Línea bancaria
`banco`, `numero` (string tal como se muestra).

### Canal de denuncia
`entidad`, `contacto` (texto visible), `enlace?` (opcional; si existe, abre en una pestaña nueva y solo lleva a sitios oficiales).

## Entidades de estado del usuario

### Respuestas (en memoria durante la encuesta)
- Arreglo de 14 posiciones, cada una `"a" | "b" | "c" | null`. Vive en el estado de la página `Diagnostico.jsx`.
- **Nunca se guarda parcialmente**: si el usuario sale o recarga a mitad de la encuesta, se descarta.

### Diagnóstico → clase `Diagnostico`
| Campo | Tipo | Regla |
|---|---|---|
| `respuestas` | 14 × `"a" \| "b" \| "c"` | todas presentes; si no, el constructor lanza un error |
| `fecha` | string ISO-8601 | se fija al completar la encuesta |

Derivados (se calculan, no se guardan):

- `riesgoTotal`: entero 0–100 = `round(Σ puntajes × 100 / Σ puntajeMaximo)`.
- `riesgoPorDimension`: `{ phishing, smishing, vishing, habitos }`, calculados igual dentro de cada rango.
- `nivelSemaforo`: Bajo si es menor que 40, Medio si es menor que 70, Alto en el resto (sobre el valor redondeado).
- `habitosDeRiesgo`: lista de `{ numeroPregunta, descripcion, prioridad, puntos }` para respuestas con puntaje mayor a 0, ordenada por `puntos` de mayor a menor y, en empate, por `numeroPregunta` ascendente.

Cardinalidad: **0 o 1 por dispositivo**. Uno nuevo reemplaza al anterior y reinicia el progreso.

### Acción del plan (derivada)
`{ numeroPregunta, titulo, prioridad, puntos, bajaPorcentaje, queHacerAhora, comoPrevenirlo, hecha }`
- `bajaPorcentaje = round(puntos × 100 / puntajeMaximoTotal)`.
- Mismo orden que `habitosDeRiesgo`.

### Progreso del plan → clase `PlanAccion`
| Campo | Tipo | Regla |
|---|---|---|
| `accionesHechas` | conjunto de números de pregunta | cada número debe ser un hábito de riesgo del diagnóstico vigente |

Derivados:

- `riesgoActual = round((Σ puntos de los hábitos − Σ puntos de los hechos) × 100 / puntajeMaximoTotal)`.
- `nivelActual`: el semáforo sobre `riesgoActual`.
- `contador`: `"X de N hechas"`.

Operaciones **inmutables**: `marcarHecha(n)` y `desmarcar(n)` devuelven un `PlanAccion` nuevo (amigable con el estado de React).

### Estado de almacenamiento
`"vacio" | "valido" | "corrupto" | "no-disponible"` (ver [contracts/almacenamiento.md](./contracts/almacenamiento.md)). Determina si se muestra `AvisoAlmacenamiento` y si las escrituras están activas.

## Relaciones

```text
Dimensión 1 ──< Pregunta 1 ──< Opción (3)
Pregunta 1 ── 0..1 Recomendación
Diagnóstico ──> 14 Respuestas ──> Opción elegida de cada Pregunta
Diagnóstico 1 ──< Hábito de riesgo (0..14) 1 ── 1 Acción del plan
PlanAccion 1 ── 1 Diagnóstico ; PlanAccion ──< accionesHechas ⊆ hábitos
```

## Transiciones de estado

### Ciclo de vida de la app

```text
[Carga] ── almacenamiento.cargar() ──┬─ valido        → Resultado (con barra)
                                     ├─ vacio         → Inicio (sin barra)
                                     ├─ corrupto      → borrar + aviso → Inicio
                                     └─ no-disponible → aviso "no se guardará" → Inicio
```

### Encuesta

```text
Inicio ─(consentimiento ✔ + "Empezar")→ Pregunta 1
Pregunta k ─(opción + "Siguiente")→ Pregunta k+1
Pregunta k (k>1) ─("Anterior" o atrás del navegador)→ Pregunta k−1 (respuesta conservada)
Pregunta k ─("Salir" o atrás en k=1)→ Diálogo ─ confirmar → pantalla previa (Inicio o Resultado); respuestas descartadas
                                              └ cancelar  → Pregunta k sin cambios
Pregunta 14 ─("Siguiente")→ new Diagnostico(respuestas, ahora) → guardar (reemplaza y reinicia progreso) → Resultado
```

### Acción del plan

```text
no hecha ─("Ya lo hice")→ hecha     (riesgo actual −puntos, contador +1, guardar)
hecha    ─(desmarcar)───→ no hecha  (riesgo actual +puntos, contador −1, guardar)
```

### Modo de guardado

```text
activo ─(cualquier escritura falla)→ sin guardar (aviso, sigue en memoria durante la sesión)
```
