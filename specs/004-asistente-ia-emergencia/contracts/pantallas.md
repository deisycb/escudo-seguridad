# Contrato: pantalla de Emergencia con escritura

Complementa [../../003-rediseno-emergencia-agente/contracts/pantallas.md](../../003-rediseno-emergencia-agente/contracts/pantallas.md); lo de la 003 sigue valiendo salvo lo que se indica aquí.

## Al montar (R6)

| Condición | Conversación inicial | Aviso |
|---|---|---|
| Sin `VITE_URL_ASISTENTE_IA` | `iniciar` (guías) | — |
| URL configurada y sin conexión | `iniciar` (guías) | "No tienes conexión. Te muestro las guías, que funcionan sin internet." (`role="status"`) |
| URL configurada y con conexión | `iniciarEscritura` | — |

## Estructura (con escritura)

1. `<h1>`, presentación del asistente y aviso "No borres nada" (sin cambios).
2. Conversación `role="log"` (sin cambios; ahora también con `escrito`, `respuestaIA`, `esperandoIA` y `falloIA`).
3. Opciones pendientes (sin cambios; por ejemplo "Ver guías" tras un fallo).
4. **`EscrituraIA`** (solo en las etapas `escritura`, `esperandoIA` y `falloIA`):
   - Sin consentimiento: tarjeta (`TARJETA`) con `CONSENTIMIENTO_IA`, "Acepto y quiero escribir" (`BOTON_PRINCIPAL`) y "No, prefiero ver las guías" (`BOTON_SECUNDARIO`).
   - Con consentimiento:
     - `<label for>` "Cuéntame con tus palabras qué te pasó";
     - `<textarea>` (fondo `fondo`, borde `borde`, radio 12 px, texto 16 px, mínimo 3 filas, `maxLength=1000`);
     - aviso `#aviso-sensibles` (14 px, `texto-secundario`, ícono Lock 16 px);
     - contador si quedan ≤ 100;
     - explicación de bloqueo `#explicacion-bloqueo` (`role="alert"`, con `<mark>`);
     - botón "Enviar" (`BOTON_PRINCIPAL`, ChevronRight, deshabilitado sin texto o esperando).
   - Enlace-botón "No puedo o no quiero escribir: ver guías" (`BOTON_ENLACE`).
5. Desde las guías, con conexión y URL configurada: enlace-botón "Prefiero escribirlo" (`BOTON_ENLACE`) debajo de las opciones → `volverAEscribir()`. No pide de nuevo el consentimiento si ya se aceptó en esta visita.
6. "Volver al inicio", acciones rápidas y diálogo de confirmación (sin cambios).

## Mensajes nuevos en `MensajeConversacion`

| Tipo | Presentación |
|---|---|
| `escrito` | burbuja de la persona; prefijo `sr-only` "Tú escribiste:" |
| `respuestaIA` | burbuja del asistente; chip "Respuesta generada por IA" (`pista`/`texto-secundario`); texto con `whitespace-pre-line`; pie "No reemplaza a tu banco ni a las autoridades" (12 px, `texto-suave`) |
| `esperandoIA` | burbuja del asistente con "El asistente está respondiendo…" (se anuncia en el `log`) |
| `falloIA` | burbuja del asistente con el texto amable; la opción "Ver guías" va en las opciones pendientes |

## Foco y anuncios

| Evento | Foco |
|---|---|
| Aceptar consentimiento | `textarea` |
| Envío bloqueado | `textarea` (la explicación se anuncia por `role="alert"`) |
| Respuesta recibida | `textarea` (la respuesta se anuncia por el `log`) |
| Fallo | opción "Ver guías" |
| Abrir guías | primera situación (regla de la 003) |
| Volver a escribir | `textarea` (o "Acepto y quiero escribir" si no hay consentimiento) |

## Prohibido

- `dangerouslySetInnerHTML`.
- Guardar el borrador, la conversación o el consentimiento en el navegador.
- Enviar sin consentimiento o con `detectarDatoSensible(texto) !== null`.
- Mostrar errores técnicos.
