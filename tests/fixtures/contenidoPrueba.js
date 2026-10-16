// CONTENIDO SINTÉTICO SOLO PARA PRUEBAS.
// No es el contenido real de Escudo y nunca se importa desde src/.

import { DIMENSIONES, OPCIONES_VALIDAS, TOTAL_PREGUNTAS } from "../../src/logic/constantes.js";

const CRITICIDADES_CRECIENTES = ["revisa", "importante", "urgente"];

function dimensionDe(numero) {
  return DIMENSIONES.find((d) => numero >= d.desde && numero <= d.hasta).id;
}

function crearOpciones(puntajes, numero) {
  const opciones = {};
  OPCIONES_VALIDAS.forEach((letra, i) => {
    opciones[letra] = {
      texto: `Opción ${letra} de prueba ${numero}`,
      puntaje: puntajes[i],
      criticidad: puntajes[i] === 0 ? null : CRITICIDADES_CRECIENTES[i],
    };
  });
  return opciones;
}

/**
 * Crea 14 preguntas de prueba con la forma de contracts/contenido.md.
 * @param {number[][]} puntajes 14 tríos [a, b, c]
 */
export function crearDatosPreguntas(puntajes) {
  return puntajes.map((trio, i) => {
    const numero = i + 1;
    return {
      numero,
      dimension: dimensionDe(numero),
      texto: `Pregunta de prueba ${numero}`,
      descripcionHabito: `Hábito de prueba ${numero}`,
      opciones: crearOpciones(trio, numero),
    };
  });
}

export const DATOS_PREGUNTAS_PRUEBA = crearDatosPreguntas(
  Array.from({ length: TOTAL_PREGUNTAS }, () => [0, 2, 4]),
);

export const RECOMENDACIONES_PRUEBA = Object.fromEntries(
  DATOS_PREGUNTAS_PRUEBA.map(({ numero }) => [
    numero,
    {
      titulo: `Acción de prueba ${numero}`,
      queHacerAhora: [`Paso de prueba ${numero}`],
      comoPrevenirlo: `Consejo de prueba ${numero}`,
    },
  ]),
);

/** Almacén en memoria con la interfaz de Storage, capaz de simular fallos. */
export class AlmacenFalso {
  constructor({ fallarAlLeer = false, fallarAlEscribir = false } = {}) {
    this.datos = new Map();
    this.fallarAlLeer = fallarAlLeer;
    this.fallarAlEscribir = fallarAlEscribir;
  }

  getItem(clave) {
    if (this.fallarAlLeer) throw new Error("lectura bloqueada");
    return this.datos.has(clave) ? this.datos.get(clave) : null;
  }

  setItem(clave, valor) {
    if (this.fallarAlEscribir) throw new Error("escritura bloqueada");
    this.datos.set(clave, String(valor));
  }

  removeItem(clave) {
    this.datos.delete(clave);
  }
}
