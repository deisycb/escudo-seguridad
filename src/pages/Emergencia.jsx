import { ChevronLeft, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Dialogo from "../components/Dialogo.jsx";
import MensajeConversacion from "../components/MensajeConversacion.jsx";
import OpcionesConversacion from "../components/OpcionesConversacion.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import { TARJETA, TEXTO_LECTURA, TITULO_PANTALLA } from "../components/estilos.js";
import {
  AVISO_NO_BORRES,
  CANALES_DENUNCIA,
  GUIAS_EMERGENCIA,
  LINEAS_BANCARIAS,
  MENSAJES_ASISTENTE,
  SITUACIONES_EMERGENCIA,
} from "../data/emergencias.js";
import { ConversacionEmergencia, TEXTOS_ASISTENTE } from "../logic/ConversacionEmergencia.js";

const CONTENIDO = {
  mensajes: MENSAJES_ASISTENTE,
  situaciones: SITUACIONES_EMERGENCIA,
  guias: GUIAS_EMERGENCIA,
  lineas: LINEAS_BANCARIAS,
  canales: CANALES_DENUNCIA,
};

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

/** Confirmación de salida (spec 003, FR-031). "Seguir aquí" es la opción segura. */
function DialogoConfirmacion({ confirmacion, onSeguir, onConfirmar }) {
  return (
    <Dialogo
      abierto={confirmacion !== null}
      titulo={TEXTOS_ASISTENTE.confirmarSalirTitulo}
      onCerrar={onSeguir}
      acciones={
        <>
          <button type="button" className={BOTON_PRINCIPAL} onClick={onSeguir}>
            {TEXTOS_ASISTENTE.seguirAqui}
          </button>
          <button type="button" className={BOTON_SECUNDARIO} onClick={onConfirmar}>
            {TEXTOS_ASISTENTE.confirmarSalir}
          </button>
        </>
      }
    >
      <p>{TEXTOS_ASISTENTE.confirmarTexto}</p>
    </Dialogo>
  );
}

/**
 * Pantalla de Emergencia: conversación guiada solo con botones (spec 003). La conversación vive
 * solo en este estado: no se guarda ni sale del dispositivo, y se descarta al salir.
 */
export default function Emergencia({
  hayDiagnostico,
  navegar,
  registrarInterceptorAtras,
  onVolverAlInicio,
}) {
  const [conversacion, setConversacion] = useState(() => ConversacionEmergencia.iniciar(CONTENIDO));
  const [confirmacion, setConfirmacion] = useState(null);

  // Una sola guarda para "atrás", la barra inferior y "Volver al inicio" (research R7).
  function interceptarSalida(destino) {
    // Ir a Emergencia estando en Emergencia no es salir: se ignora y la conversación sigue.
    if (destino.pantalla === "emergencia") return true;
    if (!conversacion.tieneProgreso()) return false;
    setConfirmacion({ tipo: "salir", destino });
    return true;
  }

  useEffect(() => registrarInterceptorAtras(interceptarSalida));

  function confirmarSalida() {
    const { destino } = confirmacion;
    setConfirmacion(null);
    navegar(destino);
  }

  function volverAlInicio() {
    if (!interceptarSalida({ pantalla: "inicio" })) onVolverAlInicio();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Respira. Vamos paso a paso.
      </h1>
      <PresentacionAsistente />
      <AvisoNoBorres />
      <ol className="flex flex-col gap-3">
        {conversacion.obtenerMensajes().map((mensaje) => (
          <MensajeConversacion key={mensaje.id} mensaje={mensaje} />
        ))}
      </ol>
      <OpcionesConversacion
        opciones={conversacion.obtenerOpciones()}
        onElegir={(id) => setConversacion((actual) => actual.elegir(id))}
      />
      {!hayDiagnostico && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={volverAlInicio}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          Volver al inicio
        </button>
      )}
      <DialogoConfirmacion
        confirmacion={confirmacion}
        onSeguir={() => setConfirmacion(null)}
        onConfirmar={confirmarSalida}
      />
    </div>
  );
}
