import { ChevronDown, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { useId, useState } from "react";
import TextoContenido from "./TextoContenido.jsx";
import { ETIQUETA_SUAVE, TARJETA, TEXTO_LECTURA } from "./estilos.js";

/** Nombre visible e ícono de cada canal (constitución §7.9). */
const CANALES = {
  sms: { nombre: "SMS", Icono: MessageSquare },
  llamada: { nombre: "Llamada", Icono: Phone },
  correo: { nombre: "Correo", Icono: Mail },
  whatsapp: { nombre: "WhatsApp", Icono: MessageCircle },
};

/** Tarjeta de una estafa común con su detalle desplegable. */
export default function TarjetaTip({ tip }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();
  const { nombre, Icono } = CANALES[tip.canal];

  return (
    <article className={`${TARJETA} flex flex-col gap-3`}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idDetalle}
        onClick={() => setAbierta(!abierta)}
        className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
      >
        <span className="flex flex-col gap-1">
          <span className={`flex items-center gap-2 ${ETIQUETA_SUAVE}`}>
            <Icono size={20} strokeWidth={2} aria-hidden="true" className="text-primario" />
            {nombre} · {tip.tipoAtaque}
          </span>
          <span className="font-bold text-texto">{tip.titulo}</span>
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-texto-suave transition-transform ${abierta ? "rotate-180" : ""}`}
        />
      </button>
      <div id={idDetalle} hidden={!abierta} className={`space-y-4 ${TEXTO_LECTURA}`}>
        <section>
          <h3 className="font-bold text-texto">Cómo reconocerla</h3>
          <TextoContenido valor={tip.comoReconocerla} />
        </section>
        <section>
          <h3 className="font-bold text-texto">Qué hacer</h3>
          <TextoContenido valor={tip.queHacer} />
        </section>
      </div>
    </article>
  );
}
