import FraseTrampa from "./FraseTrampa.jsx";
import { TEXTOS_TIPS } from "../data/tips.js";

function Segmentos({ segmentos, encontradas, onActivarTrampa }) {
  return segmentos.map((segmento, posicion) =>
    segmento.esTrampa ? (
      <FraseTrampa
        key={posicion}
        texto={segmento.texto}
        encontrada={encontradas.includes(segmento.indice)}
        onActivar={() => onActivarTrampa(segmento.indice)}
      />
    ) : (
      <span key={posicion}>{segmento.texto}</span>
    ),
  );
}

/**
 * Simulación del mensaje de un tip: remitente, etiqueta "Ejemplo" y burbuja
 * con las frases trampa (spec 006, FR-008).
 */
export default function MensajeEjemplo({ tip, segmentos, encontradas, onActivarTrampa }) {
  const esLlamada = tip.canal === "llamada";
  const encabezado = esLlamada ? TEXTOS_TIPS.loQueTeDicen : TEXTOS_TIPS.de;
  const props = { encontradas, onActivarTrampa };

  return (
    <div className="rounded-tarjeta border border-dashed border-borde bg-superficie p-3">
      <div className="mb-1.5 flex justify-between gap-2 text-xs text-texto-suave">
        <span>
          {encabezado}{" "}
          <b className="font-bold [overflow-wrap:anywhere] text-texto">
            <Segmentos segmentos={segmentos.remitente} {...props} />
          </b>
        </span>
        <span className="shrink-0 font-bold tracking-wider uppercase">{TEXTOS_TIPS.ejemplo}</span>
      </div>
      <p
        className={`bg-fondo px-3 py-2.5 text-base leading-relaxed [overflow-wrap:anywhere] text-texto ${esLlamada ? "rounded-tarjeta" : "rounded-tarjeta rounded-tl-[4px]"}`}
      >
        <Segmentos segmentos={segmentos.mensaje} {...props} />
      </p>
    </div>
  );
}
