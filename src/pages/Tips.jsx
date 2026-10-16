import { useState } from "react";
import TarjetaTip from "../components/TarjetaTip.jsx";
import { BOTON_ALERTA } from "../components/botones.js";
import { REGLA_DE_ORO, TIPS } from "../data/tips.js";

const FILTROS = [
  { etiqueta: "Todos", canal: null },
  { etiqueta: "SMS", canal: "sms" },
  { etiqueta: "Llamadas", canal: "llamada" },
  { etiqueta: "Correo", canal: "correo" },
  { etiqueta: "WhatsApp", canal: "whatsapp" },
];

export default function Tips({ onIrAEmergencia }) {
  const [canal, setCanal] = useState(null);
  const visibles = canal ? TIPS.filter((tip) => tip.canal === canal) : TIPS;

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className="text-3xl font-bold">
        Tips de seguridad
      </h1>

      <section className="rounded-lg border-4 border-blue-700 bg-blue-50 p-4">
        <h2 className="font-bold text-blue-900">Regla de oro</h2>
        <p className="mt-1 text-lg">{REGLA_DE_ORO}</p>
      </section>

      <div role="group" aria-label="Filtrar por canal" className="flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.etiqueta}
            type="button"
            aria-pressed={canal === filtro.canal}
            onClick={() => setCanal(filtro.canal)}
            className="min-h-11 min-w-11 rounded-full border-2 border-blue-700 px-4 font-semibold text-blue-800 aria-pressed:bg-blue-700 aria-pressed:text-white"
          >
            {filtro.etiqueta}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {visibles.map((tip) => (
          <li key={tip.id}>
            <TarjetaTip tip={tip} />
          </li>
        ))}
      </ul>

      <button type="button" className={BOTON_ALERTA} onClick={onIrAEmergencia}>
        ¿Ya caíste en una? Ve a primeros auxilios
      </button>
    </div>
  );
}
