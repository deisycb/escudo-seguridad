import { ChevronDown, Phone } from "lucide-react";
import { useId, useRef, useState } from "react";
import { TEXTOS_ASISTENTE } from "../logic/ConversacionEmergencia.js";

const BASE =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-boton px-4 py-2 font-bold";
const LLAMAR = `${BASE} flex-1 bg-primario text-white hover:bg-primario-oscuro active:bg-primario-oscuro`;
const MAS_AYUDA = `${BASE} shrink-0 border border-primario bg-fondo text-primario`;
const ACCION_PANEL =
  "inline-flex min-h-11 w-full items-center justify-center rounded-boton border border-primario bg-fondo px-4 py-2 font-bold text-primario";

/**
 * Acciones fijas al pie de Emergencia (spec 003, FR-014): "Llamar a la línea de mi banco" y
 * "Más ayuda", que despliega "Cómo denunciar en Colombia" y "Empezar de nuevo" (research R4).
 * @param {{ hayBarra: boolean, onLlamarBanco: () => void, onComoDenunciar: () => void,
 *   onEmpezarDeNuevo: () => void, refMasAyuda?: object }} props `refMasAyuda` permite
 *   devolver el foco a "Más ayuda" desde la pantalla.
 */
export default function AccionesRapidas({
  hayBarra,
  onLlamarBanco,
  onComoDenunciar,
  onEmpezarDeNuevo,
  refMasAyuda,
}) {
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();
  const refPropia = useRef(null);
  const refBoton = refMasAyuda ?? refPropia;

  function elegir(accion) {
    setAbierto(false);
    accion();
  }

  function cerrarConEsc(evento) {
    if (evento.key !== "Escape" || !abierto) return;
    setAbierto(false);
    refBoton.current?.focus();
  }

  return (
    <nav
      aria-label="Acciones rápidas"
      className={`sticky ${hayBarra ? "bottom-barra" : "bottom-0"} -mx-6 mt-auto flex flex-col gap-2 border-t border-borde bg-superficie px-6 py-2`}
    >
      {abierto && (
        <div id={idPanel} className="flex flex-col gap-2">
          <button
            type="button"
            className={ACCION_PANEL}
            onClick={() => elegir(onComoDenunciar)}
            onKeyDown={cerrarConEsc}
          >
            {TEXTOS_ASISTENTE.comoDenunciar}
          </button>
          <button
            type="button"
            className={ACCION_PANEL}
            onClick={() => elegir(onEmpezarDeNuevo)}
            onKeyDown={cerrarConEsc}
          >
            {TEXTOS_ASISTENTE.empezarDeNuevo}
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" className={LLAMAR} onClick={onLlamarBanco}>
          <Phone size={20} strokeWidth={2} aria-hidden="true" className="shrink-0" />
          {TEXTOS_ASISTENTE.llamarBanco}
        </button>
        <button
          type="button"
          ref={refBoton}
          className={MAS_AYUDA}
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto((actual) => !actual)}
          onKeyDown={cerrarConEsc}
        >
          {TEXTOS_ASISTENTE.masAyuda}
          <ChevronDown
            size={20}
            strokeWidth={2}
            aria-hidden="true"
            className={abierto ? "rotate-180" : undefined}
          />
        </button>
      </div>
    </nav>
  );
}
