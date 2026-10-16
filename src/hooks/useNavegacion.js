import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Navegación propia con la History API (R1): sin react-router y sin cambiar la URL.
 * El estado es { pantalla, pregunta?, vista? }.
 * @param {object} inicial Estado con el que arranca la app.
 */
export function useNavegacion(inicial) {
  const [estado, setEstado] = useState(inicial);
  const estadoActual = useRef(inicial);
  const interceptorAtras = useRef(null);
  const esPrimerRender = useRef(true);

  useEffect(() => {
    history.replaceState(estadoActual.current, "");
    function alVolver(evento) {
      const nuevo = evento.state ?? estadoActual.current;
      if (interceptorAtras.current?.(nuevo)) {
        // La pantalla se quedó con el "atrás": se restaura el estado actual.
        history.pushState(estadoActual.current, "");
        return;
      }
      setEstado(nuevo);
    }
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  }, []);

  useEffect(() => {
    estadoActual.current = estado;
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }
    document.querySelector("main h1")?.focus();
  }, [estado]);

  const navegar = useCallback((destino) => {
    history.pushState(destino, "");
    setEstado(destino);
  }, []);

  const reemplazar = useCallback((destino) => {
    history.replaceState(destino, "");
    setEstado(destino);
  }, []);

  const registrarInterceptorAtras = useCallback((fn) => {
    interceptorAtras.current = fn;
    return () => {
      if (interceptorAtras.current === fn) interceptorAtras.current = null;
    };
  }, []);

  return { estado, navegar, reemplazar, registrarInterceptorAtras };
}
