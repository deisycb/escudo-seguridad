// PROVISIONAL: borrador para poder probar el asistente; pendiente de redactar y aprobar por el
// equipo (spec 004 FR-004, Ley 1581 de 2012).
// Debe explicar en lenguaje sencillo:
// - que los mensajes se procesan en n8n y en un proveedor de IA externo, posiblemente fuera de Colombia;
// - que no se guardan;
// - que se usan solo para orientar a la persona sobre este incidente;
// - que puede usar las guías en su lugar.
export const CONSENTIMIENTO_IA = {
  titulo: "Antes de escribirle al asistente",
  parrafos: [
    "Lo que escribas aquí se envía a un servicio llamado n8n y a un proveedor de inteligencia artificial externo, que puede estar fuera de Colombia.",
    "Tus mensajes no se guardan. Se usan solo para orientarte sobre lo que te pasó ahora.",
    "No escribas claves, códigos, números de tarjeta ni de cuenta. Si prefieres no usar el asistente, puedes seguir las guías de esta pantalla.",
  ],
};
