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

/** Pantallas con fondo `superficie`; Inicio y Diagnóstico van en `fondo` (FR-036d). */
const PANTALLAS_EN_SUPERFICIE = ["resultado", "plan", "tips", "emergencia"];

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
  const { estado, navegar, navegarConGuarda, reemplazar, registrarInterceptorAtras } =
    useNavegacion({
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
    navegar({ pantalla: "emergencia" });
  }

  // La barra pasa por la guarda: Emergencia pide confirmar si hay una guía a medias (FR-031).
  function navegarDesdeBarra(destino) {
    navegarConGuarda({ pantalla: destino });
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
            navegar={navegar}
            registrarInterceptorAtras={registrarInterceptorAtras}
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

  // pb-24 = 96px: deja libre la barra inferior de 72px más 24px de margen.
  const fondo = PANTALLAS_EN_SUPERFICIE.includes(pantalla) ? "bg-superficie" : "bg-fondo";

  return (
    <div className={`flex min-h-dvh flex-col ${fondo}`}>
      <main
        className={`mx-auto flex w-full max-w-columna flex-1 flex-col gap-4 px-6 py-6 text-texto ${mostrarBarra ? "pb-24" : ""}`}
      >
        {escudo.aviso && <AvisoAlmacenamiento tipo={escudo.aviso} onCerrar={escudo.cerrarAviso} />}
        {renderizarPantalla()}
      </main>
      {mostrarBarra && <BarraNavegacion pantallaActual={pantalla} onNavegar={navegarDesdeBarra} />}
    </div>
  );
}
