# Quickstart — validar la escritura con asistente de IA

**Spec**: [spec.md](./spec.md) | **Contratos**: [contracts/](./contracts/)

## Requisitos

- Node.js 22+ y `npm install` (sin dependencias nuevas).
- Para probar con respuestas: un webhook que cumpla [contracts/webhook.md](./contracts/webhook.md):
  - **Desarrollo**: `node scripts/webhook-prueba.mjs` (responde un texto fijo; con `?modo=429|500|lento|invalida` simula fallos). Solo local, nunca se publica.
  - **Real**: el flujo de n8n de [contracts/n8n-flujo.md](./contracts/n8n-flujo.md), cuando el equipo defina proveedor y alojamiento.

## Verificación automática

```bash
npm test                     # FiltroDatosSensibles, AsistenteIA y la ampliación de ConversacionEmergencia
npm run lint
npm run build                # sin VITE_URL_ASISTENTE_IA: CSP connect-src 'none'
VITE_URL_ASISTENTE_IA=https://ejemplo.n8n.cloud/webhook/abc npm run build   # CSP connect-src https://ejemplo.n8n.cloud
VITE_URL_ASISTENTE_IA=http://inseguro npm run build                         # debe fallar
```

Se aceptan solo los fallos de contenido pendiente ya registrados en la spec 003.

## Escenarios manuales (`VITE_URL_ASISTENTE_IA=http://localhost:8787 npm run dev`, 390 px)

| # | Pasos | Esperado | Spec |
|---|---|---|---|
| 1 | Sin la variable de entorno, abrir Emergencia | Abre directo en las guías (como en la 003), sin escritura | R1; 003 FR-042 |
| 2 | Con la variable, abrir Emergencia desde Inicio sin diagnóstico | Escritura con consentimiento; no se ven las 7 situaciones; acciones rápidas y "No borres nada" visibles; Network: **cero** peticiones | FR-001, FR-002, SC-004 |
| 3 | Tocar "No, prefiero ver las guías" | Guías; cero peticiones | FR-014, US3 |
| 4 | Aceptar, escribir y enviar | El mensaje a la derecha, luego "respondiendo…", luego respuesta con "Respuesta generada por IA" y "No reemplaza…". Network: una petición con solo `mensajes` | FR-004, FR-007, FR-009, FR-011 |
| 5 | Enviar una segunda pregunta | La petición lleva los 3 mensajes anteriores y el nuevo, sin pasos de guía | FR-009, FR-012 |
| 6 | Escribir `4111 1111 1111 1111` y enviar | Bloqueado; número resaltado; texto conservado; cero peticiones | FR-008, SC-003 |
| 7 | Escribir `me robaron 500000` | Bloqueado con la sugerencia "500 mil"; con `500 mil` se envía | FR-008 |
| 8 | Webhook con `?modo=lento` (más de 20 s), `500` e `invalida` | Mensaje amable y "Ver guías"; conversación conservada | FR-010, FR-013 |
| 9 | Webhook con `?modo=429` | "Recibí muchos mensajes seguidos…" y "Ver guías" | FR-013 |
| 10 | Tras un fallo, "Ver guías" y luego "Prefiero escribirlo" | Las guías se suman a la conversación; al volver no se pide consentimiento; nada se borra | FR-014, FR-021 |
| 11 | DevTools Offline y abrir Emergencia | Guías directas con el aviso de sin conexión | FR-003, SC-005 |
| 12 | Con mensajes: "atrás", la barra o "Volver al inicio" | Confirmación de la 003; al volver, consentimiento pedido de nuevo y conversación vacía | FR-005, FR-020 |
| 13 | "Más ayuda" → "Empezar de nuevo" con mensajes | Confirmación; vuelve a la escritura vacía; consentimiento sigue aceptado | FR-021 |
| 14 | Pedirle al asistente que muestre `<b>hola</b>` o un enlace | Se ve literal, como texto | FR-011 |
| 15 | Application → Local Storage / Session Storage | Nada del asistente guardado | FR-005, FR-015, SC-006 |
| 16 | Teclado y VoiceOver o NVDA en todo el flujo | Etiqueta y aviso del campo leídos; "respondiendo" y respuestas anunciadas; bloqueos anunciados de inmediato con el foco en el campo | FR-019, SC-007 |
| 17 | Build con URL real y revisión de red de toda la app | Solo hay conexiones al origen del webhook, y solo después de aceptar | FR-017, SC-004 |
| 18 | En n8n: ejecuciones guardadas, límite de 429 y pedir datos sensibles | Nada guardado; la 11.ª petición da 429; nunca pide datos | FR-015, FR-016 ([n8n-flujo.md](./contracts/n8n-flujo.md)) |
