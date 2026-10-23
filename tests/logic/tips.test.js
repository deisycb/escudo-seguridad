// Valida la estructura de /src/data/tips.js (spec 006, data-model.md).

import { describe, expect, it } from "vitest";
import { CANALES_TIPS, REGLA_DE_ORO, TEXTOS_TIPS, TIPS } from "../../src/data/tips.js";
import { TOTAL_TRAMPAS_POR_TIP } from "../../src/logic/constantes.js";

const TIPO_POR_CANAL = {
  sms: "Smishing",
  llamada: "Vishing",
  correo: "Phishing",
  whatsapp: "Suplantación",
};

const OPCIONES_POR_RETO = 3;
const TIPS_POR_CANAL = 2;

function esTextoNoVacio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function contarMarcas(texto) {
  return (texto.match(/\[\[(.+?)\]\]/g) ?? []).length;
}

describe("tips.js", () => {
  it("REGLA_DE_ORO es el texto exacto de FR-002", () => {
    expect(REGLA_DE_ORO).toBe(
      "Tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta. Ni por llamada, ni por mensaje, ni por correo.",
    );
  });

  it("tiene 8 tips, 2 por canal, con el tipo de su canal e ids únicos", () => {
    expect(TIPS).toHaveLength(8);
    Object.keys(TIPO_POR_CANAL).forEach((canal) =>
      expect(TIPS.filter((t) => t.canal === canal)).toHaveLength(TIPS_POR_CANAL),
    );
    TIPS.forEach(({ canal, tipo }) => expect(tipo).toBe(TIPO_POR_CANAL[canal]));
    expect(new Set(TIPS.map((t) => t.id)).size).toBe(TIPS.length);
  });

  it("los títulos y su orden coinciden con FR-019", () => {
    expect(TIPS.map((t) => t.titulo)).toEqual([
      "Tu paquete está retenido",
      "Descuento o premio en tu plan de celular",
      '"Le hablamos del banco por un movimiento sospechoso"',
      "Falso técnico o asesor de tu operador",
      "Tu cuenta será suspendida",
      "Factura o recibo que no esperabas",
      '"Cambié de número, necesito un favor"',
      "Te piden el código de 6 dígitos",
    ]);
  });

  it.each(TIPS.map((t) => [t.id, t]))(
    "%s: 3 trampas marcadas que coinciden con trampas[]",
    (_, tip) => {
      const marcas = contarMarcas(tip.remitente) + contarMarcas(tip.mensaje);
      expect(marcas).toBe(TOTAL_TRAMPAS_POR_TIP);
      expect(tip.trampas).toHaveLength(TOTAL_TRAMPAS_POR_TIP);
    },
  );

  it.each(TIPS.map((t) => [t.id, t]))("%s: 3 señales, 3 pasos y textos no vacíos", (_, tip) => {
    expect(tip.senales).toHaveLength(TOTAL_TRAMPAS_POR_TIP);
    expect(tip.pasos).toHaveLength(TOTAL_TRAMPAS_POR_TIP);
    const textos = [
      tip.titulo,
      tip.remitente,
      tip.hora,
      tip.mensaje,
      tip.dato,
      tip.reto.pregunta,
      tip.reto.acierto,
      ...tip.trampas,
      ...tip.senales,
      ...tip.pasos,
    ];
    textos.forEach((texto) => expect(esTextoNoVacio(texto)).toBe(true));
  });

  it.each(TIPS.map((t) => [t.id, t]))("%s: 3 opciones con exactamente una correcta", (_, tip) => {
    const { opciones } = tip.reto;
    expect(opciones).toHaveLength(OPCIONES_POR_RETO);
    opciones.forEach((o) => expect(esTextoNoVacio(o.texto)).toBe(true));
    expect(opciones.filter((o) => o.esCorrecta === true)).toHaveLength(1);
  });

  it("no hay marcas sin cerrar ni vacías", () => {
    TIPS.forEach(({ remitente, mensaje }) => {
      const sinMarcas = `${remitente} ${mensaje}`.replace(/\[\[(.+?)\]\]/g, "");
      expect(sinMarcas).not.toMatch(/\[\[|\]\]/);
    });
  });

  it("CANALES_TIPS: Todos primero y un canal por cada canal de TIPS", () => {
    expect(CANALES_TIPS.map((c) => c.filtro)).toEqual([
      "Todos",
      "SMS",
      "Llamadas",
      "Correo",
      "WhatsApp",
    ]);
    expect(CANALES_TIPS[0].id).toBeNull();
    expect(CANALES_TIPS.slice(1).map((c) => c.id)).toEqual(Object.keys(TIPO_POR_CANAL));
  });

  it("TEXTOS_TIPS arma los contadores", () => {
    expect(TEXTOS_TIPS.progreso(3, 8)).toBe("3 de 8 retos superados");
    expect(TEXTOS_TIPS.contadorTrampas(1, 3)).toBe("1 de 3 trampas");
  });
});
