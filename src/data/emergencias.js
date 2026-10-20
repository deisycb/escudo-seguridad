// Forma fijada por specs/003-rediseno-emergencia-agente/contracts/contenido-emergencias.md.
// PENDIENTE: mensajes del asistente, pasos de cada guía, texto del aviso, líneas bancarias y
// canales de denuncia los entrega el equipo. No se inventan pasos, números ni canales.
// PROVISIONAL: texto y destino de las 7 situaciones (spec 003, FR-013, aclaración del 2026-10-20).
// No se publica con contenido PENDIENTE ni PROVISIONAL.

export const MENSAJES_ASISTENTE = {
  saludo: "", // PENDIENTE: lo entrega el equipo
  cierreGuia: "", // PENDIENTE: lo entrega el equipo
  despedida: "", // PENDIENTE: lo entrega el equipo
  introLineasBancarias: "", // PENDIENTE: lo entrega el equipo
  introCanalesDenuncia: "", // PENDIENTE: lo entrega el equipo
  contenidoPendiente: "", // PENDIENTE: lo entrega el equipo
};

export const SITUACIONES_EMERGENCIA = [
  {
    id: "tarjeta-banco",
    texto: "Problema con mi tarjeta o mi banco",
    guia: "tarjetas",
    provisional: true,
  },
  { id: "enlace-falso", texto: "Abrí un enlace falso", guia: "phishing", provisional: true },
  { id: "codigo-compartido", texto: "Compartí un código", guia: "whatsapp", provisional: true },
  { id: "whatsapp-perdido", texto: "Perdí mi WhatsApp", guia: "whatsapp", provisional: true },
  {
    id: "suplantacion",
    texto: "Se están haciendo pasar por mí",
    guia: "whatsapp",
    provisional: true,
  },
  {
    id: "pago-estafador",
    texto: "Le pagué o transferí a un estafador",
    guia: "tarjetas",
    provisional: true,
  },
  { id: "duda", texto: "Tengo una duda o no sé qué me pasó", guia: "phishing", provisional: true },
];

export const GUIAS_EMERGENCIA = [
  { id: "tarjetas", titulo: "Bloquear mis tarjetas", pasos: [] },
  { id: "whatsapp", titulo: "Reportar fraude en WhatsApp", pasos: [] },
  { id: "phishing", titulo: "Fui víctima de phishing", pasos: [] },
];

export const AVISO_NO_BORRES = {
  titulo: "No borres nada",
  texto: "",
};

export const LINEAS_BANCARIAS = [];

export const CANALES_DENUNCIA = [];
