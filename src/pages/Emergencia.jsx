/*import { ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AccionesRapidas from "../components/AccionesRapidas.jsx";
import Dialogo from "../components/Dialogo.jsx";
import EscrituraIA from "../components/EscrituraIA.jsx";
import MensajeConversacion from "../components/MensajeConversacion.jsx";
import OpcionesConversacion from "../components/OpcionesConversacion.jsx";
import { BOTON_ENLACE, BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import { TARJETA, TEXTO_LECTURA, TITULO_PANTALLA } from "../components/estilos.js";
import {
  AVISO_NO_BORRES,
  CANALES_DENUNCIA,
  GUIAS_EMERGENCIA,
  LINEAS_BANCARIAS,
  MENSAJES_ASISTENTE,
  SITUACIONES_EMERGENCIA,
} from "../data/emergencias.js";
import { AsistenteIA, TEXTOS_IA, escrituraConfigurada } from "../logic/AsistenteIA.js";
import { ConversacionEmergencia, TEXTOS_ASISTENTE } from "../logic/ConversacionEmergencia.js";
import { detectarDatoSensible } from "../logic/FiltroDatosSensibles.js";

const CONTENIDO = {
  mensajes: MENSAJES_ASISTENTE,
  situaciones: SITUACIONES_EMERGENCIA,
  guias: GUIAS_EMERGENCIA,
  lineas: LINEAS_BANCARIAS,
  canales: CANALES_DENUNCIA,
};

// Sin webhook configurado no hay escritura: Emergencia abre en las guías (spec 004 R1).
const URL_ASISTENTE_IA = import.meta.env.VITE_URL_ASISTENTE_IA;
const ASISTENTE_IA = escrituraConfigurada(URL_ASISTENTE_IA)
  ? new AsistenteIA({ url: URL_ASISTENTE_IA })
  : null;

/** Escritura con conexión; si no, las guías, que funcionan sin internet (spec 004 R6). */
/*function iniciarConversacion() {
  if (ASISTENTE_IA && navigator.onLine) return ConversacionEmergencia.iniciarEscritura(CONTENIDO);
  return ConversacionEmergencia.iniciar(CONTENIDO);
}

function PresentacionAsistente() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primario">
        <ShieldCheck size={24} strokeWidth={2} aria-hidden="true" className="text-white" />
      </span>
      <div>
        <p className="font-bold text-texto">Asistente de emergencias</p>
        <p className="text-sm font-medium text-texto-secundario">
          Nunca te pediré claves, códigos ni datos de tu tarjeta
        </p>
      </div>
    </div>
  );
}

function AvisoNoBorres() {
  return (
    <aside className={`${TARJETA} flex gap-3`}>
      <FileText size={24} strokeWidth={2} aria-hidden="true" className="shrink-0 text-peligro" />
      <div>
        <h2 className="font-bold text-texto">{AVISO_NO_BORRES.titulo}</h2>
        <p className={TEXTO_LECTURA}>{AVISO_NO_BORRES.texto}</p>
      </div>
    </aside>
  );
}

const CONFIRMACIONES = {
  salir: { titulo: TEXTOS_ASISTENTE.confirmarSalirTitulo, accion: TEXTOS_ASISTENTE.confirmarSalir },
  reiniciar: {
    titulo: TEXTOS_ASISTENTE.confirmarReiniciarTitulo,
    accion: TEXTOS_ASISTENTE.empezarDeNuevo,
  },
};

/**
 * Confirmación de salida (FR-041) o de "Empezar de nuevo" (FR-018). Un solo diálogo para ambas;
 * "Seguir aquí" es la opción segura.
 */
/*function DialogoConfirmacion({ confirmacion, onSeguir, onConfirmar }) {
  const textos = CONFIRMACIONES[confirmacion?.tipo ?? "salir"];
  const refSeguir = useRef(null);
  return (
    <Dialogo
      abierto={confirmacion !== null}
      titulo={textos.titulo}
      refFocoInicial={refSeguir}
      onCerrar={onSeguir}
      acciones={
        <>
          <button type="button" ref={refSeguir} className={BOTON_PRINCIPAL} onClick={onSeguir}>
            {TEXTOS_ASISTENTE.seguirAqui}
          </button>
          <button type="button" className={BOTON_SECUNDARIO} onClick={onConfirmar}>
            {textos.accion}
          </button>
        </>
      }
    >
      <p>{TEXTOS_ASISTENTE.confirmarTexto}</p>
    </Dialogo>
  );
}

function quiereMenosMovimiento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Deja a la vista las opciones nuevas; si el mensaje nuevo es largo, prioriza su comienzo.
 * El margen de desplazamiento de `final` descuenta las acciones fijas y la barra inferior.
 */
/*function desplazarALoNuevo(final, ultimoMensaje) {
  const behavior = quiereMenosMovimiento() ? "auto" : "smooth";
  final?.scrollIntoView({ block: "end", behavior });
  if (ultimoMensaje && ultimoMensaje.getBoundingClientRect().top < 0) {
    ultimoMensaje.scrollIntoView({ block: "start", behavior });
  }
}

/**
 * Pantalla de Emergencia: conversación guiada solo con botones (spec 003). La conversación vive
 * solo en este estado: no se guarda ni sale del dispositivo, y se descarta al salir.
 */
/*export default function Emergencia({
  hayDiagnostico,
  navegar,
  registrarInterceptorAtras,
  onVolverAlInicio,
}) {
  const [conversacion, setConversacion] = useState(iniciarConversacion);
  const [confirmacion, setConfirmacion] = useState(null);
  // El consentimiento vale solo en esta visita: nunca se guarda (spec 004 FR-005).
  const [consentimientoIA, setConsentimientoIA] = useState(false);
  // Con webhook pero sin conexión al abrir, se avisa por qué se muestran las guías (FR-003).
  const [sinConexionAlAbrir] = useState(() => Boolean(ASISTENTE_IA) && !navigator.onLine);
  const sePuedeVolverAEscribir =
    Boolean(ASISTENTE_IA) && navigator.onLine && !conversacion.admiteEscritura();
  const refCampo = useRef(null);
  const mensajes = conversacion.obtenerMensajes();
  const idUltimoAsistente = mensajes.findLast((m) => m.autor === "asistente")?.id;
  const refPrimeraOpcion = useRef(null);
  const refUltimoAsistente = useRef(null);
  const refFinal = useRef(null);
  const refConversacionMostrada = useRef(conversacion);

  // Tras cada cambio: mostrar lo nuevo y llevar el foco a la siguiente acción útil (R5, R6).
  // Al entrar no se toca (el foco ya va al <h1> desde useNavegacion); comparar la instancia
  // evita moverlo cuando StrictMode repite el efecto.
  useEffect(() => {
    if (refConversacionMostrada.current === conversacion) return;
    refConversacionMostrada.current = conversacion;
    desplazarALoNuevo(refFinal.current, refUltimoAsistente.current);
    const destino = refPrimeraOpcion.current ?? refCampo.current ?? refUltimoAsistente.current;
    destino?.focus({ preventScroll: true });
  }, [conversacion]);

  useEffect(() => {
    if (consentimientoIA) refCampo.current?.focus();
  }, [consentimientoIA]);

  /**
   * Envía lo escrito al asistente de IA (spec 004). Doble guarda: sin consentimiento o con un
   * dato sensible no sale nada (constitución I y II).
   * @returns {boolean} Si el mensaje se envió.
   */
  /*function enviarMensaje(texto) {
    if (!consentimientoIA || detectarDatoSensible(texto)) return false;
    const conMensaje = conversacion.agregarMensajeEscrito(texto);
    if (conMensaje === conversacion) return false;
    setConversacion(conMensaje);
    ASISTENTE_IA.responder(conMensaje.obtenerIntercambioIA()).then((resultado) => {
      setConversacion((actual) =>
        resultado.ok
          ? actual.agregarRespuestaIA(resultado.texto)
          : actual.agregarFalloIA(resultado.motivo),
      );
    });
    return true;
  }

  // Una sola guarda para "atrás", la barra inferior y "Volver al inicio" (research R7).
  /*function interceptarSalida(destino) {
    // Ir a Emergencia estando en Emergencia no es salir: se ignora y la conversación sigue.
    if (destino.pantalla === "emergencia") return true;
    if (!conversacion.tieneProgreso()) return false;
    setConfirmacion({ tipo: "salir", destino });
    return true;
  }

  useEffect(() => registrarInterceptorAtras(interceptarSalida));

  function confirmar() {
    const { tipo, destino } = confirmacion;
    setConfirmacion(null);
    if (tipo === "salir") navegar(destino);
    else setConversacion((actual) => actual.reiniciar());
  }

  function empezarDeNuevo() {
    if (conversacion.tieneProgreso()) setConfirmacion({ tipo: "reiniciar" });
  }

  function volverAlInicio() {
    if (!interceptarSalida({ pantalla: "inicio" })) onVolverAlInicio();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Respira. Vamos paso a paso.
      </h1>
      <PresentacionAsistente />
      <AvisoNoBorres />
      {sinConexionAlAbrir && (
        <p role="status" className={TEXTO_LECTURA}>
          {TEXTOS_IA.sinConexion}
        </p>
      )}
      <ol
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
        className="flex flex-col gap-3"
      >
        {mensajes.map((mensaje) => (
          <MensajeConversacion
            key={mensaje.id}
            mensaje={mensaje}
            ref={mensaje.id === idUltimoAsistente ? refUltimoAsistente : undefined}
          />
        ))}
      </ol>
      <OpcionesConversacion
        ref={refPrimeraOpcion}
        opciones={conversacion.obtenerOpciones()}
        onElegir={(id) => setConversacion((actual) => actual.elegir(id))}
      />
      {sePuedeVolverAEscribir && (
        <button
          type="button"
          className={`${BOTON_ENLACE} self-start`}
          onClick={() => setConversacion((actual) => actual.volverAEscribir())}
        >
          {TEXTOS_IA.volverAEscribir}
        </button>
      )}
      {conversacion.admiteEscritura() && (
        <EscrituraIA
          consentimiento={consentimientoIA}
          esperando={conversacion.estaEsperandoIA()}
          onAceptar={() => setConsentimientoIA(true)}
          onVerGuias={() => setConversacion((actual) => actual.abrirGuias())}
          onEnviar={enviarMensaje}
          refCampo={refCampo}
        />
      )}
      <div
        ref={refFinal}
        aria-hidden="true"
        className={hayDiagnostico ? "scroll-mb-40" : "scroll-mb-24"}
      />
      {!hayDiagnostico && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={volverAlInicio}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          Volver al inicio
        </button>
      )}
      <AccionesRapidas
        hayBarra={hayDiagnostico}
        onLlamarBanco={() => setConversacion((actual) => actual.mostrarLineasBancarias())}
        onComoDenunciar={() => setConversacion((actual) => actual.mostrarCanalesDenuncia())}
        onEmpezarDeNuevo={empezarDeNuevo}
      />
      <DialogoConfirmacion
        confirmacion={confirmacion}
        onSeguir={() => setConfirmacion(null)}
        onConfirmar={confirmar}
      />
    </div>
  );
}
*/

import { useState } from "react";
import { useEscudoChat } from "../hooks/useChatEmergencia.js";
import { BOTON_ENLACE } from "../components/botones.js";

export default function ChatEscudo({ onVolver }) {
  const { mensajes, cargando, error, enviar } = useEscudoChat();
  const [texto, setTexto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    enviar(texto);
    setTexto("");
  };

  return (
    <div>
      <button type="button" className={BOTON_ENLACE} onClick={onVolver}>
        Volver al inicio
      </button>
      <div>
        {mensajes.map((m) => (
          <p key={m.id} className={m.rol}>
            {m.texto}
          </p>
        ))}
        {cargando && <p className="bot">Escribiendo...</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={cargando}
        />
        <button type="submit" disabled={cargando || !texto.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}