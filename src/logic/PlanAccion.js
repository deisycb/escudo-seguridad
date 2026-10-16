import { Diagnostico } from "./Diagnostico.js";

function sumarPuntos(habitos) {
  return habitos.reduce((suma, habito) => suma + habito.puntos, 0);
}

/**
 * Plan de acción: una acción por hábito de riesgo del diagnóstico y su progreso.
 * Es inmutable: marcar o desmarcar devuelve un plan nuevo. No modifica el Diagnostico.
 */
export class PlanAccion {
  #diagnostico;
  #recomendaciones;
  #habitos;
  #hechas;

  /**
   * @param {Diagnostico} diagnostico
   * @param {object} recomendaciones RECOMENDACIONES, indexadas por número de pregunta.
   * @param {number[]} [accionesHechas=[]] Números de pregunta ya resueltos.
   * @throws {Error} Si alguna acción hecha no es un hábito de riesgo del diagnóstico.
   */
  constructor(diagnostico, recomendaciones, accionesHechas = []) {
    this.#diagnostico = diagnostico;
    this.#recomendaciones = recomendaciones;
    this.#habitos = diagnostico.obtenerHabitosDeRiesgo();
    const numeros = new Set(this.#habitos.map((h) => h.numeroPregunta));
    const invalida = accionesHechas.find((numero) => !numeros.has(numero));
    if (invalida !== undefined) {
      throw new Error(`La acción ${invalida} no corresponde a un hábito de riesgo.`);
    }
    this.#hechas = new Set(accionesHechas);
  }

  /**
   * @returns {{ numeroPregunta: number, titulo: string, prioridad: string, puntos: number,
   *   bajaPorcentaje: number, queHacerAhora: string|string[], comoPrevenirlo: string|string[],
   *   hecha: boolean }[]} En el mismo orden que los hábitos de riesgo.
   */
  obtenerAcciones() {
    const maximo = this.#diagnostico.calcularPuntajeMaximo();
    return this.#habitos.map(({ numeroPregunta, prioridad, puntos }) => {
      const { titulo, queHacerAhora, comoPrevenirlo } = this.#recomendaciones[numeroPregunta] ?? {};
      return {
        numeroPregunta,
        titulo,
        prioridad,
        puntos,
        bajaPorcentaje: Diagnostico.calcularPorcentaje(puntos, maximo),
        queHacerAhora,
        comoPrevenirlo,
        hecha: this.#hechas.has(numeroPregunta),
      };
    });
  }

  /**
   * @param {number} numero Número de pregunta.
   * @returns {PlanAccion} Plan nuevo con la acción hecha (idempotente).
   * @throws {Error} Si el número no es un hábito de riesgo.
   */
  marcarHecha(numero) {
    return this.#conHechas([...this.#hechas, numero]);
  }

  /**
   * @param {number} numero Número de pregunta.
   * @returns {PlanAccion} Plan nuevo con la acción sin hacer (idempotente).
   */
  desmarcar(numero) {
    return this.#conHechas([...this.#hechas].filter((n) => n !== numero));
  }

  /** @returns {number} Riesgo restando las acciones hechas, entero 0..100. */
  calcularRiesgoActual() {
    const hechos = this.#habitos.filter((h) => this.#hechas.has(h.numeroPregunta));
    return Diagnostico.calcularPorcentaje(
      sumarPuntos(this.#habitos) - sumarPuntos(hechos),
      this.#diagnostico.calcularPuntajeMaximo(),
    );
  }

  /** @returns {"Bajo"|"Medio"|"Alto"} Semáforo sobre el riesgo actual. */
  obtenerNivelActual() {
    return Diagnostico.clasificarNivel(this.calcularRiesgoActual());
  }

  /** @returns {number} Cantidad de acciones hechas. */
  contarHechas() {
    return this.#hechas.size;
  }

  /** @returns {number} Cantidad total de acciones (hábitos de riesgo). */
  contarTotal() {
    return this.#habitos.length;
  }

  /** @returns {number[]} Números de las acciones hechas, ordenados (para guardar). */
  obtenerAccionesHechas() {
    return [...this.#hechas].sort((x, y) => x - y);
  }

  #conHechas(hechas) {
    return new PlanAccion(this.#diagnostico, this.#recomendaciones, [...new Set(hechas)]);
  }
}
