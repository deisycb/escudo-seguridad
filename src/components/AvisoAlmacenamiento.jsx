import { TriangleAlert, X } from "lucide-react";

const TEXTOS = {
  corrupto: "No pudimos recuperar tu diagnóstico anterior. Puedes hacerlo de nuevo.",
  "no-disponible":
    "Tu navegador no permite guardar. Puedes usar Escudo, pero tu resultado no se guardará al cerrar.",
};

/** Aviso amigable sobre el guardado en el dispositivo; nunca muestra detalles técnicos. */
export default function AvisoAlmacenamiento({ tipo, onCerrar }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-tarjeta border border-advertencia bg-advertencia-suave p-4 text-advertencia-texto"
    >
      <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
      <p className="flex-1 font-semibold">{TEXTOS[tipo]}</p>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={onCerrar}
        className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-boton"
      >
        <X size={20} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
