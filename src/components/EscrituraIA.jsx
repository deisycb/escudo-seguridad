import { ChevronRight, Lock } from "lucide-react";
import { useId, useState } from "react";
import { CONSENTIMIENTO_IA } from "../data/asistenteIA.js";
import { MAXIMO_CARACTERES_MENSAJE, TEXTOS_IA } from "../logic/AsistenteIA.js";
import { detectarDatoSensible } from "../logic/FiltroDatosSensibles.js";
import { BOTON_ENLACE, BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "./botones.js";
import { TARJETA, TEXTO_LECTURA, TITULO_SECCION } from "./estilos.js";

const AVISO_CONTADOR = 100;
const CONTEXTO_RESALTADO = 30;
const CAMPO =
  "w-full rounded-boton border border-borde bg-fondo p-3 text-base leading-normal text-texto focus-visible:outline-2 focus-visible:outline-primario";

/** Consentimiento propio del asistente de IA (constitución II, spec 004 FR-004). */
function ConsentimientoIA({ onAceptar, onVerGuias }) {
  const { titulo, parrafos } = CONSENTIMIENTO_IA;
  return (
    <section className={`${TARJETA} flex flex-col gap-3`}>
      {/* PENDIENTE: sin el texto aprobado por el equipo no se publica con la escritura activa. */}
      <h2 className={TITULO_SECCION}>{titulo || "Antes de escribir"}</h2>
      {parrafos.length > 0 ? (
        parrafos.map((parrafo) => (
          <p key={parrafo} className={TEXTO_LECTURA}>
            {parrafo}
          </p>
        ))
      ) : (
        <p className={TEXTO_LECTURA}>Texto del consentimiento pendiente de aprobación.</p>
      )}
      <button type="button" className={BOTON_PRINCIPAL} onClick={onAceptar}>
        {TEXTOS_IA.aceptar}
      </button>
      <button type="button" className={BOTON_SECUNDARIO} onClick={onVerGuias}>
        {TEXTOS_IA.rechazar}
      </button>
    </section>
  );
}

/** Explica por qué no se envía y resalta el número detectado (spec 004 FR-008). */
function ExplicacionBloqueo({ id, texto, bloqueo }) {
  const antes = texto.slice(Math.max(0, bloqueo.inicio - CONTEXTO_RESALTADO), bloqueo.inicio);
  const despues = texto.slice(bloqueo.fin, bloqueo.fin + CONTEXTO_RESALTADO);
  const esCodigo = bloqueo.tipo === "codigo";
  return (
    <div id={id} role="alert" className="flex flex-col gap-1 text-sm text-texto">
      <p className="font-semibold">
        {esCodigo ? TEXTOS_IA.bloqueoCodigo : TEXTOS_IA.bloqueoTarjeta}
      </p>
      <p className="text-texto-secundario">
        …{antes}
        <mark className="rounded-etiqueta bg-advertencia-suave px-1 text-advertencia-texto">
          {bloqueo.fragmento}
        </mark>
        {despues}…
      </p>
      {esCodigo && <p className="text-texto-secundario">{TEXTOS_IA.sugerenciaCodigo}</p>}
    </div>
  );
}

function FormularioEscritura({ esperando, onEnviar, refCampo }) {
  const [borrador, setBorrador] = useState("");
  const [bloqueo, setBloqueo] = useState(null);
  const ids = { campo: useId(), aviso: useId(), bloqueo: useId() };
  const restantes = MAXIMO_CARACTERES_MENSAJE - borrador.length;
  const sinTexto = borrador.trim().length === 0;

  function enviar(evento) {
    evento.preventDefault();
    if (sinTexto || esperando) return;
    // Primera guarda contra datos sensibles; la pantalla vuelve a revisar antes de enviar.
    const detectado = detectarDatoSensible(borrador);
    setBloqueo(detectado);
    if (detectado) {
      refCampo.current?.focus();
      return;
    }
    if (onEnviar(borrador)) setBorrador("");
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={enviar} noValidate>
      <label htmlFor={ids.campo} className="font-bold text-texto">
        {TEXTOS_IA.invitacion}
      </label>
      <p id={ids.aviso} className="flex items-start gap-2 text-sm text-texto-secundario">
        <Lock size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
        {TEXTOS_IA.avisoSensibles}
      </p>
      <textarea
        id={ids.campo}
        ref={refCampo}
        rows={3}
        maxLength={MAXIMO_CARACTERES_MENSAJE}
        value={borrador}
        aria-describedby={bloqueo ? `${ids.aviso} ${ids.bloqueo}` : ids.aviso}
        aria-invalid={bloqueo ? true : undefined}
        className={CAMPO}
        onChange={(evento) => {
          setBorrador(evento.target.value);
          setBloqueo(null);
        }}
      />
      {restantes <= AVISO_CONTADOR && (
        <p aria-live="polite" className="text-xs text-texto-suave">
          Te quedan {restantes} caracteres
        </p>
      )}
      {bloqueo && <ExplicacionBloqueo id={ids.bloqueo} texto={borrador} bloqueo={bloqueo} />}
      <button type="submit" className={BOTON_PRINCIPAL} disabled={sinTexto || esperando}>
        {TEXTOS_IA.enviar}
        <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
      </button>
    </form>
  );
}

/**
 * Escritura libre con el asistente de IA (spec 004): primero el consentimiento y luego el campo
 * de texto con su aviso. Nada de esto se guarda.
 * @param {{ consentimiento: boolean, esperando: boolean, onAceptar: () => void,
 *   onVerGuias: () => void, onEnviar: (texto: string) => boolean, refCampo: object }} props
 *   `onEnviar` devuelve si el mensaje se envió, para vaciar el campo.
 */
export default function EscrituraIA({
  consentimiento,
  esperando,
  onAceptar,
  onVerGuias,
  onEnviar,
  refCampo,
}) {
  return (
    <div className="flex flex-col gap-3">
      {consentimiento ? (
        <FormularioEscritura esperando={esperando} onEnviar={onEnviar} refCampo={refCampo} />
      ) : (
        <ConsentimientoIA onAceptar={onAceptar} onVerGuias={onVerGuias} />
      )}
      <button type="button" className={`${BOTON_ENLACE} self-start`} onClick={onVerGuias}>
        {TEXTOS_IA.irAGuias}
      </button>
    </div>
  );
}
