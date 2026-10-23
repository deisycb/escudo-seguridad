import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { TITULO_SECCION } from "./estilos.js";

/** Diálogo modal sobre el <dialog> nativo (foco y Esc los maneja el navegador). */
/**
 * @param {{ abierto: boolean, titulo: string, onCerrar: () => void, children: any,
 *   acciones: any, refFocoInicial?: object }} props `refFocoInicial`: control que recibe el
 *   foco al abrir (por defecto, el navegador enfoca el primero, que es la X).
 */
export default function Dialogo({ abierto, titulo, onCerrar, children, acciones, refFocoInicial }) {
  const referencia = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = referencia.current;
    if (abierto && !dialogo.open) {
      dialogo.showModal();
      refFocoInicial?.current?.focus();
    }
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto, refFocoInicial]);

  useEffect(() => {
    const dialogo = referencia.current;
    dialogo.addEventListener("close", onCerrar);
    return () => dialogo.removeEventListener("close", onCerrar);
  }, [onCerrar]);

  return (
    <dialog
      ref={referencia}
      aria-labelledby={idTitulo}
      className="m-auto w-[calc(100%-48px)] max-w-columna rounded-tarjeta border border-borde bg-fondo p-0 text-texto backdrop:bg-texto/50"
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="flex items-start gap-3 px-6 pt-6">
          <h2 id={idTitulo} className={`${TITULO_SECCION} flex-1`}>
            {titulo}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="-mt-2 -mr-2 inline-flex size-11 items-center justify-center rounded-boton text-texto-suave"
          >
            <X size={24} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-3 text-texto-secundario">{children}</div>
        <div className="flex flex-col gap-3 border-t border-borde px-6 py-4">{acciones}</div>
      </div>
    </dialog>
  );
}
