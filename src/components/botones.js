// Clases de los botones del sistema de diseño (constitución §7.4 y §7.5). Solo tokens.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-boton px-4 font-bold disabled:cursor-not-allowed disabled:opacity-50";

export const BOTON_PRINCIPAL = `${BASE} h-14 w-full bg-primario text-white hover:bg-primario-oscuro active:bg-primario-oscuro`;
export const BOTON_SECUNDARIO = `${BASE} h-14 w-full border border-primario bg-fondo text-primario`;
export const BOTON_EMERGENCIA = `${BASE} h-[52px] w-full border-[1.5px] border-peligro bg-fondo text-peligro`;
export const BOTON_ENLACE =
  "inline-flex min-h-11 items-center gap-1 font-semibold text-primario underline underline-offset-2";
