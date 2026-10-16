import { Lock, ShieldCheck, Smartphone, TriangleAlert, User } from "lucide-react";
import { useState } from "react";
import Dialogo from "../components/Dialogo.jsx";
import { BOTON_EMERGENCIA, BOTON_PRINCIPAL } from "../components/botones.js";
import { POLITICA_PRIVACIDAD } from "../data/politica.js";

const GARANTIAS = [
  { texto: "Nunca pedimos contraseñas", Icono: Lock },
  { texto: "Respuestas anónimas", Icono: User },
  { texto: "No entramos a tu celular", Icono: Smartphone },
];

export default function Inicio({
  consentimiento,
  onCambiarConsentimiento,
  onEmpezar,
  onEmergencia,
}) {
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-primario">
            <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" className="text-white" />
          </span>
          <span className="text-xl font-extrabold text-texto">Escudo</span>
        </div>
        <span className="rounded-full bg-pista px-3 py-1 text-xs font-semibold text-texto-secundario">
          Gratis · 5 min
        </span>
      </header>

      <div className="flex flex-col gap-3">
        {/* Mayúsculas por CSS para que el lector de pantalla no deletree la etiqueta. */}
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-primario">
          Diagnóstico de seguridad digital
        </p>
        <h1 tabIndex={-1} className="text-bienvenida text-texto">
          ¿Qué tan fácil sería estafarte?
        </h1>
        <p className="text-[17px] leading-normal text-texto-secundario">
          Responde 14 preguntas sobre tus hábitos y te mostramos tu nivel de riesgo y qué corregir
          primero.
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-2.5">
        {GARANTIAS.map(({ texto, Icono }) => (
          <li
            key={texto}
            className="flex flex-col gap-2 rounded-tarjeta border border-borde bg-superficie p-3"
          >
            <Icono size={22} strokeWidth={2} aria-hidden="true" className="text-primario" />
            <span className="text-[13px] font-semibold leading-snug text-texto">{texto}</span>
          </li>
        ))}
      </ul>

      <div className="flex-1" aria-hidden="true" />

      <div className="flex flex-col gap-3">
        <div className="relative rounded-tarjeta border border-borde bg-superficie p-5">
          {/* "Ver política" va fuera del <label>: abrirla no cambia la casilla. El relleno del
              <label> cubre casilla, hueco y texto con 44px de alto sin separar las líneas (§7.7). */}
          <p className="pl-8 text-sm text-texto">
            <label className="-ml-8 cursor-pointer py-[13px] pl-8">
              <input
                type="checkbox"
                checked={consentimiento}
                onChange={(evento) => onCambiarConsentimiento(evento.target.checked)}
                className="absolute top-5 left-5 size-5 accent-primario"
              />
              Acepto el tratamiento de mis respuestas según la Ley 1581 de 2012.
            </label>{" "}
            <button
              type="button"
              className="-my-3 inline-block py-3 font-semibold text-primario underline underline-offset-2"
              onClick={() => setPoliticaAbierta(true)}
            >
              Ver política
            </button>
          </p>
        </div>

        <button
          type="button"
          className={BOTON_PRINCIPAL}
          disabled={!consentimiento}
          onClick={onEmpezar}
        >
          Empezar diagnóstico
        </button>
        <button type="button" className={BOTON_EMERGENCIA} onClick={onEmergencia}>
          <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
          Tengo una emergencia ahora
        </button>
      </div>

      <footer className="text-center text-xs text-texto-suave">
        Basado en NIST CSF 2.0 y CIS Controls v8.1
      </footer>

      <Dialogo
        abierto={politicaAbierta}
        titulo={POLITICA_PRIVACIDAD.titulo}
        onCerrar={() => setPoliticaAbierta(false)}
        acciones={
          <button
            type="button"
            className={BOTON_PRINCIPAL}
            onClick={() => setPoliticaAbierta(false)}
          >
            Cerrar
          </button>
        }
      >
        {POLITICA_PRIVACIDAD.secciones.map(({ subtitulo, texto }) => (
          <section key={subtitulo} className="mb-3">
            <h3 className="font-bold text-texto">{subtitulo}</h3>
            <p>{texto}</p>
          </section>
        ))}
      </Dialogo>
    </div>
  );
}
