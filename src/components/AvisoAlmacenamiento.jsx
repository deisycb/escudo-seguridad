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
      className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border-2 border-amber-700 bg-amber-50 p-4 text-gray-900"
    >
      <p className="flex-1">{TEXTOS[tipo]}</p>
      <button
        type="button"
        onClick={onCerrar}
        className="min-h-11 min-w-11 rounded-md border-2 border-amber-700 px-3 font-semibold text-amber-900"
      >
        Cerrar aviso
      </button>
    </div>
  );
}
