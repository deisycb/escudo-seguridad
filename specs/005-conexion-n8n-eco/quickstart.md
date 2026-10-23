# Quickstart — validar la conexión con n8n (eco local)

**Spec**: [spec.md](./spec.md) | **Contratos**: [contracts/](./contracts/)

## Requisitos

- Node.js 22+ y `npm install` (sin dependencias nuevas).
- Una cuenta de n8n Cloud.

## Preparar n8n Cloud

1. En n8n Cloud: *Workflows* → *Import from File* → `n8n/asistente-emergencia.json`.
2. Revisar en *Settings* del flujo que no se guarda ningún dato de ejecución ([n8n-flujo-eco.md](./contracts/n8n-flujo-eco.md)).
3. Activar el flujo y copiar la **Production URL** del nodo Webhook.
4. Crear `.env.local` (no se sube al repositorio):

   ```bash
   VITE_URL_ASISTENTE_IA=https://<instancia>.app.n8n.cloud/webhook/<uuid>
   ```

## Verificación automática

```bash
npm test          # incluye tests/n8n/asistenteEmergencia.test.js (settings, sin credenciales, eco, 400 y 429)
npm run lint
npm run build     # con .env.local: CSP connect-src https://<instancia>.app.n8n.cloud
```

## Escenarios manuales (`npm run dev`, http://localhost:5173, DevTools → Network)

| # | Pasos | Esperado | Spec |
|---|---|---|---|
| 1 | Abrir Emergencia, aceptar el consentimiento, escribir "hola" y enviar | "El asistente está respondiendo…" y luego "Eco: hola" en menos de 3 s, como texto plano | US1-1, FR-003, SC-001 |
| 2 | En Network, abrir la petición al webhook → *Payload* | Solo `{ "mensajes": [ { "rol": "persona", "texto": "hola" } ] }`; sin cookies ni `Referer` | US1-2, FR-001, FR-002, SC-002 |
| 3 | Enviar una segunda pregunta | El cuerpo lleva los mensajes anteriores y el nuevo; la respuesta es el eco del nuevo | FR-001 |
| 4 | Mientras espera, intentar enviar otra vez | Botón "Enviar" no disponible | US1-3, FR-007 |
| 5 | Repetir 1 diez veces | Todas responden en menos de 3 s (anotar los tiempos) | SC-001 |
| 6 | Escribir solo espacios | No se puede enviar | FR-008 |
| 7 | Pegar un texto de 1.100 caracteres | El campo se queda en 1.000 y muestra cuántos quedan desde los 900 | FR-008 |
| 8 | Escribir `4111 1111 1111 1111` y enviar | Bloqueado; ninguna petición en Network | FR-009 |
| 9 | Cambiar la URL de `.env.local` por una ruta inexistente y reiniciar `npm run dev` | Aviso amable y "Ver guías"; los botones de las guías funcionan hasta el final | US2-2, FR-005, SC-003, SC-004 |
| 10 | DevTools → Network → *Offline* y enviar | Mismo aviso amable | Casos borde, SC-004 |
| 11 | Network → *Throttling* personalizado de 25 s de latencia y enviar | A los 20 s, aviso amable | US2-1, FR-004, SC-004 |
| 12 | Desactivar el flujo en n8n y enviar | Aviso amable, sin detalles técnicos | US2-2, SC-004 |
| 13 | Quitar `VITE_URL_ASISTENTE_IA` y abrir Emergencia | Abre en las guías | US2-3 |
| 14 | En n8n Cloud → *Executions* del flujo | No hay ejecuciones guardadas | US1-4, FR-011, SC-005 |
| 15 | Enviar 31 mensajes en menos de un minuto (por ejemplo con `curl` en bucle) | La petición 31 recibe `429`; en la app: "Recibí muchos mensajes seguidos…" | Constitución IV |
| 16 | `git status` y revisar `n8n/asistente-emergencia.json` | `.env.local` no aparece; el JSON no tiene credenciales, `pinData` ni la URL de la instancia | FR-012 |
