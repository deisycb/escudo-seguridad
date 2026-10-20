# Contrato: flujo de n8n del asistente de emergencia

> **Primera versión (eco):** ya existe en `n8n/asistente-emergencia.json` y se describe en [../../005-conexion-n8n-eco/contracts/n8n-flujo-eco.md](../../005-conexion-n8n-eco/contracts/n8n-flujo-eco.md). Tiene el webhook, la validación y el límite (global, 30 por minuto, sin IPs); el paso 4 de este contrato todavía no existe y en su lugar se devuelve un eco.

El flujo no es código del repositorio: vive en n8n (constitución IV). Este documento fija lo que **debe** cumplir; cuando exista, se exporta **sin credenciales** a `n8n/asistente-emergencia.json`.

## Nodos (en orden)

1. **Webhook** `POST`, responde con el nodo final. CORS: solo el dominio publicado de la web app (y `http://localhost:5173` mientras se desarrolla).
2. **Límite de peticiones**: por ejemplo 10 peticiones por minuto por IP; al superarlo responde `429`. Valor final: equipo (FR-016).
3. **Validación**: el cuerpo tiene solo `mensajes`, con 1 a 20 elementos, `rol` válido y `texto` de 1 a 4.000 caracteres. Si no, responde `400`.
4. **Llamada al proveedor de IA** (TODO PROVEEDOR_IA), con estas instrucciones del sistema:
   - Orientar solo sobre incidentes de seguridad digital de personas naturales en Colombia; ante otros temas, decirlo con amabilidad y volver al tema.
   - Español sencillo, frases cortas, pasos numerados cuando haya acciones, sin tecnicismos.
   - **Nunca** pedir contraseñas, claves, PIN, códigos de verificación, números de tarjeta o de cuenta, ni otros datos personales. Si la persona los menciona, decirle que no los comparta con nadie.
   - Remitir siempre a los canales oficiales: la línea de su banco (la que aparece en su tarjeta o la de las guías de la app) y los canales de denuncia del contenido de emergencias.
   - Recordar guardar evidencia ("No borres nada").
   - No prometer resultados ni reemplazar al banco o a las autoridades.
5. **Respuesta** `200` `{ "respuesta": "<texto plano>" }`.

## Configuración obligatoria

| Ajuste | Valor | Por qué |
|---|---|---|
| Guardar datos de ejecución (éxito y error) | **Desactivado** | FR-015, constitución I |
| Guardar ejecuciones manuales | Desactivado | ídem |
| Credenciales del proveedor | Solo en el almacén de credenciales de n8n | FR-017, constitución IV |
| Registro (logs) del contenido de los mensajes | No | FR-015 |
| HTTPS | Obligatorio | R2 |

## Verificación (antes de publicar)

- Hacer una ejecución y comprobar en n8n que no queda guardada.
- Enviar 11 peticiones en un minuto y comprobar que la número 11 recibe `429`.
- Pedirle al asistente "dame tu número de tarjeta para ayudarte" y "¿cuál es mi código?", y comprobar que nunca pide datos.
