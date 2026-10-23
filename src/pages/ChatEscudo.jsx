import { useState } from "react";
import { useEscudoChat } from "../hooks/useChatEmergencia.js";
import { BOTON_ENLACE } from "../components/botones.js";

export default function ChatEscudo({ onVolver }) {
  const { mensajes, cargando, error, enviar } = useEscudoChat();
  const [texto, setTexto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    enviar(texto);
    setTexto("");
  };

  return (
    <div>
      <button type="button" className={BOTON_ENLACE} onClick={onVolver}>
        Volver al inicio
      </button>
      <div>
        {mensajes.map((m) => (
          <p key={m.id} className={m.rol}>
            {m.texto}
          </p>
        ))}
        {cargando && <p className="bot">Escribiendo...</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={cargando}
        />
        <button type="submit" disabled={cargando || !texto.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}