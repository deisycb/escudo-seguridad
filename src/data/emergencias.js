// Forma fijada por specs/003-rediseno-emergencia-agente/contracts/contenido-emergencias.md.
// PROVISIONAL: pasos de cada guía, texto del aviso, líneas bancarias y canales de denuncia son un
// borrador para poder probar; pendientes de validar por el equipo. VERIFICAR cada número y enlace
// en el sitio oficial de la entidad antes de publicar.
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
  {
    id: "tarjetas",
    titulo: "Bloquear mis tarjetas",
    pasos: [
      "Bloquea tu tarjeta ya desde la app oficial de tu banco o llamando a su línea oficial.",
      "Si no tienes la app a mano, usa el número que está al respaldo de tu tarjeta.",
      "Pide que revisen tus últimos movimientos y reporta los que no reconozcas.",
      "Si hiciste una transferencia a un estafador, dile al banco cuándo fue, el valor y la cuenta de destino.",
      "Pide un número de radicado y guárdalo.",
      "Cambia las claves de tu app y de tu banca en línea.",
    ],
  },
  {
    id: "whatsapp",
    titulo: "Reportar fraude en WhatsApp",
    pasos: [
      "Nunca compartas el código de 6 dígitos que te llega por SMS, ni siquiera con conocidos.",
      "Si perdiste tu cuenta, abre WhatsApp, pon tu número de nuevo y espera el código que te llega por SMS.",
      "Activa la verificación en dos pasos en Ajustes, Cuenta.",
      "Avisa a tus contactos por otro medio que no respondan mensajes ni envíen dinero en tu nombre.",
      "Reporta y bloquea el número que te estafó desde el chat.",
      "Si te están suplantando, escribe a soporte desde Ajustes, Ayuda, en la app oficial.",
    ],
  },
  {
    id: "phishing",
    titulo: "Fui víctima de phishing",
    pasos: [
      "No escribas nada más en la página o el mensaje sospechoso y ciérralo.",
      "Desde la app o el sitio oficial, no desde el enlace, cambia la clave de la cuenta afectada.",
      "Si usas esa clave en otras cuentas, cámbiala también allí.",
      "Si pusiste datos de tu tarjeta o tu banco, llama a la línea oficial de tu banco y bloquéala.",
      "Activa la verificación en dos pasos en tu correo y tus redes sociales.",
      "Guarda capturas del mensaje y del enlace para tu denuncia.",
    ],
  },
];

export const AVISO_NO_BORRES = {
  titulo: "No borres nada",
  texto:
    "Guarda los mensajes, correos, capturas de pantalla, números y comprobantes de pago. Son la prueba que necesitas para denunciar el delito, según la Ley 1273 de 2009.",
};

export const LINEAS_BANCARIAS = [
  { banco: "Bancolombia", numero: "01 8000 912 345" },
  { banco: "Davivienda", numero: "01 8000 123 838" },
];

export const CANALES_DENUNCIA = [
  {
    entidad: "Policía Nacional – CAI Virtual",
    contacto: "Reporta en línea llamadas, mensajes, correos o páginas falsas.",
    enlace: "https://caivirtual.policia.gov.co",
  },
  {
    entidad: "A Denunciar (Policía y Fiscalía)",
    contacto: "Pon la denuncia formal en la categoría de delitos informáticos.",
    enlace: "https://adenunciar.policia.gov.co",
  },
  {
    entidad: "Superintendencia Financiera",
    contacto: "Queja si tu banco no te atiende el fraude como debe.",
    enlace: "https://www.superfinanciera.gov.co",
  },
  {
    entidad: "Superintendencia de Industria y Comercio",
    contacto: "Reporta si están usando tus datos personales sin permiso.",
    enlace: "https://www.sic.gov.co",
  },
];
