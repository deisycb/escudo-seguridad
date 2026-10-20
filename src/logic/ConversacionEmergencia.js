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

const PREFIJO_SITUACION = "situacion:";
const PREFIJO_RESPUESTA = "respuesta:";

const ETAPA = {
  SITUACIONES: "situaciones",
  SEGUIMIENTO: "seguimiento",
  PASO: "paso",
  CIERRE: "cierre",
  CIERRE_TRAS_DENUNCIA: "cierreTrasDenuncia",
  TERMINADA: "terminada",
  // Escritura libre con el asistente de IA (spec 004).
  ESCRITURA: "escritura",
  ESPERANDO_IA: "esperandoIA",
  FALLO_IA: "falloIA",
};

/** Con qué empieza la conversación; "Empezar de nuevo" vuelve a ese modo (spec 004 R5). */
const MODO = { GUIAS: "guias", ESCRITURA: "escritura" };

const OPCION_SIGUIENTE = { id: "siguiente", texto: TEXTOS_ASISTENTE.siguiente };
const OPCION_DENUNCIAR = { id: "denunciar", texto: TEXTOS_ASISTENTE.denunciar };
const OPCION_OTRA_COSA = { id: "otraCosa", texto: TEXTOS_ASISTENTE.otraCosa };
const OPCION_TERMINAR = { id: "terminar", texto: TEXTOS_ASISTENTE.terminar };
const OPCIONES_CIERRE = [OPCION_DENUNCIAR, OPCION_OTRA_COSA, OPCION_TERMINAR];
const OPCIONES_TRAS_DENUNCIA = [OPCION_OTRA_COSA, OPCION_TERMINAR];

function eleccion(texto) {
  return { autor: "persona", tipo: "eleccion", texto };
}

function pasosDe(guia) {
  return (guia?.pasos ?? []).filter(esTextoNoVacio);
}

/**
 * Conversación de Emergencia: las guías del asistente guiado (spec 003) y la escritura libre con
 * el asistente de IA (spec 004) en una sola línea de mensajes. Es inmutable: cada acción devuelve
 * una conversación nueva, o la misma si la acción no aplica. Vive solo en memoria.
 */
export class ConversacionEmergencia {
  #contenido;
  #mensajes;
  #opciones;
  #posicion;
  #modoInicial;

  /**
   * Usar {@link ConversacionEmergencia.iniciar}; el constructor es para uso interno.
   * @param {object} contenido { mensajes, situaciones, guias, lineas, canales }.
   * @param {object[]} mensajes Historial con ids ya asignados.
   * @param {{ id: string, texto: string }[]} opciones Opciones pendientes.
   * @param {{ etapa: string, situacionId?: string, guiaId?: string, numero?: number }} posicion
   * @param {string} [modoInicial="guias"] "guias" o "escritura".
   */
  constructor(contenido, mensajes, opciones, posicion, modoInicial = MODO.GUIAS) {
    this.#contenido = contenido;
    this.#mensajes = mensajes;
    this.#opciones = opciones;
    this.#posicion = posicion;
    this.#modoInicial = modoInicial;
  }

  /**
   * @param {object} contenido { mensajes, situaciones, guias, lineas, canales } de emergencias.js.
   * @returns {ConversacionEmergencia} Conversación con el saludo y las 7 situaciones.
   */
  static iniciar(contenido) {
    return new ConversacionEmergencia(contenido, [], [], { etapa: ETAPA.SITUACIONES }).#conSaludo(
      [],
    );
  }

  /**
   * Conversación que empieza en la escritura libre, sin mensajes (spec 004 FR-001).
   * @param {object} contenido { mensajes, situaciones, guias, lineas, canales } de emergencias.js.
   * @returns {ConversacionEmergencia}
   */
  static iniciarEscritura(contenido) {
    return new ConversacionEmergencia(
      contenido,
      [],
      [],
      { etapa: ETAPA.ESCRITURA },
      MODO.ESCRITURA,
    );
  }

  /**
   * Abre las guías dentro de la misma conversación, sin borrar nada (spec 004 FR-014, FR-021).
   * @returns {ConversacionEmergencia} Con el saludo y las 7 situaciones como opciones.
   */
  abrirGuias() {
    return this.#conSaludo([]);
  }

  /**
   * Vuelve a la escritura libre desde las guías, sin borrar nada (spec 004 FR-014).
   * @returns {ConversacionEmergencia}
   */
  volverAEscribir() {
    return this.#continuar([], [], { etapa: ETAPA.ESCRITURA });
  }

  /** @returns {boolean} Si se espera la respuesta del asistente de IA. */
  estaEsperandoIA() {
    return this.#posicion.etapa === ETAPA.ESPERANDO_IA;
  }

  /**
   * @param {string} idOpcion Id de una opción pendiente.
   * @returns {ConversacionEmergencia} Conversación nueva, o esta misma si el id no está pendiente.
   */
  elegir(idOpcion) {
    const opcion = this.#opciones.find((o) => o.id === idOpcion);
    if (!opcion) return this;
    const previos = [eleccion(opcion.texto)];
    if (idOpcion.startsWith(PREFIJO_SITUACION)) {
      return this.#elegirSituacion(idOpcion.slice(PREFIJO_SITUACION.length), previos);
    }
    if (idOpcion.startsWith(PREFIJO_RESPUESTA)) {
      return this.#elegirRespuesta(idOpcion.slice(PREFIJO_RESPUESTA.length), previos);
    }
    return this.#elegirAccionFija(idOpcion, previos);
  }

  /** @returns {object[]} Copia del historial de mensajes, en orden. */
  obtenerMensajes() {
    return this.#mensajes.map((mensaje) => ({ ...mensaje }));
  }

  /** @returns {{ id: string, texto: string }[]} Copia de las opciones pendientes. */
  obtenerOpciones() {
    return this.#opciones.map((opcion) => ({ ...opcion }));
  }

  /** @returns {boolean} Si la persona terminó con "Eso es todo, gracias". */
  estaTerminada() {
    return this.#posicion.etapa === ETAPA.TERMINADA;
  }

  /** @returns {boolean} Si hay algún mensaje de la persona (decide las confirmaciones). */
  tieneProgreso() {
    return this.#mensajes.some((mensaje) => mensaje.autor === "persona");
  }

  /**
   * Acción rápida "Llamar a la línea de mi banco": muestra las líneas sin perder el paso
   * (spec 003, FR-015 y FR-017).
   * @returns {ConversacionEmergencia} Conversación nueva con las mismas opciones pendientes.
   */
  mostrarLineasBancarias() {
    return this.#mostrarSinMoverse(TEXTOS_ASISTENTE.llamarBanco, this.#mensajeLineas());
  }

  /**
   * Acción rápida "Cómo denunciar en Colombia" (spec 003, FR-016 y FR-017).
   * @returns {ConversacionEmergencia} Conversación nueva con las mismas opciones pendientes.
   */
  mostrarCanalesDenuncia() {
    return this.#mostrarSinMoverse(TEXTOS_ASISTENTE.comoDenunciar, this.#mensajeCanales());
  }

  /**
   * "Empezar de nuevo" (la confirmación es de la pantalla, spec 003 FR-018).
   * @returns {ConversacionEmergencia} Conversación nueva en su modo inicial: solo el saludo (guías) o vacía (escritura).
   */
  reiniciar() {
    if (this.#modoInicial === MODO.ESCRITURA) {
      return ConversacionEmergencia.iniciarEscritura(this.#contenido);
    }
    return ConversacionEmergencia.iniciar(this.#contenido);
  }

  #mostrarSinMoverse(textoAccion, mensaje) {
    return this.#continuar([eleccion(textoAccion), mensaje], this.#opciones, this.#posicion);
  }

  #elegirSituacion(id, previos) {
    const situacion = this.#contenido.situaciones.find((s) => s.id === id);
    if (!situacion.seguimiento) return this.#iniciarGuia(situacion.guia, previos);
    const { pregunta, respuestas } = situacion.seguimiento;
    return this.#continuar(
      [...previos, this.#mensajeTexto(pregunta)],
      respuestas.map((r) => ({ id: `${PREFIJO_RESPUESTA}${r.id}`, texto: r.texto })),
      { etapa: ETAPA.SEGUIMIENTO, situacionId: id },
    );
  }

  #elegirRespuesta(id, previos) {
    const situacion = this.#contenido.situaciones.find((s) => s.id === this.#posicion.situacionId);
    const respuesta = situacion.seguimiento.respuestas.find((r) => r.id === id);
    return this.#iniciarGuia(respuesta.guia, previos);
  }

  #elegirAccionFija(id, previos) {
    const { mensajes } = this.#contenido;
    switch (id) {
      case OPCION_SIGUIENTE.id:
        return this.#avanzarPaso(previos);
      case OPCION_DENUNCIAR.id:
        return this.#continuar([...previos, this.#mensajeCanales()], OPCIONES_TRAS_DENUNCIA, {
          etapa: ETAPA.CIERRE_TRAS_DENUNCIA,
        });
      case OPCION_OTRA_COSA.id:
        return this.#conSaludo(previos);
      default:
        return this.#continuar([...previos, this.#mensajeTexto(mensajes.despedida)], [], {
          etapa: ETAPA.TERMINADA,
        });
    }
  }

  #iniciarGuia(guiaId, previos) {
    if (pasosDe(this.#buscarGuia(guiaId)).length === 0) {
      return this.#conCierre([...previos, this.#mensajeTexto("")]);
    }
    return this.#conPaso(guiaId, 1, previos);
  }

  #avanzarPaso(previos) {
    const { guiaId, numero } = this.#posicion;
    if (numero < pasosDe(this.#buscarGuia(guiaId)).length) {
      return this.#conPaso(guiaId, numero + 1, previos);
    }
    return this.#conCierre([...previos, this.#mensajeTexto(this.#contenido.mensajes.cierreGuia)]);
  }

  #conPaso(guiaId, numero, previos) {
    const pasos = pasosDe(this.#buscarGuia(guiaId));
    const paso = {
      autor: "asistente",
      tipo: "paso",
      texto: pasos[numero - 1],
      numero,
      total: pasos.length,
    };
    return this.#continuar([...previos, paso], [OPCION_SIGUIENTE], {
      etapa: ETAPA.PASO,
      guiaId,
      numero,
    });
  }

  #conCierre(nuevos) {
    return this.#continuar(nuevos, OPCIONES_CIERRE, { etapa: ETAPA.CIERRE });
  }

  #conSaludo(previos) {
    const opciones = this.#contenido.situaciones.map((s) => ({
      id: `${PREFIJO_SITUACION}${s.id}`,
      texto: s.texto,
    }));
    return this.#continuar(
      [...previos, this.#mensajeTexto(this.#contenido.mensajes.saludo)],
      opciones,
      {
        etapa: ETAPA.SITUACIONES,
      },
    );
  }

  #buscarGuia(id) {
    return this.#contenido.guias.find((g) => g.id === id);
  }

  /** Un texto vacío nunca se muestra: se cambia por el aviso de contenido pendiente. */
  #textoOPendiente(texto) {
    if (esTextoNoVacio(texto)) return texto;
    const { contenidoPendiente } = this.#contenido.mensajes;
    return esTextoNoVacio(contenidoPendiente)
      ? contenidoPendiente
      : TEXTOS_ASISTENTE.respaldoPendiente;
  }

  #mensajeTexto(texto) {
    return { autor: "asistente", tipo: "texto", texto: this.#textoOPendiente(texto) };
  }

  #mensajeCanales() {
    const { canales, mensajes } = this.#contenido;
    return this.#mensajeLista("canalesDenuncia", { canales }, mensajes.introCanalesDenuncia);
  }

  #mensajeLineas() {
    const { lineas, mensajes } = this.#contenido;
    return this.#mensajeLista("lineasBancarias", { lineas }, mensajes.introLineasBancarias);
  }

  /** Lista de líneas o canales; sin elementos, el aviso de pendiente (nunca una lista vacía). */
  #mensajeLista(tipo, lista, introduccion) {
    if (Object.values(lista)[0].length === 0) return this.#mensajeTexto("");
    const texto = esTextoNoVacio(introduccion) ? introduccion : null;
    return { autor: "asistente", tipo, texto, ...lista };
  }

  /** Agrega mensajes (con ids nuevos) y devuelve la conversación con la nueva posición. */
  #continuar(nuevos, opciones, posicion) {
    const ultimoId = this.#mensajes.at(-1)?.id ?? 0;
    const conIds = nuevos.map((mensaje, i) => ({ id: ultimoId + i + 1, ...mensaje }));
    return new ConversacionEmergencia(
      this.#contenido,
      [...this.#mensajes, ...conIds],
      opciones,
      posicion,
      this.#modoInicial,
    );
  }
}
