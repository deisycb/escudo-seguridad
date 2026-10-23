import { ChevronRight } from "lucide-react";

const BOTON_OPCION =
  "flex min-h-[52px] w-full items-center gap-3 rounded-boton border border-borde bg-fondo px-4 py-2 text-left font-semibold text-texto focus-visible:outline-2 focus-visible:outline-primario";

/**
 * Opciones pendientes del asistente como botones de ancho completo (spec 003, FR-020).
 * @param {{ opciones: { id: string, texto: string }[], onElegir: (id: string) => void,
 *   ref?: object }} props `ref` apunta a la primera opción, para mover el foco.
 */
export default function OpcionesConversacion({ opciones, onElegir, ref }) {
  if (opciones.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {opciones.map(({ id, texto }, i) => (
        <li key={id}>
          <button
            type="button"
            ref={i === 0 ? ref : undefined}
            className={`${BOTON_OPCION} scroll-mb-24`}
            onClick={() => onElegir(id)}
          >
            <span className="flex-1">{texto}</span>
            <ChevronRight
              size={20}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-texto-suave"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
