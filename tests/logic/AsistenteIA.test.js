import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AsistenteIA,
  MAXIMO_MENSAJES_ENVIADOS,
  TIEMPO_ESPERA_MS,
  escrituraConfigurada,
} from "../../src/logic/AsistenteIA.js";

describe("escrituraConfigurada", () => {
  it("acepta un webhook HTTPS y uno local de desarrollo", () => {
    expect(escrituraConfigurada("https://ejemplo.n8n.cloud/webhook/abc")).toBe(true);
    expect(escrituraConfigurada("http://localhost:8787")).toBe(true);
    expect(escrituraConfigurada("http://127.0.0.1:8787")).toBe(true);
  });

  it("rechaza la ausencia de URL y los webhooks sin HTTPS", () => {
    expect(escrituraConfigurada(undefined)).toBe(false);
    expect(escrituraConfigurada("")).toBe(false);
    expect(escrituraConfigurada("http://ejemplo.com/webhook")).toBe(false);
    expect(escrituraConfigurada("ftp://ejemplo.com")).toBe(false);
  });
});

const URL = "https://ejemplo.n8n.cloud/webhook/abc";
const INTERCAMBIO = [{ rol: "persona", texto: "me robaron el WhatsApp" }];

function respuestaJson(estado, cuerpo) {
  return Promise.resolve({
    ok: estado >= 200 && estado < 300,
    status: estado,
    json: () => (cuerpo instanceof Error ? Promise.reject(cuerpo) : Promise.resolve(cuerpo)),
  });
}

function crear(fetchFalso) {
  return new AsistenteIA({ url: URL, fetch: fetchFalso });
}

describe("AsistenteIA.responder", () => {
  afterEach(() => vi.useRealTimers());

  it("envía solo { mensajes } por POST, sin credenciales ni referrer", async () => {
    const fetchFalso = vi.fn(() => respuestaJson(200, { respuesta: "hola" }));
    await crear(fetchFalso).responder(INTERCAMBIO);
    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toBe(URL);
    expect(opciones).toMatchObject({
      method: "POST",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": "application/json" },
    });
    expect(JSON.parse(opciones.body)).toEqual({ mensajes: INTERCAMBIO });
  });

  it(`envía solo los últimos ${MAXIMO_MENSAJES_ENVIADOS} mensajes`, async () => {
    const largo = Array.from({ length: 25 }, (_, i) => ({ rol: "persona", texto: `m${i}` }));
    const fetchFalso = vi.fn(() => respuestaJson(200, { respuesta: "ok" }));
    await crear(fetchFalso).responder(largo);
    const { mensajes } = JSON.parse(fetchFalso.mock.calls[0][1].body);
    expect(mensajes).toEqual(largo.slice(-MAXIMO_MENSAJES_ENVIADOS));
  });

  it("una respuesta válida devuelve el texto", async () => {
    const resultado = await crear(() => respuestaJson(200, { respuesta: "hola" })).responder(
      INTERCAMBIO,
    );
    expect(resultado).toEqual({ ok: true, texto: "hola" });
  });

  const INVALIDAS = [
    ["vacía", { respuesta: "  " }],
    ["muy larga", { respuesta: "x".repeat(4001) }],
    ["sin el campo", { otra: "cosa" }],
    ["con un tipo raro", { respuesta: 42 }],
    ["con JSON inválido", new Error("JSON")],
  ];
  INVALIDAS.forEach(([nombre, cuerpo]) =>
    it(`una respuesta ${nombre} da motivo "invalida"`, async () => {
      const resultado = await crear(() => respuestaJson(200, cuerpo)).responder(INTERCAMBIO);
      expect(resultado).toEqual({ ok: false, motivo: "invalida" });
    }),
  );

  it('429 da "limite", 500 y fallos de red dan "red"', async () => {
    expect(await crear(() => respuestaJson(429, {})).responder(INTERCAMBIO)).toEqual({
      ok: false,
      motivo: "limite",
    });
    expect(await crear(() => respuestaJson(500, {})).responder(INTERCAMBIO)).toEqual({
      ok: false,
      motivo: "red",
    });
    const sinRed = () => Promise.reject(new TypeError("Failed to fetch"));
    expect(await crear(sinRed).responder(INTERCAMBIO)).toEqual({ ok: false, motivo: "red" });
  });

  it(`pasados ${TIEMPO_ESPERA_MS / 1000} s da "tiempo" y cancela la petición`, async () => {
    vi.useFakeTimers();
    let senal;
    const colgado = (_url, { signal }) => {
      senal = signal;
      return new Promise((_resolver, rechazar) =>
        signal.addEventListener("abort", () => rechazar(new DOMException("abort", "AbortError"))),
      );
    };
    const promesa = crear(colgado).responder(INTERCAMBIO);
    await vi.advanceTimersByTimeAsync(TIEMPO_ESPERA_MS);
    expect(await promesa).toEqual({ ok: false, motivo: "tiempo" });
    expect(senal.aborted).toBe(true);
  });
});
