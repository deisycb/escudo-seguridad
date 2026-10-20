# Research — Escritura libre con asistente de IA (004-asistente-ia-emergencia)

**Fecha**: 2026-10-20 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

El stack del frontend lo fija la constitución (React 19 + Vite 7 + Tailwind 4 + JavaScript + Vitest). El único backend permitido es un flujo de n8n con un asistente de IA (principio IV). El proveedor de IA y el alojamiento de n8n siguen pendientes (TODO PROVEEDOR_IA y TODO HOSTING_N8N): el diseño no depende de ellos (R1).

---

## R1. Proveedor de IA y alojamiento de n8n sin definir

- **Decisión**: la web app solo conoce una URL de webhook, que llega en el build como variable de entorno `VITE_URL_ASISTENTE_IA`. El contrato del webhook ([contracts/webhook.md](./contracts/webhook.md)) es propio del proyecto y no depende del proveedor. Si la variable no existe, la escritura queda **desactivada** y Emergencia abre directo en las guías, como pide la spec 003 en FR-042 ("mientras la spec 004 no esté implementada…").
- **Justificación**: permite construir y probar todo ahora (con un webhook de prueba local) y publicar sin escritura mientras el equipo decide. Cambiar de proveedor solo toca el flujo de n8n.
- **Alternativas consideradas**: llamar directo a la API del proveedor desde el navegador (prohibido: las claves nunca van en el frontend, principio IV); bloquear el plan hasta que se decida el proveedor (innecesario).

## R2. Política de seguridad (CSP) con el webhook

- **Decisión**: el plugin `cspSoloEnBuild` de `vite.config.js` arma `connect-src` así: si `VITE_URL_ASISTENTE_IA` existe y empieza por `https://`, usa **solo su origen** (`new URL(url).origin`); si no, `'none'` (como hoy). Si la variable existe pero no es `https://`, el build **falla** con un mensaje claro.
- **Justificación**: constitución IV ("El CSP de producción DEBE limitar `connect-src` al origen de ese webhook") y FR-017. Fallar el build evita publicar con una URL insegura.
- **Alternativas consideradas**: la CSP en encabezados de Netlify (depende del hosting; la meta funciona en cualquiera, igual que R9 de la 001).

## R3. Filtro de datos sensibles

- **Decisión**: función pura `detectarDatoSensible(texto)` en `src/logic/FiltroDatosSensibles.js`:
  - **Tarjeta o cuenta**: `/(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/`, es decir, de 13 a 19 dígitos, con espacios o guiones sueltos entre ellos.
  - **Código**: `/(?<![\d.,])\d{4,8}(?![\d.,])/`, un grupo aislado de 4 a 8 dígitos. No cuenta los que forman parte de números más largos ni los que llevan punto o coma de miles: "500.000" se deja pasar y "500000" no.
  - Primero se revisa la tarjeta (más grave) y luego el código. Devuelve `null` o `{ tipo: "tarjeta" | "codigo", fragmento, inicio, fin }`, para poder resaltar el número (spec, aclaración 2026-10-20).
- **Justificación**: FR-008 y constitución I. Las expresiones son simples, se prueban por completo con Vitest y no dependen de librerías. Un teléfono de 10 dígitos seguidos no cae en ninguno de los dos rangos (caso borde de la spec).
- **Riesgo aceptado**: los montos o fechas solo con números (4 a 8 dígitos) se bloquean; la explicación muestra cómo reescribirlos (aclaración 2026-10-20).
- **Alternativas consideradas**: validación de Luhn para tarjetas (dejaría pasar números de cuenta y tarjetas mal escritas); dejar enviar con confirmación (descartado en la spec, choca con el principio I).

## R4. Cliente del webhook

- **Decisión**: clase `AsistenteIA` en `src/logic/AsistenteIA.js`, con `fetch` inyectado (para las pruebas) y método `responder(intercambio)`:
  - `POST` JSON `{ mensajes: [{ rol, texto }] }` con `AbortController` y 20 s de espera (`TIEMPO_ESPERA_MS = 20000`).
  - Sin cookies ni credenciales (`credentials: "omit"`), sin encabezados con datos del dispositivo y con `referrerPolicy: "no-referrer"`.
  - Respuesta válida: estado 200 y JSON `{ respuesta: string }`, no vacía y de hasta 4.000 caracteres. Todo lo demás es fallo.
  - Devuelve `{ ok: true, texto }` o `{ ok: false, motivo: "tiempo" | "red" | "invalida" | "limite" }` (429 → `limite`). Nunca lanza errores hacia la interfaz.
- **Justificación**: FR-009, FR-010 y FR-013; constitución V (lógica en `/logic`, con pruebas) y VI (errores traducidos). Un objeto de resultado evita `try/catch` en los componentes.
- **Alternativas consideradas**: respuestas en *streaming* (más complejas y no aportan para respuestas cortas); librerías HTTP (innecesarias).

## R5. Una sola conversación (aclaración del 2026-10-20)

- **Decisión**: se amplía `ConversacionEmergencia` (spec 003) en lugar de crear una segunda conversación:
  - `static iniciarEscritura(contenido)`: conversación sin mensajes, en la etapa `escritura`, sin opciones.
  - `agregarMensajeEscrito(texto)`, `agregarRespuestaIA(texto)` y `agregarFalloIA(motivo)`. El fallo agrega un mensaje amable y la opción pendiente `verGuias`, que reutiliza el mecanismo de opciones de la 003.
  - `abrirGuias()`: agrega el saludo y las 7 situaciones, sin borrar nada.
  - `volverAEscribir()`: etapa `escritura`, sin opciones.
  - `obtenerIntercambioIA()`: solo los mensajes `escrito` y `respuestaIA`, como `{ rol, texto }` (FR-009).
  - `reiniciar()` vuelve al modo con el que empezó (escritura o guías).
- **Justificación**: FR-021 pide una sola línea de mensajes. La clase ya tiene ids, inmutabilidad, `tieneProgreso()` y la confirmación de salida (FR-041 de la 003), y todo eso sirve igual para los mensajes escritos.
- **Alternativas consideradas**: dos conversaciones fusionadas en la pantalla (duplica ids y orden); una clase nueva que envuelva a la 003 (más código sin ganancia).

## R6. Cuándo se muestra la escritura

- **Decisión**: al montar Emergencia:
  1. sin `VITE_URL_ASISTENTE_IA` → guías directas (sin aviso);
  2. con URL y `navigator.onLine === false` → guías directas con el aviso "No tienes conexión. Te muestro las guías, que funcionan sin internet" (FR-003);
  3. si no → `iniciarEscritura`.

  El consentimiento es estado local de la página (`useState(false)`): se pierde al salir, como pide FR-005 (aclaración "cada visita"). "Empezar de nuevo" no lo borra.
- **Justificación**: FR-001, FR-003, FR-005 y FR-042 de la 003. `navigator.onLine` es lo que el navegador informa al abrir (supuesto de la spec); una caída posterior se trata como fallo de envío.

## R7. Escritura: componente y accesibilidad

- **Decisión**: componente `EscrituraIA.jsx` debajo de la conversación (fuera del `role="log"`). Dos estados:
  - **Sin consentimiento**: tarjeta con el texto del consentimiento (`CONSENTIMIENTO_IA`, desde `src/data/asistenteIA.js`, PENDIENTE del equipo) y dos botones: "Acepto y quiero escribir" (primario) y "No, prefiero ver las guías" (secundario).
  - **Con consentimiento**:
    - `<label>` visible "Cuéntame con tus palabras qué te pasó".
    - `<textarea maxLength={1000} aria-describedby="aviso-sensibles explicacion-bloqueo">`.
    - Aviso fijo "No escribas contraseñas, números de tarjeta o de cuenta, ni códigos de verificación".
    - Contador de caracteres cuando quedan 100 o menos.
    - Botón "Enviar" con texto visible y ChevronRight (no hay ícono de "enviar" en §7.9; FR-018).
  - **Bloqueo**: explicación en `role="alert"`, con el número resaltado (`<mark>` con fondo `advertencia-suave` y texto `advertencia-texto`); el foco vuelve al `textarea`.
  - Enlace "No puedo o no quiero escribir: ver guías" debajo, en las dos vistas.
  - Mientras espera respuesta: el botón queda deshabilitado y se agrega a la conversación un mensaje temporal "El asistente está respondiendo…", que se anuncia en el `log` y se reemplaza por la respuesta.
- **Justificación**: FR-004, FR-006, FR-007, FR-008, FR-018 y FR-019. Elementos nativos y la misma región viva de la 003 (R5 de la 003).

## R8. Respuestas de la IA en pantalla

- **Decisión**: `MensajeConversacion` gana dos tipos:
  - `respuestaIA`: burbuja del asistente con el chip "Respuesta generada por IA" (`pista` / `texto-secundario`, como el chip de paso), el texto en un `<p className="whitespace-pre-line">` (texto plano: React escapa todo y no se usa `dangerouslySetInnerHTML`) y debajo "No reemplaza a tu banco ni a las autoridades" (12 px, `texto-suave`).
  - `escrito`: igual que `eleccion`, a la derecha, con el prefijo "Tú escribiste:".
- **Justificación**: FR-011 y constitución ("Respuestas: se muestran como texto plano… se identifican como generadas por IA").

## R9. Flujo de n8n (contrato, no código del repositorio)

- **Decisión**: el flujo vive en n8n. El repositorio documenta su contrato en [contracts/n8n-flujo.md](./contracts/n8n-flujo.md):
  - webhook POST;
  - validación del cuerpo;
  - límite de peticiones;
  - instrucciones del sistema;
  - llamada al proveedor;
  - respuesta `{ respuesta }`;
  - guardado de datos de ejecución desactivado;
  - CORS solo para el dominio de la web app.

  Cuando el equipo defina el alojamiento, se exporta el flujo **sin credenciales** a `n8n/asistente-emergencia.json` como referencia.
- **Justificación**: FR-015, FR-016 y FR-017. El repositorio no contiene servidor propio (principio IV), solo la descripción del único backend permitido.

## R10. Pruebas

- **Decisión**: Vitest (entorno `node`) para:
  - `FiltroDatosSensibles`: tablas de casos que bloquean y que pasan;
  - `AsistenteIA`: `fetch` falso para éxito, 429, 500, JSON inválido, respuesta vacía o larga, tiempo agotado con temporizadores falsos, y que el cuerpo enviado solo contenga `mensajes`;
  - los métodos nuevos de `ConversacionEmergencia`.

  La interfaz y el flujo de n8n se validan con [quickstart.md](./quickstart.md), con un webhook de prueba local (`scripts/webhook-prueba.mjs`, solo para desarrollo, nunca se publica) y con el flujo real cuando exista.
- **Justificación**: constitución V; igual que R11 de la 001 y de la 003.

## Dependencia abierta (no bloquea el plan, sí la publicación)

- Proveedor de IA y alojamiento de n8n (TODOs de la constitución).
- Texto del consentimiento (`CONSENTIMIENTO_IA`), que aprueba el equipo (Ley 1581 de 2012).
- Confirmar con el equipo que `scripts/webhook-prueba.mjs` (solo desarrollo) es aceptable bajo el principio IV. Si no, las pruebas manuales esperan al flujo real.
