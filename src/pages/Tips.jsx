import { Lightbulb, TriangleAlert } from "lucide-react";
import { useState } from "react";
import TarjetaTip from "../components/TarjetaTip.jsx";
import { BOTON_EMERGENCIA } from "../components/botones.js";
import {
  CHIP,
  LISTA_TARJETAS,
  TARJETA,
  TEXTO_LECTURA,
  TITULO_PANTALLA,
  TITULO_SECCION,
} from "../components/estilos.js";
import { REGLA_DE_ORO, TIPS } from "../data/tips.js";

const FILTROS = [
  { etiqueta: "Todos", canal: null },
  { etiqueta: "SMS", canal: "sms" },
  { etiqueta: "Llamadas", canal: "llamada" },
  { etiqueta: "Correo", canal: "correo" },
  { etiqueta: "WhatsApp", canal: "whatsapp" },
];

// Filtros como chips píldora: interpretación de §7 anotada en research R18.
const CLASE_FILTRO = `${CHIP} min-h-11 min-w-11 justify-center px-4 text-sm border border-borde bg-fondo text-texto-secundario aria-pressed:border-primario aria-pressed:bg-primario aria-pressed:text-white`;

export default function Tips({ onIrAEmergencia }) {
  const [canal, setCanal] = useState(null);
  const visibles = canal ? TIPS.filter((tip) => tip.canal === canal) : TIPS;

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Tips de seguridad
      </h1>

      <section className={`${TARJETA} flex gap-3 border-l-4 border-l-primario`}>
        <Lightbulb
          size={24}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 text-primario"
        />
        <div>
          <h2 className={TITULO_SECCION}>Regla de oro</h2>
          <p className={`mt-1 ${TEXTO_LECTURA}`}>{REGLA_DE_ORO}</p>
        </div>
      </section>

      <div role="group" aria-label="Filtrar por canal" className="flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.etiqueta}
            type="button"
            aria-pressed={canal === filtro.canal}
            onClick={() => setCanal(filtro.canal)}
            className={CLASE_FILTRO}
          >
            {filtro.etiqueta}
          </button>
        ))}
      </div>

      <ul className={LISTA_TARJETAS}>
        {visibles.map((tip) => (
          <li key={tip.id}>
            <TarjetaTip tip={tip} />
          </li>
        ))}
      </ul>

      <button type="button" className={BOTON_EMERGENCIA} onClick={onIrAEmergencia}>
        <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
        ¿Ya caíste en una? Ve a primeros auxilios
      </button>
    </div>
  );
}
