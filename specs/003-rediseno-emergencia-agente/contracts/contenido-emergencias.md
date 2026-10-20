# Contrato: `src/data/emergencias.js`

Reemplaza la sección `emergencias.js` de [../../001-escudo-web-app/contracts/contenido.md](../../001-escudo-web-app/contracts/contenido.md). Las prohibiciones de esa página (constitución I y III) siguen vigentes: no se inventa contenido y no hay campos que pidan datos sensibles.

```js
export const MENSAJES_ASISTENTE = {
  saludo: "<saludo y pregunta '¿qué te pasó?'>",
  cierreGuia: "<mensaje al terminar una guía>",
  despedida: "<respuesta a 'Eso es todo, gracias'>",
  introLineasBancarias: "<texto antes de la lista de bancos>",
  introCanalesDenuncia: "<texto antes de los canales de denuncia>",
  contenidoPendiente: "<qué decir si falta una guía, las líneas o los canales>",
}; // ✔ strings; vacíos = pendientes (no se publica con vacíos)

export const SITUACIONES_EMERGENCIA = [
  { id: "tarjeta-banco", texto: "<…>", guia: "tarjetas" },
  {
    id: "duda",
    texto: "<…>",
    seguimiento: {
      pregunta: "<…>",
      respuestas: [
        { id: "<id>", texto: "<…>", guia: "<id de guía>" },
        { id: "<id>", texto: "<…>", guia: "<id de guía>" },
      ],
    },
  },
  // …
];
// ✔ exactamente 7, en este orden de ids:
//   tarjeta-banco, enlace-falso, codigo-compartido, whatsapp-perdido,
//   suplantacion, pago-estafador, duda
// ✔ cada una con texto no vacío y EXACTAMENTE uno de: guia | seguimiento
// ✔ seguimiento: pregunta no vacía, ≥ 2 respuestas, ids únicos, cada guia existente

export const GUIAS_EMERGENCIA = [
  { id: "tarjetas", titulo: "Bloquear mis tarjetas", pasos: ["<paso 1>", "…"] },
  { id: "whatsapp", titulo: "Reportar fraude en WhatsApp", pasos: ["…"] },
  { id: "phishing", titulo: "Fui víctima de phishing", pasos: ["…"] },
  // el equipo puede agregar guías nuevas
];
// ✔ ids únicos; para publicar, toda guía referenciada con ≥ 1 paso no vacío
// ✔ el título no se muestra en la conversación; sirve para organizar el contenido

export const AVISO_NO_BORRES = { titulo: "No borres nada", texto: "<…Ley 1273 de 2009>" }; // sin cambios
export const LINEAS_BANCARIAS = [{ banco: "<nombre>", numero: "<número>" }]; // sin cambios
export const CANALES_DENUNCIA = [{ entidad: "<…>", contacto: "<…>", enlace: "https://…" }]; // sin cambios
```

## Validación

`validarContenidoEmergencias({ mensajes, situaciones, guias, lineas, canales })` (en `src/logic/ConversacionEmergencia.js`) devuelve:

```js
{ errores: string[], pendientes: string[] }
```

- **Errores** (estructura rota): ids de situación distintos de los 7 fijos, una situación con `guia` y `seguimiento` a la vez o sin ninguno, un `guia` que no existe, ids repetidos o menos de 2 respuestas.
- **Pendientes** (falta contenido): mensajes vacíos, guías sin pasos, listas de bancos o de canales vacías y textos marcados `PROVISIONAL`.

No se publica con errores ni con pendientes. En desarrollo, los pendientes se muestran con el mensaje de contenido pendiente (R3).

## Estado provisional (hasta que el equipo entregue el contenido)

| Situación | `texto` provisional (de spec FR-007) | Destino provisional |
|---|---|---|
| tarjeta-banco | "Problema con mi tarjeta o mi banco" | guía `tarjetas` |
| enlace-falso | "Abrí un enlace falso" | guía `phishing` |
| codigo-compartido | "Compartí un código" | guía `whatsapp` |
| whatsapp-perdido | "Perdí mi WhatsApp" | guía `whatsapp` |
| suplantacion | "Se están haciendo pasar por mí" | guía `whatsapp` |
| pago-estafador | "Le pagué o transferí a un estafador" | guía `tarjetas` |
| duda | "Tengo una duda o no sé qué me pasó" | guía `phishing` |

Cada línea lleva el comentario `// PROVISIONAL`. Los mensajes del asistente quedan `""` con `// PENDIENTE`.
