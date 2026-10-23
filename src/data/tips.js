// Regla de oro, canales, tipos de ataque y títulos fijados por la spec (FR-025, FR-026).
// PROVISIONAL: comoReconocerla y queHacer son un borrador para poder probar; pendientes de validar
// por el equipo (constitución III).
export const REGLA_DE_ORO =
  "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo";

export const TIPS = [
  {
    id: "sms-paquete",
    canal: "sms",
    tipoAtaque: "Smishing",
    titulo: "Tu paquete está retenido",
    comoReconocerla: [
      "Te llega un SMS de una empresa de envíos que no esperabas.",
      "Te pide pagar un valor pequeño o confirmar datos en un enlace.",
      "El enlace no es la página oficial de la empresa.",
    ],
    queHacer: [
      "No abras el enlace.",
      "Revisa el estado del envío solo en la página o app oficial de la empresa.",
      "Borra el mensaje después de tomarle captura.",
    ],
  },
  {
    id: "sms-premio",
    canal: "sms",
    tipoAtaque: "Smishing",
    titulo: "Descuento o premio en tu plan de celular",
    comoReconocerla: [
      "Te dicen que ganaste un premio o un descuento sin haber participado.",
      "Te piden datos, una clave o un pago para reclamarlo.",
      "Te apuran con que la oferta vence hoy.",
    ],
    queHacer: [
      "No respondas ni abras el enlace.",
      "Si tienes duda, llama a la línea oficial de tu operador.",
      "Bloquea el número.",
    ],
  },
  {
    id: "llamada-banco",
    canal: "llamada",
    tipoAtaque: "Vishing",
    titulo: "Le hablamos del banco por un movimiento sospechoso",
    comoReconocerla: [
      "Te llaman a avisar de una compra o un movimiento que no hiciste.",
      "Te piden claves, el código que te llegó por SMS o el número completo de tu tarjeta.",
      "Te presionan para actuar rápido.",
    ],
    queHacer: [
      "Cuelga sin dar ningún dato.",
      "Llama tú a la línea oficial que está al respaldo de tu tarjeta o en la app.",
      "Revisa tus movimientos desde la app oficial.",
    ],
  },
  {
    id: "llamada-tecnico",
    canal: "llamada",
    tipoAtaque: "Vishing",
    titulo: "Falso técnico o asesor de tu operador",
    comoReconocerla: [
      "Te llama alguien que dice ser técnico o asesor de tu operador.",
      "Te pide instalar una app, darle un código o reenviar un mensaje.",
      "Te ofrece un beneficio o te amenaza con cortar el servicio.",
    ],
    queHacer: [
      "No instales nada que te pidan por teléfono.",
      "Cuelga y llama tú a la línea oficial de tu operador.",
      "Nunca compartas códigos que te lleguen por SMS.",
    ],
  },
  {
    id: "correo-suspension",
    canal: "correo",
    tipoAtaque: "Phishing",
    titulo: "Tu cuenta será suspendida",
    comoReconocerla: [
      "El correo dice que tu cuenta será bloqueada o suspendida.",
      "El remitente tiene una dirección rara o con errores.",
      "Te pide entrar por un enlace y poner tu clave.",
    ],
    queHacer: [
      "No abras el enlace.",
      "Entra a tu cuenta escribiendo tú la dirección oficial o desde la app.",
      "Marca el correo como phishing o correo no deseado.",
    ],
  },
  {
    id: "correo-factura",
    canal: "correo",
    tipoAtaque: "Phishing",
    titulo: "Factura o recibo que no esperabas",
    comoReconocerla: [
      "Te llega una factura o recibo de algo que no compraste.",
      "Trae un archivo adjunto o un enlace para ver el detalle.",
      "El correo genera urgencia para que pagues o reclames.",
    ],
    queHacer: [
      "No abras el adjunto ni el enlace.",
      "Verifica en la página oficial de la empresa si de verdad tienes esa deuda.",
      "Borra el correo y bloquea al remitente.",
    ],
  },
  {
    id: "whatsapp-numero",
    canal: "whatsapp",
    tipoAtaque: "Suplantación",
    titulo: "Cambié de número, necesito un favor",
    comoReconocerla: [
      "Un número desconocido dice ser un familiar o amigo que cambió de número.",
      "Al poco tiempo te pide dinero o un favor urgente.",
      "Evita llamadas y solo quiere escribir.",
    ],
    queHacer: [
      "No envíes dinero.",
      "Llama al número de siempre de esa persona para confirmar.",
      "Bloquea y reporta el número en WhatsApp.",
    ],
  },
  {
    id: "whatsapp-codigo",
    canal: "whatsapp",
    tipoAtaque: "Suplantación",
    titulo: "Te piden el código de 6 dígitos",
    comoReconocerla: [
      "Alguien te pide el código de 6 dígitos que te llegó por SMS.",
      "Dice que te lo envió por error o que es para un concurso.",
      "Puede escribirte desde el número de un conocido.",
    ],
    queHacer: [
      "Nunca compartas ese código: con él te roban la cuenta.",
      "Activa la verificación en dos pasos en WhatsApp.",
      "Avisa a tus contactos si crees que te robaron la cuenta.",
    ],
  },
];
