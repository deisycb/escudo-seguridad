// Forma fijada por specs/003-rediseno-emergencia-agente/contracts/contenido-emergencias.md.
// PENDIENTE: mensajes del asistente, pasos de cada guía, texto del aviso, líneas bancarias y
// canales de denuncia los entrega el equipo. No se inventan pasos, números ni canales.
// PROVISIONAL: texto y destino de las 7 situaciones (spec 003, FR-013, aclaración del 2026-10-20).
// No se publica con contenido PENDIENTE ni PROVISIONAL.

/**
 * Textos fijos del asistente de emergencia.
 * Tono: calmado, sin culpa, frases cortas, tuteo colombiano.
 */
export const MENSAJES_ASISTENTE = {
  saludo:
    "Hola. Respira, esto le pasa a mucha gente y tiene solución. Vamos paso a paso: elige lo que te pasó.",

  cierreGuia:
    "Estos son los pasos más importantes. Hazlos en orden y sin afán. Si te pasó algo más, elige otra opción.",

  despedida:
    "Hiciste bien en actuar rápido. Guarda capturas y comprobantes, y recuerda: tu banco nunca te pedirá claves ni códigos. Cuídate.",

  introLineasBancarias:
    "Llama solo a la línea oficial de tu banco. Si no la ves aquí, búscala al respaldo de tu tarjeta o en la app oficial, nunca en un mensaje que te llegó.",

  introCanalesDenuncia:
    "Denunciar ayuda a que esto no le pase a otras personas. Puedes hacerlo por estos canales oficiales:",

  contenidoPendiente:
    "Todavía estamos preparando esta guía. Mientras tanto, llama a la línea oficial de tu banco o revisa cómo denunciar en Colombia.",
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
