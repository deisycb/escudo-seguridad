/** Ids de las 7 situaciones, en el orden fijo de la spec 003 (FR-007). */
export const IDS_SITUACIONES = [
  "tarjeta-banco",
  "enlace-falso",
  "codigo-compartido",
  "whatsapp-perdido",
  "suplantacion",
  "pago-estafador",
  "duda",
];

/** Textos de interfaz fijados por la spec 003; el resto sale de emergencias.js. */
export const TEXTOS_ASISTENTE = {
  siguiente: "Listo, ¿qué sigue?",
  denunciar: "Ver cómo denunciar en Colombia",
  otraCosa: "Me pasó otra cosa",
  terminar: "Eso es todo, gracias",
  llamarBanco: "Llamar a la línea de mi banco",
  comoDenunciar: "Cómo denunciar en Colombia",
  empezarDeNuevo: "Empezar de nuevo",
  masAyuda: "Más ayuda",
  confirmarSalirTitulo: "¿Salir del asistente?",
  confirmarReiniciarTitulo: "¿Empezar de nuevo?",
  confirmarTexto: "Perderás el paso en que vas.",
  confirmarSalir: "Salir",
  seguirAqui: "Seguir aquí",
  respaldoPendiente:
    "Esta parte de la guía aún no está lista. Usa los botones de abajo para llamar a tu banco o ver cómo denunciar.",
};

const MINIMO_RESPUESTAS = 2;

function esTextoNoVacio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function buscarRepetidos(ids) {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

function validarIdsSituaciones(situaciones, errores) {
  const ids = situaciones.map((s) => s.id);
  if (ids.join() !== IDS_SITUACIONES.join()) {
    errores.push(
      `Las situaciones deben ser exactamente ${IDS_SITUACIONES.join(", ")}, en ese orden.`,
    );
  }
}

function validarGuiaReferida(idGuia, donde, idsGuias, errores) {
  if (!idsGuias.includes(idGuia)) errores.push(`${donde}: la guía "${idGuia}" no existe.`);
}

function validarSeguimiento({ id, seguimiento }, idsGuias, errores) {
  if (!esTextoNoVacio(seguimiento.pregunta)) errores.push(`Situación "${id}": pregunta vacía.`);
  const respuestas = seguimiento.respuestas ?? [];
  if (respuestas.length < MINIMO_RESPUESTAS) {
    errores.push(`Situación "${id}": necesita al menos ${MINIMO_RESPUESTAS} respuestas.`);
  }
  buscarRepetidos(respuestas.map((r) => r.id)).forEach((repetido) =>
    errores.push(`Situación "${id}": respuesta "${repetido}" repetida.`),
  );
  respuestas.forEach((r) => {
    if (!esTextoNoVacio(r.texto)) errores.push(`Respuesta "${r.id}": texto vacío.`);
    validarGuiaReferida(r.guia, `Respuesta "${r.id}"`, idsGuias, errores);
  });
}

function validarSituacion(situacion, idsGuias, errores) {
  const { id, texto, guia, seguimiento } = situacion;
  if (!esTextoNoVacio(texto)) errores.push(`Situación "${id}": texto vacío.`);
  if (Boolean(guia) === Boolean(seguimiento)) {
    errores.push(`Situación "${id}": debe tener "guia" o "seguimiento", no ambos ni ninguno.`);
    return;
  }
  if (guia) validarGuiaReferida(guia, `Situación "${id}"`, idsGuias, errores);
  else validarSeguimiento(situacion, idsGuias, errores);
}

function guiasReferidas(situaciones) {
  return situaciones.flatMap((s) =>
    s.seguimiento ? (s.seguimiento.respuestas ?? []).map((r) => r.guia) : [s.guia],
  );
}

function buscarPendientes({ mensajes, situaciones, guias, lineas, canales }) {
  const pendientes = Object.entries(mensajes)
    .filter(([, texto]) => !esTextoNoVacio(texto))
    .map(([clave]) => `Mensaje "${clave}" vacío.`);
  const referidas = new Set(guiasReferidas(situaciones));
  guias
    .filter((g) => referidas.has(g.id) && !(g.pasos ?? []).some(esTextoNoVacio))
    .forEach((g) => pendientes.push(`Guía "${g.id}" sin pasos.`));
  situaciones
    .filter((s) => s.provisional)
    .forEach((s) => pendientes.push(`Situación "${s.id}" provisional.`));
  if (lineas.length === 0) pendientes.push("No hay líneas bancarias.");
  if (canales.length === 0) pendientes.push("No hay canales de denuncia.");
  return pendientes;
}

/**
 * Revisa el contenido de emergencias contra contracts/contenido-emergencias.md.
 * Los errores rompen la conversación; los pendientes impiden publicar (spec 003, FR-013).
 * @param {{ mensajes: object, situaciones: object[], guias: object[], lineas: object[],
 *   canales: object[] }} contenido
 * @returns {{ errores: string[], pendientes: string[] }}
 */
export function validarContenidoEmergencias(contenido) {
  const { situaciones, guias } = contenido;
  const errores = [];
  const idsGuias = guias.map((g) => g.id);
  buscarRepetidos(idsGuias).forEach((id) => errores.push(`Guía "${id}" repetida.`));
  validarIdsSituaciones(situaciones, errores);
  situaciones.forEach((s) => validarSituacion(s, idsGuias, errores));
  return { errores, pendientes: buscarPendientes(contenido) };
}
