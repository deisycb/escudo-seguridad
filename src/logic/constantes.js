/** Número de preguntas del prediagnóstico (constitución III). */
export const TOTAL_PREGUNTAS = 14;

/** Letras de opción permitidas en cada pregunta. */
export const OPCIONES_VALIDAS = Object.freeze(["a", "b", "c"]);

/** Porcentaje desde el que el semáforo pasa a Medio. */
export const LIMITE_RIESGO_MEDIO = 40;

/** Porcentaje desde el que el semáforo pasa a Alto. */
export const LIMITE_RIESGO_ALTO = 70;

/** Etiquetas de los niveles del semáforo (FR-014). */
export const NIVELES_SEMAFORO = Object.freeze({ BAJO: "Bajo", MEDIO: "Medio", ALTO: "Alto" });

/** Dimensiones de riesgo con su rango inclusivo de números de pregunta (FR-008). */
export const DIMENSIONES = Object.freeze([
  Object.freeze({ id: "phishing", nombre: "Phishing", desde: 1, hasta: 4 }),
  Object.freeze({ id: "smishing", nombre: "Smishing", desde: 5, hasta: 8 }),
  Object.freeze({ id: "vishing", nombre: "Vishing", desde: 9, hasta: 12 }),
  Object.freeze({ id: "habitos", nombre: "Hábitos generales", desde: 13, hasta: 14 }),
]);

/** Prioridades según la criticidad de la opción elegida (FR-016, FR-017). */
export const PRIORIDADES = Object.freeze({
  urgente: Object.freeze({ etiqueta: "Urgente", orden: 3 }),
  importante: Object.freeze({ etiqueta: "Importante", orden: 2 }),
  revisa: Object.freeze({ etiqueta: "Revisa", orden: 1 }),
});

/** Clave única de localStorage (R2). */
export const CLAVE_ALMACENAMIENTO = "escudo.v1";

/** Versión del esquema guardado en localStorage. */
export const VERSION_ALMACENAMIENTO = 1;
