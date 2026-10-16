import { NIVELES_SEMAFORO } from "../logic/constantes.js";
import { LISTA_TARJETAS } from "./estilos.js";
import { ICONOS_DIMENSION } from "./iconosDimension.js";

const RELLENO_POR_NIVEL = {
  [NIVELES_SEMAFORO.BAJO]: "bg-exito",
  [NIVELES_SEMAFORO.MEDIO]: "bg-advertencia",
  [NIVELES_SEMAFORO.ALTO]: "bg-peligro",
};

/**
 * Riesgo por canal (constitución §7.5): una barra de progreso por dimensión con su nombre y
 * porcentaje encima. Recibe `canales` = [{ id, etiqueta, porcentaje, nivel }] ya calculados.
 */
export default function RiesgoPorCanal({ canales }) {
  return (
    <ul className={LISTA_TARJETAS}>
      {canales.map(({ id, etiqueta, porcentaje, nivel }) => {
        const Icono = ICONOS_DIMENSION[id];
        return (
          <li key={id}>
            <div className="flex items-center gap-2">
              <Icono size={20} strokeWidth={2} aria-hidden="true" className="text-texto-suave" />
              <span className="font-semibold text-texto">{etiqueta}</span>
              <span className="ml-auto font-bold text-texto">{porcentaje} %</span>
            </div>
            <div aria-hidden="true" className="mt-2 h-2 w-full rounded-full bg-pista">
              <div
                className={`h-full rounded-full ${RELLENO_POR_NIVEL[nivel]}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
