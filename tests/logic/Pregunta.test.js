import { describe, expect, it } from "vitest";
import { Pregunta } from "../../src/logic/Pregunta.js";
import { DATOS_PREGUNTAS_PRUEBA, crearDatosPreguntas } from "../fixtures/contenidoPrueba.js";

const datos = DATOS_PREGUNTAS_PRUEBA[0];

describe("Pregunta", () => {
  it("expone los campos del contenido", () => {
    const pregunta = new Pregunta(datos);
    expect(pregunta.numero).toBe(1);
    expect(pregunta.dimension).toBe("phishing");
    expect(pregunta.texto).toBe(datos.texto);
    expect(pregunta.descripcionHabito).toBe(datos.descripcionHabito);
    expect(pregunta.opciones).toEqual(datos.opciones);
  });

  it("obtenerOpcion devuelve texto, puntaje y criticidad", () => {
    const pregunta = new Pregunta(datos);
    expect(pregunta.obtenerOpcion("b")).toEqual({
      texto: datos.opciones.b.texto,
      puntaje: 2,
      criticidad: "importante",
    });
  });

  it.each(["d", null, ""])("obtenerOpcion(%j) lanza un error", (letra) => {
    const pregunta = new Pregunta(datos);
    expect(() => pregunta.obtenerOpcion(letra)).toThrow();
  });

  it("obtenerPuntaje devuelve el puntaje de la opción", () => {
    const pregunta = new Pregunta(datos);
    expect(pregunta.obtenerPuntaje("a")).toBe(0);
    expect(pregunta.obtenerPuntaje("c")).toBe(4);
  });

  it("obtenerPuntajeMaximo devuelve el mayor puntaje", () => {
    expect(new Pregunta(datos).obtenerPuntajeMaximo()).toBe(4);
    const ceros = crearDatosPreguntas(Array.from({ length: 14 }, () => [0, 0, 0]));
    expect(new Pregunta(ceros[0]).obtenerPuntajeMaximo()).toBe(0);
  });
});
