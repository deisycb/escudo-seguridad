// Clases de Tailwind compartidas por los botones (áreas táctiles ≥ 44×44 px, tonos 700).
const BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50";

export const BOTON_PRINCIPAL = `${BASE} bg-blue-700 text-white`;
export const BOTON_SECUNDARIO = `${BASE} border-2 border-blue-700 bg-white text-blue-800`;
export const BOTON_ALERTA = `${BASE} bg-red-700 text-white`;
export const BOTON_ENLACE = "min-h-11 font-semibold text-blue-800 underline underline-offset-2";
