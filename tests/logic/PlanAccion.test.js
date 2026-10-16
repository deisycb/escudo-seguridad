import { describe, expect, it } from "vitest";
import { Diagnostico } from "../../src/logic/Diagnostico.js";
import { PlanAccion } from "../../src/logic/PlanAccion.js";
import { Pregunta } from "../../src/logic/Pregunta.js";
import { DATOS_PREGUNTAS_PRUEBA, RECOMENDACIONES_PRUEBA } from "../fixtures/contenidoPrueba.js";

const FECHA = "2026-10-15T14:32:00.000Z";
const PREGUNTAS = DATOS_PREGUNTAS_PRUEBA.map((d) => new Pregunta(d));

function respuestasCon(cambios) {
  const respuestas = Array(14).fill("a");
  Object.entries(cambios).forEach(([numero, letra]) => (respuestas[numero - 1] = letra));
  return respuestas;
}

// Hábitos: 2 (4 pts), 6 (4 pts), 1 (2 pts). Máximo total: 56.
const DIAGNOSTICO = new Diagnostico(PREGUNTAS, respuestasCon({ 1: "b", 2: "c", 6: "c" }), FECHA);

function crearPlan(hechas) {
  return new PlanAccion(DIAGNOSTICO, RECOMENDACIONES_PRUEBA, hechas);
}

describe("PlanAccion", () => {
  it("obtenerAcciones sigue el orden de los hábitos y trae su recomendación", () => {
    const acciones = crearPlan().obtenerAcciones();
    expect(acciones.map((a) => a.numeroPregunta)).toEqual(
      DIAGNOSTICO.obtenerHabitosDeRiesgo().map((h) => h.numeroPregunta),
    );
    expect(acciones[0]).toEqual({
      numeroPregunta: 2,
      titulo: RECOMENDACIONES_PRUEBA[2].titulo,
      prioridad: "Urgente",
      puntos: 4,
      bajaPorcentaje: Math.round((4 * 100) / 56),
      queHacerAhora: RECOMENDACIONES_PRUEBA[2].queHacerAhora,
      comoPrevenirlo: RECOMENDACIONES_PRUEBA[2].comoPrevenirlo,
      hecha: false,
    });
  });

  it("sin acciones hechas, el riesgo actual es igual al riesgo total", () => {
    const plan = crearPlan();
    expect(plan.calcularRiesgoActual()).toBe(DIAGNOSTICO.calcularRiesgoTotal());
    expect(plan.obtenerNivelActual()).toBe(DIAGNOSTICO.obtenerNivelSemaforo());
  });

  it("marcarHecha devuelve una instancia nueva y resta los puntos", () => {
    const plan = crearPlan();
    const marcado = plan.marcarHecha(2);
    expect(marcado).not.toBe(plan);
    expect(plan.contarHechas()).toBe(0);
    expect(marcado.contarHechas()).toBe(1);
    expect(marcado.calcularRiesgoActual()).toBe(Math.round((6 * 100) / 56));
    expect(marcado.obtenerAcciones()[0].hecha).toBe(true);
  });

  it("marcar dos veces es idempotente", () => {
    const plan = crearPlan().marcarHecha(2).marcarHecha(2);
    expect(plan.contarHechas()).toBe(1);
    expect(plan.obtenerAccionesHechas()).toEqual([2]);
  });

  it("desmarcar devuelve el riesgo a su valor inicial", () => {
    const plan = crearPlan();
    const vuelta = plan.marcarHecha(6).desmarcar(6);
    expect(vuelta.calcularRiesgoActual()).toBe(plan.calcularRiesgoActual());
    expect(vuelta.contarHechas()).toBe(0);
    expect(crearPlan().desmarcar(6).contarHechas()).toBe(0);
  });

  it("con todas hechas, el riesgo es 0 y el nivel Bajo", () => {
    const plan = crearPlan([1, 2, 6]);
    expect(plan.calcularRiesgoActual()).toBe(0);
    expect(plan.obtenerNivelActual()).toBe("Bajo");
  });

  it("contarTotal es el número de hábitos y obtenerAccionesHechas va ordenado", () => {
    const plan = crearPlan([6, 1]);
    expect(plan.contarTotal()).toBe(3);
    expect(plan.obtenerAccionesHechas()).toEqual([1, 6]);
  });

  it("el constructor lanza error si una acción hecha no es un hábito", () => {
    expect(() => crearPlan([3])).toThrow();
  });

  it("no modifica el Diagnostico", () => {
    const riesgo = DIAGNOSTICO.calcularRiesgoTotal();
    crearPlan().marcarHecha(2).marcarHecha(6);
    expect(DIAGNOSTICO.calcularRiesgoTotal()).toBe(riesgo);
    expect(DIAGNOSTICO.obtenerHabitosDeRiesgo()).toHaveLength(3);
  });

  it("un diagnóstico sin hábitos da 0 de 0", () => {
    const sinRiesgo = new Diagnostico(PREGUNTAS, respuestasCon({}), FECHA);
    const plan = new PlanAccion(sinRiesgo, RECOMENDACIONES_PRUEBA);
    expect(plan.contarTotal()).toBe(0);
    expect(plan.contarHechas()).toBe(0);
    expect(plan.calcularRiesgoActual()).toBe(0);
  });
});
