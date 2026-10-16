import { useRef, useState } from "react";
import { PREGUNTAS } from "../data/preguntas.js";
import { RECOMENDACIONES } from "../data/recomendaciones.js";
import { Almacenamiento } from "../logic/Almacenamiento.js";
import { Diagnostico } from "../logic/Diagnostico.js";
import { PlanAccion } from "../logic/PlanAccion.js";
import { Pregunta } from "../logic/Pregunta.js";

const PREGUNTAS_ESCUDO = PREGUNTAS.map((datos) => new Pregunta(datos));

const SIN_DIAGNOSTICO = { diagnostico: null, plan: null };

function crearEstado(respuestas, fecha, accionesHechas) {
  const diagnostico = new Diagnostico(PREGUNTAS_ESCUDO, respuestas, fecha);
  return { diagnostico, plan: new PlanAccion(diagnostico, RECOMENDACIONES, accionesHechas) };
}

function cargarInicio(almacenamiento) {
  const { estado, datos } = almacenamiento.cargar(PREGUNTAS_ESCUDO);
  if (estado !== "valido") {
    return { ...SIN_DIAGNOSTICO, aviso: estado === "vacio" ? null : estado, estadoInicial: estado };
  }
  try {
    const { respuestas, fecha, accionesHechas } = datos;
    return {
      ...crearEstado(respuestas, fecha, accionesHechas),
      aviso: null,
      estadoInicial: estado,
    };
  } catch {
    // Datos que pasaron la validación pero no encajan con el contenido actual.
    almacenamiento.borrar();
    return { ...SIN_DIAGNOSTICO, aviso: "corrupto", estadoInicial: "corrupto" };
  }
}

// La carga se hace una sola vez por sesión: si el registro está corrupto se borra,
// y una segunda lectura (por ejemplo, el doble render de StrictMode) perdería el aviso.
let cargaInicial = null;
const almacenamiento = new Almacenamiento();

function obtenerCargaInicial() {
  cargaInicial ??= cargarInicio(almacenamiento);
  return cargaInicial;
}

/**
 * Estado global de Escudo: diagnóstico, plan de acción y avisos de guardado.
 * Todo el cálculo lo hacen Diagnostico y PlanAccion.
 */
export function useEstadoEscudo() {
  const [inicial] = useState(obtenerCargaInicial);
  const [{ diagnostico, plan }, setEstado] = useState(inicial);
  const [aviso, setAviso] = useState(inicial.aviso);
  const avisoNoDisponibleMostrado = useRef(inicial.aviso === "no-disponible");

  function avisarSiNoSeGuardo(guardado) {
    if (guardado || avisoNoDisponibleMostrado.current) return;
    avisoNoDisponibleMostrado.current = true;
    setAviso("no-disponible");
  }

  function completarDiagnostico(respuestas) {
    const fecha = new Date().toISOString();
    setEstado(crearEstado(respuestas, fecha, []));
    avisarSiNoSeGuardo(almacenamiento.guardarDiagnostico(respuestas, fecha));
  }

  function alternarAccion(numero) {
    const hecha = plan.obtenerAccionesHechas().includes(numero);
    const nuevo = hecha ? plan.desmarcar(numero) : plan.marcarHecha(numero);
    setEstado({ diagnostico, plan: nuevo });
    avisarSiNoSeGuardo(almacenamiento.guardarProgreso(nuevo.obtenerAccionesHechas()));
  }

  return {
    preguntas: PREGUNTAS_ESCUDO,
    diagnostico,
    plan,
    aviso,
    cerrarAviso: () => setAviso(null),
    estadoInicial: inicial.estadoInicial,
    completarDiagnostico,
    alternarAccion,
  };
}
