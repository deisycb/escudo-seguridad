# Contrato: `src/logic/ConversacionEmergencia.js`

Clase inmutable (igual que `PlanAccion`): toda acción devuelve una instancia nueva, o la misma si la acción no aplica. JSDoc obligatorio en cada método público (constitución V). Sin acceso a `localStorage`, `history` ni red.

## Constantes (en el mismo módulo o en `constantes.js`)

```js
export const IDS_SITUACIONES = [
  "tarjeta-banco", "enlace-falso", "codigo-compartido",
  "whatsapp-perdido", "suplantacion", "pago-estafador", "duda",
];
export const TEXTOS_ASISTENTE = {
  siguiente: "Listo, ¿qué sigue?",
  denunciar: "Ver cómo denunciar en Colombia",
  otraCosa: "Me pasó otra cosa",
  terminar: "Eso es todo, gracias",
  llamarBanco: "Llamar a la línea de mi banco",
  comoDenunciar: "Cómo denunciar en Colombia",
  empezarDeNuevo: "Empezar de nuevo",
  masAyuda: "Más ayuda",
  confirmarSalirTitulo: "¿Salir del asistente?",
  confirmarReiniciarTitulo: "¿Empezar de nuevo?",
  confirmarTexto: "Perderás el paso en que vas.",
  confirmarSalir: "Salir",
  seguirAqui: "Seguir aquí",
  respaldoPendiente: "Esta parte de la guía aún no está lista. Usa los botones de abajo para llamar a tu banco o ver cómo denunciar.",
};
```

## API pública

```js
class ConversacionEmergencia {
  /** @param {ContenidoEmergencias} contenido { mensajes, situaciones, guias, lineas, canales } */
  static iniciar(contenido): ConversacionEmergencia
  // historial: [saludo]; opciones: las 7 situaciones; etapa "situaciones"

  /** @param {string} idOpcion id de una opción pendiente */
  elegir(idOpcion): ConversacionEmergencia
  // id no pendiente → devuelve `this` (sin cambios)

  mostrarLineasBancarias(): ConversacionEmergencia
  // agrega elección "Llamar a la línea de mi banco" + mensaje lineasBancarias;
  // opciones y posición sin cambios

  mostrarCanalesDenuncia(): ConversacionEmergencia
  // igual, con "Cómo denunciar en Colombia" + mensaje canalesDenuncia

  reiniciar(): ConversacionEmergencia
  // equivale a ConversacionEmergencia.iniciar(contenido)

  obtenerMensajes(): Mensaje[]        // copia; ver data-model.md
  obtenerOpciones(): Opcion[]         // copia; [] si terminada
  estaTerminada(): boolean
  tieneProgreso(): boolean            // true si hay algún mensaje de la persona (decide las confirmaciones de FR-018 y FR-031)
}

export function validarContenidoEmergencias(contenido): { errores: string[], pendientes: string[] }
```

## Reglas que cubren las pruebas

| Caso | Resultado esperado | FR |
|---|---|---|
| `iniciar` | 1 mensaje (saludo) y 7 opciones con los textos del contenido, en orden | FR-007 |
| Elegir situación directa | + elección con el texto exacto + paso 1 con `numero: 1, total: M`; opciones `[siguiente]` | FR-008, FR-010 |
| Elegir situación con seguimiento | + elección + pregunta; opciones = respuestas | FR-008 |
| Elegir respuesta | + elección + paso 1 de su guía | FR-009 |
| `siguiente` en paso N < M | + elección "Listo, ¿qué sigue?" + paso N+1 | FR-010 |
| `siguiente` en paso M | + elección + cierreGuia; opciones `[denunciar, otraCosa, terminar]` | FR-011 |
| Guía de 1 paso | Paso "1 de 1"; `siguiente` lleva al cierre | Edge case |
| `denunciar` | + elección + canalesDenuncia; opciones `[otraCosa, terminar]` | FR-011 |
| `otraCosa` | + elección + saludo; opciones = 7 situaciones; historial conservado | FR-011 |
| `terminar` | + elección + despedida; opciones `[]`; `estaTerminada()` | FR-011 |
| Acción rápida en cualquier etapa | + 2 mensajes; `obtenerOpciones()` igual que antes; posición igual | FR-015…FR-017 |
| Acción rápida repetida o tras terminar | Se agrega cada vez; opciones siguen iguales (o `[]`) | Edge cases |
| Elegir id no pendiente u opción ya usada | Devuelve la misma instancia | FR-012 |
| `reiniciar` | Igual que `iniciar` (la confirmación es de la pantalla, no de la clase) | FR-018 |
| `tieneProgreso` | `false` tras `iniciar` y `reiniciar`; `true` tras cualquier elección o acción rápida | FR-018, FR-031 |
| Guía vacía / líneas vacías / canales vacíos / mensaje vacío | Se usa `contenidoPendiente` (o `respaldoPendiente`); nunca mensaje vacío | Edge case |
| Ninguna acción | No escribe en almacenamiento ni hace peticiones | FR-027, FR-028 |
