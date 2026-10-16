import { OPCIONES_VALIDAS } from "./constantes.js";

/**
 * Una pregunta del prediagnóstico con sus tres opciones (a, b, c).
 * Solo lee el contenido fijo de /src/data; no lo modifica.
 */
export class Pregunta {
  /**
   * @param {object} datos Una entrada de PREGUNTAS (ver contracts/contenido.md).
   */
  constructor(datos) {
    this.numero = datos.numero;
    this.dimension = datos.dimension;
    this.texto = datos.texto;
    this.descripcionHabito = datos.descripcionHabito;
    this.opciones = datos.opciones;
  }

  /**
   * @param {string} letra "a", "b" o "c".
   * @returns {{ texto: string, puntaje: number, criticidad: string|null }}
   * @throws {Error} Si la letra no es una opción válida.
   */
  obtenerOpcion(letra) {
    if (!OPCIONES_VALIDAS.includes(letra)) {
      throw new Error(`La opción "${letra}" no es válida en la pregunta ${this.numero}.`);
    }
    const { texto, puntaje, criticidad } = this.opciones[letra];
    return { texto, puntaje, criticidad };
  }

  /**
   * @param {string} letra "a", "b" o "c".
   * @returns {number} Puntaje de riesgo de la opción.
   * @throws {Error} Si la letra no es una opción válida.
   */
  obtenerPuntaje(letra) {
    return this.obtenerOpcion(letra).puntaje;
  }

  /**
   * @returns {number} El mayor puntaje entre las tres opciones.
   */
  obtenerPuntajeMaximo() {
    return Math.max(...OPCIONES_VALIDAS.map((letra) => this.obtenerPuntaje(letra)));
  }
}
