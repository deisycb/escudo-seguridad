import Prioridad from "../components/Prioridad.jsx";
import Semaforo from "../components/Semaforo.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import { DIMENSIONES } from "../logic/constantes.js";

const LEYENDA = [
  { texto: "Bajo 0–39 %", color: "bg-green-700" },
  { texto: "Medio 40–69 %", color: "bg-amber-700" },
  { texto: "Alto 70 % en adelante", color: "bg-red-700" },
];

export default function Resultado({ diagnostico, onVerPlan, onRepetir }) {
  const riesgoPorDimension = diagnostico.calcularRiesgoPorDimension();
  const habitos = diagnostico.obtenerHabitosDeRiesgo();

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className="text-3xl font-bold">
        Tu resultado
      </h1>

      <section className="flex flex-col items-center gap-4">
        <Semaforo
          porcentaje={diagnostico.calcularRiesgoTotal()}
          nivel={diagnostico.obtenerNivelSemaforo()}
        />
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
          {LEYENDA.map(({ texto, color }) => (
            <li key={texto} className="flex items-center gap-1">
              <span className={`size-3 rounded-full ${color}`} aria-hidden="true" />
              {texto}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Riesgo por dimensión</h2>
        <ul className="mt-2 divide-y divide-gray-200">
          {DIMENSIONES.map(({ id, nombre }) => (
            <li key={id} className="flex justify-between py-2">
              <span>{nombre}</span>
              <span className="font-semibold">{riesgoPorDimension[id]} %</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Dónde estás en riesgo</h2>
        {habitos.length === 0 ? (
          <p className="mt-2">¡Muy bien! No encontramos hábitos de riesgo en tus respuestas.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {habitos.map(({ numeroPregunta, descripcion, prioridad, puntos }) => (
              <li key={numeroPregunta} className="rounded-lg border-2 border-gray-200 p-3">
                <p className="text-sm text-gray-700">Pregunta {numeroPregunta}</p>
                <p className="font-semibold">{descripcion}</p>
                <p className="mt-1 flex items-center gap-3">
                  <Prioridad prioridad={prioridad} />
                  <span>{puntos} puntos</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={BOTON_PRINCIPAL} onClick={onVerPlan}>
          Ver mi plan de acción
        </button>
        <button type="button" className={BOTON_SECUNDARIO} onClick={onRepetir}>
          Repetir diagnóstico
        </button>
      </div>
    </div>
  );
}
