import { OPCIONES_VALIDAS, TOTAL_PREGUNTAS } from "../logic/constantes.js";

/** Una pregunta del diagnóstico con sus 3 opciones como radios nativos. Solo presentación. */
export default function TarjetaPregunta({
  pregunta,
  numero,
  nombreDimension,
  respuesta,
  onResponder,
}) {
  return (
    <section>
      <h1 tabIndex={-1} className="text-2xl font-bold">
        Pregunta {numero} de {TOTAL_PREGUNTAS}
      </h1>
      <progress
        value={numero}
        max={TOTAL_PREGUNTAS}
        aria-label="Avance del diagnóstico"
        className="mt-3 h-3 w-full accent-blue-700"
      />
      <p className="mt-2 font-semibold text-blue-800">{nombreDimension}</p>
      <fieldset className="mt-4">
        <legend className="mb-3 text-lg font-semibold">{pregunta.texto}</legend>
        <div className="flex flex-col gap-3">
          {OPCIONES_VALIDAS.map((letra) => (
            <label
              key={letra}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-300 p-3 has-checked:border-blue-700 has-checked:bg-blue-50"
            >
              <input
                type="radio"
                name={`pregunta-${pregunta.numero}`}
                value={letra}
                checked={respuesta === letra}
                onChange={() => onResponder(letra)}
                className="mt-1 size-5 shrink-0 accent-blue-700"
              />
              <span>{pregunta.opciones[letra].texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
