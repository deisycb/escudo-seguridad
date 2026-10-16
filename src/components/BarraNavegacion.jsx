import { Lightbulb, ListChecks, ShieldCheck, TriangleAlert } from "lucide-react";

const SECCIONES = [
  { pantalla: "resultado", etiqueta: "Resultado", Icono: ShieldCheck },
  { pantalla: "plan", etiqueta: "Mi plan", Icono: ListChecks },
  { pantalla: "tips", etiqueta: "Tips", Icono: Lightbulb },
  { pantalla: "emergencia", etiqueta: "Emergencia", Icono: TriangleAlert },
];

// Emergencia va siempre en peligro; el resto en primario solo si está activa (constitución §7.5).
function claseBoton(pantalla, activa) {
  let color = activa ? "text-primario" : "text-texto-suave";
  if (pantalla === "emergencia") color = "text-peligro";
  const peso = activa ? "font-bold" : "font-semibold";
  return `relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 text-xs ${color} ${peso}`;
}

/** Barra inferior con las 4 secciones; solo se muestra cuando hay diagnóstico. */
export default function BarraNavegacion({ pantallaActual, onNavegar }) {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 mx-auto h-barra max-w-columna border-t border-borde bg-fondo min-[560px]:border-x"
    >
      <ul className="flex h-full">
        {SECCIONES.map(({ pantalla, etiqueta, Icono }) => {
          const activa = pantalla === pantallaActual;
          return (
            <li key={pantalla} className="flex flex-1">
              <button
                type="button"
                aria-current={activa ? "page" : undefined}
                onClick={() => onNavegar(pantalla)}
                className={claseBoton(pantalla, activa)}
              >
                {/* Indicador de forma de la sección activa: no depende solo del color (FR-036a). */}
                {activa && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-current"
                  />
                )}
                <Icono size={24} strokeWidth={2} aria-hidden="true" />
                {etiqueta}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
