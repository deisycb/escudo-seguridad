import { ShieldCheck, TriangleAlert } from "lucide-react";
import { LIMITE_RIESGO_ALTO, LIMITE_RIESGO_MEDIO, NIVELES_SEMAFORO } from "../logic/constantes.js";
import { CHIP, ETIQUETA_SUAVE } from "./estilos.js";

const PORCENTAJE_COMPLETO = 100;

// Tramos de la barra segmentada (constitución §7.5); los anchos salen de los límites del semáforo.
// Se reparten con flex-grow para que las separaciones no hagan desbordar la barra; el marcador se
// limita con clamp para no salirse en 0 % ni en 100 %.
const TRAMOS = [
  {
    nivel: NIVELES_SEMAFORO.BAJO,
    ancho: LIMITE_RIESGO_MEDIO,
    color: "bg-exito",
    rango: `0–${LIMITE_RIESGO_MEDIO - 1} %`,
  },
  {
    nivel: NIVELES_SEMAFORO.MEDIO,
    ancho: LIMITE_RIESGO_ALTO - LIMITE_RIESGO_MEDIO,
    color: "bg-advertencia",
    rango: `${LIMITE_RIESGO_MEDIO}–${LIMITE_RIESGO_ALTO - 1} %`,
  },
  {
    nivel: NIVELES_SEMAFORO.ALTO,
    ancho: PORCENTAJE_COMPLETO - LIMITE_RIESGO_ALTO,
    color: "bg-peligro",
    rango: `${LIMITE_RIESGO_ALTO} %+`,
  },
];

/** Rangos leídos por el lector de pantalla, porque la barra visible está oculta para él (FR-036a). */
const DESCRIPCION_RANGOS = `Rangos: ${TRAMOS.map(({ nivel, rango }) => `${nivel} ${rango}`).join(", ")}`;

const CHIP_POR_NIVEL = {
  [NIVELES_SEMAFORO.BAJO]: {
    clases: "border border-borde bg-fondo text-exito",
    Icono: ShieldCheck,
  },
  [NIVELES_SEMAFORO.MEDIO]: {
    clases: "bg-advertencia-suave text-advertencia-texto",
    Icono: TriangleAlert,
  },
  [NIVELES_SEMAFORO.ALTO]: { clases: "bg-peligro-suave text-peligro", Icono: TriangleAlert },
};

/**
 * Semáforo de riesgo: porcentaje grande, chip con el nivel y barra segmentada con marcador.
 * Recibe valores ya calculados por Diagnostico o PlanAccion; no calcula nada.
 */
export default function Semaforo({ porcentaje, nivel, etiquetaAccesible, compacto = false }) {
  const { clases, Icono } = CHIP_POR_NIVEL[nivel];
  return (
    <div
      role="img"
      aria-label={`${etiquetaAccesible ?? `Riesgo total ${porcentaje} %, nivel ${nivel}`}. ${DESCRIPCION_RANGOS}`}
      className="flex w-full flex-col gap-3"
    >
      <div aria-hidden="true" className="flex flex-wrap items-center gap-3">
        <span className={compacto ? "text-4xl font-extrabold tracking-tight" : "text-riesgo"}>
          {porcentaje} %
        </span>
        <span className={`${CHIP} ${clases}`}>
          <Icono size={16} strokeWidth={2} />
          Riesgo {nivel.toLowerCase()}
        </span>
      </div>
      <div aria-hidden="true">
        <div className="relative flex h-3 w-full gap-0.5">
          {TRAMOS.map((tramo) => (
            <span
              key={tramo.nivel}
              className={`h-full rounded-full ${tramo.color} ${tramo.nivel === nivel ? "opacity-100" : "opacity-35"}`}
              style={{ flex: `${tramo.ancho} 1 0` }}
            />
          ))}
          <span
            className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-texto"
            style={{ left: `clamp(2px, ${porcentaje}%, calc(100% - 2px))` }}
          />
        </div>
        <div className="mt-2 flex gap-0.5">
          {TRAMOS.map((tramo) => (
            <span
              key={tramo.nivel}
              className={`flex flex-col ${ETIQUETA_SUAVE}`}
              style={{ flex: `${tramo.ancho} 1 0` }}
            >
              {/* Nivel y rango en dos líneas para que quepan en el tramo de 30 % (390 px). */}
              <span>{tramo.nivel}</span>
              <span className="whitespace-nowrap">{tramo.rango}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
