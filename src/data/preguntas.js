// Textos de preguntas y opciones: entregados por el equipo (spec, "Banco de preguntas", 2026-10-16).
// PROVISIONAL (spec, "Puntajes provisionales"): puntajes y criticidades mock iguales para todas
// las preguntas (a = 0 / null, b = 1 / importante, c = 2 / urgente) hasta que el equipo los defina.
// PROVISIONAL: descripcionHabito redactada como borrador, pendiente de validar por el equipo.
export const PREGUNTAS = [
  {
    numero: 1,
    dimension: "phishing",
    texto:
      "¿Usas la misma contraseña para tu correo y para otras cuentas (redes sociales, bancos, tiendas en línea)?",
    descripcionHabito: "Repites la contraseña de tu correo en otras cuentas",
    opciones: {
      a: { texto: "No, cada cuenta tiene una contraseña distinta", puntaje: 0, criticidad: null },
      b: { texto: "En algunas cuentas sí la repito", puntaje: 1, criticidad: "importante" },
      c: { texto: "Sí, uso la misma en casi todo", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 2,
    dimension: "phishing",
    texto: "¿Tienes activada la verificación en dos pasos en tu correo electrónico?",
    descripcionHabito: "Tu correo no tiene verificación en dos pasos",
    opciones: {
      a: { texto: "Sí, está activada", puntaje: 0, criticidad: null },
      b: { texto: "No", puntaje: 1, criticidad: "importante" },
      c: { texto: "No sé qué es", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 3,
    dimension: "phishing",
    texto: "¿Cuándo fue la última vez que cambiaste la contraseña de tu correo?",
    descripcionHabito: "Hace mucho no cambias la contraseña de tu correo",
    opciones: {
      a: { texto: "Hace menos de 6 meses", puntaje: 0, criticidad: null },
      b: { texto: "Entre 6 meses y 2 años", puntaje: 1, criticidad: "importante" },
      c: { texto: "Hace más de 2 años o nunca", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 4,
    dimension: "phishing",
    texto:
      'Si recibes un correo de tu banco o de una entidad pidiéndote "actualizar tus datos" o "verificar tu cuenta", ¿qué haces?',
    descripcionHabito: "Abres o respondes correos que piden actualizar tus datos",
    opciones: {
      a: {
        texto: "Lo reporto o lo borro, y si tengo dudas entro yo mismo a la app o página oficial",
        puntaje: 0,
        criticidad: null,
      },
      b: { texto: "Lo abro para ver qué dice", puntaje: 1, criticidad: "importante" },
      c: {
        texto: "Hago clic en el enlace y actualizo mis datos",
        puntaje: 2,
        criticidad: "urgente",
      },
    },
  },
  {
    numero: 5,
    dimension: "smishing",
    texto:
      "Cuando te llega un SMS o WhatsApp con un enlace de un número desconocido, ¿qué haces normalmente?",
    descripcionHabito: "Abres enlaces de mensajes de números desconocidos",
    opciones: {
      a: { texto: "Lo borro o lo reporto sin abrirlo", puntaje: 0, criticidad: null },
      b: {
        texto: "Lo abro si parece de una empresa conocida",
        puntaje: 1,
        criticidad: "importante",
      },
      c: { texto: "Lo abro para ver de qué se trata", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 6,
    dimension: "smishing",
    texto:
      "¿Has compartido alguna vez un código de verificación de 6 dígitos que te llegó por SMS porque alguien te lo pidió?",
    descripcionHabito: "Has compartido códigos de verificación que te llegan por SMS",
    opciones: {
      a: { texto: "Nunca", puntaje: 0, criticidad: null },
      b: { texto: "No lo recuerdo", puntaje: 1, criticidad: "importante" },
      c: { texto: "Sí", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 7,
    dimension: "smishing",
    texto: "¿Tienes activada la verificación en dos pasos (PIN) dentro de WhatsApp?",
    descripcionHabito: "Tu WhatsApp no tiene verificación en dos pasos",
    opciones: {
      a: { texto: "Sí", puntaje: 0, criticidad: null },
      b: { texto: "No", puntaje: 1, criticidad: "importante" },
      c: { texto: "No sé", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 8,
    dimension: "smishing",
    texto: 'Si has recibido mensajes como "tu paquete está retenido, paga aquí", ¿qué hiciste?',
    descripcionHabito: "Has interactuado con mensajes falsos de paquetes retenidos",
    opciones: {
      a: { texto: "Nunca he recibido uno, o no hice clic", puntaje: 0, criticidad: null },
      b: { texto: "Hice clic, pero no pagué ni di datos", puntaje: 1, criticidad: "importante" },
      c: { texto: "Pagué o ingresé mis datos", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 9,
    dimension: "vishing",
    texto:
      "Cuando recibes llamadas de números desconocidos que se cuelgan sin decir nada, ¿qué haces?",
    descripcionHabito: "Respondes o devuelves llamadas de números desconocidos",
    opciones: {
      a: { texto: "Las ignoro o bloqueo el número", puntaje: 0, criticidad: null },
      b: { texto: 'Contesto y digo "aló" o "sí"', puntaje: 1, criticidad: "importante" },
      c: { texto: "Devuelvo la llamada", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 10,
    dimension: "vishing",
    texto:
      "Si alguien te llama diciendo ser de tu banco y te pide confirmar tu clave, número de tarjeta o código de seguridad, ¿qué haces?",
    descripcionHabito: "Das datos bancarios cuando te llaman",
    opciones: {
      a: { texto: "Cuelgo y llamo yo a la línea oficial del banco", puntaje: 0, criticidad: null },
      b: { texto: "Doy algunos datos, pero no la clave", puntaje: 1, criticidad: "importante" },
      c: {
        texto: "Doy lo que me piden para resolver el problema",
        puntaje: 2,
        criticidad: "urgente",
      },
    },
  },
  {
    numero: 11,
    dimension: "vishing",
    texto: "¿Sabías que tu banco nunca te pedirá contraseñas ni códigos de seguridad por teléfono?",
    descripcionHabito: "No tienes claro que el banco nunca pide claves por teléfono",
    opciones: {
      a: { texto: "Sí, lo sabía", puntaje: 0, criticidad: null },
      b: { texto: "No estaba seguro", puntaje: 1, criticidad: "importante" },
      c: { texto: "Creía que sí pueden pedirlos", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 12,
    dimension: "vishing",
    texto:
      "Ante una llamada sospechosa, ¿cuelgas y llamas tú mismo a la línea oficial de la entidad para confirmar?",
    descripcionHabito: "No confirmas las llamadas sospechosas con la línea oficial",
    opciones: {
      a: { texto: "Siempre", puntaje: 0, criticidad: null },
      b: { texto: "A veces", puntaje: 1, criticidad: "importante" },
      c: { texto: "Nunca", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 13,
    dimension: "habitos",
    texto:
      "¿Publicas en redes sociales información personal como tu celular, dirección, fecha de nacimiento o lugar de trabajo?",
    descripcionHabito: "Publicas datos personales en redes sociales",
    opciones: {
      a: { texto: "No", puntaje: 0, criticidad: null },
      b: { texto: "Algunos de esos datos", puntaje: 1, criticidad: "importante" },
      c: { texto: "Sí, varios de ellos", puntaje: 2, criticidad: "urgente" },
    },
  },
  {
    numero: 14,
    dimension: "habitos",
    texto: "Si sospecharas que fuiste víctima de una estafa digital, ¿sabrías a quién acudir?",
    descripcionHabito: "No sabes a quién acudir si te estafan",
    opciones: {
      a: { texto: "Sí, sé exactamente qué hacer", puntaje: 0, criticidad: null },
      b: { texto: "Tengo una idea general", puntaje: 1, criticidad: "importante" },
      c: { texto: "No sabría a quién acudir", puntaje: 2, criticidad: "urgente" },
    },
  },
];
