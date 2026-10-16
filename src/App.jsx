import { useEffect, useState } from "react";
import AvisoAlmacenamiento from "./components/AvisoAlmacenamiento.jsx";
import BarraNavegacion from "./components/BarraNavegacion.jsx";
import { useEstadoEscudo } from "./hooks/useEstadoEscudo.js";
import { useNavegacion } from "./hooks/useNavegacion.js";
import { TOTAL_PREGUNTAS } from "./logic/constantes.js";
import Diagnostico from "./pages/Diagnostico.jsx";
import Emergencia from "./pages/Emergencia.jsx";
import Inicio from "./pages/Inicio.jsx";
import PlanAccion from "./pages/PlanAccion.jsx";
import Resultado from "./pages/Resultado.jsx";
import Tips from "./pages/Tips.jsx";

const REQUIEREN_DIAGNOSTICO = ["resultado", "plan", "tips"];

/** Guardas de contracts/pantallas.md: decide qué pantalla se muestra realmente. */
function resolverPantalla(pantalla, { hayDiagnostico, consentimiento, hayPreguntas }) {
  if (REQUIEREN_DIAGNOSTICO.includes(pantalla) && !hayDiagnostico) return "inicio";
  if (pantalla === "diagnostico" && !(consentimiento && hayPreguntas)) return "inicio";
  return pantalla;
}

function limitarPregunta(numero) {
  return Math.min(Math.max(Number(numero) || 1, 1), TOTAL_PREGUNTAS);
}

export default function App() {
  const escudo = useEstadoEscudo();
  const { estado, navegar, reemplazar, registrarInterceptorAtras } = useNavegacion({
    pantalla: escudo.estadoInicial === "valido" ? "resultado" : "inicio",
  });
  const [consentimiento, setConsentimiento] = useState(false);
  const hayDiagnostico = escudo.diagnostico !== null;
  const pantalla = resolverPantalla(estado.pantalla, {
    hayDiagnostico,
    consentimiento,
    hayPreguntas: escudo.preguntas.length === TOTAL_PREGUNTAS,
  });

  // Si una guarda redirige (por ejemplo, una entrada vieja del historial a la encuesta), la entrada
  // se reemplaza: así marcar la casilla no reabre la encuesta sin "Empezar diagnóstico" (FR-003).
  useEffect(() => {
    if (pantalla !== estado.pantalla) reemplazar({ pantalla });
  }, [pantalla, estado.pantalla, reemplazar]);

  // La casilla de consentimiento se desmarca cada vez que se entra a Inicio (FR-005).
  const [pantallaPrevia, setPantallaPrevia] = useState(pantalla);
  if (pantalla !== pantallaPrevia) {
    setPantallaPrevia(pantalla);
    if (pantalla === "inicio") setConsentimiento(false);
  }

  function salirDelDiagnostico() {
    setConsentimiento(false);
    navegar({ pantalla: hayDiagnostico ? "resultado" : "inicio" });
  }

  function completarDiagnostico(respuestas) {
    escudo.completarDiagnostico(respuestas);
    setConsentimiento(false);
    navegar({ pantalla: "resultado" });
  }

  function irAEmergencia() {
    navegar({ pantalla: "emergencia", vista: "menu" });
  }

  function navegarDesdeBarra(destino) {
    if (destino === "emergencia") irAEmergencia();
    else navegar({ pantalla: destino });
  }

  function renderizarPantalla() {
    switch (pantalla) {
      case "diagnostico":
        return (
          <Diagnostico
            preguntas={escudo.preguntas}
            numero={limitarPregunta(estado.pregunta)}
            navegar={navegar}
            registrarInterceptorAtras={registrarInterceptorAtras}
            onCompletar={completarDiagnostico}
            onSalir={salirDelDiagnostico}
          />
        );
      case "resultado":
        return (
          <Resultado
            diagnostico={escudo.diagnostico}
            onVerPlan={() => navegar({ pantalla: "plan" })}
            onRepetir={() => navegar({ pantalla: "inicio" })}
          />
        );
      case "plan":
        return <PlanAccion plan={escudo.plan} onAlternarAccion={escudo.alternarAccion} />;
      case "tips":
        return <Tips onIrAEmergencia={irAEmergencia} />;
      case "emergencia":
        return (
          <Emergencia
            vista={estado.vista}
            navegar={navegar}
            hayDiagnostico={hayDiagnostico}
            onVolverAlInicio={() => navegar({ pantalla: "inicio" })}
          />
        );
      default:
        return (
          <Inicio
            consentimiento={consentimiento}
            onCambiarConsentimiento={setConsentimiento}
            onEmpezar={() => navegar({ pantalla: "diagnostico", pregunta: 1 })}
            onEmergencia={irAEmergencia}
          />
        );
    }
  }

  const mostrarBarra = hayDiagnostico && pantalla !== "diagnostico";

  return (
    <>
      <main className={`mx-auto max-w-2xl px-4 py-6 text-gray-900 ${mostrarBarra ? "pb-28" : ""}`}>
        {escudo.aviso && <AvisoAlmacenamiento tipo={escudo.aviso} onCerrar={escudo.cerrarAviso} />}
        {renderizarPantalla()}
      </main>
      {mostrarBarra && <BarraNavegacion pantallaActual={pantalla} onNavegar={navegarDesdeBarra} />}
    </>
  );
}
