import { ShieldCheck } from "lucide-react";
import Prioridad from "../components/Prioridad.jsx";
import RiesgoPorCanal from "../components/RiesgoPorCanal.jsx";
import Semaforo from "../components/Semaforo.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import {
  ETIQUETA_SUAVE,
  LISTA_TARJETAS,
  TARJETA,
  TITULO_PANTALLA,
  TITULO_SECCION,
} from "../components/estilos.js";
import { DIMENSIONES } from "../logic/constantes.js";
import { Diagnostico } from "../logic/Diagnostico.js";

export default function Resultado({ diagnostico, onVerPlan, onRepetir }) {
  const riesgoPorDimension = diagnostico.calcularRiesgoPorDimension();
  const habitos = diagnostico.obtenerHabitosDeRiesgo();
  const canales = DIMENSIONES.map(({ id, etiqueta }) => ({
    id,
    etiqueta,
    porcentaje: riesgoPorDimension[id],
    nivel: Diagnostico.clasificarNivel(riesgoPorDimension[id]),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Tu resultado
      </h1>

      <section className={TARJETA}>
        <Semaforo
          porcentaje={diagnostico.calcularRiesgoTotal()}
          nivel={diagnostico.obtenerNivelSemaforo()}
        />
      </section>

      <section className={`${TARJETA} flex flex-col gap-4`}>
        <h2 className={TITULO_SECCION}>Riesgo por canal</h2>
        <RiesgoPorCanal canales={canales} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={TITULO_SECCION}>Dónde estás en riesgo</h2>
        {habitos.length === 0 ? (
          <p className={`${TARJETA} flex items-center gap-3 text-texto`}>
            <ShieldCheck size={24} strokeWidth={2} aria-hidden="true" className="text-exito" />
            ¡Muy bien! No encontramos hábitos de riesgo en tus respuestas.
          </p>
        ) : (
          <ul className={LISTA_TARJETAS}>
            {habitos.map(({ numeroPregunta, descripcion, prioridad, puntos }) => (
              <li key={numeroPregunta} className={`${TARJETA} flex flex-col gap-2`}>
                <p className={ETIQUETA_SUAVE}>Pregunta {numeroPregunta}</p>
                <p className="font-semibold text-texto">{descripcion}</p>
                <p className="flex items-center gap-3 text-texto-secundario">
                  <Prioridad prioridad={prioridad} />
                  <span>
                    {puntos} {puntos === 1 ? "punto" : "puntos"}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3">
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
