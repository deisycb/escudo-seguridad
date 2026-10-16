import { NIVELES_SEMAFORO } from "../logic/constantes.js";

const RADIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const PORCENTAJE_COMPLETO = 100;

const ESTILOS = {
  [NIVELES_SEMAFORO.BAJO]: { color: "text-green-700", forma: <circle cx="12" cy="12" r="9" /> },
  [NIVELES_SEMAFORO.MEDIO]: {
    color: "text-amber-700",
    forma: <polygon points="12,3 22,21 2,21" />,
  },
  [NIVELES_SEMAFORO.ALTO]: {
    color: "text-red-700",
    forma: <polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" />,
  },
};

/** Indicador circular del riesgo. Recibe valores ya calculados por Diagnostico o PlanAccion. */
export default function Semaforo({ porcentaje, nivel, etiquetaAccesible }) {
  const { color, forma } = ESTILOS[nivel];
  const relleno = (CIRCUNFERENCIA * porcentaje) / PORCENTAJE_COMPLETO;
  return (
    <div
      role="img"
      aria-label={etiquetaAccesible ?? `Riesgo total ${porcentaje} %, nivel ${nivel}`}
      className={`relative mx-auto size-40 ${color}`}
    >
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={RADIO} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={RADIO}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${relleno} ${CIRCUNFERENCIA}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{porcentaje} %</span>
        <span className="flex items-center gap-1 font-semibold">
          <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
            {forma}
          </svg>
          {nivel}
        </span>
      </div>
    </div>
  );
}
