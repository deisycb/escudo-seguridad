const SECCIONES = [
  { pantalla: "resultado", etiqueta: "Resultado", icono: "M3 13h4v8H3zm7-6h4v14h-4zm7 3h4v11h-4z" },
  {
    pantalla: "plan",
    etiqueta: "Mi plan",
    icono: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
  },
  {
    pantalla: "tips",
    etiqueta: "Tips",
    icono: "M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
  },
  {
    pantalla: "emergencia",
    etiqueta: "Emergencia",
    icono: "M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z",
  },
];

function claseBoton(pantalla, activa) {
  const color = pantalla === "emergencia" ? "text-red-700" : "text-gray-800";
  const indicador = activa ? "border-current font-bold" : "border-transparent";
  return `flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 border-t-4 py-1 text-xs ${color} ${indicador}`;
}

/** Barra inferior con las 4 secciones; solo se muestra cuando hay diagnóstico. */
export default function BarraNavegacion({ pantallaActual, onNavegar }) {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 border-t border-gray-300 bg-white"
    >
      <ul className="mx-auto flex max-w-2xl">
        {SECCIONES.map(({ pantalla, etiqueta, icono }) => {
          const activa = pantalla === pantallaActual;
          return (
            <li key={pantalla} className="flex flex-1">
              <button
                type="button"
                aria-current={activa ? "page" : undefined}
                onClick={() => onNavegar(pantalla)}
                className={claseBoton(pantalla, activa)}
              >
                <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true">
                  <path d={icono} />
                </svg>
                {etiqueta}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
