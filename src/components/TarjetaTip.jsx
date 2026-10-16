import { useId, useState } from "react";
import TextoContenido from "./TextoContenido.jsx";

const NOMBRES_CANAL = {
  sms: "SMS",
  llamada: "Llamada",
  correo: "Correo",
  whatsapp: "WhatsApp",
};

/** Tarjeta de una estafa común con su detalle desplegable. */
export default function TarjetaTip({ tip }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();

  return (
    <article className="rounded-lg border-2 border-gray-300 p-4">
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idDetalle}
        onClick={() => setAbierta(!abierta)}
        className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-blue-800">
            {NOMBRES_CANAL[tip.canal]} · {tip.tipoAtaque}
          </span>
          <span className="block font-semibold">{tip.titulo}</span>
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
          <h3 className="font-bold">Cómo reconocerla</h3>
          <TextoContenido valor={tip.comoReconocerla} />
        </section>
        <section>
          <h3 className="font-bold">Qué hacer</h3>
          <TextoContenido valor={tip.queHacer} />
        </section>
      </div>
    </article>
  );
}
