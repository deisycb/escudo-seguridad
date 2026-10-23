import { Diagnostico } from "./Diagnostico.js";
import { MENSAJE_FALLO, TOTAL_TRAMPAS_POR_TIP } from "./constantes.js";

// Frase trampa marcada en el contenido: [[texto]].
const MARCA_TRAMPA = /\[\[(.+?)\]\]/g;

/**
 * Juego de los tips: trampas encontradas por tip (solo en memoria) y retos superados (se guardan).
 * Es inmutable: marcar una trampa o acertar un reto devuelve una instancia nueva
 * (contracts/logica.md, research R1).
 */
export class RetoTips {
  #tips;
  #encontradas;
  #superados;

  /**
   * @param {object[]} tips TIPS de src/data/tips.js.
   * @param {string[]} [retosSuperados=[]] Ids guardados; se descartan los que no existen.
   * @param {Map<string, Set<number>>} [encontradas] Uso interno al crear la instancia nueva.
   */
  constructor(tips, retosSuperados = [], encontradas = new Map()) {
    this.#tips = tips;
    const ids = new Set(tips.map((t) => t.id));
    this.#superados = new Set(retosSuperados.filter((id) => ids.has(id)));
    this.#encontradas = encontradas;
  }

  /**
   * Parte un texto del contenido en segmentos normales y frases trampa.
   * @param {string} texto Texto con frases entre [[ ]].
   * @param {number} [indiceInicial=0] Índice de la primera trampa del texto.
   * @returns {{ texto: string, esTrampa: boolean, indice: number|null }[]}
   */
  partirEnSegmentos(texto, indiceInicial = 0) {
    const segmentos = [];
    let indice = indiceInicial;
    let desde = 0;
    for (const marca of texto.matchAll(MARCA_TRAMPA)) {
      segmentos.push({ texto: texto.slice(desde, marca.index), esTrampa: false, indice: null });
      segmentos.push({ texto: marca[1], esTrampa: true, indice: indice++ });
      desde = marca.index + marca[0].length;
    }
    segmentos.push({ texto: texto.slice(desde), esTrampa: false, indice: null });
    return segmentos.filter((s) => s.texto.length > 0);
  }

  /**
   * Segmentos del remitente y del mensaje; la numeración de trampas sigue del uno al otro.
   * @param {string} idTip
   * @returns {{ remitente: object[], mensaje: object[] }}
   * @throws {Error} Si el tip no existe.
   */
  segmentosDelTip(idTip) {
    const { remitente, mensaje } = this.#buscar(idTip);
    const segmentosRemitente = this.partirEnSegmentos(remitente);
    const trampasRemitente = segmentosRemitente.filter((s) => s.esTrampa).length;
    return {
      remitente: segmentosRemitente,
      mensaje: this.partirEnSegmentos(mensaje, trampasRemitente),
    };
  }

  /**
   * @param {string|null} canal Canal del filtro; null = todos.
   * @returns {object[]} Tips del canal, en el orden del contenido.
   */
  tipsDelCanal(canal) {
    return canal === null ? this.#tips : this.#tips.filter((t) => t.canal === canal);
  }

  /**
   * @param {string} idTip
   * @param {number} indice Posición de la trampa (0..TOTAL_TRAMPAS_POR_TIP - 1).
   * @returns {RetoTips} Instancia nueva, o la misma si el índice es inválido o ya estaba.
   * @throws {Error} Si el tip no existe.
   */
  marcarTrampa(idTip, indice) {
    this.#buscar(idTip);
    const actuales = this.#encontradas.get(idTip) ?? new Set();
    const esValido = Number.isInteger(indice) && indice >= 0 && indice < TOTAL_TRAMPAS_POR_TIP;
    if (!esValido || actuales.has(indice)) return this;
    const encontradas = new Map(this.#encontradas).set(idTip, new Set([...actuales, indice]));
    return new RetoTips(this.#tips, [...this.#superados], encontradas);
  }

  /**
   * @param {string} idTip
   * @returns {number[]} Índices de trampas encontradas, ordenados y sin repetir.
   * @throws {Error} Si el tip no existe.
   */
  trampasEncontradas(idTip) {
    this.#buscar(idTip);
    return [...(this.#encontradas.get(idTip) ?? [])].sort((a, b) => a - b);
  }

  /**
   * Responde el mini reto de un tip. Una respuesta incorrecta nunca quita un reto superado.
   * @param {string} idTip
   * @param {number} indiceOpcion Posición de la opción elegida.
   * @returns {{ correcta: boolean, mensaje: string, reto: RetoTips }} `reto` es la instancia
   *   nueva si el reto quedó superado por primera vez; si no, la misma.
   * @throws {Error} Si el tip no existe.
   */
  responder(idTip, indiceOpcion) {
    const { reto } = this.#buscar(idTip);
    const correcta = reto.opciones[indiceOpcion]?.esCorrecta === true;
    if (!correcta) return { correcta, mensaje: MENSAJE_FALLO, reto: this };
    const nuevo = this.#superados.has(idTip)
      ? this
      : new RetoTips(this.#tips, [...this.#superados, idTip], this.#encontradas);
    return { correcta, mensaje: reto.acierto, reto: nuevo };
  }

  /**
   * @param {string} idTip
   * @returns {boolean}
   */
  estaSuperado(idTip) {
    return this.#superados.has(idTip);
  }

  /** @returns {string[]} Ids de retos superados, en el orden del contenido (para guardar). */
  retosSuperados() {
    return this.#tips.filter((t) => this.#superados.has(t.id)).map((t) => t.id);
  }

  /** @returns {{ superados: number, total: number, porcentaje: number }} porcentaje entero 0..100. */
  progreso() {
    const superados = this.#superados.size;
    const total = this.#tips.length;
    return { superados, total, porcentaje: Diagnostico.calcularPorcentaje(superados, total) };
  }

  #buscar(idTip) {
    const tip = this.#tips.find((t) => t.id === idTip);
    if (!tip) throw new Error(`El tip "${idTip}" no existe.`);
    return tip;
  }
}
