import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import {
  LISTA_TARJETAS,
  TARJETA,
  TEXTO_LECTURA,
  TITULO_PANTALLA,
  TITULO_SECCION,
} from "../components/estilos.js";
import {
  AVISO_NO_BORRES,
  CANALES_DENUNCIA,
  GUIAS_EMERGENCIA,
  LINEAS_BANCARIAS,
} from "../data/emergencias.js";

const PREFIJO_GUIA = "guia:";

/** Íconos de cada guía según el mapa de la constitución §7.9. */
const ICONOS_GUIA = { tarjetas: CreditCard, whatsapp: MessageCircle, phishing: Mail };

function AvisoNoBorres() {
  return (
    <aside className={`${TARJETA} flex gap-3`}>
      <FileText size={24} strokeWidth={2} aria-hidden="true" className="shrink-0 text-peligro" />
      <div>
        <h2 className="font-bold text-texto">{AVISO_NO_BORRES.titulo}</h2>
        <p className={TEXTO_LECTURA}>{AVISO_NO_BORRES.texto}</p>
      </div>
    </aside>
  );
}

function Menu({ ir }) {
  return (
    <>
      <p className={TEXTO_LECTURA}>Elige lo que te pasó:</p>
      <ul className={LISTA_TARJETAS}>
        {GUIAS_EMERGENCIA.map(({ id, titulo }) => {
          const Icono = ICONOS_GUIA[id];
          return (
            <li key={id}>
              <button
                type="button"
                className={`${TARJETA} flex min-h-11 w-full items-center gap-3 text-left font-bold text-texto`}
                onClick={() => ir(`${PREFIJO_GUIA}${id}`)}
              >
                {Icono && (
                  <Icono size={24} strokeWidth={2} aria-hidden="true" className="text-peligro" />
                )}
                <span className="flex-1">{titulo}</span>
                <ChevronRight
                  size={20}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="text-texto-suave"
                />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-3">
        <button type="button" className={BOTON_PRINCIPAL} onClick={() => ir("bancos")}>
          <Phone size={20} strokeWidth={2} aria-hidden="true" />
          Llamar a la línea de mi banco
        </button>
        <button type="button" className={BOTON_SECUNDARIO} onClick={() => ir("denuncia")}>
          Cómo denunciar en Colombia
        </button>
      </div>
    </>
  );
}

function Guia({ id }) {
  const guia = GUIAS_EMERGENCIA.find((g) => g.id === id);
  if (!guia) return null;
  return (
    <section className={`${TARJETA} flex flex-col gap-3`}>
      <h2 className={TITULO_SECCION}>{guia.titulo}</h2>
      <ol className={`list-decimal space-y-2 pl-6 ${TEXTO_LECTURA}`}>
        {guia.pasos.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>
    </section>
  );
}

function Bancos() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={TITULO_SECCION}>Líneas de los bancos</h2>
      <ul className={LISTA_TARJETAS}>
        {LINEAS_BANCARIAS.map(({ banco, numero }) => (
          <li key={banco}>
            <a
              href={`tel:${encodeURIComponent(numero)}`}
              className={`${TARJETA} flex min-h-11 flex-wrap items-center justify-between gap-2`}
            >
              <span className="font-semibold text-texto">{banco}</span>
              <span className="flex items-center gap-2 font-bold text-primario underline">
                <Phone size={20} strokeWidth={2} aria-hidden="true" />
                {numero}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Denuncia() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={TITULO_SECCION}>Cómo denunciar en Colombia</h2>
      <ul className={LISTA_TARJETAS}>
        {CANALES_DENUNCIA.map(({ entidad, contacto, enlace }) => (
          <li key={entidad} className={TARJETA}>
            <p className="font-semibold text-texto">{entidad}</p>
            <p className={TEXTO_LECTURA}>{contacto}</p>
            {enlace && (
              <a
                href={enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-primario underline"
              >
                Ir al sitio oficial (se abre en otra pestaña)
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function VistaActual({ vista, ir }) {
  if (vista.startsWith(PREFIJO_GUIA)) return <Guia id={vista.slice(PREFIJO_GUIA.length)} />;
  if (vista === "bancos") return <Bancos />;
  if (vista === "denuncia") return <Denuncia />;
  return <Menu ir={ir} />;
}

export default function Emergencia({ vista = "menu", navegar, hayDiagnostico, onVolverAlInicio }) {
  function ir(destino) {
    navegar({ pantalla: "emergencia", vista: destino });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 tabIndex={-1} className={TITULO_PANTALLA}>
        Respira. Vamos paso a paso.
      </h1>
      <VistaActual vista={vista} ir={ir} />
      {vista !== "menu" && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={() => ir("menu")}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          Volver a las opciones
        </button>
      )}
      <AvisoNoBorres />
      {!hayDiagnostico && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={onVolverAlInicio}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          Volver al inicio
        </button>
      )}
    </div>
  );
}
