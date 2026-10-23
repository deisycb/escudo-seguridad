import { Phone } from "lucide-react";
import { TEXTOS_IA } from "../logic/AsistenteIA.js";
import { CHIP } from "./estilos.js";

const BURBUJA_ASISTENTE =
  "max-w-[88%] self-start rounded-tarjeta border border-borde bg-fondo p-4 text-base leading-normal text-texto";
const BURBUJA_PERSONA =
  "max-w-[80%] self-end rounded-tarjeta bg-primario p-4 text-base leading-normal font-semibold text-white";

/** El número siempre se ve: en un computador sin llamadas se marca a mano (R10 de la 001). */
function LineasBancarias({ lineas }) {
  return (
    <ul className="mt-3 flex flex-col divide-y divide-borde self-stretch">
      {lineas.map(({ banco, numero }) => (
        <li key={banco}>
          <a
            href={`tel:${encodeURIComponent(numero)}`}
            className="flex min-h-11 flex-wrap items-center justify-between gap-2 py-2"
          >
            <span className="font-semibold">{banco}</span>
            <span className="flex items-center gap-2 font-bold text-primario underline">
              <Phone size={20} strokeWidth={2} aria-hidden="true" />
              {numero}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function CanalesDenuncia({ canales }) {
  return (
    <ul className="mt-3 flex flex-col divide-y divide-borde self-stretch">
      {canales.map(({ entidad, contacto, enlace }) => (
        <li key={entidad} className="py-2">
          <p className="font-semibold">{entidad}</p>
          <p className="text-texto-secundario">{contacto}</p>
          {enlace && (
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-primario underline"
            >
              Ir al sitio oficial (se abre en otra pestaña)
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Respuesta de la IA: siempre texto plano y marcada como generada por IA (spec 004 FR-011). */
function RespuestaIA({ texto }) {
  return (
    <>
      <span className={`${CHIP} mb-2 bg-pista text-texto-secundario`}>{TEXTOS_IA.etiquetaIA}</span>
      <p className="whitespace-pre-line">{texto}</p>
      <p className="mt-2 text-xs text-texto-suave">{TEXTOS_IA.noReemplaza}</p>
    </>
  );
}

function ContenidoAsistente({ mensaje }) {
  if (mensaje.tipo === "respuestaIA") return <RespuestaIA texto={mensaje.texto} />;
  return (
    <>
      {mensaje.tipo === "paso" && (
        <span className={`${CHIP} mb-2 bg-pista text-texto-secundario`}>
          Paso {mensaje.numero} de {mensaje.total}
        </span>
      )}
      {mensaje.texto && <p>{mensaje.texto}</p>}
      {mensaje.tipo === "lineasBancarias" && <LineasBancarias lineas={mensaje.lineas} />}
      {mensaje.tipo === "canalesDenuncia" && <CanalesDenuncia canales={mensaje.canales} />}
    </>
  );
}

/**
 * Un mensaje de la conversación de emergencia (spec 003, FR-019 y FR-021): el asistente a la
 * izquierda (blanco con borde) y la persona a la derecha (primario con texto blanco).
 * @param {{ mensaje: { autor: string, tipo: string, texto?: string }, ref?: object }} props
 */
export default function MensajeConversacion({ mensaje, ref }) {
  if (mensaje.autor === "persona") {
    return (
      <li className={BURBUJA_PERSONA}>
        <span className="sr-only">
          {mensaje.tipo === "escrito" ? "Tú escribiste: " : "Tú elegiste: "}
        </span>
        {mensaje.texto}
      </li>
    );
  }
  return (
    <li
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      className={`${BURBUJA_ASISTENTE} flex flex-col items-start`}
    >
      <span className="sr-only">El asistente dice: </span>
      <ContenidoAsistente mensaje={mensaje} />
    </li>
  );
}
