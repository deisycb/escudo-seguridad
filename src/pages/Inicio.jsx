import { useState } from "react";
import Dialogo from "../components/Dialogo.jsx";
import { BOTON_ALERTA, BOTON_ENLACE, BOTON_PRINCIPAL } from "../components/botones.js";
import { POLITICA_PRIVACIDAD } from "../data/politica.js";

const GARANTIAS = [
  "Nunca te pedimos contraseñas",
  "Respuestas anónimas",
  "No accedemos a tu celular ni a tus cuentas",
];

export default function Inicio({
  consentimiento,
  onCambiarConsentimiento,
  onEmpezar,
  onEmergencia,
}) {
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 tabIndex={-1} className="text-4xl font-bold">
          Escudo
        </h1>
        <p className="mt-2 text-lg">
          Responde 14 preguntas y descubre qué tan expuesto estás a las estafas digitales y qué
          hacer para protegerte.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {GARANTIAS.map((garantia) => (
          <li key={garantia} className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-green-700" aria-hidden="true">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
            {garantia}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border-2 border-gray-300 p-4">
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(evento) => onCambiarConsentimiento(evento.target.checked)}
            className="mt-1 size-5 shrink-0 accent-blue-700"
          />
          <span>Acepto el tratamiento de mis respuestas según la Ley 1581 de 2012.</span>
        </label>
        <button type="button" className={BOTON_ENLACE} onClick={() => setPoliticaAbierta(true)}>
          Ver política
        </button>
      </div>

      <button
        type="button"
        className={BOTON_PRINCIPAL}
        disabled={!consentimiento}
        onClick={onEmpezar}
      >
        Empezar diagnóstico
      </button>
      <button type="button" className={BOTON_ALERTA} onClick={onEmergencia}>
        Tengo una emergencia ahora
      </button>

      <Dialogo
        abierto={politicaAbierta}
        titulo={POLITICA_PRIVACIDAD.titulo}
        onCerrar={() => setPoliticaAbierta(false)}
        acciones={
          <button
            type="button"
            className={BOTON_PRINCIPAL}
            onClick={() => setPoliticaAbierta(false)}
          >
            Cerrar
          </button>
        }
      >
        {POLITICA_PRIVACIDAD.secciones.map(({ subtitulo, texto }) => (
          <section key={subtitulo} className="mb-3">
            <h3 className="font-semibold">{subtitulo}</h3>
            <p>{texto}</p>
          </section>
        ))}
      </Dialogo>
    </div>
  );
}
