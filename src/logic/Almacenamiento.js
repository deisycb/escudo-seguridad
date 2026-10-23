import {
  CLAVE_ALMACENAMIENTO,
  OPCIONES_VALIDAS,
  TOTAL_PREGUNTAS,
  VERSION_ALMACENAMIENTO,
} from "./constantes.js";

const CLAVE_PRUEBA = `${CLAVE_ALMACENAMIENTO}.prueba`;

// Acceder a localStorage puede lanzar un error (navegador que lo bloquea).
function obtenerLocalStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function esRespuestasValidas(respuestas) {
  return (
    Array.isArray(respuestas) &&
    respuestas.length === TOTAL_PREGUNTAS &&
    respuestas.every((letra) => OPCIONES_VALIDAS.includes(letra))
  );
}

function esFechaValida(fecha) {
  return typeof fecha === "string" && !Number.isNaN(Date.parse(fecha));
}

function esAccionValida(numero, respuestas, preguntas) {
  if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_PREGUNTAS) return false;
  const pregunta = preguntas.find((p) => p.numero === numero);
  return Boolean(pregunta) && pregunta.obtenerPuntaje(respuestas[numero - 1]) > 0;
}

function esAccionesValidas(acciones, respuestas, preguntas) {
  return (
    Array.isArray(acciones) &&
    new Set(acciones).size === acciones.length &&
    acciones.every((n) => esAccionValida(n, respuestas, preguntas))
  );
}

function esRegistroValido(registro, preguntas) {
  if (registro?.version !== VERSION_ALMACENAMIENTO) return false;
  const { respuestas, fecha } = registro.diagnostico ?? {};
  return (
    esRespuestasValidas(respuestas) &&
    esFechaValida(fecha) &&
    esAccionesValidas(registro.accionesHechas, respuestas, preguntas)
  );
}

/**
 * Guarda y recupera el diagnóstico, el progreso del plan y los retos de Tips en localStorage
 * (clave única "escudo.v1", ver contracts/almacenamiento.md de las specs 001 y 006).
 * Ningún método lanza errores hacia la interfaz.
 */
export class Almacenamiento {
  /**
   * @param {Storage|null} [almacen=localStorage] Inyectable para pruebas.
   */
  constructor(almacen = obtenerLocalStorage()) {
    this.almacen = almacen;
    this.disponible = Boolean(almacen);
  }

  /**
   * Comprueba que se puede escribir y borrar en el almacén.
   * @returns {boolean}
   */
  estaDisponible() {
    if (!this.disponible) return false;
    try {
      this.almacen.setItem(CLAVE_PRUEBA, "1");
      this.almacen.removeItem(CLAVE_PRUEBA);
      return true;
    } catch {
      this.disponible = false;
      return false;
    }
  }

  /**
   * Lee y valida el registro guardado. Si está corrupto, lo borra.
   * @param {import("./Pregunta.js").Pregunta[]} preguntas Para validar las acciones hechas.
   * @returns {{ estado: "vacio"|"valido"|"corrupto"|"no-disponible",
   *   datos?: { respuestas: string[], fecha: string, accionesHechas: number[] } }}
   */
  cargar(preguntas) {
    if (!this.estaDisponible()) return { estado: "no-disponible" };
    let texto;
    try {
      texto = this.almacen.getItem(CLAVE_ALMACENAMIENTO);
    } catch {
      this.disponible = false;
      return { estado: "no-disponible" };
    }
    if (texto === null) return { estado: "vacio" };
    return this.#interpretar(texto, preguntas);
  }

  /**
   * Reemplaza todo el registro con un diagnóstico nuevo y el progreso vacío.
   * @param {string[]} respuestas 14 letras "a"|"b"|"c".
   * @param {string} fecha ISO-8601.
   * @returns {boolean} false si no se pudo guardar.
   */
  guardarDiagnostico(respuestas, fecha) {
    // Los retos de Tips son aprendizaje, no parte del diagnóstico: se conservan (spec 006).
    const retosSuperados = this.cargarRetosSuperados();
    return this.#escribir({
      version: VERSION_ALMACENAMIENTO,
      diagnostico: { respuestas: [...respuestas], fecha },
      accionesHechas: [],
      ...(retosSuperados.length > 0 && { retosSuperados }),
    });
  }

  /**
   * Lee los ids de retos de Tips superados. Lo inválido se ignora y nunca vuelve corrupto el
   * registro (spec 006, contracts/almacenamiento.md).
   * @returns {string[]} Ids únicos; [] si no hay o no se pueden leer. Nunca lanza error.
   */
  cargarRetosSuperados() {
    const guardados = this.#leerRegistro()?.retosSuperados;
    if (!Array.isArray(guardados)) return [];
    return [...new Set(guardados.filter((id) => typeof id === "string"))];
  }

  /**
   * Reescribe solo los retos superados del registro actual.
   * @param {string[]} retosSuperados Ids de tip.
   * @returns {boolean} false si no hay registro o no se pudo guardar.
   */
  guardarRetosSuperados(retosSuperados) {
    const actual = this.#leerRegistro();
    if (!actual) return false;
    return this.#escribir({ ...actual, retosSuperados: [...retosSuperados] });
  }

  /**
   * Reescribe solo las acciones hechas del registro actual.
   * @param {number[]} accionesHechas Números de pregunta.
   * @returns {boolean} false si no se pudo guardar.
   */
  guardarProgreso(accionesHechas) {
    const actual = this.#leerRegistro();
    if (!actual) return false;
    return this.#escribir({ ...actual, accionesHechas: [...accionesHechas] });
  }

  /**
   * Elimina el registro guardado. Nunca lanza error.
   * @returns {void}
   */
  borrar() {
    try {
      this.almacen?.removeItem(CLAVE_ALMACENAMIENTO);
    } catch {
      // Si no se puede borrar, no hay nada más que hacer.
    }
  }

  #interpretar(texto, preguntas) {
    let registro;
    try {
      registro = JSON.parse(texto);
    } catch {
      registro = null;
    }
    if (!esRegistroValido(registro, preguntas)) {
      this.borrar();
      return { estado: "corrupto" };
    }
    const { respuestas, fecha } = registro.diagnostico;
    return {
      estado: "valido",
      datos: { respuestas, fecha, accionesHechas: registro.accionesHechas },
    };
  }

  #leerRegistro() {
    if (!this.disponible) return null;
    try {
      return JSON.parse(this.almacen.getItem(CLAVE_ALMACENAMIENTO));
    } catch {
      return null;
    }
  }

  #escribir(registro) {
    if (!this.disponible) return false;
    try {
      this.almacen.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(registro));
      return true;
    } catch {
      this.disponible = false;
      return false;
    }
  }
}
