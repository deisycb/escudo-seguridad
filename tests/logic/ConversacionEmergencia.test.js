import { describe, expect, it } from "vitest";
import {
  ConversacionEmergencia,
  TEXTOS_ASISTENTE,
  validarContenidoEmergencias,
} from "../../src/logic/ConversacionEmergencia.js";
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

const PRUEBA = contenidoEmergenciasPrueba;
const { mensajes: MENSAJES } = PRUEBA;

function iniciar(contenido = PRUEBA) {
  return ConversacionEmergencia.iniciar(contenido);
}

/** Aplica una lista de elecciones por id, en orden. */
function recorrer(conversacion, ids) {
  return ids.reduce((c, id) => c.elegir(id), conversacion);
}

function ultimo(conversacion) {
  return conversacion.obtenerMensajes().at(-1);
}

function idsOpciones(conversacion) {
  return conversacion.obtenerOpciones().map((o) => o.id);
}

const OPCIONES_CIERRE = ["denunciar", "otraCosa", "terminar"];

describe("ConversacionEmergencia — flujo", () => {
  it("iniciar muestra el saludo y las 7 situaciones en orden", () => {
    const c = iniciar();
    expect(c.obtenerMensajes()).toEqual([
      { id: 1, autor: "asistente", tipo: "texto", texto: MENSAJES.saludo },
    ]);
    expect(c.obtenerOpciones()).toEqual(
      PRUEBA.situaciones.map((s) => ({ id: `situacion:${s.id}`, texto: s.texto })),
    );
    expect(c.tieneProgreso()).toBe(false);
    expect(c.estaTerminada()).toBe(false);
  });

  it("una situación directa muestra la elección y el paso 1 de M", () => {
    const c = iniciar().elegir("situacion:tarjeta-banco");
    const [, eleccion, paso] = c.obtenerMensajes();
    expect(eleccion).toMatchObject({
      autor: "persona",
      tipo: "eleccion",
      texto: "Situación tarjeta",
    });
    expect(paso).toMatchObject({
      autor: "asistente",
      tipo: "paso",
      texto: "Paso uno",
      numero: 1,
      total: 3,
    });
    expect(c.obtenerOpciones()).toEqual([{ id: "siguiente", texto: TEXTOS_ASISTENTE.siguiente }]);
    expect(c.tieneProgreso()).toBe(true);
  });

  it("una situación con seguimiento pregunta y la respuesta lleva a su guía", () => {
    const c = iniciar().elegir("situacion:duda");
    expect(ultimo(c)).toMatchObject({ tipo: "texto", texto: "Pregunta de seguimiento de prueba" });
    expect(idsOpciones(c)).toEqual(["respuesta:respuesta-a", "respuesta:respuesta-b"]);
    const guia = c.elegir("respuesta:respuesta-b");
    expect(guia.obtenerMensajes().at(-2)).toMatchObject({ autor: "persona", texto: "Respuesta B" });
    expect(ultimo(guia)).toMatchObject({ tipo: "paso", texto: "Único paso", numero: 1, total: 1 });
  });

  it("'Listo, ¿qué sigue?' avanza paso a paso hasta el cierre", () => {
    let c = iniciar().elegir("situacion:tarjeta-banco").elegir("siguiente");
    expect(c.obtenerMensajes().at(-2)).toMatchObject({
      autor: "persona",
      texto: TEXTOS_ASISTENTE.siguiente,
    });
    expect(ultimo(c)).toMatchObject({ tipo: "paso", texto: "Paso dos", numero: 2, total: 3 });
    c = recorrer(c, ["siguiente", "siguiente"]);
    expect(ultimo(c)).toMatchObject({ tipo: "texto", texto: MENSAJES.cierreGuia });
    expect(idsOpciones(c)).toEqual(OPCIONES_CIERRE);
  });

  it("una guía de 1 paso muestra 'Paso 1 de 1' y luego el cierre", () => {
    const c = iniciar().elegir("situacion:whatsapp-perdido");
    expect(ultimo(c)).toMatchObject({ numero: 1, total: 1 });
    expect(idsOpciones(c.elegir("siguiente"))).toEqual(OPCIONES_CIERRE);
  });

  it("'Ver cómo denunciar' muestra los canales y ofrece otra cosa o terminar", () => {
    const c = recorrer(iniciar(), ["situacion:whatsapp-perdido", "siguiente", "denunciar"]);
    expect(ultimo(c)).toMatchObject({
      tipo: "canalesDenuncia",
      texto: MENSAJES.introCanalesDenuncia,
      canales: PRUEBA.canales,
    });
    expect(idsOpciones(c)).toEqual(["otraCosa", "terminar"]);
  });

  it("'Me pasó otra cosa' conserva el historial y vuelve a las 7 situaciones", () => {
    const antes = recorrer(iniciar(), ["situacion:whatsapp-perdido", "siguiente"]);
    const c = antes.elegir("otraCosa");
    expect(c.obtenerMensajes().slice(0, antes.obtenerMensajes().length)).toEqual(
      antes.obtenerMensajes(),
    );
    expect(ultimo(c)).toMatchObject({ tipo: "texto", texto: MENSAJES.saludo });
    expect(idsOpciones(c)).toHaveLength(7);
  });

  it("'Eso es todo, gracias' despide y no deja opciones", () => {
    const c = recorrer(iniciar(), ["situacion:whatsapp-perdido", "siguiente", "terminar"]);
    expect(ultimo(c)).toMatchObject({ tipo: "texto", texto: MENSAJES.despedida });
    expect(c.obtenerOpciones()).toEqual([]);
    expect(c.estaTerminada()).toBe(true);
  });

  it("un id que no está pendiente devuelve la misma instancia", () => {
    const c = iniciar().elegir("situacion:tarjeta-banco");
    expect(c.elegir("situacion:tarjeta-banco")).toBe(c);
    expect(c.elegir("terminar")).toBe(c);
    expect(c.elegir("no-existe")).toBe(c);
  });

  it("una guía sin pasos muestra el mensaje de pendiente y pasa al cierre", () => {
    const c = iniciar().elegir("situacion:suplantacion");
    expect(ultimo(c)).toMatchObject({ tipo: "texto", texto: MENSAJES.contenidoPendiente });
    expect(idsOpciones(c)).toEqual(OPCIONES_CIERRE);
  });

  it("con mensajes vacíos usa el respaldo y nunca muestra texto vacío", () => {
    const c = recorrer(iniciar(contenidoEmergenciasVacio), [
      "situacion:suplantacion",
      "denunciar",
      "otraCosa",
      "situacion:whatsapp-perdido",
      "siguiente",
      "terminar",
    ]);
    c.obtenerMensajes()
      .filter((m) => m.autor === "asistente" && m.tipo === "texto")
      .forEach((m) => expect(m.texto).toBe(TEXTOS_ASISTENTE.respaldoPendiente));
    expect(c.obtenerMensajes().every((m) => m.texto?.trim())).toBe(true);
  });

  it("obtenerMensajes y obtenerOpciones devuelven copias", () => {
    const c = iniciar();
    c.obtenerMensajes().push({ texto: "intruso" });
    c.obtenerOpciones().pop();
    expect(c.obtenerMensajes()).toHaveLength(1);
    expect(c.obtenerOpciones()).toHaveLength(7);
  });

  it("los ids de los mensajes son únicos y crecientes", () => {
    const ids = recorrer(iniciar(), ["situacion:duda", "respuesta:respuesta-a", "siguiente"])
      .obtenerMensajes()
      .map((m) => m.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
