import { ShieldCheck, TriangleAlert } from "lucide-react";
import BarraProgreso from "../components/BarraProgreso.jsx";
import FiltrosCanal from "../components/FiltrosCanal.jsx";
import TarjetaTip from "../components/TarjetaTip.jsx";
import { LISTA_TARJETAS, TITULO_PANTALLA } from "../components/estilos.js";
import { CANALES_TIPS, REGLA_DE_ORO, TEXTOS_TIPS } from "../data/tips.js";

/**
 * Tips de seguridad interactivos (spec 006). Solo muestra y reacciona:
 * las reglas las aplica RetoTips a través de useEstadoEscudo (`tips`).
 */
export default function Tips({ tips, onIrAEmergencia }) {
  const { reto } = tips;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 tabIndex={-1} className={`${TITULO_PANTALLA} text-balance`}>
          {TEXTOS_TIPS.titulo}
        </h1>
        <p className="mt-1 text-base text-texto-suave">{TEXTOS_TIPS.subtitulo}</p>
      </header>

      <section className="flex items-start gap-3 rounded-tarjeta bg-primario px-[18px] py-4 text-white">
        <ShieldCheck size={22} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div>
          <h2 className="mb-0.5 text-xs font-bold tracking-[0.12em] uppercase opacity-80">
            {TEXTOS_TIPS.etiquetaRegla}
          </h2>
          <p className="text-base leading-snug font-bold">{REGLA_DE_ORO}</p>
        </div>
      </section>

      <BarraProgreso progreso={tips.progreso} />

      <FiltrosCanal canales={CANALES_TIPS} activo={tips.filtro} onCambiar={tips.cambiarFiltro} />

      <ul className={LISTA_TARJETAS}>
        {tips.visibles.map((tip) => (
          <li key={tip.id}>
            <TarjetaTip
              tip={tip}
              abierta={tips.tipAbierto === tip.id}
              superado={reto.estaSuperado(tip.id)}
              segmentos={reto.segmentosDelTip(tip.id)}
              encontradas={reto.trampasEncontradas(tip.id)}
              onAlternar={() => tips.alternarTip(tip.id)}
              onActivarTrampa={(indice) => tips.marcarTrampa(tip.id, indice)}
              onResponder={(indice) => tips.responder(tip.id, indice)}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onIrAEmergencia}
        className="flex min-h-[52px] w-full items-center gap-2.5 rounded-tarjeta border-[1.5px] border-peligro bg-fondo px-4 py-3.5 text-left font-bold text-peligro"
      >
        <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" className="shrink-0" />
        <span>
          {TEXTOS_TIPS.emergenciaPregunta}{" "}
          <span className="font-medium text-texto">{TEXTOS_TIPS.emergenciaAccion}</span>
        </span>
      </button>
    </div>
  );
}
