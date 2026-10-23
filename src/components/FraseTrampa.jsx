import { useEffect, useRef, useState } from "react";

// Debe aparecer literal para que Tailwind genere la clase (se agrega por programa).
const CLASE_POP = "motion-safe:animate-pop";

const BASE =
  "cursor-pointer rounded-[3px] border-b-[2.5px] border-peligro px-px box-decoration-clone transition-colors motion-reduce:transition-none";
const SIN_ENCONTRAR = `${BASE} border-dotted hover:bg-peligro-suave`;
const ENCONTRADA = `${BASE} border-solid bg-peligro-suave font-semibold text-peligro`;

/**
 * Frase trampa tocable dentro de un mensaje de ejemplo (spec 006, FR-009, research R6 y R7).
 * Es un span con rol de botón para que el texto pueda partirse en varias líneas.
 */
export default function FraseTrampa({ texto, encontrada, onActivar }) {
  const ref = useRef(null);
  const [toques, setToques] = useState(0);

  // Reinicia el "pop" en cada toque sin remontar el elemento (así no pierde el foco).
  useEffect(() => {
    const elemento = ref.current;
    if (toques === 0 || !elemento) return;
    elemento.classList.remove(CLASE_POP);
    void elemento.offsetWidth;
    elemento.classList.add(CLASE_POP);
  }, [toques]);

  function activar() {
    setToques((n) => n + 1);
    onActivar();
  }

  function alPresionarTecla(evento) {
    if (evento.key !== "Enter" && evento.key !== " ") return;
    evento.preventDefault();
    activar();
  }

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={encontrada}
      onClick={activar}
      onKeyDown={alPresionarTecla}
      className={encontrada ? ENCONTRADA : SIN_ENCONTRAR}
    >
      {texto}
    </span>
  );
}
