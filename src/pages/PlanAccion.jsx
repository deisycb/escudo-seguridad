import Semaforo from "../components/Semaforo.jsx";
import TarjetaAccion from "../components/TarjetaAccion.jsx";

export default function PlanAccion({ plan, onAlternarAccion }) {
  const riesgo = plan.calcularRiesgoActual();
  const nivel = plan.obtenerNivelActual();
  const acciones = plan.obtenerAcciones();

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className="text-3xl font-bold">
        Mi plan
      </h1>

      <section className="flex flex-col items-center gap-3 rounded-lg border-2 border-gray-300 p-4">
        <h2 className="text-lg font-bold">Riesgo actual</h2>
        <Semaforo
          porcentaje={riesgo}
          nivel={nivel}
          etiquetaAccesible={`Riesgo actual ${riesgo} %, nivel ${nivel}`}
        />
        <p className="font-semibold">
          {plan.contarHechas()} de {plan.contarTotal()} hechas
        </p>
      </section>

      {acciones.length === 0 ? (
        <p>¡Muy bien! No tienes hábitos de riesgo, así que no hay acciones pendientes.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {acciones.map((accion) => (
            <li key={accion.numeroPregunta}>
              <TarjetaAccion accion={accion} onAlternar={onAlternarAccion} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
