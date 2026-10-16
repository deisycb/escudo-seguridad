import { ChevronDown, ListChecks, ShieldCheck, Zap } from "lucide-react";
import { useId, useState } from "react";
import Prioridad from "./Prioridad.jsx";
import TextoContenido from "./TextoContenido.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "./botones.js";
import { ETIQUETA_SUAVE, TARJETA, TEXTO_LECTURA } from "./estilos.js";

/** Una acción del plan con su detalle desplegable y el botón "Ya lo hice". */
export default function TarjetaAccion({ accion, onAlternar }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();

  return (
    <article className={`${TARJETA} flex flex-col gap-3`}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idDetalle}
        onClick={() => setAbierta(!abierta)}
        className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
      >
        <span className="flex flex-col gap-2">
          <span className="font-bold text-texto">{accion.titulo}</span>
          <span className="flex flex-wrap items-center gap-3">
            <Prioridad prioridad={accion.prioridad} />
            <span className={ETIQUETA_SUAVE}>Baja {accion.bajaPorcentaje} %</span>
          </span>
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-texto-suave transition-transform ${abierta ? "rotate-180" : ""}`}
        />
      </button>

      <div id={idDetalle} hidden={!abierta} className={`space-y-4 ${TEXTO_LECTURA}`}>
        <section>
          <h3 className="flex items-center gap-2 font-bold text-texto">
            <Zap size={20} strokeWidth={2} aria-hidden="true" className="text-primario" />
            Qué hacer ahora
          </h3>
          <TextoContenido valor={accion.queHacerAhora} />
        </section>
        <section>
          <h3 className="flex items-center gap-2 font-bold text-texto">
            <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" className="text-primario" />
            Cómo prevenirlo
          </h3>
          <TextoContenido valor={accion.comoPrevenirlo} />
        </section>
      </div>

      {accion.hecha && (
        <p className="flex items-center gap-2 font-bold text-exito">
          <ListChecks size={20} strokeWidth={2} aria-hidden="true" />
          Acción hecha
        </p>
      )}
      <button
        type="button"
        aria-pressed={accion.hecha}
        onClick={() => onAlternar(accion.numeroPregunta)}
        className={accion.hecha ? BOTON_SECUNDARIO : BOTON_PRINCIPAL}
      >
        {accion.hecha ? "Desmarcar" : "Ya lo hice"}
      </button>
    </article>
  );
}
