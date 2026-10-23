import { useState, useCallback } from "react";
import { enviarMensajeEscudo } from "../services/escudoAPI";

export function useEscudoChat() {
  const [mensajes, setMensajes] = useState([]); // { id, rol: "usuario" | "bot", texto }
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = useCallback(async (texto) => {
    const limpio = (texto || "").trim();
    if (!limpio || cargando) return;

    setError(null);
    setMensajes((prev) => [...prev, { id: Date.now(), rol: "usuario", texto: limpio }]);
    setCargando(true);

    try {
      const respuesta = await enviarMensajeEscudo(limpio);
      setMensajes((prev) => [...prev, { id: Date.now() + 1, rol: "bot", texto: respuesta }]);
    } catch (e) {
      setError(e.message || "No se pudo conectar con el asistente.");
    } finally {
      setCargando(false);
    }
  }, [cargando]);

  return { mensajes, cargando, error, enviar };
}