import { TEXTOS_TIPS } from "../data/tips.js";

const CHIP_FILTRO =
  "min-h-11 rounded-full border-[1.5px] border-borde bg-fondo px-4 py-2 text-sm font-semibold text-texto aria-pressed:border-primario aria-pressed:bg-primario aria-pressed:text-white";

/** Chips para filtrar los tips por canal (spec 006, FR-004). */
export default function FiltrosCanal({ canales, activo, onCambiar }) {
  return (
    <div role="group" aria-label={TEXTOS_TIPS.filtrosAria} className="flex flex-wrap gap-2">
      {canales.map((canal) => (
        <button
          key={canal.filtro}
          type="button"
          aria-pressed={canal.id === activo}
          onClick={() => onCambiar(canal.id)}
          className={CHIP_FILTRO}
        >
          {canal.filtro}
        </button>
      ))}
    </div>
  );
}
