import { describe, expect, it } from "vitest";
import { Almacenamiento } from "../../src/logic/Almacenamiento.js";
import { Pregunta } from "../../src/logic/Pregunta.js";
import { CLAVE_ALMACENAMIENTO } from "../../src/logic/constantes.js";
import { AlmacenFalso, DATOS_PREGUNTAS_PRUEBA } from "../fixtures/contenidoPrueba.js";

const PREGUNTAS = DATOS_PREGUNTAS_PRUEBA.map((d) => new Pregunta(d));

// Igual al ejemplo de contracts/almacenamiento.md
const RESPUESTAS = ["a", "c", "b", "a", "a", "c", "b", "a", "b", "c", "a", "a", "b", "c"];
const FECHA = "2026-10-15T14:32:00.000Z";

function registro(cambios = {}) {
  return {
    version: 1,
    diagnostico: { respuestas: RESPUESTAS, fecha: FECHA },
    accionesHechas: [2, 6],
    ...cambios,
  };
}

function conRegistro(valor) {
  const almacen = new AlmacenFalso();
  almacen.setItem(CLAVE_ALMACENAMIENTO, typeof valor === "string" ? valor : JSON.stringify(valor));
  return almacen;
}

function leer(almacen) {
  return JSON.parse(almacen.getItem(CLAVE_ALMACENAMIENTO));
}

describe("Almacenamiento.estaDisponible", () => {
  it("es true con un almacén que funciona", () => {
    expect(new Almacenamiento(new AlmacenFalso()).estaDisponible()).toBe(true);
  });

  it("es false si setItem lanza un error", () => {
    const almacen = new AlmacenFalso({ fallarAlEscribir: true });
    expect(new Almacenamiento(almacen).estaDisponible()).toBe(false);
  });
});

describe("Almacenamiento.cargar", () => {
  it("devuelve vacio si no existe la clave", () => {
    expect(new Almacenamiento(new AlmacenFalso()).cargar(PREGUNTAS)).toEqual({ estado: "vacio" });
  });

  it("devuelve valido con los datos del ejemplo del contrato", () => {
    const resultado = new Almacenamiento(conRegistro(registro())).cargar(PREGUNTAS);
    expect(resultado).toEqual({
      estado: "valido",
      datos: { respuestas: RESPUESTAS, fecha: FECHA, accionesHechas: [2, 6] },
    });
  });

  it("acepta accionesHechas vacío", () => {
    const almacen = conRegistro(registro({ accionesHechas: [] }));
    expect(new Almacenamiento(almacen).cargar(PREGUNTAS).estado).toBe("valido");
  });

  const casosCorruptos = [
    ["JSON ilegible", "{no es json"],
    ["version distinta de 1", registro({ version: 2 })],
    ["sin diagnostico", registro({ diagnostico: null })],
    ["13 respuestas", registro({ diagnostico: { respuestas: RESPUESTAS.slice(1), fecha: FECHA } })],
    [
      "15 respuestas",
      registro({ diagnostico: { respuestas: [...RESPUESTAS, "a"], fecha: FECHA } }),
    ],
    [
      "letra fuera de a|b|c",
      registro({ diagnostico: { respuestas: [...RESPUESTAS.slice(1), "d"], fecha: FECHA } }),
    ],
    ["fecha inválida", registro({ diagnostico: { respuestas: RESPUESTAS, fecha: "ayer" } })],
    ["accionesHechas no es arreglo", registro({ accionesHechas: "2,6" })],
    ["accionesHechas con repetidos", registro({ accionesHechas: [2, 2] })],
    ["accionesHechas fuera de 1–14", registro({ accionesHechas: [15] })],
    ["accionesHechas con 0", registro({ accionesHechas: [0] })],
    ["accionesHechas no enteros", registro({ accionesHechas: [2.5] })],
    // La respuesta 1 es "a", con puntaje 0: no es un hábito de riesgo.
    ["acción de una pregunta con puntaje 0", registro({ accionesHechas: [1] })],
  ];

  it.each(casosCorruptos)("devuelve corrupto y borra la clave: %s", (_, valor) => {
    const almacen = conRegistro(valor);
    const resultado = new Almacenamiento(almacen).cargar(PREGUNTAS);
    expect(resultado).toEqual({ estado: "corrupto" });
    expect(almacen.getItem(CLAVE_ALMACENAMIENTO)).toBeNull();
  });

  it("devuelve no-disponible si getItem lanza un error", () => {
    const almacen = new AlmacenFalso({ fallarAlLeer: true });
    expect(new Almacenamiento(almacen).cargar(PREGUNTAS)).toEqual({ estado: "no-disponible" });
  });

  it("devuelve no-disponible si la prueba de escritura falla", () => {
    const almacen = new AlmacenFalso({ fallarAlEscribir: true });
    expect(new Almacenamiento(almacen).cargar(PREGUNTAS)).toEqual({ estado: "no-disponible" });
  });

  it("devuelve no-disponible si no hay almacén", () => {
    expect(new Almacenamiento(null).cargar(PREGUNTAS)).toEqual({ estado: "no-disponible" });
  });
});

describe("Almacenamiento escrituras", () => {
  it("guardarDiagnostico escribe el esquema completo con accionesHechas vacío", () => {
    const almacen = conRegistro(registro());
    const resultado = new Almacenamiento(almacen).guardarDiagnostico(RESPUESTAS, FECHA);
    expect(resultado).toBe(true);
    expect(leer(almacen)).toEqual({
      version: 1,
      diagnostico: { respuestas: RESPUESTAS, fecha: FECHA },
      accionesHechas: [],
    });
  });

  it("guardarProgreso reescribe solo accionesHechas", () => {
    const almacen = new AlmacenFalso();
    const almacenamiento = new Almacenamiento(almacen);
    almacenamiento.guardarDiagnostico(RESPUESTAS, FECHA);
    expect(almacenamiento.guardarProgreso([2, 6])).toBe(true);
    expect(leer(almacen)).toEqual(registro({ accionesHechas: [2, 6] }));
  });

  it("si setItem lanza error, ambos devuelven false y pasa a no-disponible", () => {
    const almacen = new AlmacenFalso();
    const almacenamiento = new Almacenamiento(almacen);
    almacenamiento.guardarDiagnostico(RESPUESTAS, FECHA);
    almacen.fallarAlEscribir = true;
    expect(almacenamiento.guardarDiagnostico(RESPUESTAS, FECHA)).toBe(false);
    expect(almacenamiento.guardarProgreso([2])).toBe(false);
    expect(almacenamiento.estaDisponible()).toBe(false);
  });

  it("borrar elimina la clave y nunca lanza error", () => {
    const almacen = conRegistro(registro());
    new Almacenamiento(almacen).borrar();
    expect(almacen.getItem(CLAVE_ALMACENAMIENTO)).toBeNull();
    const roto = {
      removeItem: () => {
        throw new Error("bloqueado");
      },
    };
    expect(() => new Almacenamiento(roto).borrar()).not.toThrow();
    expect(() => new Almacenamiento(null).borrar()).not.toThrow();
  });

  it("ningún método lanza error con un almacén que siempre falla", () => {
    const almacen = new AlmacenFalso({ fallarAlLeer: true, fallarAlEscribir: true });
    const almacenamiento = new Almacenamiento(almacen);
    expect(() => almacenamiento.estaDisponible()).not.toThrow();
    expect(() => almacenamiento.cargar(PREGUNTAS)).not.toThrow();
    expect(() => almacenamiento.guardarDiagnostico(RESPUESTAS, FECHA)).not.toThrow();
    expect(() => almacenamiento.guardarProgreso([2])).not.toThrow();
    expect(() => almacenamiento.borrar()).not.toThrow();
  });
});
