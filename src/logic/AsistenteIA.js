/** Espera máxima por una respuesta del asistente de IA (spec 004 FR-010). */
export const TIEMPO_ESPERA_MS = 20000;
export const MAXIMO_CARACTERES_MENSAJE = 1000;
export const MAXIMO_CARACTERES_RESPUESTA = 4000;
export const MAXIMO_MENSAJES_ENVIADOS = 20;

/** Textos de interfaz de la escritura libre (spec 004 y sus contratos). */
export const TEXTOS_IA = {
  invitacion: "Cuéntame con tus palabras qué te pasó",
  avisoSensibles:
    "No escribas contraseñas, números de tarjeta o de cuenta, ni códigos de verificación",
  aceptar: "Acepto y quiero escribir",
  rechazar: "No, prefiero ver las guías",
  enviar: "Enviar",
  irAGuias: "No puedo o no quiero escribir: ver guías",
  volverAEscribir: "Prefiero escribirlo",
  etiquetaIA: "Respuesta generada por IA",
  noReemplaza: "No reemplaza a tu banco ni a las autoridades",
  respondiendo: "El asistente está respondiendo…",
  sinConexion: "No tienes conexión. Te muestro las guías, que funcionan sin internet.",
  bloqueoTarjeta:
    "Parece que escribiste un número de tarjeta o de cuenta. Por tu seguridad no lo envío: bórralo y vuelve a intentarlo.",
  bloqueoCodigo:
    "Parece que escribiste un código de verificación. Nunca lo compartas con nadie, ni siquiera conmigo: bórralo.",
  sugerenciaCodigo: "Si es un monto o una fecha, escríbelo así: '500 mil', '20 de octubre'.",
  falloGeneral:
    "No pude responderte en este momento. Mientras tanto, estas guías te pueden ayudar.",
  falloLimite: "Recibí muchos mensajes seguidos. Espera un momento o mira las guías.",
  verGuias: "Ver guías",
};

const ORIGENES_LOCALES = ["http://localhost", "http://127.0.0.1"];

/**
 * La escritura solo se ofrece con un webhook HTTPS (constitución IV); en desarrollo se acepta
 * un webhook local.
 * @param {string | undefined} url Valor de VITE_URL_ASISTENTE_IA.
 * @returns {boolean} Si la escritura está disponible.
 */
export function escrituraConfigurada(url) {
  if (typeof url !== "string") return false;
  return url.startsWith("https://") || ORIGENES_LOCALES.some((origen) => url.startsWith(origen));
}
