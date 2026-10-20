/** Dígitos de un número de tarjeta o de cuenta (constitución I, spec 004 FR-008). */
export const LIMITES_TARJETA = { minimo: 13, maximo: 19 };

/** Dígitos de un código de verificación (spec 004 FR-008). */
export const LIMITES_CODIGO = { minimo: 4, maximo: 8 };

// 13 a 19 dígitos que pueden llevar un espacio o guion entre ellos ("4111 1111 1111 1111").
const PATRON_TARJETA = new RegExp(
  `(?<!\\d)(?:\\d[ -]?){${LIMITES_TARJETA.minimo - 1},${LIMITES_TARJETA.maximo - 1}}\\d(?!\\d)`,
);

// Grupo aislado de 4 a 8 dígitos. Un punto o una coma pegados ("500.000") lo vuelven un monto.
const PATRON_CODIGO = new RegExp(
  `(?<![\\d.,])\\d{${LIMITES_CODIGO.minimo},${LIMITES_CODIGO.maximo}}(?![\\d.,])`,
);

function buscar(texto, patron, tipo) {
  const coincidencia = patron.exec(texto);
  if (!coincidencia) return null;
  const [fragmento] = coincidencia;
  return {
    tipo,
    fragmento,
    inicio: coincidencia.index,
    fin: coincidencia.index + fragmento.length,
  };
}

/**
 * Busca en el mensaje algo que parezca un número de tarjeta o cuenta, o un código de
 * verificación. Si lo encuentra, el mensaje no se envía (constitución I). Revisa primero la
 * tarjeta porque es lo más grave.
 * @param {string} texto Mensaje escrito por la persona.
 * @returns {null | { tipo: "tarjeta" | "codigo", fragmento: string, inicio: number,
 *   fin: number }} Lo encontrado y su posición, para resaltarlo.
 */
export function detectarDatoSensible(texto) {
  return buscar(texto, PATRON_TARJETA, "tarjeta") ?? buscar(texto, PATRON_CODIGO, "codigo");
}
