import { useId, useState } from "react";
import Prioridad from "./Prioridad.jsx";
import TextoContenido from "./TextoContenido.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "./botones.js";

/** Una acción del plan con su detalle desplegable y el botón "Ya lo hice". */
export default function TarjetaAccion({ accion, onAlternar }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();

  return (
    <article
      className={`rounded-lg border-2 p-4 ${accion.hecha ? "border-green-700 bg-green-50" : "border-gray-300"}`}
    >
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idDetalle}
        onClick={() => setAbierta(!abierta)}
        className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
      >
        <span>
          <span className="block font-semibold">{accion.titulo}</span>
          <span className="mt-1 flex flex-wrap items-center gap-3">
            <Prioridad prioridad={accion.prioridad} />
            <span>Baja {accion.bajaPorcentaje} %</span>
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`mt-1 size-5 shrink-0 fill-current transition-transform ${abierta ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      <div id={idDetalle} hidden={!abierta} className="mt-3 space-y-3">
        <section>
          <h3 className="font-bold">Qué hacer ahora</h3>
          <TextoContenido valor={accion.queHacerAhora} />
        </section>
        <section>
          <h3 className="font-bold">Cómo prevenirlo</h3>
          <TextoContenido valor={accion.comoPrevenirlo} />
        </section>
      </div>

      <button
        type="button"
        aria-pressed={accion.hecha}
        onClick={() => onAlternar(accion.numeroPregunta)}
        className={`mt-3 ${accion.hecha ? BOTON_SECUNDARIO : BOTON_PRINCIPAL}`}
      >
        {accion.hecha ? "Hecho ✓ · Desmarcar" : "Ya lo hice"}
      </button>
    </article>
  );
}
