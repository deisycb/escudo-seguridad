import { describe, expect, it } from "vitest";
import { detectarDatoSensible } from "../../src/logic/FiltroDatosSensibles.js";

const TARJETAS = [
  "mi tarjeta 4111 1111 1111 1111",
  "4111-1111-1111-1111",
  "4111111111111111",
  "cuenta 0123456789012",
  "1234567890123456789",
];

const CODIGOS = ["me llegó el 482913", "código 1234", "me robaron 500000", "12345678"];

const PERMITIDOS = [
  "me robaron 500.000",
  "me robaron 500 mil",
  "mi celular 3001234567",
  "el 20 de octubre",
  "123",
  "12345678901234567890",
  "",
];

describe("detectarDatoSensible", () => {
  TARJETAS.forEach((texto) =>
    it(`bloquea como tarjeta o cuenta: "${texto}"`, () => {
      expect(detectarDatoSensible(texto)).toMatchObject({ tipo: "tarjeta" });
    }),
  );

  CODIGOS.forEach((texto) =>
    it(`bloquea como código: "${texto}"`, () => {
      expect(detectarDatoSensible(texto)).toMatchObject({ tipo: "codigo" });
    }),
  );

  PERMITIDOS.forEach((texto) =>
    it(`deja pasar: "${texto}"`, () => {
      expect(detectarDatoSensible(texto)).toBeNull();
    }),
  );

  it("con tarjeta y código en el mismo texto, la tarjeta va primero", () => {
    expect(detectarDatoSensible("código 482913 y tarjeta 4111111111111111")).toMatchObject({
      tipo: "tarjeta",
    });
  });

  it("devuelve el fragmento y su posición para resaltarlo", () => {
    const texto = "me llegó el 482913 por SMS";
    const resultado = detectarDatoSensible(texto);
    expect(resultado).toEqual({ tipo: "codigo", fragmento: "482913", inicio: 12, fin: 18 });
    expect(texto.slice(resultado.inicio, resultado.fin)).toBe(resultado.fragmento);
  });

  it("el fragmento de una tarjeta incluye sus separadores", () => {
    const resultado = detectarDatoSensible("es la 4111 1111 1111 1111, ayuda");
    expect(resultado.fragmento).toBe("4111 1111 1111 1111");
  });
});
