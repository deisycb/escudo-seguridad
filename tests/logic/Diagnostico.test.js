import { describe, expect, it } from "vitest";
import { Diagnostico } from "../../src/logic/Diagnostico.js";
import { Pregunta } from "../../src/logic/Pregunta.js";
import { DATOS_PREGUNTAS_PRUEBA, crearDatosPreguntas } from "../fixtures/contenidoPrueba.js";

const FECHA = "2026-10-15T14:32:00.000Z";
const PREGUNTAS = DATOS_PREGUNTAS_PRUEBA.map((d) => new Pregunta(d));

function crearPreguntas(puntajes) {
  return crearDatosPreguntas(puntajes).map((d) => new Pregunta(d));
}

function respuestasCon(cambios, base = "a") {
  const respuestas = Array(14).fill(base);
  Object.entries(cambios).forEach(([numero, letra]) => (respuestas[numero - 1] = letra));
  return respuestas;
}

describe("Diagnostico constructor", () => {
  it.each([
    ["13 respuestas", Array(13).fill("a")],
    ["15 respuestas", Array(15).fill("a")],
    ["null", null],
    ["una letra inválida", respuestasCon({ 5: "d" })],
    ["una respuesta vacía", respuestasCon({ 5: null })],
  ])("lanza un error con %s", (_, respuestas) => {
    expect(() => new Diagnostico(PREGUNTAS, respuestas, FECHA)).toThrow();
  });

  it("respuestas devuelve una copia", () => {
    const diagnostico = new Diagnostico(PREGUNTAS, respuestasCon({ 1: "c" }), FECHA);
    diagnostico.respuestas[0] = "a";
    expect(diagnostico.respuestas[0]).toBe("c");
    expect(diagnostico.fecha).toBe(FECHA);
  });

  it("no depende del arreglo original de respuestas", () => {
    const respuestas = respuestasCon({ 1: "c" });
    const diagnostico = new Diagnostico(PREGUNTAS, respuestas, FECHA);
    respuestas[0] = "a";
    expect(diagnostico.calcularPuntajeObtenido()).toBe(4);
  });
});

describe("Diagnostico puntajes y porcentajes", () => {
  it("suma los puntajes obtenidos y los máximos", () => {
    const diagnostico = new Diagnostico(PREGUNTAS, respuestasCon({ 1: "b", 2: "c" }), FECHA);
    expect(diagnostico.calcularPuntajeObtenido()).toBe(6);
    expect(diagnostico.calcularPuntajeMaximo()).toBe(56);
    expect(diagnostico.calcularRiesgoTotal()).toBe(Math.round((6 * 100) / 56));
  });

  it("calcularPorcentaje devuelve 0 si el máximo es 0", () => {
    expect(Diagnostico.calcularPorcentaje(5, 0)).toBe(0);
  });

  it.each([
    [0, "Bajo"],
    [39, "Bajo"],
    [40, "Medio"],
    [69, "Medio"],
    [70, "Alto"],
    [100, "Alto"],
  ])("clasificarNivel(%i) es %s", (porcentaje, nivel) => {
    expect(Diagnostico.clasificarNivel(porcentaje)).toBe(nivel);
  });

  // Máximo total 200: 13 preguntas con [0, 1, 10] y la 14 con [0, 9, 70].
  const PREGUNTAS_FRONTERA = crearPreguntas([
    ...Array.from({ length: 13 }, () => [0, 1, 10]),
    [0, 9, 70],
  ]);

  it("39,5 % se redondea a 40 y queda en Medio", () => {
    // 7 × 10 + 9 = 79 → 79 × 100 / 200 = 39,5
    const respuestas = respuestasCon({
      1: "c",
      2: "c",
      3: "c",
      4: "c",
      5: "c",
      6: "c",
      7: "c",
      14: "b",
    });
    const diagnostico = new Diagnostico(PREGUNTAS_FRONTERA, respuestas, FECHA);
    expect(diagnostico.calcularRiesgoTotal()).toBe(40);
    expect(diagnostico.obtenerNivelSemaforo()).toBe("Medio");
  });

  it("69,5 % se redondea a 70 y queda en Alto", () => {
    // 13 × 10 + 9 = 139 → 139 × 100 / 200 = 69,5
    const respuestas = respuestasCon({ 14: "b" }, "c");
    const diagnostico = new Diagnostico(PREGUNTAS_FRONTERA, respuestas, FECHA);
    expect(diagnostico.calcularRiesgoTotal()).toBe(70);
    expect(diagnostico.obtenerNivelSemaforo()).toBe("Alto");
  });

  it("calcula el riesgo de cada dimensión dentro de su rango", () => {
    const respuestas = respuestasCon({ 1: "c", 2: "c", 3: "c", 4: "c", 5: "b", 13: "c" });
    const diagnostico = new Diagnostico(PREGUNTAS, respuestas, FECHA);
    expect(diagnostico.calcularRiesgoPorDimension()).toEqual({
      phishing: 100,
      smishing: Math.round((2 * 100) / 16),
      vishing: 0,
      habitos: 50,
    });
  });

  it("todas las respuestas con puntaje 0 dan riesgo 0, Bajo y sin hábitos", () => {
    const diagnostico = new Diagnostico(PREGUNTAS, respuestasCon({}), FECHA);
    expect(diagnostico.calcularRiesgoTotal()).toBe(0);
    expect(diagnostico.obtenerNivelSemaforo()).toBe("Bajo");
    expect(diagnostico.obtenerHabitosDeRiesgo()).toEqual([]);
  });
});

describe("Diagnostico hábitos de riesgo", () => {
  it("incluye solo puntajes > 0, ordenados por puntos y en empate por número", () => {
    const respuestas = respuestasCon({ 1: "b", 3: "c", 2: "c" });
    const habitos = new Diagnostico(PREGUNTAS, respuestas, FECHA).obtenerHabitosDeRiesgo();
    expect(habitos).toEqual([
      { numeroPregunta: 2, descripcion: "Hábito de prueba 2", prioridad: "Urgente", puntos: 4 },
      { numeroPregunta: 3, descripcion: "Hábito de prueba 3", prioridad: "Urgente", puntos: 4 },
      { numeroPregunta: 1, descripcion: "Hábito de prueba 1", prioridad: "Importante", puntos: 2 },
    ]);
  });

  it("es determinista", () => {
    const respuestas = respuestasCon({ 1: "b", 6: "c", 10: "b", 14: "c" });
    const primero = new Diagnostico(PREGUNTAS, respuestas, FECHA);
    const segundo = new Diagnostico(PREGUNTAS, respuestas, FECHA);
    expect(segundo.calcularRiesgoTotal()).toBe(primero.calcularRiesgoTotal());
    expect(segundo.calcularRiesgoPorDimension()).toEqual(primero.calcularRiesgoPorDimension());
    expect(segundo.obtenerHabitosDeRiesgo()).toEqual(primero.obtenerHabitosDeRiesgo());
  });
});
