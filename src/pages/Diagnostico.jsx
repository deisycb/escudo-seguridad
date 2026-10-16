import { useEffect, useState } from "react";
import Dialogo from "../components/Dialogo.jsx";
import TarjetaPregunta from "../components/TarjetaPregunta.jsx";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from "../components/botones.js";
import { DIMENSIONES, TOTAL_PREGUNTAS } from "../logic/constantes.js";

function nombreDimension(id) {
  return DIMENSIONES.find((dimension) => dimension.id === id)?.nombre;
}

export default function Diagnostico({
  preguntas,
  numero,
  navegar,
  registrarInterceptorAtras,
  onCompletar,
  onSalir,
}) {
  // Las respuestas viven solo aquí: nunca se guardan a medias.
  const [respuestas, setRespuestas] = useState(() => Array(TOTAL_PREGUNTAS).fill(null));
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const pregunta = preguntas[numero - 1];
  const respuesta = respuestas[numero - 1];

  useEffect(
    () =>
      registrarInterceptorAtras((destino) => {
        const avanza = destino.pantalla === "diagnostico" && destino.pregunta > numero;
        if (numero !== 1 || avanza) return false;
        setConfirmarSalida(true);
        return true;
      }),
    [numero, registrarInterceptorAtras],
  );

  function responder(letra) {
    setRespuestas((actuales) => actuales.map((r, i) => (i === numero - 1 ? letra : r)));
  }

  function siguiente() {
    if (numero < TOTAL_PREGUNTAS) {
      navegar({ pantalla: "diagnostico", pregunta: numero + 1 });
      return;
    }
    // Con el "adelante" del navegador se pueden saltar preguntas: solo se termina con las 14 (FR-012).
    const faltante = respuestas.indexOf(null);
    if (faltante === -1) onCompletar(respuestas);
    else navegar({ pantalla: "diagnostico", pregunta: faltante + 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      <TarjetaPregunta
        pregunta={pregunta}
        numero={numero}
        nombreDimension={nombreDimension(pregunta.dimension)}
        respuesta={respuesta}
        onResponder={responder}
      />
      <div className="flex flex-wrap gap-3">
        {numero > 1 && (
          <button type="button" className={BOTON_SECUNDARIO} onClick={() => history.back()}>
            Anterior
          </button>
        )}
        <button type="button" className={BOTON_PRINCIPAL} disabled={!respuesta} onClick={siguiente}>
          Siguiente
        </button>
        <button
          type="button"
          className={`${BOTON_SECUNDARIO} ml-auto`}
          onClick={() => setConfirmarSalida(true)}
        >
          Salir
        </button>
      </div>

      <Dialogo
        abierto={confirmarSalida}
        titulo="¿Salir del diagnóstico?"
        onCerrar={() => setConfirmarSalida(false)}
        acciones={
          <>
            <button
              type="button"
              className={BOTON_SECUNDARIO}
              onClick={() => setConfirmarSalida(false)}
            >
              Seguir respondiendo
            </button>
            <button type="button" className={BOTON_PRINCIPAL} onClick={onSalir}>
              Sí, salir
            </button>
          </>
        }
      >
        <p>Si sales ahora, tus respuestas de este diagnóstico se borran.</p>
      </Dialogo>
    </div>
  );
}
