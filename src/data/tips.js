// Regla de oro, canales, tipos de ataque y títulos fijados por la spec (FR-025, FR-026).
// PENDIENTE: comoReconocerla y queHacer los entrega el equipo.
export const REGLA_DE_ORO =
  "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo";

export const TIPS = [
  {
    id: "sms-paquete",
    canal: "sms",
    tipoAtaque: "Smishing",
    titulo: "Tu paquete está retenido",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "sms-premio",
    canal: "sms",
    tipoAtaque: "Smishing",
    titulo: "Descuento o premio en tu plan de celular",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "llamada-banco",
    canal: "llamada",
    tipoAtaque: "Vishing",
    titulo: "Le hablamos del banco por un movimiento sospechoso",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "llamada-tecnico",
    canal: "llamada",
    tipoAtaque: "Vishing",
    titulo: "Falso técnico o asesor de tu operador",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "correo-suspension",
    canal: "correo",
    tipoAtaque: "Phishing",
    titulo: "Tu cuenta será suspendida",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "correo-factura",
    canal: "correo",
    tipoAtaque: "Phishing",
    titulo: "Factura o recibo que no esperabas",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "whatsapp-numero",
    canal: "whatsapp",
    tipoAtaque: "Suplantación",
    titulo: "Cambié de número, necesito un favor",
    comoReconocerla: "",
    queHacer: "",
  },
  {
    id: "whatsapp-codigo",
    canal: "whatsapp",
    tipoAtaque: "Suplantación",
    titulo: "Te piden el código de 6 dígitos",
    comoReconocerla: "",
    queHacer: "",
  },
];
