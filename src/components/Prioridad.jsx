const ESTILOS = {
  Urgente: "bg-peligro text-white",
  Importante: "bg-advertencia-suave text-advertencia-texto",
  Revisa: "bg-pista text-texto-secundario",
};

/** Etiqueta de prioridad (constitución §7.5): siempre con texto, no solo color (FR-036a). */
export default function Prioridad({ prioridad }) {
  return (
    <span
      className={`inline-block rounded-etiqueta px-2 py-0.5 text-xs font-bold ${ESTILOS[prioridad]}`}
    >
      {prioridad}
    </span>
  );
}
