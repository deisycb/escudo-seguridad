# Feature Specification: Escritura libre en Emergencia con asistente de IA

**Feature Branch**: `004-asistente-ia-emergencia`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Escritura libre en Emergencia con asistente de IA vía n8n, como forma principal, con las guías de la spec 003 como respaldo." (Origen: clarificaciones de la spec 003 del 2026-10-20: "deja una opción en emergencias donde la persona pueda enviar su texto sin tener que seleccionar una opción" → el texto va al asistente de IA vía n8n y la lista de situaciones deja de verse al abrir.)

## Relación con otras specs y con la constitución

- **Spec 003 (asistente guiado):** esta spec implementa la forma principal que exige FR-042 de la spec 003. El asistente guiado de la 003 no cambia: sigue siendo la ayuda que funciona sin conexión y se abre con el enlace "No puedo o no quiero escribir: ver guías" o automáticamente cuando la escritura no está disponible.
- **Constitución:** esta es la única función que usa la excepción del principio I (sale del dispositivo el texto que la persona escribe), el consentimiento propio del principio II y el único backend permitido por el principio IV (un flujo de n8n con un asistente de IA). Todas las reglas de la subsección "Asistente de Emergencia (n8n + IA)" aplican tal cual.
- **Pendientes de la constitución:** el proveedor de IA (TODO PROVEEDOR_IA) y el alojamiento de n8n (TODO HOSTING_N8N) siguen sin definir. Esta spec no los elige; son dependencias para publicar.

## Clarifications

### Session 2026-10-20

- Q: ¿Qué hace la app con un grupo de 4 a 8 dígitos seguidos que puede ser un código, un monto o una fecha? → A: Bloquea siempre (constitución I) y ayuda a reescribir: la explicación muestra resaltado el número detectado y sugiere cómo escribirlo si no es un código ("500 mil", "20 de octubre"); el texto queda en el campo. Se descartó dejar enviar con confirmación porque exigiría enmendar el principio I.
- Q: Si la persona aceptó el consentimiento, sale de Emergencia y vuelve sin cerrar la pestaña, ¿se le pide otra vez? → A: Sí, en cada visita a Emergencia; la aceptación no se recuerda ni en memoria ni en el navegador.
- Q: Si la persona pasa de la conversación con la IA a las guías y vuelve, ¿qué pasa con lo escrito? → A: Hay una sola conversación en pantalla: mensajes de IA, guías y sus pasos se suman en la misma línea; ir y volver no borra nada, y "Empezar de nuevo" (con su confirmación) borra todo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contar con mis palabras lo que me pasó y recibir orientación (Priority: P1)

Una persona que acaba de caer en una estafa abre Emergencia. En lugar de una lista, ve una invitación a contar con sus palabras qué le pasó. Antes de escribir, lee en lenguaje sencillo que su mensaje lo procesará un asistente de IA por fuera de su celular, que no se guarda y que no debe escribir claves, números de tarjeta o de cuenta ni códigos. Acepta, escribe "me llegó un mensaje del banco y puse mi clave en un link" y recibe una respuesta clara del asistente, marcada como generada por IA, que le dice qué hacer primero y le recuerda los canales oficiales. Puede seguir preguntando en la misma conversación.

**Why this priority**: es lo que pidió el equipo: escribir sin tener que elegir una opción. Sin esto, la spec no aporta nada.

**Independent Test**: con conexión y el flujo de n8n activo, abrir Emergencia desde Inicio sin diagnóstico, aceptar el consentimiento, enviar un mensaje y una pregunta de seguimiento, y verificar que se ven las dos respuestas marcadas como IA. En una revisión de red, verificar que solo viajan los textos escritos.

**Acceptance Scenarios**:

1. **Given** Emergencia recién abierta con conexión, **When** se muestra, **Then** aparecen el título, la presentación del asistente, el aviso "No borres nada" y las acciones rápidas de la spec 003, una invitación a escribir, el consentimiento del asistente de IA y el enlace "No puedo o no quiero escribir: ver guías". No se ve la lista de 7 situaciones.
2. **Given** el consentimiento sin aceptar, **When** la persona mira la pantalla, **Then** no puede escribir ni enviar mensajes: el campo de texto no está disponible hasta aceptar.
3. **Given** el consentimiento aceptado, **When** se muestra el campo de texto, **Then** antes de él se ve el aviso "No escribas contraseñas, números de tarjeta o de cuenta, ni códigos de verificación".
4. **Given** el consentimiento aceptado, **When** la persona escribe un mensaje y lo envía, **Then** su mensaje aparece en la conversación a la derecha, se indica que el asistente está respondiendo, y la respuesta aparece a la izquierda con la etiqueta "Respuesta generada por IA" y el recordatorio de que no reemplaza al banco ni a las autoridades.
5. **Given** una respuesta recibida, **When** la persona envía otra pregunta, **Then** el asistente responde teniendo en cuenta los mensajes anteriores de esa misma conversación.
6. **Given** una conversación con mensajes, **When** la persona sale de Emergencia y confirma (FR-041 de la spec 003), recarga o cierra la pestaña, **Then** la conversación se borra y al volver empieza de cero.

---

### User Story 2 - Que no se me escape un dato sensible (Priority: P1)

Una persona nerviosa empieza a escribir el número de su tarjeta o el código que le llegó por SMS. La app no lo envía: le explica en palabras sencillas por qué y le pide quitarlo.

**Why this priority**: es una condición de la constitución (principio I). Sin este bloqueo no se puede publicar la escritura libre.

**Independent Test**: con el consentimiento aceptado, intentar enviar mensajes con 16 dígitos seguidos, con 16 dígitos separados por espacios o guiones, y con un código de 6 dígitos, y verificar que ninguno sale del dispositivo; luego enviar un mensaje sin esos datos y verificar que sí se envía.

**Acceptance Scenarios**:

1. **Given** un mensaje con una secuencia de 13 a 19 dígitos (seguidos, o separados por espacios o guiones), **When** la persona intenta enviarlo, **Then** el mensaje no se envía, el texto sigue en el campo y se muestra junto al campo: "Parece que escribiste un número de tarjeta o de cuenta. Por tu seguridad no lo envío: bórralo y vuelve a intentarlo".
2. **Given** un mensaje con un grupo aislado de 4 a 8 dígitos, **When** la persona intenta enviarlo, **Then** no se envía, el número detectado se resalta en la explicación y se muestra: "Parece que escribiste un código de verificación. Nunca lo compartas con nadie, ni siquiera conmigo: bórralo. Si es un monto o una fecha, escríbelo así: '500 mil', '20 de octubre'".
3. **Given** un mensaje bloqueado, **When** la persona quita esos datos y vuelve a enviar, **Then** el mensaje se envía normalmente.

---

### User Story 3 - Recibir ayuda aunque falle la conexión o no quiera usar IA (Priority: P1)

Una persona sin datos móviles, o que no quiere que su mensaje salga del celular, o a quien el asistente no le responde, igual recibe ayuda: la app la lleva a las guías del asistente guiado (spec 003) con un mensaje amable.

**Why this priority**: la constitución (principio VI) exige que la ayuda nunca dependa del asistente de IA.

**Independent Test**: abrir Emergencia en modo avión, rechazar el consentimiento, y simular un fallo del servicio; en los tres casos verificar que se llega a las guías sin pantallas en blanco ni errores técnicos.

**Acceptance Scenarios**:

1. **Given** que no hay conexión al abrir Emergencia, **When** se muestra la pantalla, **Then** se abre directamente el asistente guiado de la spec 003, con un aviso: "No tienes conexión. Te muestro las guías, que funcionan sin internet".
2. **Given** el consentimiento a la vista, **When** la persona toca "No, prefiero ver las guías" o el enlace "No puedo o no quiero escribir: ver guías", **Then** se abre el asistente guiado y no se envía nada.
3. **Given** un mensaje enviado, **When** el asistente no responde en 20 segundos, falla la red o la respuesta no es válida, **Then** se muestra en la conversación: "No pude responderte en este momento. Mientras tanto, estas guías te pueden ayudar", con el botón "Ver guías", y el mensaje de la persona sigue visible para reintentar.
4. **Given** el asistente guiado abierto desde la escritura, **When** la persona quiere volver a escribir y hay conexión, **Then** puede hacerlo con el enlace "Prefiero escribirlo", sin aceptar de nuevo el consentimiento en esa misma visita.

---

### User Story 4 - Usar la escritura con lector de pantalla o teclado (Priority: P2)

Una persona que usa lector de pantalla o solo teclado acepta el consentimiento, escribe, envía y escucha la respuesta del asistente sin perderse.

**Why this priority**: WCAG 2.1 AA es obligatorio (spec 001 FR-036a); la escritura es ahora la forma principal de Emergencia.

**Independent Test**: con VoiceOver o NVDA y solo teclado, aceptar, enviar un mensaje, provocar un bloqueo por dato sensible y recibir una respuesta.

**Acceptance Scenarios**:

1. **Given** el campo de texto, **When** el lector de pantalla llega a él, **Then** lee su etiqueta y el aviso de datos sensibles asociado.
2. **Given** un mensaje enviado, **When** llega la respuesta, **Then** se anuncia sin interrumpir lo que el lector esté leyendo, junto con "Respuesta generada por IA"; mientras espera, se anuncia que el asistente está respondiendo.
3. **Given** un mensaje bloqueado, **When** se muestra la explicación, **Then** se anuncia de inmediato y el foco queda en el campo de texto.

---

### Edge Cases

- **Mensaje vacío o solo espacios**: el botón de enviar no está disponible.
- **Mensaje muy largo**: el campo admite hasta 1.000 caracteres y muestra cuántos quedan cuando faltan 100 o menos.
- **Envíos seguidos**: mientras el asistente responde, no se puede enviar otro mensaje (el botón queda no disponible y se indica que está respondiendo).
- **Límite de peticiones alcanzado** (el flujo rechaza por abuso): mensaje amable "Recibí muchos mensajes seguidos. Espera un momento o mira las guías", con "Ver guías".
- **Respuesta con formato raro** (etiquetas HTML, enlaces, código): se muestra siempre como texto plano; nada se interpreta como HTML.
- **Respuesta que pide datos sensibles** (falla del flujo): la app la muestra como texto, pero el aviso fijo "Nunca te pediré claves, códigos ni datos de tu tarjeta" sigue a la vista; el flujo de n8n debe impedirlo (FR-016).
- **Se pierde la conexión a mitad de la conversación**: el siguiente envío falla con el mensaje amable de User Story 3 y "Ver guías"; la conversación no se borra.
- **Dígitos legítimos** (un monto como "500000", una fecha "20102026"): se bloquean por la regla de 4 a 8 dígitos; la explicación resalta el número y muestra cómo reescribirlo ("500 mil", "20 de octubre"). No hay forma de enviarlos tal cual (aclaración del 2026-10-20).
- **Números de teléfono** (10 dígitos seguidos): no se bloquean, porque no caen en ninguno de los dos rangos.
- **Salir con conversación a medias**: aplica la confirmación de FR-041 de la spec 003.
- **Ir a las guías y volver**: la conversación se conserva entera (FR-021); al volver a escribir, el siguiente envío lleva solo el intercambio con la IA (FR-009).
- **Consentimiento en otra visita**: al volver a abrir Emergencia se pide de nuevo; no se guarda.

## Requirements *(mandatory)*

### Functional Requirements

**Pantalla y entrada principal** (implementa FR-042 de la spec 003)

- **FR-001**: Al abrir Emergencia con conexión, la pantalla MUST mostrar, debajo del título, la presentación del asistente y el aviso "No borres nada" de la spec 003: una invitación a escribir ("Cuéntame con tus palabras qué te pasó"), el consentimiento del asistente de IA (FR-004) y el enlace "No puedo o no quiero escribir: ver guías". La lista de 7 situaciones MUST NOT mostrarse en esta vista.
- **FR-002**: Las acciones rápidas de la spec 003 (FR-014) y el aviso "No borres nada" MUST seguir visibles en la vista de escritura.
- **FR-003**: Sin conexión al abrir Emergencia, el sistema MUST abrir directamente el asistente guiado de la spec 003 con el aviso "No tienes conexión. Te muestro las guías, que funcionan sin internet".

**Consentimiento y aviso** (constitución I y II)

- **FR-004**: Antes de poder escribir, la persona MUST aceptar un consentimiento propio, aparte del consentimiento del diagnóstico, que explique en lenguaje sencillo: que sus mensajes se procesan en n8n y en un proveedor de IA externo, posiblemente fuera de Colombia; que no se guardan; que se usan solo para orientarla sobre este incidente; y que puede usar las guías en su lugar. Debe ofrecer "Acepto y quiero escribir" y "No, prefiero ver las guías". El texto del consentimiento lo aprueba el equipo (Ley 1581 de 2012).
- **FR-005**: El consentimiento MUST NOT guardarse ni recordarse (ni en el navegador ni en la memoria de la app): se pide en cada visita a Emergencia, también al volver sin cerrar la pestaña, y vale solo hasta que la persona sale de la pantalla.
- **FR-006**: Junto al campo de texto MUST verse siempre el aviso "No escribas contraseñas, números de tarjeta o de cuenta, ni códigos de verificación".

**Escribir y enviar**

- **FR-007**: El campo de texto MUST admitir hasta 1.000 caracteres, tener una etiqueta visible y un botón "Enviar" que solo está disponible con texto no vacío y cuando no se espera una respuesta.
- **FR-008**: Antes de enviar, el sistema MUST bloquear en el dispositivo los mensajes que contengan (a) una secuencia de 13 a 19 dígitos, contando dígitos separados solo por espacios o guiones, o (b) un grupo aislado de 4 a 8 dígitos; MUST conservar el texto en el campo y mostrar la explicación de User Story 2, que MUST mostrar el número detectado y, para los grupos de 4 a 8 dígitos, un ejemplo de cómo reescribir un monto o una fecha. Un mensaje bloqueado MUST NOT salir del dispositivo ni enviarse con ninguna confirmación posterior (constitución I).
- **FR-009**: Al enviar, el sistema MUST transmitir solo el texto del mensaje y los mensajes anteriores del intercambio con la IA en la conversación abierta (lo que la persona escribió y las respuestas de la IA). Los pasos de las guías y los botones elegidos MUST NOT enviarse. MUST NOT enviar respuestas del diagnóstico, resultados, progreso del plan, identificadores del dispositivo ni nada guardado en el navegador.
- **FR-010**: Mientras espera, la conversación MUST mostrar que el asistente está respondiendo; si no hay respuesta en 20 segundos, MUST tratarse como fallo (FR-013).

**Respuestas**

- **FR-011**: Cada respuesta MUST mostrarse como texto plano (nunca como HTML), alineada a la izquierda como los mensajes del asistente de la spec 003, con la etiqueta "Respuesta generada por IA" y el recordatorio "No reemplaza a tu banco ni a las autoridades".
- **FR-012**: La persona MUST poder seguir enviando mensajes en la misma conversación; cada envío incluye la conversación anterior (FR-009).

**Fallos y respaldo** (constitución VI)

- **FR-013**: Ante tiempo agotado, error de red, respuesta inválida o límite de peticiones, el sistema MUST mostrar un mensaje amable (User Story 3 y casos borde) con el botón "Ver guías", sin errores técnicos, y conservar la conversación.
- **FR-014**: "Ver guías", "No, prefiero ver las guías" y el enlace "No puedo o no quiero escribir: ver guías" MUST abrir el asistente guiado de la spec 003 dentro de la misma conversación (FR-021). Desde las guías, con conexión, el enlace "Prefiero escribirlo" MUST volver a la escritura, sin pedir otra vez el consentimiento si ya se aceptó en esta visita.

**Privacidad**

- **FR-021**: Emergencia MUST mostrar una sola conversación: los mensajes con la IA, los mensajes del asistente guiado y las acciones rápidas se suman en la misma línea, en orden. Pasar de la escritura a las guías o volver MUST NOT borrar mensajes. "Empezar de nuevo" (con la confirmación de FR-018 de la spec 003) MUST borrar toda la conversación y volver a la vista inicial de escritura (FR-001); el consentimiento sigue aceptado en esa visita.
- **FR-015**: La conversación MUST NOT guardarse en el dispositivo ni en el flujo de n8n (el flujo MUST tener desactivado el guardado de datos de ejecución). Se descarta al salir de Emergencia, recargar o cerrar la pestaña.
- **FR-016**: El flujo de n8n MUST limitar al asistente a orientar sobre incidentes de seguridad digital, en español sencillo; MUST NOT pedir datos sensibles; MUST remitir a los canales oficiales del contenido de emergencias (líneas bancarias y denuncia), y MUST limitar la cantidad de peticiones.
- **FR-017**: Las claves del proveedor de IA MUST vivir solo en n8n, nunca en la web app. La web app MUST conectarse únicamente a un único webhook de n8n por HTTPS, y la política de seguridad de la web app MUST permitir conexiones solo a ese origen.

**Diseño y accesibilidad** (constitución §7; spec 001 FR-036a)

- **FR-018**: Los mensajes de la persona y del asistente MUST usar las mismas burbujas de la spec 003 (FR-019); el campo y el botón "Enviar" MUST usar los tokens, radios y tipografía de §7 y áreas táctiles de al menos 44×44 px; el ícono de enviar MUST ser uno de §7.9 o, si ninguno sirve, se avisa al equipo antes de usar otro.
- **FR-019**: El campo de texto MUST tener etiqueta accesible y su aviso de datos sensibles asociado; las respuestas y el estado "respondiendo" MUST anunciarse a lectores de pantalla sin interrumpir la lectura en curso; los bloqueos por dato sensible MUST anunciarse de inmediato con el foco en el campo.
- **FR-020**: La salida de Emergencia con una conversación de IA a medias MUST pedir la misma confirmación de FR-041 de la spec 003.

### Key Entities

- **Consentimiento del asistente de IA**: aceptado o no en la visita actual. No se guarda.
- **Mensaje de la conversación de IA**: autor (persona o asistente), texto, y para el asistente la marca "generado por IA". Vive solo en memoria.
- **Bloqueo por dato sensible**: tipo (número de tarjeta o cuenta, código de verificación) y explicación mostrada. No se registra.
- **Estado de la escritura**: disponible, sin conexión, esperando respuesta, fallo o límite alcanzado; decide si se muestra la escritura o el asistente guiado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con conexión, una persona puede enviar su primer mensaje en 3 toques o menos desde Inicio (botón de emergencia, "Acepto y quiero escribir", "Enviar") más lo que escriba.
- **SC-002**: En el 90 % de los envíos de prueba, la respuesta del asistente aparece en menos de 10 segundos.
- **SC-003**: El 100 % de los mensajes de prueba con números de tarjeta (13 a 19 dígitos, con o sin separadores) o códigos de 4 a 8 dígitos se bloquean sin salir del dispositivo, y el 100 % de los mensajes sin esos datos se envían.
- **SC-004**: En una revisión de red durante el uso completo de la web app, la única conexión externa es al webhook de n8n, solo ocurre después de aceptar el consentimiento, y solo contiene los textos de la conversación; no hay peticiones antes de aceptar ni al rechazar.
- **SC-005**: En los tres casos de respaldo (sin conexión, consentimiento rechazado, asistente sin respuesta) la persona llega a las guías en 1 toque o menos, sin pantallas en blanco ni errores técnicos.
- **SC-006**: Tras salir de Emergencia, recargar o cerrar la pestaña, no queda ningún rastro de la conversación ni del consentimiento en el almacenamiento del navegador, y el flujo de n8n no conserva datos de esas ejecuciones.
- **SC-007**: Una auditoría automática y una revisión manual con teclado y lector de pantalla no encuentran incumplimientos de WCAG 2.1 AA en la vista de escritura.
- **SC-008**: En pruebas con usuarios, al menos el 80 % entiende, después de leer el consentimiento, que su mensaje sale del celular hacia un asistente de IA y que no se guarda.

## Assumptions

- **Proveedor de IA y alojamiento de n8n**: los define el equipo (TODOs de la constitución). Esta spec funciona con cualquiera que cumpla FR-015 a FR-017; sin ellos definidos, la escritura no se puede publicar y Emergencia sigue abriendo en el asistente guiado (spec 003, FR-042).
- **Texto del consentimiento**: lo redacta y aprueba el equipo; esta spec fija qué debe explicar (FR-004), no su texto final. Los demás textos de interfaz de esta spec son propuestas que el equipo puede ajustar.
- **Consentimiento por visita**: se pide cada vez que se abre Emergencia, porque no se guarda nada de este asistente en el dispositivo. Volver de las guías a la escritura en la misma visita no lo vuelve a pedir.
- **Detección de datos sensibles**: reglas simples por cantidad de dígitos (13 a 19 para tarjeta o cuenta, 4 a 8 para códigos). Bloquean montos o fechas escritos solo con números; se acepta ese costo a cambio de no dejar pasar códigos, y la explicación ayuda a reescribirlos (aclaración del 2026-10-20). Contraseñas escritas como palabras no se pueden detectar: por eso el aviso fijo (FR-006).
- **Límites por defecto**: 1.000 caracteres por mensaje, 20 segundos de espera; ajustables en el plan si el proveedor lo exige.
- **Sin conexión**: se considera "sin conexión" lo que el navegador informa como desconectado al abrir Emergencia; una red lenta o caída después se trata como fallo de envío (FR-013).
- **Fuera de alcance**: adjuntar imágenes o capturas, notas de voz, guardar o exportar la conversación, historial entre visitas, cuentas, otros idiomas, que el asistente haga trámites con bancos o autoridades, y cambiar el asistente guiado de la spec 003.
