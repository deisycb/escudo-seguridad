import { describe, expect, it } from "vitest";
import { TIPS } from "../../src/data/tips.js";
import { RetoTips } from "../../src/logic/RetoTips.js";
import { MENSAJE_FALLO, TOTAL_TRAMPAS_POR_TIP } from "../../src/logic/constantes.js";

const ID_SMS = "sms-paquete";
const ID_CORREO = "correo-suspension";

// Índices de opción del reto "sms-paquete": la correcta es la 1.
const OPCION_CORRECTA_SMS = 1;
const OPCION_INCORRECTA_SMS = 0;

function nuevoReto(superados) {
  return new RetoTips(TIPS, superados);
}

describe("RetoTips.partirEnSegmentos", () => {
  const reto = nuevoReto();

  it("separa texto normal y frases trampa con índices consecutivos", () => {
    expect(reto.partirEnSegmentos("Hola [[uno]] y [[dos]].")).toEqual([
      { texto: "Hola ", esTrampa: false, indice: null },
      { texto: "uno", esTrampa: true, indice: 0 },
      { texto: " y ", esTrampa: false, indice: null },
      { texto: "dos", esTrampa: true, indice: 1 },
      { texto: ".", esTrampa: false, indice: null },
    ]);
  });

  it("empieza a contar desde indiceInicial", () => {
    const [segmento] = reto.partirEnSegmentos("[[tres]]", 2);
    expect(segmento).toEqual({ texto: "tres", esTrampa: true, indice: 2 });
  });

  it("omite segmentos vacíos al inicio y al final", () => {
    expect(reto.partirEnSegmentos("[[a]][[b]]")).toHaveLength(2);
  });

  it("un texto sin marcas es un solo segmento normal", () => {
    expect(reto.partirEnSegmentos("Envíos Col")).toEqual([
      { texto: "Envíos Col", esTrampa: false, indice: null },
    ]);
  });
});

describe("RetoTips.segmentosDelTip", () => {
  const reto = nuevoReto();

  it("en el correo, la trampa 0 está en el remitente y el mensaje sigue en 1 y 2", () => {
    const { remitente, mensaje } = reto.segmentosDelTip(ID_CORREO);
    expect(remitente.filter((s) => s.esTrampa).map((s) => s.texto)).toEqual([
      "seguridad@cuenta-verificacion.net",
    ]);
    expect(remitente.find((s) => s.esTrampa).indice).toBe(0);
    expect(mensaje.filter((s) => s.esTrampa).map((s) => s.indice)).toEqual([1, 2]);
  });

  it("cada tip tiene trampas 0..2 entre remitente y mensaje", () => {
    TIPS.forEach(({ id }) => {
      const { remitente, mensaje } = reto.segmentosDelTip(id);
      const indices = [...remitente, ...mensaje].filter((s) => s.esTrampa).map((s) => s.indice);
      expect(indices).toEqual([...Array(TOTAL_TRAMPAS_POR_TIP).keys()]);
    });
  });

  it("lanza un error si el tip no existe", () => {
    expect(() => reto.segmentosDelTip("no-existe")).toThrow();
  });
});

describe("RetoTips.marcarTrampa", () => {
  it("cuenta cada trampa una sola vez", () => {
    const reto = nuevoReto()
      .marcarTrampa(ID_SMS, 2)
      .marcarTrampa(ID_SMS, 0)
      .marcarTrampa(ID_SMS, 2);
    expect(reto.trampasEncontradas(ID_SMS)).toEqual([0, 2]);
  });

  it("devuelve la misma instancia si la trampa ya estaba o el índice es inválido", () => {
    const reto = nuevoReto().marcarTrampa(ID_SMS, 1);
    expect(reto.marcarTrampa(ID_SMS, 1)).toBe(reto);
    expect(reto.marcarTrampa(ID_SMS, TOTAL_TRAMPAS_POR_TIP)).toBe(reto);
    expect(reto.marcarTrampa(ID_SMS, -1)).toBe(reto);
    expect(reto.marcarTrampa(ID_SMS, 0.5)).toBe(reto);
  });

  it("no modifica la instancia original ni otros tips", () => {
    const original = nuevoReto();
    original.marcarTrampa(ID_SMS, 0);
    expect(original.trampasEncontradas(ID_SMS)).toEqual([]);
    expect(original.marcarTrampa(ID_SMS, 0).trampasEncontradas(ID_CORREO)).toEqual([]);
  });

  it("conserva los retos superados", () => {
    expect(nuevoReto([ID_SMS]).marcarTrampa(ID_CORREO, 0).estaSuperado(ID_SMS)).toBe(true);
  });
});

describe("RetoTips.responder", () => {
  it("con la correcta devuelve el acierto y deja el reto superado", () => {
    const original = nuevoReto();
    const { correcta, mensaje, reto } = original.responder(ID_SMS, OPCION_CORRECTA_SMS);
    expect(correcta).toBe(true);
    expect(mensaje).toBe(TIPS[0].reto.acierto);
    expect(reto.estaSuperado(ID_SMS)).toBe(true);
    expect(original.estaSuperado(ID_SMS)).toBe(false);
  });

  it("con una incorrecta devuelve MENSAJE_FALLO y la misma instancia", () => {
    const original = nuevoReto();
    const { correcta, mensaje, reto } = original.responder(ID_SMS, OPCION_INCORRECTA_SMS);
    expect(correcta).toBe(false);
    expect(mensaje).toBe(MENSAJE_FALLO);
    expect(reto).toBe(original);
  });

  it("una incorrecta no quita un reto ya superado", () => {
    const { reto } = nuevoReto([ID_SMS]).responder(ID_SMS, OPCION_INCORRECTA_SMS);
    expect(reto.estaSuperado(ID_SMS)).toBe(true);
  });

  it("acertar dos veces no cambia la instancia", () => {
    const superado = nuevoReto([ID_SMS]);
    expect(superado.responder(ID_SMS, OPCION_CORRECTA_SMS).reto).toBe(superado);
  });

  it("una opción que no existe cuenta como incorrecta", () => {
    expect(nuevoReto().responder(ID_SMS, 9).correcta).toBe(false);
  });

  it("conserva las trampas encontradas", () => {
    const { reto } = nuevoReto().marcarTrampa(ID_SMS, 1).responder(ID_SMS, OPCION_CORRECTA_SMS);
    expect(reto.trampasEncontradas(ID_SMS)).toEqual([1]);
  });
});

describe("RetoTips.progreso y retosSuperados", () => {
  it("empieza en 0 de 8", () => {
    expect(nuevoReto().progreso()).toEqual({ superados: 0, total: 8, porcentaje: 0 });
  });

  it("cuenta los superados y calcula el porcentaje entero", () => {
    expect(nuevoReto([ID_SMS, ID_CORREO]).progreso()).toEqual({
      superados: 2,
      total: 8,
      porcentaje: 25,
    });
  });

  it("descarta ids guardados que no existen y repetidos", () => {
    const reto = nuevoReto(["no-existe", ID_SMS, ID_SMS]);
    expect(reto.progreso().superados).toBe(1);
  });

  it("retosSuperados sale en el orden del contenido", () => {
    expect(nuevoReto([ID_CORREO, ID_SMS]).retosSuperados()).toEqual([ID_SMS, ID_CORREO]);
  });
});

describe("RetoTips.tipsDelCanal", () => {
  const reto = nuevoReto();

  it("null devuelve los 8", () => {
    expect(reto.tipsDelCanal(null)).toHaveLength(TIPS.length);
  });

  it("un canal devuelve solo sus 2 tips", () => {
    const llamadas = reto.tipsDelCanal("llamada");
    expect(llamadas.map((t) => t.id)).toEqual(["llamada-banco", "llamada-tecnico"]);
  });
});
