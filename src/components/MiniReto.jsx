import { useState } from "react";

const OPCION =
  "min-h-11 w-full rounded-boton border-[1.5px] px-3.5 py-3 text-left text-base font-semibold text-texto disabled:cursor-default";
const OPCION_NORMAL = `${OPCION} border-borde bg-fondo`;
const OPCION_ACERTADA = `${OPCION} border-exito bg-exito-suave`;
const OPCION_FALLADA = `${OPCION} border-peligro bg-peligro-suave`;

function claseOpcion(indice, acertada, fallidas) {
  if (indice === acertada) return OPCION_ACERTADA;
  if (fallidas.includes(indice)) return OPCION_FALLADA;
  return OPCION_NORMAL;
}

/**
 * Mini reto de un tip: pregunta y 3 opciones (spec 006, FR-013 a FR-016).
 * Quién acierta lo decide RetoTips (vía onResponder); aquí solo se recuerda lo elegido en
 * este intento, que se reinicia al cerrar la tarjeta.
 */
export default function MiniReto({ reto, onResponder }) {
  const [fallidas, setFallidas] = useState([]);
  const [acertada, setAcertada] = useState(null);
  const [resultado, setResultado] = useState(null);

  function elegir(indice) {
    const { correcta, mensaje } = onResponder(indice);
    setResultado({ correcta, mensaje });
    if (correcta) setAcertada(indice);
    else setFallidas((actuales) => [...actuales, indice]);
  }

  return (
    <section className="rounded-tarjeta bg-primario-suave p-3.5">
      <p className="mb-2.5 font-bold text-primario-oscuro">{reto.pregunta}</p>
      <div className="grid gap-2">
        {reto.opciones.map((opcion, indice) => (
          <button
            key={opcion.texto}
            type="button"
            disabled={acertada !== null || fallidas.includes(indice)}
            onClick={() => elegir(indice)}
            className={claseOpcion(indice, acertada, fallidas)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      <p
        aria-live="polite"
        className={`mt-2.5 text-base font-semibold ${resultado?.correcta ? "text-exito-texto" : "text-peligro"}`}
      >
        {resultado?.mensaje}
      </p>
    </section>
  );
}
