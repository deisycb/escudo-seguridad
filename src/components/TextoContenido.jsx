/** Muestra un texto del contenido que puede ser un string o una lista de strings. */
export default function TextoContenido({ valor }) {
  if (Array.isArray(valor)) {
    return (
      <ul className="list-disc space-y-1 pl-6">
        {valor.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{valor}</p>;
}
