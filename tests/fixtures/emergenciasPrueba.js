// CONTENIDO SINTÉTICO SOLO PARA PRUEBAS.
// No es el contenido real de Escudo y nunca se importa desde src/.

const MENSAJES = {
  saludo: "Saludo de prueba. ¿Qué te pasó?",
  cierreGuia: "Cierre de guía de prueba.",
  despedida: "Despedida de prueba.",
  introLineasBancarias: "Introducción de bancos de prueba.",
  introCanalesDenuncia: "Introducción de denuncia de prueba.",
  contenidoPendiente: "Contenido pendiente de prueba.",
};

const SITUACIONES = [
  { id: "tarjeta-banco", texto: "Situación tarjeta", guia: "tres-pasos" },
  { id: "enlace-falso", texto: "Situación enlace", guia: "tres-pasos" },
  { id: "codigo-compartido", texto: "Situación código", guia: "tres-pasos" },
  { id: "whatsapp-perdido", texto: "Situación WhatsApp", guia: "un-paso" },
  { id: "suplantacion", texto: "Situación suplantación", guia: "vacia" },
  { id: "pago-estafador", texto: "Situación pago", guia: "tres-pasos" },
  {
    id: "duda",
    texto: "Situación duda",
    seguimiento: {
      pregunta: "Pregunta de seguimiento de prueba",
      respuestas: [
        { id: "respuesta-a", texto: "Respuesta A", guia: "tres-pasos" },
        { id: "respuesta-b", texto: "Respuesta B", guia: "un-paso" },
      ],
    },
  },
];

const GUIAS = [
  { id: "tres-pasos", titulo: "Guía de tres pasos", pasos: ["Paso uno", "Paso dos", "Paso tres"] },
  { id: "un-paso", titulo: "Guía de un paso", pasos: ["Único paso"] },
  { id: "vacia", titulo: "Guía sin pasos", pasos: [] },
];

const LINEAS = [
  { banco: "Banco Uno", numero: "601 000 0001" },
  { banco: "Banco Dos", numero: "#000" },
];

const CANALES = [
  { entidad: "Entidad Uno", contacto: "Contacto uno", enlace: "https://ejemplo.org" },
  { entidad: "Entidad Dos", contacto: "Contacto dos" },
];

export const contenidoEmergenciasPrueba = {
  mensajes: MENSAJES,
  situaciones: SITUACIONES,
  guias: GUIAS,
  lineas: LINEAS,
  canales: CANALES,
};

export const contenidoEmergenciasVacio = {
  mensajes: Object.fromEntries(Object.keys(MENSAJES).map((clave) => [clave, ""])),
  situaciones: SITUACIONES,
  guias: GUIAS,
  lineas: [],
  canales: [],
};
