import {
  DIMENSIONES,
  LIMITE_RIESGO_ALTO,
  LIMITE_RIESGO_MEDIO,
  NIVELES_SEMAFORO,
  OPCIONES_VALIDAS,
  PRIORIDADES,
  TOTAL_PREGUNTAS,
} from "./constantes.js";

const PORCENTAJE_COMPLETO = 100;

function validarRespuestas(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== TOTAL_PREGUNTAS) {
    throw new Error(`El diagnóstico necesita exactamente ${TOTAL_PREGUNTAS} respuestas.`);
  }
  const posicion = respuestas.findIndex((letra) => !OPCIONES_VALIDAS.includes(letra));
  if (posicion !== -1) {
    throw new Error(`La respuesta de la pregunta ${posicion + 1} no es válida.`);
  }
}

/**
 * Resultado de un diagnóstico completo: calcula el riesgo total, el de cada
 * dimensión, el semáforo y los hábitos de riesgo de forma determinista.
 */
export class Diagnostico {
  #preguntas;
  #respuestas;
  #fecha;

  /**
   * @param {import("./Pregunta.js").Pregunta[]} preguntas Las 14 preguntas, en orden.
   * @param {string[]} respuestas 14 letras "a"|"b"|"c".
   * @param {string} fecha ISO-8601.
   * @throws {Error} Si las respuestas no son 14 letras válidas.
   */
  constructor(preguntas, respuestas, fecha) {
    validarRespuestas(respuestas);
    this.#preguntas = [...preguntas];
    this.#respuestas = [...respuestas];
    this.#fecha = fecha;
  }

  /** @returns {string[]} Copia de las respuestas. */
  get respuestas() {
    return [...this.#respuestas];
  }

  /** @returns {string} Fecha ISO-8601 del diagnóstico. */
  get fecha() {
    return this.#fecha;
  }

  /**
   * Convierte puntos en un porcentaje entero (multiplica antes de dividir).
   * @param {number} puntos
   * @param {number} maximo
   * @returns {number} Entero 0..100; 0 si el máximo es 0.
   */
  static calcularPorcentaje(puntos, maximo) {
    if (maximo === 0) return 0;
    return Math.round((puntos * PORCENTAJE_COMPLETO) / maximo);
  }

  /**
   * @param {number} porcentaje Valor ya redondeado.
   * @returns {"Bajo"|"Medio"|"Alto"}
   */
  static clasificarNivel(porcentaje) {
    if (porcentaje < LIMITE_RIESGO_MEDIO) return NIVELES_SEMAFORO.BAJO;
    if (porcentaje < LIMITE_RIESGO_ALTO) return NIVELES_SEMAFORO.MEDIO;
    return NIVELES_SEMAFORO.ALTO;
  }

  /** @returns {number} Suma de los puntajes obtenidos (sin redondear). */
  calcularPuntajeObtenido() {
    return this.#sumarObtenido(this.#preguntas);
  }

  /** @returns {number} Suma de los puntajes máximos de las preguntas. */
  calcularPuntajeMaximo() {
    return this.#sumarMaximo(this.#preguntas);
  }

  /** @returns {number} Riesgo total, entero 0..100. */
  calcularRiesgoTotal() {
    return Diagnostico.calcularPorcentaje(
      this.calcularPuntajeObtenido(),
      this.calcularPuntajeMaximo(),
    );
  }

  /** @returns {{ phishing: number, smishing: number, vishing: number, habitos: number }} */
  calcularRiesgoPorDimension() {
    const riesgo = {};
    DIMENSIONES.forEach(({ id, desde, hasta }) => {
      const preguntas = this.#preguntas.filter((p) => p.numero >= desde && p.numero <= hasta);
      riesgo[id] = Diagnostico.calcularPorcentaje(
        this.#sumarObtenido(preguntas),
        this.#sumarMaximo(preguntas),
      );
    });
    return riesgo;
  }

  /** @returns {"Bajo"|"Medio"|"Alto"} Nivel del semáforo según el riesgo total. */
  obtenerNivelSemaforo() {
    return Diagnostico.clasificarNivel(this.calcularRiesgoTotal());
  }

  /**
   * Hábitos con puntaje mayor a 0, de más a menos puntos y, en empate,
   * por número de pregunta ascendente.
   * @returns {{ numeroPregunta: number, descripcion: string, prioridad: string, puntos: number }[]}
   */
  obtenerHabitosDeRiesgo() {
    return this.#preguntas
      .map((pregunta) => this.#crearHabito(pregunta))
      .filter((habito) => habito.puntos > 0)
      .sort((x, y) => y.puntos - x.puntos || x.numeroPregunta - y.numeroPregunta);
  }

  #respuestaDe(pregunta) {
    return this.#respuestas[pregunta.numero - 1];
  }

  #sumarObtenido(preguntas) {
    return preguntas.reduce((suma, p) => suma + p.obtenerPuntaje(this.#respuestaDe(p)), 0);
  }

  #sumarMaximo(preguntas) {
    return preguntas.reduce((suma, p) => suma + p.obtenerPuntajeMaximo(), 0);
  }

  #crearHabito(pregunta) {
    const { puntaje, criticidad } = pregunta.obtenerOpcion(this.#respuestaDe(pregunta));
    return {
      numeroPregunta: pregunta.numero,
      descripcion: pregunta.descripcionHabito,
      prioridad: criticidad ? PRIORIDADES[criticidad].etiqueta : null,
      puntos: puntaje,
    };
  }
}
