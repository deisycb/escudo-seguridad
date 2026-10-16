// Valida /src/data contra specs/001-escudo-web-app/contracts/contenido.md.
// Falla mientras el equipo no entregue el contenido real: es lo esperado.

import { describe, expect, it } from "vitest";
import { PREGUNTAS } from "../../src/data/preguntas.js";
import { POLITICA_PRIVACIDAD } from "../../src/data/politica.js";
import {
  AVISO_NO_BORRES,
  CANALES_DENUNCIA,
  GUIAS_EMERGENCIA,
  LINEAS_BANCARIAS,
} from "../../src/data/emergencias.js";
import { RECOMENDACIONES } from "../../src/data/recomendaciones.js";
import { REGLA_DE_ORO, TIPS } from "../../src/data/tips.js";
import { DIMENSIONES, OPCIONES_VALIDAS, TOTAL_PREGUNTAS } from "../../src/logic/constantes.js";

const ORDEN_CRITICIDAD = { revisa: 1, importante: 2, urgente: 3 };

function esTextoNoVacio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function esTextoOListaNoVacia(valor) {
  if (Array.isArray(valor)) return valor.length > 0 && valor.every(esTextoNoVacio);
  return esTextoNoVacio(valor);
}

function recogerTextos(valor) {
  if (typeof valor === "string") return [valor];
  if (valor && typeof valor === "object") return Object.values(valor).flatMap(recogerTextos);
  return [];
}

describe("preguntas.js", () => {
  it("tiene exactamente 14 preguntas numeradas 1..14 en orden", () => {
    expect(PREGUNTAS).toHaveLength(TOTAL_PREGUNTAS);
    PREGUNTAS.forEach((pregunta, i) => expect(pregunta.numero).toBe(i + 1));
  });

  it("cada dimensión coincide con el rango de DIMENSIONES", () => {
    PREGUNTAS.forEach(({ numero, dimension }) => {
      const esperada = DIMENSIONES.find((d) => numero >= d.desde && numero <= d.hasta);
      expect(dimension).toBe(esperada.id);
    });
  });

  it("texto y descripcionHabito son strings no vacíos", () => {
    PREGUNTAS.forEach(({ texto, descripcionHabito }) => {
      expect(esTextoNoVacio(texto)).toBe(true);
      expect(esTextoNoVacio(descripcionHabito)).toBe(true);
    });
  });

  it("cada pregunta tiene exactamente las opciones a, b y c con texto", () => {
    PREGUNTAS.forEach(({ opciones }) => {
      expect(Object.keys(opciones).sort()).toEqual([...OPCIONES_VALIDAS]);
      OPCIONES_VALIDAS.forEach((letra) => expect(esTextoNoVacio(opciones[letra].texto)).toBe(true));
    });
  });

  it("los puntajes son enteros ≥ 0 y no bajan: a ≤ b ≤ c", () => {
    PREGUNTAS.forEach(({ opciones: { a, b, c } }) => {
      [a, b, c].forEach((o) => expect(Number.isInteger(o.puntaje) && o.puntaje >= 0).toBe(true));
      expect(a.puntaje <= b.puntaje && b.puntaje <= c.puntaje).toBe(true);
    });
  });

  it("criticidad === null si y solo si puntaje === 0, y si no es un valor válido", () => {
    PREGUNTAS.forEach(({ opciones }) => {
      Object.values(opciones).forEach(({ puntaje, criticidad }) => {
        expect(criticidad === null).toBe(puntaje === 0);
        if (criticidad !== null) expect(Object.keys(ORDEN_CRITICIDAD)).toContain(criticidad);
      });
    });
  });

  it("la criticidad no baja de a → b → c (revisa < importante < urgente)", () => {
    PREGUNTAS.forEach(({ opciones }) => {
      const orden = OPCIONES_VALIDAS.map((l) => ORDEN_CRITICIDAD[opciones[l].criticidad] ?? 0);
      expect(orden[0] <= orden[1] && orden[1] <= orden[2]).toBe(true);
    });
  });

  it("el puntaje máximo total es mayor que 0", () => {
    const maximo = PREGUNTAS.reduce((suma, { opciones }) => suma + opciones.c.puntaje, 0);
    expect(maximo).toBeGreaterThan(0);
  });
});

describe("politica.js", () => {
  it("tiene título y al menos 1 sección con subtítulo y texto", () => {
    expect(esTextoNoVacio(POLITICA_PRIVACIDAD.titulo)).toBe(true);
    expect(POLITICA_PRIVACIDAD.secciones.length).toBeGreaterThanOrEqual(1);
    POLITICA_PRIVACIDAD.secciones.forEach(({ subtitulo, texto }) => {
      expect(esTextoNoVacio(subtitulo)).toBe(true);
      expect(esTextoNoVacio(texto)).toBe(true);
    });
  });
});

describe("emergencias.js", () => {
  it("tiene exactamente las 3 guías con sus ids, títulos y pasos", () => {
    expect(GUIAS_EMERGENCIA.map(({ id, titulo }) => ({ id, titulo }))).toEqual([
      { id: "tarjetas", titulo: "Bloquear mis tarjetas" },
      { id: "whatsapp", titulo: "Reportar fraude en WhatsApp" },
      { id: "phishing", titulo: "Fui víctima de phishing" },
    ]);
    GUIAS_EMERGENCIA.forEach(({ pasos }) => {
      expect(pasos.length).toBeGreaterThan(0);
      pasos.forEach((paso) => expect(esTextoNoVacio(paso)).toBe(true));
    });
  });

  it("AVISO_NO_BORRES tiene el título exacto y texto", () => {
    expect(AVISO_NO_BORRES.titulo).toBe("No borres nada");
    expect(esTextoNoVacio(AVISO_NO_BORRES.texto)).toBe(true);
  });

  it("LINEAS_BANCARIAS: al menos 1, número con solo dígitos, espacios, +, #, *, -", () => {
    expect(LINEAS_BANCARIAS.length).toBeGreaterThanOrEqual(1);
    LINEAS_BANCARIAS.forEach(({ banco, numero }) => {
      expect(esTextoNoVacio(banco)).toBe(true);
      expect(numero).toMatch(/^[\d\s+#*-]+$/);
    });
  });

  it("CANALES_DENUNCIA: al menos 1; si hay enlace, empieza por https://", () => {
    expect(CANALES_DENUNCIA.length).toBeGreaterThanOrEqual(1);
    CANALES_DENUNCIA.forEach(({ entidad, contacto, enlace }) => {
      expect(esTextoNoVacio(entidad)).toBe(true);
      expect(esTextoNoVacio(contacto)).toBe(true);
      if (enlace !== undefined) expect(enlace.startsWith("https://")).toBe(true);
    });
  });
});

describe("recomendaciones.js", () => {
  it("existe una entrada por cada pregunta con alguna opción con puntaje > 0", () => {
    const conRiesgo = PREGUNTAS.filter(({ opciones }) =>
      Object.values(opciones).some((o) => o.puntaje > 0),
    );
    expect(conRiesgo.length).toBeGreaterThan(0);
    conRiesgo.forEach(({ numero }) => {
      const recomendacion = RECOMENDACIONES[numero];
      expect(recomendacion).toBeDefined();
      expect(esTextoNoVacio(recomendacion.titulo)).toBe(true);
      expect(esTextoOListaNoVacia(recomendacion.queHacerAhora)).toBe(true);
      expect(esTextoOListaNoVacia(recomendacion.comoPrevenirlo)).toBe(true);
    });
  });
});

describe("tips.js", () => {
  const TIPO_POR_CANAL = {
    sms: "Smishing",
    llamada: "Vishing",
    correo: "Phishing",
    whatsapp: "Suplantación",
  };

  it("REGLA_DE_ORO es el texto exacto de FR-025", () => {
    expect(REGLA_DE_ORO).toBe(
      "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo",
    );
  });

  it("tiene 8 en total, 2 por canal, con el tipo de ataque de su canal e ids únicos", () => {
    expect(TIPS).toHaveLength(8);
    Object.keys(TIPO_POR_CANAL).forEach((canal) =>
      expect(TIPS.filter((t) => t.canal === canal)).toHaveLength(2),
    );
    TIPS.forEach(({ canal, tipoAtaque }) => expect(tipoAtaque).toBe(TIPO_POR_CANAL[canal]));
    expect(new Set(TIPS.map((t) => t.id)).size).toBe(TIPS.length);
  });

  it("los títulos coinciden exactamente con FR-026", () => {
    expect(TIPS.map(({ canal, titulo }) => [canal, titulo]).sort()).toEqual(
      [
        ["sms", "Tu paquete está retenido"],
        ["sms", "Descuento o premio en tu plan de celular"],
        ["llamada", "Le hablamos del banco por un movimiento sospechoso"],
        ["llamada", "Falso técnico o asesor de tu operador"],
        ["correo", "Tu cuenta será suspendida"],
        ["correo", "Factura o recibo que no esperabas"],
        ["whatsapp", "Cambié de número, necesito un favor"],
        ["whatsapp", "Te piden el código de 6 dígitos"],
      ].sort(),
    );
  });

  it("comoReconocerla y queHacer no están vacíos", () => {
    TIPS.forEach(({ comoReconocerla, queHacer }) => {
      expect(esTextoOListaNoVacia(comoReconocerla)).toBe(true);
      expect(esTextoOListaNoVacia(queHacer)).toBe(true);
    });
  });
});

describe("prohibiciones (constitución I)", () => {
  it("ningún texto de contenido contiene <script ni http://", () => {
    const textos = recogerTextos({
      PREGUNTAS,
      POLITICA_PRIVACIDAD,
      GUIAS_EMERGENCIA,
      AVISO_NO_BORRES,
      LINEAS_BANCARIAS,
      CANALES_DENUNCIA,
      RECOMENDACIONES,
      REGLA_DE_ORO,
      TIPS,
    });
    textos.forEach((texto) => {
      expect(texto.toLowerCase()).not.toContain("<script");
      expect(texto).not.toContain("http://");
    });
  });
});
