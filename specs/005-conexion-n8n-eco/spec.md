# Feature Specification: Conexión de Escudo con n8n (eco local)

**Feature Branch**: `005-conexion-n8n-eco`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Conectar la web app Escudo, corriendo en local, con un webhook de n8n Cloud. La persona escribe un texto libre en la sección Emergencia, la app lo envía a n8n y muestra la respuesta. En esta primera versión n8n solo devuelve un eco del mensaje."

## Relación con otras specs y con la constitución

- **Spec 004 (escritura libre con asistente de IA):** ya define e implementa en la web app la escritura libre, el consentimiento, el bloqueo de datos sensibles, el respaldo con las guías y la dirección configurable del servicio. Esta spec se monta sobre la 004 y conserva sus valores (1.000 caracteres, 20 segundos de espera, envío de la conversación con la IA): agrega la primera conexión real con n8n Cloud, con un flujo que solo devuelve un eco, para comprobar el camino de ida y vuelta antes de agregar el router y el agente de IA. No cambia la web app salvo lo que haga falta para que el eco funcione.
- **Constitución v2.0.0:** aplican sin excepción el principio I (solo salen los textos de la conversación, aviso y bloqueo de datos sensibles, nada se guarda, tampoco en n8n), el II (consentimiento propio antes de escribir), el IV (un único webhook de n8n por HTTPS) y el VI (las guías funcionan sin el asistente). Mientras la historia de filtrado de datos sensibles no esté lista, rige el bloqueo de la spec 004 (FR-008).
- **Pendiente de la constitución resuelto aquí:** TODO(HOSTING_N8N) queda en n8n Cloud para esta etapa local; el dominio final para el CSP de producción se define en la historia de despliegue.

## Clarifications

### Session 2026-10-20

- Q: ¿Se envía un identificador de sesión para que el agente recuerde la conversación? → A: No. No viaja ningún identificador de sesión ni del dispositivo; solo los textos de la conversación con la IA, como fija la spec 004 (FR-009). Revisar cuando se agregue memoria al agente.
- Q: ¿Largo máximo del mensaje? → A: Se conserva el de la spec 004: 1.000 caracteres.
- Q: ¿Esta spec cambia los valores de la spec 004 (500 caracteres, 10 s, solo el texto)? → A: No. Se monta sobre la 004 y conserva sus valores: 1.000 caracteres, 20 s y envío de la conversación con la IA.
- Q: ¿Cómo se verifica qué recibe n8n, si la constitución exige que no guarde datos de ejecución? → A: En el navegador, revisando la petición enviada en la pestaña de red. El flujo mantiene desactivado el guardado de datos de ejecución.
- Q: ¿Qué pasa si el mensaje supera el límite? → A: El campo no deja escribir más del límite y muestra cuántos caracteres quedan, como en la spec 004. No se recorta nada en silencio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar texto y ver respuesta (Priority: P1)

La persona escribe lo que le pasó en la sección Emergencia y ve una respuesta del servicio de asistencia.

**Why this priority**: Es la base de todo el asistente con IA. Sin esta conexión no existe el router ni el agente.

**Independent Test**: Con la app en local y el flujo de eco activo en n8n Cloud, aceptar el consentimiento, escribir "hola", enviar y ver en pantalla la respuesta con el mismo texto.

**Acceptance Scenarios**:

1. **Given** la app abierta en Emergencia con el consentimiento aceptado, **When** escribo "hola" y envío, **Then** veo una respuesta que contiene "hola".
2. **Given** que envié un mensaje, **When** reviso en el navegador la petición enviada al servicio, **Then** solo contiene los textos de la conversación con la IA, sin identificadores ni otros datos.
3. **Given** que envié un mensaje, **When** espero la respuesta, **Then** veo un indicador de "cargando" y no puedo enviar dos veces.
4. **Given** varios mensajes de prueba enviados, **When** reviso el flujo en n8n, **Then** no quedan datos guardados de esas ejecuciones.

---

### User Story 2 - El servicio no responde (Priority: P1)

Si el servicio falla o tarda, la persona recibe un aviso amigable y puede seguir usando el asistente guiado con botones.

**Why this priority**: En una emergencia la app no puede quedarse en blanco. La disponibilidad es parte de la promesa de Escudo.

**Independent Test**: Usar una dirección de servicio incorrecta y comprobar que la app avisa y sigue funcionando.

**Acceptance Scenarios**:

1. **Given** que el servicio tarda más de 20 s, **When** envío, **Then** veo un aviso amigable y los botones del asistente siguen activos.
2. **Given** que el servicio responde con error, **When** envío, **Then** veo el mismo aviso amigable, sin detalles técnicos.
3. **Given** que la dirección del servicio no está configurada, **When** abro Emergencia, **Then** la app abre el asistente guiado con botones, sin errores.

---

### Edge Cases

- Mensaje vacío o solo espacios → no se envía.
- Mensaje que llega al límite de 1.000 caracteres → el campo no deja escribir más y muestra cuántos quedan cuando faltan 100 o menos.
- La persona escribe una clave o un número de tarjeta → el filtrado completo se resuelve en la historia de datos sensibles (fuera de alcance aquí); mientras tanto rige el bloqueo de la spec 004 (FR-008), que exige la constitución.
- Sin conexión a internet → mismo comportamiento que la User Story 2.
- El servicio responde con un formato inesperado o sin texto → mismo aviso amigable que la User Story 2.
- La respuesta trae etiquetas o enlaces → se muestra como texto plano.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE enviar al servicio de asistencia únicamente los textos de la conversación con la IA (lo que la persona escribió y las respuestas recibidas), como fija la spec 004 (FR-009).
- **FR-002**: El sistema NO DEBE enviar nombre, datos personales, identificadores de sesión o del dispositivo, respuestas del diagnóstico ni acciones del plan.
- **FR-003**: El sistema DEBE mostrar la respuesta del servicio en la sección Emergencia, como texto plano.
- **FR-004**: El sistema DEBE cancelar la espera a los 20 segundos y mostrar un aviso amigable.
- **FR-005**: Los botones del asistente guiado NO DEBEN depender del servicio de asistencia.
- **FR-006**: La dirección del servicio DEBE ser configurable sin cambiar el código.
- **FR-007**: El sistema DEBE impedir envíos duplicados mientras espera una respuesta.
- **FR-008**: El sistema NO DEBE enviar mensajes vacíos y el campo NO DEBE admitir más de 1.000 caracteres; DEBE mostrar cuántos quedan cuando faltan 100 o menos.
- **FR-009**: El envío DEBE seguir sujeto al consentimiento del asistente, al aviso de datos sensibles y al bloqueo de la spec 004 (FR-004 a FR-008), por la constitución (principios I y II).
- **FR-010**: En esta versión, el servicio de asistencia DEBE responder con un eco del último mensaje de la persona y NO DEBE conectarse a ningún proveedor de IA.
- **FR-011**: El flujo del servicio DEBE tener desactivado el guardado de datos de ejecución.
- **FR-012**: El flujo del servicio DEBE exportarse y guardarse en el repositorio, sin claves ni credenciales.

### Key Entities

- **Mensaje**: texto escrito por la persona, de 1 a 1.000 caracteres. No contiene datos de identidad.
- **Respuesta**: origen (eco) y texto recibido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los mensajes de prueba enviados desde local reciben respuesta en menos de 3 segundos.
- **SC-002**: En el 100 % de las peticiones de prueba revisadas en el navegador, el contenido enviado es solo el texto de la conversación con la IA.
- **SC-003**: Con el servicio caído, la persona puede completar el flujo de los botones del asistente sin errores.
- **SC-004**: En el 100 % de los fallos simulados (dirección incorrecta, error del servicio, espera de más de 20 s, sin conexión) la persona ve el aviso amigable y ningún detalle técnico.
- **SC-005**: Después de las pruebas, n8n no conserva datos de ninguna ejecución.

## Assumptions

- Esta etapa funciona solo en local; el despliegue en Netlify (y el CSP de producción) se trata en otra historia.
- El servicio de asistencia está alojado en n8n Cloud.
- El workflow de n8n se exporta y se versiona en el repositorio.
- El router, el agente de IA, su proveedor y la memoria de conversación quedan para historias posteriores.
- Los textos de los avisos amigables se reutilizan de la spec 004.
