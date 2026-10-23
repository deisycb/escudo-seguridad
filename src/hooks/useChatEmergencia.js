// src/hooks/useChatEmergencia.js
import { useState, useRef, useCallback } from "react";
import { enviarMensajeEscudo } from "../logic/ClienteN8n.js";

const TIEMPO_AVISO_MS = 10000; // a los 10 s se ofrecen los botones
const MENSAJE_ESPERA =
  "Sigo revisando tu caso. Mientras tanto, si ya sabes qué te pasó, elige una opción:";
const MENSAJE_SIN_CONEXION =
  "No pude conectarme, pero te sigo ayudando. ¿Cuál de estas situaciones se parece más a lo que te pasó?";

/**
 * Tapa números de 4 o más dígitos para que no salgan del dispositivo.
 * @param {string} texto
 * @returns {{ texto: string, huboOcultos: boolean }}
 */
export function ocultarNumeros(texto) {
  let huboOcultos = false;
  const limpio = (texto || "").replace(/\d[\d\s-]{2,}\d/g, () => {
    huboOcultos = true;
    return "••••";
  });
  return { texto: limpio, huboOcultos };
}

/**
 * Estado del chat de emergencia: mensajes, espera y envío a n8n.
 * @param {{ respaldo?: (texto: string) => string | null }} opciones
 *   respaldo: busca una guía local por palabras clave si n8n falla.
 */
export function useChatEmergencia({ respaldo } = {}) {
  const [mensajes, setMensajes] = useState([]);
  const [esperando, setEsperando] = useState(false);
  const turno = useRef(0); // sirve para descartar respuestas tardías

  const agregar = useCallback((autor, texto, extra = {}) => {
    setMensajes((lista) => [...lista, { id: crypto.randomUUID(), autor, texto, ...extra }]);
  }, []);

  /** Texto libre: se limpia, se envía a n8n y se maneja la espera. */
  const enviarTexto = useCallback(
    async (crudo) => {
      const { texto, huboOcultos } = ocultarNumeros(crudo);
      if (!texto.trim() || esperando) return;

      agregar("persona", texto, { huboOcultos });
      const miTurno = ++turno.current;
      setEsperando(true);

      const aviso = setTimeout(() => {
        if (turno.current === miTurno) agregar("asistente", MENSAJE_ESPERA, { mostrarMenu: true });
      }, TIEMPO_AVISO_MS);

      try {
        const respuesta = await enviarMensajeEscudo(texto);
        if (turno.current === miTurno) agregar("asistente", respuesta);
      } catch {
        if (turno.current === miTurno) {
          const guia = respaldo?.(texto);
          agregar("asistente", guia || MENSAJE_SIN_CONEXION, { mostrarMenu: !guia });
        }
      } finally {
        clearTimeout(aviso);
        if (turno.current === miTurno) setEsperando(false);
      }
    },
    [agregar, esperando, respaldo]
  );

  /** Botón rápido: nunca llama a n8n y descarta cualquier respuesta pendiente. */
  const elegirOpcion = useCallback(
    (textoOpcion, guiaLocal) => {
      turno.current++;
      setEsperando(false);
      agregar("persona", textoOpcion);
      agregar("asistente", guiaLocal);
    },
    [agregar]
  );

  return { mensajes, esperando, enviarTexto, elegirOpcion };
}