import { BOTON_ALERTA, BOTON_SECUNDARIO } from "../components/botones.js";
import {
  AVISO_NO_BORRES,
  CANALES_DENUNCIA,
  GUIAS_EMERGENCIA,
  LINEAS_BANCARIAS,
} from "../data/emergencias.js";

const PREFIJO_GUIA = "guia:";

function AvisoNoBorres() {
  return (
    <aside className="rounded-lg border-2 border-amber-700 bg-amber-50 p-4">
      <h2 className="font-bold">{AVISO_NO_BORRES.titulo}</h2>
      <p>{AVISO_NO_BORRES.texto}</p>
    </aside>
  );
}

function Menu({ ir }) {
  return (
    <>
      <p className="text-lg">Elige lo que te pasó:</p>
      <div className="flex flex-col gap-3">
        {GUIAS_EMERGENCIA.map(({ id, titulo }) => (
          <button
            key={id}
            type="button"
            className={BOTON_ALERTA}
            onClick={() => ir(`${PREFIJO_GUIA}${id}`)}
          >
            {titulo}
          </button>
        ))}
        <button type="button" className={BOTON_SECUNDARIO} onClick={() => ir("bancos")}>
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
    <section>
      <h2 className="text-xl font-bold">{guia.titulo}</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-6">
        {guia.pasos.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>
    </section>
  );
}

function Bancos() {
  return (
    <section>
      <h2 className="text-xl font-bold">Líneas de los bancos</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {LINEAS_BANCARIAS.map(({ banco, numero }) => (
          <li key={banco}>
            <a
              href={`tel:${encodeURIComponent(numero)}`}
              className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-gray-300 p-3"
            >
              <span className="font-semibold">{banco}</span>
              <span className="text-blue-800 underline">{numero}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Denuncia() {
  return (
    <section>
      <h2 className="text-xl font-bold">Cómo denunciar en Colombia</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {CANALES_DENUNCIA.map(({ entidad, contacto, enlace }) => (
          <li key={entidad} className="rounded-lg border-2 border-gray-300 p-3">
            <p className="font-semibold">{entidad}</p>
            <p>{contacto}</p>
            {enlace && (
              <a
                href={enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-blue-800 underline"
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
      <h1 tabIndex={-1} className="text-3xl font-bold">
        Respira. Vamos paso a paso.
      </h1>
      <VistaActual vista={vista} ir={ir} />
      {vista !== "menu" && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={() => ir("menu")}>
          Volver a las opciones
        </button>
      )}
      <AvisoNoBorres />
      {!hayDiagnostico && (
        <button type="button" className={BOTON_SECUNDARIO} onClick={onVolverAlInicio}>
          Volver al inicio
        </button>
      )}
    </div>
  );
}
