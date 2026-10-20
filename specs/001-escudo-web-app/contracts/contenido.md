# Contrato: archivos de contenido (`/src/data`)

Este contrato define **la forma** en que el equipo entrega el contenido. Los valores reales (textos, puntajes, criticidades, números) los pone el equipo y **no se pueden inventar ni reformular** (constitución III). `tests/logic/contenido.test.js` verifica cada regla marcada con ✔.

> **Excepción vigente (2026-10-16)**: `preguntas.js` usa puntajes y criticidades provisionales aprobados en la spec, y `descripcionHabito` y `recomendaciones.js` son borradores ([R13](../research.md)). Cumplen este contrato; solo cambian los valores cuando el equipo los defina.

Todos los archivos son módulos ES con exportaciones con nombre y sin lógica.

## `preguntas.js`

```js
export const PREGUNTAS = [
  {
    numero: 1,                       // ✔ enteros 1..14, únicos, en orden
    dimension: "phishing",           // ✔ coincide con DIMENSIONES según el número
    texto: "<texto exacto>",         // ✔ string no vacío
    descripcionHabito: "<corta>",    // ✔ string no vacío
    opciones: {
      a: { texto: "<exacto>", puntaje: 0, criticidad: null },
      b: { texto: "<exacto>", puntaje: 0, criticidad: "importante" },
      c: { texto: "<exacto>", puntaje: 0, criticidad: "urgente" },
    },
  },
  // … 14 en total ✔
];
```

Reglas:

- ✔ Cada pregunta tiene exactamente las claves `a`, `b` y `c`.
- ✔ Los puntajes son enteros ≥ 0 y no bajan: `a ≤ b ≤ c`.
- ✔ `criticidad === null` si y solo si `puntaje === 0`. Si no es `null`, vale `"revisa"`, `"importante"` o `"urgente"`.
- ✔ La criticidad no baja de a → b → c (orden: revisa < importante < urgente).
- ✔ El puntaje máximo total es mayor que 0.

## `recomendaciones.js`

```js
export const RECOMENDACIONES = {
  1: {
    titulo: "<título de la acción>",
    queHacerAhora: ["<paso>", "..."],   // string o lista de strings
    comoPrevenirlo: ["<consejo>", "..."],
  },
  // …
};
```

- ✔ Existe una entrada por cada pregunta que tenga alguna opción con puntaje mayor a 0, con los tres campos no vacíos.
- *Extensión prevista (solo si el equipo la necesita, R5)*: si los textos varían según la opción, la entrada se cambia a `{ b: {…}, c: {…} }` y `PlanAccion` elige la de la opción respondida. Las clases no cambian de API.

## `tips.js`

```js
export const REGLA_DE_ORO = "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo"; // ✔ texto exacto de FR-025

export const TIPS = [
  {
    id: "sms-paquete",
    canal: "sms",                  // ✔ "sms" | "llamada" | "correo" | "whatsapp"
    tipoAtaque: "Smishing",        // ✔ sms→Smishing, llamada→Vishing, correo→Phishing, whatsapp→Suplantación
    titulo: "Tu paquete está retenido",
    comoReconocerla: "<texto o lista>",
    queHacer: "<texto o lista>",
  },
  // … 8 en total ✔, 2 por canal ✔
];
```

✔ Los 8 títulos coinciden exactamente con FR-026:

| Canal | Títulos |
|---|---|
| sms | "Tu paquete está retenido"; "Descuento o premio en tu plan de celular" |
| llamada | "Le hablamos del banco por un movimiento sospechoso"; "Falso técnico o asesor de tu operador" |
| correo | "Tu cuenta será suspendida"; "Factura o recibo que no esperabas" |
| whatsapp | "Cambié de número, necesito un favor"; "Te piden el código de 6 dígitos" |

## `emergencias.js`

Reemplazado por [../../003-rediseno-emergencia-agente/contracts/contenido-emergencias.md](../../003-rediseno-emergencia-agente/contracts/contenido-emergencias.md) (spec 003): mensajes del asistente, 7 situaciones, guías, aviso, líneas bancarias y canales de denuncia.

## `politica.js`

```js
export const POLITICA_PRIVACIDAD = {
  titulo: "<título>",
  secciones: [{ subtitulo: "<…>", texto: "<…>" }],
}; // ✔ al menos 1 sección
```

## Prohibiciones (constitución I)

Ningún archivo de contenido puede definir campos de entrada, URL de envío de datos ni scripts. El contenido es solo texto y números.
