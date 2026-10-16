import { useEffect, useId, useRef } from "react";

/** Diálogo modal sobre el <dialog> nativo (foco y Esc los maneja el navegador). */
export default function Dialogo({ abierto, titulo, onCerrar, children, acciones }) {
  const referencia = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = referencia.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  useEffect(() => {
    const dialogo = referencia.current;
    dialogo.addEventListener("close", onCerrar);
    return () => dialogo.removeEventListener("close", onCerrar);
  }, [onCerrar]);

  return (
    <dialog
      ref={referencia}
      aria-labelledby={idTitulo}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg p-0 text-gray-900 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex max-h-[80vh] flex-col">
        <h2 id={idTitulo} className="px-5 pt-5 text-xl font-bold">
          {titulo}
        </h2>
        <div className="overflow-y-auto px-5 py-3">{children}</div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 px-5 py-4">
          {acciones}
        </div>
      </div>
    </dialog>
  );
}
