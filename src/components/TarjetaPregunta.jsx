import { OPCIONES_VALIDAS, TOTAL_PREGUNTAS } from "../logic/constantes.js";
import { ICONOS_DIMENSION } from "./iconosDimension.js";

/** Una pregunta del diagnóstico con sus 3 opciones como radios nativos. Solo presentación. */
export default function TarjetaPregunta({ pregunta, numero, dimension, respuesta, onResponder }) {
  const IconoDimension = ICONOS_DIMENSION[dimension.id];
  return (
    <section className="flex flex-col gap-4">
      <h1 tabIndex={-1} className="text-sm font-semibold text-texto-suave">
        Pregunta {numero} de {TOTAL_PREGUNTAS}
      </h1>
      <progress
        value={numero}
        max={TOTAL_PREGUNTAS}
        aria-label="Avance del diagnóstico"
        className="h-2 w-full appearance-none overflow-hidden rounded-full bg-pista [&::-moz-progress-bar]:bg-primario [&::-webkit-progress-bar]:bg-pista [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primario"
      />
      <p className="flex items-center gap-2 font-semibold text-primario">
        <IconoDimension size={20} strokeWidth={2} aria-hidden="true" />
        {dimension.etiqueta}
      </p>
      <fieldset>
        <legend className="mb-4 text-xl font-extrabold tracking-tight text-texto">
          {pregunta.texto}
        </legend>
        <div className="flex flex-col gap-3">
          {OPCIONES_VALIDAS.map((letra) => (
            <label
              key={letra}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-boton border border-texto-suave bg-fondo p-4 text-texto has-checked:border-2 has-checked:border-primario"
            >
              <input
                type="radio"
                name={`pregunta-${pregunta.numero}`}
                value={letra}
                checked={respuesta === letra}
                onChange={() => onResponder(letra)}
                className="mt-0.5 size-5 shrink-0 accent-primario"
              />
              <span>{pregunta.opciones[letra].texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
