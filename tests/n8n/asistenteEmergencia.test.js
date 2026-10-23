import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Protege la privacidad del flujo versionado (constitución I y IV; spec 005 R5 y R8).
const RUTA_FLUJO = new URL("../../n8n/asistente-emergencia.json", import.meta.url);
const TEXTO_FLUJO = readFileSync(RUTA_FLUJO, "utf8");
const FLUJO = JSON.parse(TEXTO_FLUJO);
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function nodosDeTipo(tipo) {
  return FLUJO.nodes.filter((nodo) => nodo.type === tipo);
}

function destinoDe(nombreNodo) {
  return FLUJO.connections[nombreNodo]?.main?.[0]?.[0]?.node;
}

describe("flujo de n8n: privacidad", () => {
  it("no guarda datos de ejecución", () => {
    expect(FLUJO.settings).toMatchObject({
      saveDataSuccessExecution: "none",
      saveDataErrorExecution: "none",
      saveManualExecutions: false,
      saveExecutionProgress: false,
    });
  });

  it("no tiene credenciales, datos fijados ni la URL de la instancia", () => {
    expect(FLUJO.nodes.some((nodo) => "credentials" in nodo)).toBe(false);
    expect(FLUJO.pinData ?? {}).toEqual({});
    expect(TEXTO_FLUJO).not.toContain(".n8n.cloud");
  });
});

describe("flujo de n8n: estructura", () => {
  const [webhook] = nodosDeTipo("n8n-nodes-base.webhook");

  it("recibe POST, responde con nodo y solo acepta el origen local", () => {
    expect(webhook.parameters).toMatchObject({
      httpMethod: "POST",
      responseMode: "responseNode",
      options: { allowedOrigins: "http://localhost:5173" },
    });
    expect(webhook.parameters.path).toMatch(FORMATO_UUID);
  });

  it("conecta Webhook → Code → Respond to Webhook", () => {
    const [codigo] = nodosDeTipo("n8n-nodes-base.code");
    const [respuesta] = nodosDeTipo("n8n-nodes-base.respondToWebhook");
    expect(nodosDeTipo("n8n-nodes-base.code")).toHaveLength(1);
    expect(nodosDeTipo("n8n-nodes-base.respondToWebhook")).toHaveLength(1);
    expect(destinoDe(webhook.name)).toBe(codigo.name);
    expect(destinoDe(codigo.name)).toBe(respuesta.name);
  });
});

// Ejecuta el código del nodo Code fuera de n8n, con $input y los datos estáticos simulados.
const FuncionAsincrona = Object.getPrototypeOf(async function () {}).constructor;
const [NODO_CODIGO] = nodosDeTipo("n8n-nodes-base.code");
const ejecutarCodigo = new FuncionAsincrona(
  "$input",
  "$getWorkflowStaticData",
  NODO_CODIGO.parameters.jsCode,
);
const INVALIDA = { estado: 400, cuerpo: { error: "peticion_invalida" } };

describe("flujo de n8n: código del eco", () => {
  let datosEstaticos;

  async function enviar(body) {
    const [item] = await ejecutarCodigo(
      { first: () => ({ json: { body } }) },
      () => datosEstaticos,
    );
    return item.json;
  }

  const persona = (texto) => ({ rol: "persona", texto });

  beforeEach(() => {
    datosEstaticos = {};
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("devuelve el eco del mensaje", async () => {
    expect(await enviar({ mensajes: [persona("hola")] })).toEqual({
      estado: 200,
      cuerpo: { respuesta: "Eco: hola" },
    });
  });

  it("hace eco del último mensaje de la persona", async () => {
    const mensajes = [
      persona("hola"),
      { rol: "asistente", texto: "Eco: hola" },
      persona("otra vez"),
    ];
    expect((await enviar({ mensajes })).cuerpo).toEqual({ respuesta: "Eco: otra vez" });
  });

  it.each([
    ["lista vacía", { mensajes: [] }],
    ["sin mensajes", {}],
    ["mensajes que no es lista", { mensajes: "hola" }],
    ["más de 20 elementos", { mensajes: Array.from({ length: 21 }, () => persona("hola")) }],
    ["campo extra", { mensajes: [persona("hola")], id: "abc" }],
    ["rol desconocido", { mensajes: [{ rol: "sistema", texto: "x" }] }],
    ["texto vacío", { mensajes: [persona("")] }],
    ["texto que no es texto", { mensajes: [persona(42)] }],
    ["texto de 4.001 caracteres", { mensajes: [persona("a".repeat(4001))] }],
    [
      "último mensaje del asistente",
      { mensajes: [persona("hola"), { rol: "asistente", texto: "x" }] },
    ],
    ["cuerpo nulo", null],
  ])("responde 400 con %s", async (_caso, body) => {
    expect(await enviar(body)).toEqual(INVALIDA);
  });

  it("responde 429 a partir de la petición 31 del mismo minuto", async () => {
    for (let i = 0; i < 30; i++) {
      expect((await enviar({ mensajes: [persona("hola")] })).estado).toBe(200);
    }
    expect(await enviar({ mensajes: [persona("hola")] })).toEqual({
      estado: 429,
      cuerpo: { error: "limite" },
    });
  });

  it("reinicia el límite cuando pasa un minuto", async () => {
    for (let i = 0; i < 31; i++) await enviar({ mensajes: [persona("hola")] });
    vi.advanceTimersByTime(60000);
    expect((await enviar({ mensajes: [persona("hola")] })).estado).toBe(200);
  });

  it("los datos estáticos solo guardan dos números, ni textos ni IPs", async () => {
    await enviar({ mensajes: [persona("me robaron el WhatsApp")] });
    await enviar({ mensajes: [] });
    expect(Object.keys(datosEstaticos).sort()).toEqual(["cantidad", "inicioVentana"]);
    expect(typeof datosEstaticos.cantidad).toBe("number");
    expect(typeof datosEstaticos.inicioVentana).toBe("number");
  });
});
