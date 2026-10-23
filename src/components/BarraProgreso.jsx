import { TEXTOS_TIPS } from "../data/tips.js";

/**
 * Progreso de retos de Tips: el texto lo dice todo; la barra es solo visual (spec 006, FR-003).
 */
export default function BarraProgreso({ progreso }) {
  const { superados, total, porcentaje } = progreso;

  return (
    <div className="flex items-center gap-2.5 text-sm font-semibold text-texto-suave">
      <span aria-live="polite">{TEXTOS_TIPS.progreso(superados, total)}</span>
      <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-pista">
        <div
          className="h-full rounded-full bg-primario transition-[width] duration-400 motion-reduce:transition-none"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
