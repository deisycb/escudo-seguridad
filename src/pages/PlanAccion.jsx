import { ShieldCheck } from "lucide-react";
import Semaforo from "../components/Semaforo.jsx";
import TarjetaAccion from "../components/TarjetaAccion.jsx";
import { LISTA_TARJETAS, TARJETA, TITULO_PANTALLA, TITULO_SECCION } from "../components/estilos.js";

export default function PlanAccion({ plan, onAlternarAccion }) {
  const riesgo = plan.calcularRiesgoActual();
  const nivel = plan.obtenerNivelActual();
  const acciones = plan.obtenerAcciones();

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Mi plan
      </h1>

      <section className={`${TARJETA} flex flex-col gap-4`}>
        <h2 className={TITULO_SECCION}>Riesgo actual</h2>
        <Semaforo
          compacto
          porcentaje={riesgo}
          nivel={nivel}
          etiquetaAccesible={`Riesgo actual ${riesgo} %, nivel ${nivel}`}
        />
        <p className="font-bold text-texto">
          {plan.contarHechas()} de {plan.contarTotal()} hechas
        </p>
      </section>

      {acciones.length === 0 ? (
        <p className={`${TARJETA} flex items-center gap-3 text-texto`}>
          <ShieldCheck size={24} strokeWidth={2} aria-hidden="true" className="text-exito" />
          ¡Muy bien! No tienes hábitos de riesgo, así que no hay acciones pendientes.
        </p>
      ) : (
        <ul className={LISTA_TARJETAS}>
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
