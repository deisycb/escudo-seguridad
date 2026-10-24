import { useEffect, useRef, useState } from "react";
import { Lock, Send, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useEscudoChat } from "../hooks/useChatEmergencia.js";

function Avatar({ pequeño = false }) {
  const tamaño = pequeño ? "size-7 rounded-lg" : "size-11 rounded-xl";
  return (
    <span
      aria-hidden="true"
      className={`${tamaño} flex shrink-0 items-center justify-center bg-peligro text-white`}
    >
      {pequeño ? <ShieldCheck size={15} strokeWidth={2.4} /> : <ShieldAlert size={22} strokeWidth={2.2} />}
    </span>
  );
}

function Burbuja({ mensaje }) {
  const esPersona = mensaje.rol === "usuario";
  return (
    <li className={`flex items-end gap-2 ${esPersona ? "justify-end" : "justify-start"}`}>
      {!esPersona && <Avatar pequeño />}
      <p
        className={`max-w-[82%] whitespace-pre-line break-words px-4 py-3 text-[15px] leading-relaxed ${
          esPersona
            ? "rounded-2xl rounded-br-md bg-primario text-white"
            : "rounded-2xl rounded-bl-md border border-borde bg-white text-texto"
        }`}
      >
        {mensaje.texto}
      </p>
    </li>
  );
}

function Escribiendo() {
  return (
    <li className="flex items-end gap-2" aria-label="El asistente está escribiendo">
      <Avatar pequeño />
      <span className="flex gap-1 rounded-2xl rounded-bl-md border border-borde bg-white px-4 py-4">
        {[0, 150, 300].map((retraso) => (
          <span
            key={retraso}
            className="size-2 animate-bounce rounded-full bg-texto-secundario motion-reduce:animate-none"
            style={{ animationDelay: `${retraso}ms` }}
          />
        ))}
      </span>
    </li>
  );
}

export default function Emergencia({ onVolver }) {
  const { mensajes, cargando, error, enviar } = useEscudoChat();
  const [texto, setTexto] = useState("");
  const refFinal = useRef(null);

  useEffect(() => {
    refFinal.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [mensajes, cargando]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim() || cargando) return;
    enviar(texto);
    setTexto("");
  };

  return (
    <div className="flex h-dvh flex-col bg-fondo">
      {/* Barra superior */}
      <header className="flex items-center gap-3 border-b border-borde bg-peligro/10 px-4 py-3">
        <Avatar />
        <div className="min-w-0 flex-1">
          <h1 tabIndex={-1} className="text-base font-extrabold text-texto">
            Asistente de emergencia
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-texto-secundario">
            <span className="size-2 rounded-full bg-exito" aria-hidden="true" />
            Te guío paso a paso
          </p>
        </div>
        <button
          type="button"
          onClick={onVolver}
          aria-label="Cerrar emergencia"
          className="flex size-11 items-center justify-center rounded-xl bg-white text-texto focus-visible:outline-3 focus-visible:outline-primario"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      </header>

      {/* Conversación */}
      <ol
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5"
      >
        <li className="flex items-end gap-2">
          <Avatar pequeño />
          <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-borde bg-white px-4 py-3 text-[15px] text-texto">
            <p className="font-bold">Respira. Vamos paso a paso.</p>
            <p className="mt-1">
              Actuar en los primeros minutos reduce el daño. Cuéntame qué te pasó.
            </p>
          </div>
        </li>

        {mensajes.map((m) => (
          <Burbuja key={m.id} mensaje={m} />
        ))}

        {cargando && <Escribiendo />}

        {error && (
          <li role="alert" className="rounded-xl bg-peligro/10 px-4 py-3 text-sm font-semibold text-peligro">
            {error}
          </li>
        )}
        <li ref={refFinal} aria-hidden="true" />
      </ol>

      {/* Barra para escribir */}
      <div className="border-t border-borde bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-texto-secundario">
          <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
          No escribas claves, códigos ni números de tarjeta.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <label htmlFor="mensaje-emergencia" className="sr-only">
            Cuéntame qué te pasó
          </label>
          <input
            id="mensaje-emergencia"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe qué te pasó…"
            disabled={cargando}
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-full border-[1.5px] border-borde bg-fondo px-5 text-[15px] text-texto placeholder:text-texto-secundario focus:border-primario focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={cargando || !texto.trim()}
            aria-label="Enviar"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primario text-white transition active:scale-90 disabled:bg-borde disabled:text-texto-secundario focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            <Send size={20} strokeWidth={2.4} />
          </button>
        </form>
      </div>
    </div>
  );
}