import { describe, expect, it } from "vitest";
import { validarContenidoEmergencias } from "../../src/logic/ConversacionEmergencia.js";
import {
  contenidoEmergenciasPrueba,
  contenidoEmergenciasVacio,
} from "../fixtures/emergenciasPrueba.js";

/** Copia el contenido de prueba cambiando solo las situaciones o las guías. */
function conCambios({ situaciones, guias }) {
  return {
    ...contenidoEmergenciasPrueba,
    situaciones: situaciones ?? contenidoEmergenciasPrueba.situaciones,
    guias: guias ?? contenidoEmergenciasPrueba.guias,
  };
}

function cambiarSituacion(id, cambios) {
  return contenidoEmergenciasPrueba.situaciones.map((s) =>
    s.id === id ? { ...s, ...cambios } : s,
  );
}

const SEGUIMIENTO_DUDA = contenidoEmergenciasPrueba.situaciones.find(
  (s) => s.id === "duda",
).seguimiento;

describe("validarContenidoEmergencias", () => {
  it("el contenido de prueba no tiene errores", () => {
    expect(validarContenidoEmergencias(contenidoEmergenciasPrueba).errores).toEqual([]);
  });

  it("exige los 7 ids de situación en el orden fijo", () => {
    const desordenadas = [...contenidoEmergenciasPrueba.situaciones].reverse();
    expect(
      validarContenidoEmergencias(conCambios({ situaciones: desordenadas })).errores,
    ).not.toEqual([]);
    const seis = contenidoEmergenciasPrueba.situaciones.slice(1);
    expect(validarContenidoEmergencias(conCambios({ situaciones: seis })).errores).not.toEqual([]);
  });

  it("rechaza una situación con guia y seguimiento a la vez, o sin ninguno", () => {
    const ambas = cambiarSituacion("duda", { guia: "un-paso" });
    expect(validarContenidoEmergencias(conCambios({ situaciones: ambas })).errores).not.toEqual([]);
    const ninguna = cambiarSituacion("tarjeta-banco", { guia: undefined });
    expect(validarContenidoEmergencias(conCambios({ situaciones: ninguna })).errores).not.toEqual(
      [],
    );
  });

  it("rechaza una situación sin texto", () => {
    const sinTexto = cambiarSituacion("enlace-falso", { texto: " " });
    expect(validarContenidoEmergencias(conCambios({ situaciones: sinTexto })).errores).not.toEqual(
      [],
    );
  });

  it("rechaza una guía inexistente, en situaciones y en respuestas", () => {
    const situacion = cambiarSituacion("tarjeta-banco", { guia: "no-existe" });
    expect(validarContenidoEmergencias(conCambios({ situaciones: situacion })).errores).not.toEqual(
      [],
    );
    const respuestas = [
      { ...SEGUIMIENTO_DUDA.respuestas[0], guia: "no-existe" },
      SEGUIMIENTO_DUDA.respuestas[1],
    ];
    const respuesta = cambiarSituacion("duda", {
      seguimiento: { ...SEGUIMIENTO_DUDA, respuestas },
    });
    expect(validarContenidoEmergencias(conCambios({ situaciones: respuesta })).errores).not.toEqual(
      [],
    );
  });

  it("exige al menos 2 respuestas con ids únicos y una pregunta no vacía", () => {
    const una = { ...SEGUIMIENTO_DUDA, respuestas: SEGUIMIENTO_DUDA.respuestas.slice(0, 1) };
    const repetidas = {
      ...SEGUIMIENTO_DUDA,
      respuestas: [
        SEGUIMIENTO_DUDA.respuestas[0],
        { ...SEGUIMIENTO_DUDA.respuestas[1], id: "respuesta-a" },
      ],
    };
    const sinPregunta = { ...SEGUIMIENTO_DUDA, pregunta: "" };
    [una, repetidas, sinPregunta].forEach((seguimiento) => {
      const situaciones = cambiarSituacion("duda", { seguimiento });
      expect(validarContenidoEmergencias(conCambios({ situaciones })).errores).not.toEqual([]);
    });
  });

  it("rechaza ids de guía repetidos", () => {
    const guias = [
      ...contenidoEmergenciasPrueba.guias,
      { id: "un-paso", titulo: "Otra", pasos: ["x"] },
    ];
    expect(validarContenidoEmergencias(conCambios({ guias })).errores).not.toEqual([]);
  });

  it("marca como pendiente la guía sin pasos y nada más en el contenido de prueba", () => {
    const { pendientes } = validarContenidoEmergencias(contenidoEmergenciasPrueba);
    expect(pendientes).toHaveLength(1);
    expect(pendientes[0]).toContain("vacia");
  });

  it("marca como pendientes los mensajes vacíos, las listas vacías y lo provisional", () => {
    const provisional = cambiarSituacion("tarjeta-banco", { provisional: true });
    const { errores, pendientes } = validarContenidoEmergencias({
      ...contenidoEmergenciasVacio,
      situaciones: provisional,
    });
    expect(errores).toEqual([]);
    const texto = pendientes.join("\n");
    [
      "saludo",
      "contenidoPendiente",
      "líneas bancarias",
      "canales de denuncia",
      "tarjeta-banco",
    ].forEach((clave) => expect(texto).toContain(clave));
  });
});
