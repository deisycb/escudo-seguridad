import { describe, expect, it } from "vitest";
import { escrituraConfigurada } from "../../src/logic/AsistenteIA.js";

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
