# Contrato: API pública de `/src/logic`

Cada clase está en su propio archivo, con JSDoc en la clase y en cada método público. Ningún componente calcula riesgo: todo pasa por estas clases (constitución V). Las firmas son el contrato; la implementación queda para `tasks.md`.

## `Pregunta`

```js
/** @param {object} datos  Una entrada de PREGUNTAS (ver contenido.md) */
new Pregunta(datos)

pregunta.numero            // number
pregunta.dimension         // string (id)
pregunta.texto             // string
pregunta.descripcionHabito // string
pregunta.opciones          // { a, b, c }
pregunta.obtenerOpcion(letra)      // → { texto, puntaje, criticidad } ; lanza un error si la letra no es válida
pregunta.obtenerPuntaje(letra)     // → number
pregunta.obtenerPuntajeMaximo()    // → number (el mayor puntaje de sus opciones)
```

## `Diagnostico`

```js
/**
 * @param {Pregunta[]} preguntas      14 preguntas
 * @param {string[]} respuestas       14 × "a"|"b"|"c"
 * @param {string} fecha              ISO-8601
 * @throws {Error} si las respuestas no son 14 válidas
 */
new Diagnostico(preguntas, respuestas, fecha)

diagnostico.respuestas                  // string[] (copia)
diagnostico.fecha                       // string
diagnostico.calcularPuntajeObtenido()   // → number (sin redondear)
diagnostico.calcularPuntajeMaximo()     // → number
diagnostico.calcularRiesgoTotal()       // → entero 0..100
diagnostico.calcularRiesgoPorDimension()// → { phishing, smishing, vishing, habitos } enteros 0..100
diagnostico.obtenerNivelSemaforo()      // → "Bajo"|"Medio"|"Alto" (según calcularRiesgoTotal)
diagnostico.obtenerHabitosDeRiesgo()    // → [{ numeroPregunta, descripcion, prioridad, puntos }] ordenados

Diagnostico.calcularPorcentaje(puntos, maximo) // static → entero; 0 si maximo === 0
Diagnostico.clasificarNivel(porcentaje)        // static → "Bajo"|"Medio"|"Alto"
```

Garantías verificadas por las pruebas:

- Mismas entradas, misma salida (determinismo).
- Valores frontera: 39 → Bajo, 40 → Medio, 69 → Medio, 70 → Alto. Si el valor exacto es 39,5, se redondea a 40 y queda en Medio.
- Todas las respuestas en "a" con puntaje 0: riesgo 0 y lista de hábitos vacía.
- En empate de puntos, el orden es por número de pregunta ascendente.
- Respuestas incompletas o letras inválidas lanzan un error.

## `PlanAccion`

```js
/**
 * @param {Diagnostico} diagnostico
 * @param {object} recomendaciones   RECOMENDACIONES
 * @param {number[]} [accionesHechas=[]]
 * @throws {Error} si alguna acción hecha no es un hábito del diagnóstico
 */
new PlanAccion(diagnostico, recomendaciones, accionesHechas)

plan.obtenerAcciones()       // → [{ numeroPregunta, titulo, prioridad, puntos, bajaPorcentaje, queHacerAhora, comoPrevenirlo, hecha }]
plan.marcarHecha(numero)     // → nuevo PlanAccion (idempotente)
plan.desmarcar(numero)       // → nuevo PlanAccion (idempotente)
plan.calcularRiesgoActual()  // → entero 0..100
plan.obtenerNivelActual()    // → "Bajo"|"Medio"|"Alto"
plan.contarHechas()          // → number
plan.contarTotal()           // → number (N)
plan.obtenerAccionesHechas() // → number[] ordenado (para guardar)
```

Garantías:

- Las acciones salen en el mismo orden que `obtenerHabitosDeRiesgo()`.
- Con todas las acciones hechas, `calcularRiesgoActual() === 0` y el nivel es "Bajo".
- Marcar y luego desmarcar deja el riesgo actual en su valor inicial.
- No modifica el `Diagnostico` (FR-024).

## `Almacenamiento`

```js
/** @param {Storage} [almacen=globalThis.localStorage]  inyectable para pruebas */
new Almacenamiento(almacen)

almacenamiento.estaDisponible()                         // → boolean
almacenamiento.cargar(preguntas)                        // → { estado: "vacio"|"valido"|"corrupto"|"no-disponible", datos?: { respuestas, fecha, accionesHechas } }
almacenamiento.guardarDiagnostico(respuestas, fecha)    // → boolean (false si falló; pasa a no-disponible)
almacenamiento.guardarProgreso(accionesHechas)          // → boolean
almacenamiento.borrar()                                 // → void (nunca lanza error)
```

Garantías:

- Ningún método lanza un error hacia la interfaz.
- Si el estado es `corrupto`, la clave se borra.
- Las reglas de validación son las de [almacenamiento.md](./almacenamiento.md).

## `constantes.js`

Exporta las constantes de [data-model.md](../data-model.md#constantes-srclogicconstantesjs). No hay números mágicos en las clases.
