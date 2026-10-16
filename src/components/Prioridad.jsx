const ESTILOS = {
  Urgente: "border-red-700 bg-red-50 text-red-800",
  Importante: "border-amber-700 bg-amber-50 text-amber-900",
  Revisa: "border-blue-700 bg-blue-50 text-blue-800",
};

/** Etiqueta de prioridad: texto y borde, no solo color (FR-036a). */
export default function Prioridad({ prioridad }) {
  return (
    <span className={`inline-block rounded border-2 px-2 text-sm font-bold ${ESTILOS[prioridad]}`}>
      {prioridad}
    </span>
  );
}
