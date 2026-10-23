import { ChevronDown, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { useId, useState } from "react";
import MensajeEjemplo from "./MensajeEjemplo.jsx";
import MiniReto from "./MiniReto.jsx";
import { CANALES_TIPS, TEXTOS_TIPS } from "../data/tips.js";
import { TOTAL_TRAMPAS_POR_TIP } from "../logic/constantes.js";

/** Ícono y colores del cuadro de cada canal (constitución §7.9, spec 006 FR-007). */
const ICONO_CANAL = {
  sms: { Icono: MessageSquare, clase: "bg-primario-suave text-primario" },
  llamada: { Icono: Phone, clase: "bg-peligro-suave text-peligro" },
  correo: { Icono: Mail, clase: "bg-advertencia-suave text-advertencia" },
  whatsapp: { Icono: MessageCircle, clase: "bg-exito-suave text-exito" },
};

const TITULO_BLOQUE =
  "mb-2 flex justify-between gap-2 text-xs font-bold tracking-widest text-texto-suave uppercase";

function nombreCanal(canal) {
  return CANALES_TIPS.find((c) => c.id === canal).nombre;
}

function Explicacion({ tip, indice, todas }) {
  if (indice === null) return null;
  return (
    <div className="mt-2 rounded-boton bg-peligro-suave px-3 py-2.5 text-base text-texto">
      <b className="text-peligro">{TEXTOS_TIPS.prefijoTrampa}</b> {tip.trampas[indice]}
      {todas && (
        <>
          {" "}
          <b className="text-peligro">{TEXTOS_TIPS.todasEncontradas}</b>
        </>
      )}
    </div>
  );
}

// Se monta al abrir la tarjeta: la última trampa tocada y el intento del reto se reinician al cerrar.
function CuerpoTip({ tip, segmentos, encontradas, onActivarTrampa, onResponder }) {
  const [ultimaTrampa, setUltimaTrampa] = useState(null);
  const todas = encontradas.length === TOTAL_TRAMPAS_POR_TIP;

  function activarTrampa(indice) {
    setUltimaTrampa(indice);
    onActivarTrampa(indice);
  }

  return (
    <div className="flex flex-col gap-[18px] px-5 pb-5">
      <section>
        <h3 className={TITULO_BLOQUE}>
          {TEXTOS_TIPS.asiSeVe}
          <span className="font-bold tracking-normal text-primario normal-case">
            {TEXTOS_TIPS.contadorTrampas(encontradas.length, TOTAL_TRAMPAS_POR_TIP)}
          </span>
        </h3>
        <MensajeEjemplo
          tip={tip}
          segmentos={segmentos}
          encontradas={encontradas}
          onActivarTrampa={activarTrampa}
        />
        <div aria-live="polite">
          <Explicacion tip={tip} indice={ultimaTrampa} todas={todas} />
        </div>
        {!todas && <p className="mt-1.5 text-xs text-texto-suave">{TEXTOS_TIPS.ayudaTrampas}</p>}
      </section>
      <section>
        <h3 className={TITULO_BLOQUE}>{TEXTOS_TIPS.comoReconocerla}</h3>
        <ul className="grid gap-2">
          {tip.senales.map((senal) => (
            <li key={senal} className="flex items-start gap-2.5 text-base text-texto">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-peligro" />
              {senal}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className={TITULO_BLOQUE}>{TEXTOS_TIPS.queHacer}</h3>
        <ol className="grid gap-2.5">
          {tip.pasos.map((paso, posicion) => (
            <li key={paso} className="flex items-start gap-3 text-base text-texto">
              <span
                aria-hidden="true"
                className="grid size-[26px] shrink-0 place-items-center rounded-full bg-primario text-[13px] font-bold text-white"
              >
                {posicion + 1}
              </span>
              {paso}
            </li>
          ))}
        </ol>
      </section>
      <MiniReto reto={tip.reto} onResponder={onResponder} />
      <p className="border-t border-borde pt-3 text-sm text-texto-suave">
        <b className="text-texto">{TEXTOS_TIPS.prefijoDato}</b> {tip.dato}
      </p>
    </div>
  );
}

/** Tarjeta acordeón de una estafa común con su mensaje de ejemplo y su reto (spec 006). */
export default function TarjetaTip({ tip, abierta, superado, onAlternar, ...cuerpo }) {
  const idCuerpo = useId();
  const { Icono, clase } = ICONO_CANAL[tip.canal];

  return (
    <article className="overflow-hidden rounded-tarjeta border border-borde bg-fondo">
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idCuerpo}
        onClick={onAlternar}
        className="flex min-h-11 w-full items-center gap-3.5 p-5 text-left"
      >
        <span className={`grid size-[46px] shrink-0 place-items-center rounded-boton ${clase}`}>
          <Icono size={22} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-texto-suave">
            {TEXTOS_TIPS.etiquetaCanal(nombreCanal(tip.canal), tip.tipo)}
            {superado && (
              <span className="font-bold text-exito">
                {TEXTOS_TIPS.separador}
                {TEXTOS_TIPS.retoSuperado}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[17px] leading-snug font-bold text-balance text-texto">
            {tip.titulo}
          </span>
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 text-texto-suave transition-transform duration-250 motion-reduce:transition-none ${abierta ? "rotate-180" : ""}`}
        />
      </button>
      <div id={idCuerpo} hidden={!abierta}>
        {abierta && <CuerpoTip tip={tip} {...cuerpo} />}
      </div>
    </article>
  );
}
