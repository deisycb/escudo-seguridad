# Feature Specification: Ajuste del asistente de emergencia

**Feature Branch**: `007-emergencia`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Ajustar el asistente de emergencia existente (specs 003, 004 y 005) al diseño aprobado (docs/prototipos/prototipo-emergencia.html) y a la conexión real de n8n: diseño de chat, aviso antes del primer texto libre, conexión con n8n basada en la función enviarMensajeEscudo, espera en dos tiempos (10 s / 60 s), formato seguro de la respuesta de la IA y constitución 2.1.0."

## Relación con otras specs, con el código y con la constitución

- **Qué se reutiliza:** el chat de emergencia ya construido en la rama `conexion-ai` (commit `744930e`, borrador "007-asistente-emergencia"): árbol de conversación con 5 botones y 6 guías locales, palabras clave, ocultar números de 4+ dígitos, cliente de n8n, burbujas, guía con pasos, botones rápidos, indicador "escribiendo" y barra de escritura. Ese trabajo no está en `main`; en esta rama se traen **solo** sus piezas de Emergencia. **Tips no se toca**: se conserva tal como está en `main` (spec 006-tips).
- **Qué se reemplaza en `main`:** la pantalla Emergencia de las specs 003/004/005 (conversación de 7 situaciones, escritura libre con consentimiento previo, bloqueo de números, cliente que envía la conversación). Las guías pasan a ser las 6 de la sección "Contenido de las guías locales".
- **Qué cambia respecto del borrador de `conexion-ai`:**
  - El consentimiento pasa a ser el **aviso de IA** con el texto y los botones de FR-020.
  - "Prefiero usar los botones" no envía nada ni busca palabras clave: muestra los 5 botones.
  - La espera es en dos tiempos: botones a los 10 s y cancelación a los 60 s (antes: respaldo a los 10 s).
  - La respuesta de n8n puede traer `text` u `output`.
  - La respuesta de la IA admite **negrita** con `**texto**`.
- **Prototipo:** `docs/prototipos/prototipo-emergencia.html` es la referencia visual y de comportamiento, y gana ante cualquier diferencia salvo en la conexión con n8n. **Aún no está en el repositorio**: esta spec se escribió con la descripción del diseño, y la comparación lado a lado queda como tarea pendiente.
- **Constitución:** se sube a 2.1.0 (MINOR). La regla de espera del asistente queda: "a los 10 segundos se ofrecen los botones mientras se espera; a los 60 segundos se cancela la petición". Se mantienen los principios I (privacidad: ningún número de 4+ dígitos sale del dispositivo; solo viaja el mensaje actual), II (aviso propio antes del primer texto libre), IV (único backend: webhook de n8n; los botones nunca lo usan) y VI (guías, botones y palabras clave funcionan sin conexión).

## Clarifications

### Session 2026-10-23

- Q: ¿Sobre qué base se construye, si lo "existente" solo está en la rama `conexion-ai`? → A: Se traen a `007-emergencia` solo los archivos del chat de emergencia de `conexion-ai`; no se borra ni cambia nada de Tips.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recibir una guía con botones, incluso sin internet (Priority: P1)

Una persona que acaba de caer en una estafa abre Emergencia y ve un chat. El asistente la saluda y le ofrece 5 botones. Toca uno: su elección aparece como mensaje suyo y el asistente responde con la guía de pasos numerados y una nota final. Después puede tocar "¿Cómo denuncio?" o "Me pasó otra cosa".

**Why this priority**: es la ayuda mínima en el momento, no depende de internet ni de la IA y cubre los 5 casos más comunes más la denuncia.

**Independent Test**: sin conexión, abrir Emergencia desde Inicio, tocar cada botón y comprobar los textos exactos de cada guía y que no se hizo ninguna petición de red.

**Acceptance Scenarios**:

1. **Given** Inicio sin diagnóstico, **When** la persona abre Emergencia, **Then** ve la barra superior ("Asistente de emergencia", punto verde "Te guío paso a paso", botón cerrar), el saludo y los 5 botones: "Di datos de mi tarjeta o banco", "Abrí un enlace falso", "Me robaron el WhatsApp", "Transferí plata a un estafador" y "Me llamaron y di información".
2. **Given** el saludo con sus botones, **When** toca "Di datos de mi tarjeta o banco", **Then** aparece a la derecha su mensaje con ese texto, se ve brevemente el indicador "escribiendo" y el asistente responde con la introducción, los 4 pasos en círculos rojos numerados y la nota en caja ámbar.
3. **Given** el asistente mostró una guía, **When** termina, **Then** aparecen "¿Cómo denuncio?" y "Me pasó otra cosa", y todos los botones anteriores quedan deshabilitados.
4. **Given** cualquier botón rápido, **When** se toca, **Then** no se hace ninguna petición de red.
5. **Given** la persona cierra el chat, **When** vuelve a abrir Emergencia, **Then** el chat empieza desde el saludo.

---

### User Story 2 - Aceptar el aviso de IA y recibir orientación (Priority: P1)

La persona prefiere escribir lo que le pasó. La primera vez que envía texto libre, el asistente le explica, antes de enviar nada, que se usa una inteligencia artificial. Si acepta, el mensaje sale (sin números) y la respuesta llega en párrafos, listas y negritas, sin que nada se interprete como código de página.

**Why this priority**: es el cambio central de esta spec y la base legal (aviso propio, constitución II) para que el texto salga del dispositivo.

**Independent Test**: con un servicio de prueba en lugar de n8n, escribir un primer mensaje y comprobar que no sale nada hasta aceptar; luego revisar qué sale exactamente y cómo se muestra la respuesta.

**Acceptance Scenarios**:

1. **Given** la persona no ha visto el aviso en esta sesión, **When** envía su primer texto libre, **Then** no sale nada del dispositivo y el asistente muestra: "Antes de seguir: para entender lo que escribes, usamos un asistente de inteligencia artificial. Solo le llega tu mensaje, sin números, y no lo guardamos. Lo usamos únicamente para orientarte.", con los botones "Sí, continuar" y "Prefiero usar los botones" y el enlace "Más detalles".
2. **Given** el aviso visible, **When** toca "Sí, continuar", **Then** se envía el mensaje que había escrito, ya sin números.
3. **Given** el aviso visible, **When** toca "Prefiero usar los botones", **Then** no se envía nada, se muestran los 5 botones del menú y el campo de texto sigue disponible.
4. **Given** la persona eligió "Prefiero usar los botones", **When** después escribe y envía otro texto, **Then** el aviso aparece de nuevo (aún no lo ha aceptado).
5. **Given** la persona ya aceptó el aviso, **When** envía más textos en la misma sesión, **Then** el aviso no vuelve a aparecer.
6. **Given** la persona solo usa botones, **When** recorre cualquier guía, **Then** el aviso nunca aparece.
7. **Given** la persona toca "Más detalles", **When** se abre, **Then** ve la política de datos, que informa que el servicio puede estar en otro país, sin perder la conversación.
8. **Given** la persona escribe "Me pidieron el código 123456", **When** lo envía, **Then** su burbuja muestra "Me pidieron el código ••••" con "Oculté los números por tu seguridad", y lo único que sale es `{ mensaje: "Me pidieron el código ••••" }`.
9. **Given** la IA responde con líneas que empiezan por "1." y "-" y con `**bloquea tu tarjeta**`, **When** se muestra, **Then** se ven párrafos, listas y la frase en negrita, con la marca de respuesta generada por IA.
10. **Given** la IA responde con `<script>alert(1)</script>` o `<b>hola</b>`, **When** se muestra, **Then** las etiquetas aparecen como texto literal y no tienen ningún efecto.

---

### User Story 3 - Espera en dos tiempos y respaldo local (Priority: P1)

Si n8n tarda, a los 10 segundos la persona ya tiene botones para avanzar sin dejar de esperar. Si n8n está caído, responde con error o se cumplen 60 segundos, el asistente sigue ayudando con palabras clave o con los botones.

**Why this priority**: una víctima nunca puede quedarse sin respuesta (constitución VI).

**Independent Test**: con temporizadores falsos y un servicio de prueba, simular respuesta rápida, lenta (más de 10 s), muy lenta (más de 60 s), con error y vacía.

**Acceptance Scenarios**:

1. **Given** se envió un texto, **When** pasan 10 s sin respuesta, **Then** el indicador "escribiendo" sigue y aparece "Sigo revisando tu caso. Mientras tanto, si ya sabes qué te pasó, elige una opción:" con los 5 botones.
2. **Given** se mostró el menú de espera, **When** la persona elige un botón, **Then** se muestra la guía local, el indicador desaparece y la respuesta de n8n que llegue después se descarta.
3. **Given** se mostró el menú de espera y la persona no eligió nada, **When** llega la respuesta de n8n antes de 60 s, **Then** se muestra la respuesta y los botones del menú de espera quedan deshabilitados.
4. **Given** n8n no responde, **When** se cumplen 60 s, **Then** se cancela la petición y, si no se mostró ninguna guía, se buscan palabras clave en el texto: con coincidencia se muestra esa guía; sin coincidencia se muestra "No pude conectarme, pero te sigo ayudando. ¿Cuál de estas situaciones se parece más a lo que te pasó?" con los 5 botones.
5. **Given** n8n responde con error HTTP o sin texto, **When** llega la respuesta, **Then** se aplica de inmediato el mismo respaldo del escenario 4, sin mostrar mensajes técnicos.
6. **Given** el dispositivo está sin conexión, **When** la persona envía texto libre, **Then** no se intenta contactar a n8n ni se muestra el aviso: se aplica el respaldo local de inmediato.
7. **Given** un texto que coincide con varios grupos ("me llamaron del banco y pagué"), **When** se busca por palabras clave, **Then** gana el primer grupo en el orden de FR-026 (aquí: Transferencia).

---

### Edge Cases

- **Números con separadores:** "4512 3456 7890 1234", "4512-3456" y "12.34.56" se tapan como una sola secuencia. Números de 1 a 3 dígitos ("las 3 de la tarde") se conservan.
- **Mensaje solo con números:** "123456" se muestra y envía como "••••".
- **Mensaje vacío o solo espacios:** el botón de enviar está deshabilitado y Enter no hace nada.
- **Mensaje muy largo:** el campo no permite más de 500 caracteres.
- **Doble envío:** mientras se espera respuesta no se puede enviar otro texto. Los botones del menú de espera sí están activos.
- **Texto pendiente del aviso:** si la persona escribe otro texto mientras ve el aviso, el campo está disponible, pero al enviar se reemplaza el texto pendiente y el aviso sigue mostrándose una sola vez.
- **Respuesta enorme:** se recorta al largo máximo y se muestra con scroll, sin desplazamiento horizontal.
- **Negrita sin cerrar** ("**hola"): se muestra literal.
- **Cerrar mientras se espera:** se cancela la petición y la conversación se descarta; nada aparece después.
- **Recargar la página:** la conversación y la aceptación del aviso se pierden.
- **Lector de pantalla:** cada mensaje nuevo se anuncia una vez; el indicador "escribiendo" tiene texto equivalente.
- **Movimiento reducido:** los puntos no se animan y el scroll es inmediato.
- **Teclado del celular abierto:** la barra inferior sigue visible y el último mensaje no queda tapado.

## Requirements *(mandatory)*

### Functional Requirements

**Diseño de chat (debe coincidir con el prototipo)**

- **FR-001**: Emergencia MUST mostrarse como un chat con tres zonas: barra superior, conversación con scroll y barra inferior fija.
- **FR-002**: La barra superior MUST tener fondo rojo suave, avatar cuadrado rojo con escudo, título "Asistente de emergencia", punto verde con "Te guío paso a paso" y botón cerrar de al menos 44×44 px con nombre accesible, que vuelve a la pantalla anterior.
- **FR-003**: Los mensajes del asistente MUST ir a la izquierda, en burbuja blanca con borde, esquina inferior izquierda casi recta y mini avatar rojo con escudo.
- **FR-004**: Los mensajes de la persona MUST ir a la derecha, en burbuja azul con texto blanco y esquina inferior derecha casi recta.
- **FR-005**: Las guías MUST mostrar introducción, pasos en círculos rojos numerados y nota final en caja ámbar.
- **FR-006**: Los botones rápidos MUST ser píldoras con borde rojo de al menos 44 px de alto, debajo del mensaje del asistente que los ofrece. Al elegir uno, todos los anteriores MUST quedar deshabilitados.
- **FR-007**: Mientras se prepara una respuesta, MUST verse el indicador "escribiendo" con tres puntos animados.
- **FR-008**: La barra inferior MUST mostrar el aviso con candado "No escribas claves, códigos ni números de tarjeta.", un campo redondeado con el texto de ejemplo "Escribe qué te pasó…" y etiqueta accesible, y un botón circular azul con ícono de enviar y nombre accesible.
- **FR-009**: El botón de enviar MUST estar deshabilitado si el campo está vacío o solo tiene espacios, o si se espera una respuesta de n8n. Enter MUST enviar en las mismas condiciones.
- **FR-010**: Cada mensaje nuevo MUST quedar a la vista (scroll automático).

**Botones (locales)**

- **FR-011**: Al abrir, el asistente MUST mostrar "Respira. Vamos paso a paso. Actuar en los primeros minutos reduce el daño. Cuéntame qué te pasó o elige una opción:" y los 5 botones de la US1.
- **FR-012**: Al elegir uno de los 5 botones, su texto MUST aparecer como mensaje de la persona y el asistente MUST responder con la guía local, seguida de "¿Cómo denuncio?" y "Me pasó otra cosa".
- **FR-013**: "¿Cómo denuncio?" MUST mostrar la guía de denuncia seguida de "Me pasó otra cosa".
- **FR-014**: "Me pasó otra cosa" MUST mostrar "Cuéntame con tus palabras qué te pasó o elige una opción:" con los 5 botones.
- **FR-015**: Ningún botón MUST generar una petición de red.

**Texto libre y privacidad**

- **FR-016**: Antes de mostrar o enviar un texto, el sistema MUST reemplazar cada secuencia de 4 o más dígitos (incluidos dígitos separados por espacio, punto o guion) por "••••". Si se reemplazó algo, la burbuja MUST mostrar "Oculté los números por tu seguridad".
- **FR-017**: Solo MUST salir del dispositivo el texto limpio del mensaje actual. MUST NOT salir el diagnóstico, el progreso, mensajes anteriores, identificadores ni datos del almacenamiento local.
- **FR-018**: La conversación y la aceptación del aviso MUST vivir solo en memoria: nunca se guardan en el dispositivo ni en n8n, y se borran al cerrar Emergencia.

**Aviso de IA**

- **FR-019**: El aviso MUST aparecer solo antes de enviar texto libre, y solo mientras la persona no lo haya aceptado en la sesión. Los botones nunca lo muestran.
- **FR-020**: El aviso MUST decir exactamente: "Antes de seguir: para entender lo que escribes, usamos un asistente de inteligencia artificial. Solo le llega tu mensaje, sin números, y no lo guardamos. Lo usamos únicamente para orientarte." Debe llevar los botones "Sí, continuar" y "Prefiero usar los botones", y un enlace pequeño "Más detalles".
- **FR-021**: "Sí, continuar" MUST enviar el texto pendiente. "Prefiero usar los botones" MUST NOT enviar nada: muestra los 5 botones y deja el campo disponible.
- **FR-022**: "Más detalles" MUST abrir la política de datos sin perder la conversación. La política MUST informar que el servicio de IA puede estar en otro país.

**Conexión con n8n**

- **FR-023**: La conexión MUST seguir la función `enviarMensajeEscudo` entregada por n8n (ver `specs/007-emergencia/referencia-n8n.md`):
  - Petición: POST con cuerpo JSON `{ mensaje }`.
  - Dirección: se toma de la configuración del despliegue, nunca escrita en el código.
  - Respuesta: puede ser un objeto o un arreglo; se toma `text` u `output` del primer elemento.
  - Tiempo máximo: 60 s.
- **FR-024**: Los mensajes de error internos MUST ser:
  - Mensaje vacío: "El mensaje no puede estar vacío."
  - Error HTTP: "Error del servidor: <código>".
  - Respuesta sin texto: "El agente no devolvió respuesta."
  - Tiempo agotado: "La respuesta tardó demasiado. Intenta de nuevo."

  Ninguno se muestra a la persona: todos activan el respaldo local.

**Espera en dos tiempos y respaldo**

- **FR-025**: Si a los 10 s no hay respuesta, el indicador MUST seguir y MUST aparecer "Sigo revisando tu caso. Mientras tanto, si ya sabes qué te pasó, elige una opción:" con los 5 botones. Si la persona elige uno, se muestra la guía local y la respuesta tardía de n8n MUST descartarse.
- **FR-026**: A los 60 s, o ante error o respuesta sin texto, si no se mostró ninguna guía, el sistema MUST buscar palabras clave en el texto. Si no hay coincidencia, MUST mostrar "No pude conectarme, pero te sigo ayudando. ¿Cuál de estas situaciones se parece más a lo que te pasó?" con los 5 botones. Los grupos se revisan en este orden, sin distinguir mayúsculas ni tildes, y gana el primero que coincida:
  1. WhatsApp: whats, wasap, guasap, "código de 6", "me robaron la cuenta"
  2. Transferencia: transfer, "envié plata", consign, nequi, daviplata, pagué, plata, dinero
  3. Tarjeta o banco: tarjeta, banco, clave, cvv, crédito, débito
  4. Enlace falso: enlace, link, página, correo, mensaje, sms, clic
  5. Llamada: llam, teléfono, "me dijeron"
  6. Denuncia: denunci, policía, fiscal
- **FR-027**: Sin conexión, el sistema MUST NOT contactar a n8n ni mostrar el aviso: aplica el respaldo local de inmediato.

**Respuesta de la IA**

- **FR-028**: La respuesta MUST tratarse como texto, en este orden:
  - Primero se escapa.
  - Los saltos de línea separan párrafos.
  - Las líneas que empiezan por un número con punto ("1.") forman una lista numerada y las que empiezan por "-" una lista de viñetas.
  - `**texto**` se muestra en negrita.

  Ningún contenido recibido MUST insertarse como código de página.
- **FR-029**: Cada respuesta de la IA MUST identificarse como generada por IA e indicar que no reemplaza al banco ni a las autoridades.

**Contenido, acceso y accesibilidad**

- **FR-030**: Todos los textos del chat (saludo, botones, guías, notas, aviso, menús de espera y respaldo, palabras clave) MUST venir del archivo de contenido de emergencias, nunca escritos en la interfaz.
- **FR-031**: Emergencia MUST abrirse desde Inicio sin diagnóstico y desde la barra inferior cuando hay diagnóstico.
- **FR-032**: La conversación MUST ser una región viva educada; todos los controles MUST usarse con teclado, con foco visible, áreas táctiles de 44×44 px, etiqueta en el campo y contraste WCAG 2.1 AA; con movimiento reducido no hay animaciones.
- **FR-033**: La pantalla MUST verse correctamente en tema claro y en tema oscuro. [NEEDS CLARIFICATION: la constitución §7.6 dice "Solo tema claro en esta versión" y el resto de la app no tiene tema oscuro. ¿El tema oscuro aplica solo a Emergencia, a toda la app, o se deja fuera?]

### Key Entities

- **Guía local**: situación, texto del botón, introducción, 4 pasos, nota y botones siguientes. Contenido fijo.
- **Grupo de palabras clave**: fragmentos ordenados asociados a una guía. Contenido fijo.
- **Mensaje**: autor, tipo (texto, guía, aviso, respuesta de IA), contenido ya limpio, indicación de números ocultos y botones ofrecidos (activos o no). Solo en memoria.
- **Estado del aviso**: no visto, mostrado con texto pendiente, aceptado. Solo en memoria.
- **Petición en curso**: texto enviado, momento de envío, si se ofreció el menú de espera y si se mostró una guía (para descartar respuestas tardías).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tocar cada botón rápido (5 situaciones, "¿Cómo denuncio?", "Me pasó otra cosa", "Prefiero usar los botones" y los del menú de espera) genera 0 peticiones de red.
- **SC-002**: El aviso aparece exactamente 1 vez por sesión cuando se acepta, y 0 veces si la persona solo usa botones.
- **SC-003**: El 100 % de las secuencias de 4+ dígitos de un conjunto de prueba (tarjetas, cuentas, cédulas, códigos, con y sin separadores) aparece como "••••" en pantalla y en lo que sale del dispositivo.
- **SC-004**: A los 10 s de espera, la persona tiene botones para avanzar en el 100 % de los casos; con n8n caído o con error, recibe guía o botones en menos de 1 s desde la falla.
- **SC-005**: 0 % de las respuestas de prueba con etiquetas de código de página se ejecutan o cambian la apariencia.
- **SC-006**: Una persona sin diagnóstico llega a los pasos de su situación en 2 toques desde Inicio, con o sin internet.
- **SC-007**: La pantalla coincide con el prototipo aprobado en móvil (390 px), comparada lado a lado.
- **SC-008**: La pantalla pasa una revisión WCAG 2.1 AA (región viva, 44 px, foco visible, etiqueta en el campo, movimiento reducido).

## Contenido de las guías locales

Se reutilizan sin cambios los textos del borrador de `conexion-ai` (principio III). Cada guía tiene introducción, 4 pasos y nota.

**Tarjeta o banco** — botón "Di datos de mi tarjeta o banco"
- Introducción: "Entendido. Lo más importante es bloquear rápido:"
1. Llama ya a la línea de tu banco (está detrás de tu tarjeta o en la app) y pide bloquear la tarjeta.
2. Si tu app tiene la opción, apaga la tarjeta desde ahí mientras te contestan.
3. Cambia la clave de la app del banco y revisa tus movimientos de hoy.
4. Pide al banco el número del reporte. Lo vas a necesitar.
- Nota: Guarda capturas del mensaje o el número que te llamó. No borres nada.

**Enlace falso** — botón "Abrí un enlace falso"
- Introducción: "Tranquilo, si actúas ya el daño se puede frenar:"
1. Si escribiste una contraseña, cámbiala ahora, y también en cualquier cuenta donde uses la misma.
2. Si diste datos de tarjeta o del banco, llama a tu banco para bloquearlos.
3. Activa la verificación en dos pasos en esa cuenta.
4. Guarda el mensaje, el enlace y el remitente como evidencia.
- Nota: Si solo abriste el enlace sin escribir nada, el riesgo es bajo. Cierra la página y borra el mensaje.

**WhatsApp robado** — botón "Me robaron el WhatsApp"
- Introducción: "Vamos a recuperar tu cuenta:"
1. Abre WhatsApp en tu celular y vuelve a verificar tu número con el código que te llegue por SMS. Eso saca al intruso.
2. Cuando entres, activa la verificación en dos pasos (PIN) en Ajustes > Cuenta.
3. Avisa a tus contactos por otro medio que no respondan pedidos de plata desde tu cuenta.
4. Si no puedes entrar, escríbele a soporte desde Ajustes > Ayuda en otro celular.
- Nota: Nunca compartas el código de 6 dígitos, aunque te lo pida alguien conocido.

**Transferencia** — botón "Transferí plata a un estafador"
- Introducción: "Lo siento mucho. El tiempo cuenta, así que vamos rápido:"
1. Llama ya a tu banco, di que fue fraude y pide intentar frenar o reversar la transferencia.
2. Guarda el comprobante, el número o la cuenta a la que enviaste y todas las conversaciones.
3. Pon la denuncia. Te digo cómo si me lo pides.
4. Si el banco no te responde, puedes acudir a su Defensor del Consumidor Financiero.
- Nota: No pagues a nadie que te ofrezca "recuperar tu plata". Suele ser una segunda estafa.

**Llamada** — botón "Me llamaron y di información"
- Introducción: "Depende de lo que dijiste. Haz esto según el caso:"
1. Si diste una clave o código, cámbialo ya y avisa a tu banco.
2. Si diste datos de tarjeta, llama al banco para bloquearla.
3. Si solo diste tu nombre o cédula, quédate alerta: pueden volver a llamar con más confianza.
4. Bloquea el número y anótalo con la hora de la llamada.
- Nota: Tu banco nunca te pide claves ni códigos por teléfono.

**Denuncia** — botón "¿Cómo denuncio?"
- Introducción: "Así puedes denunciar en Colombia:"
1. Reúne tu evidencia: capturas, números, enlaces, comprobantes y la hora en que pasó.
2. Denuncia en línea en el CAI Virtual de la Policía o en la denuncia virtual de la Fiscalía.
3. Si prefieres en persona, ve a la Fiscalía o a una estación de Policía.
4. Guarda el número de la denuncia y entrégaselo a tu banco si hubo plata de por medio.
- Nota: Estos delitos están en la Ley 1273 de 2009. Tu evidencia es la base del caso.

## Assumptions

- **Marca de IA:** bajo cada respuesta de la IA, "Respuesta generada por IA. No reemplaza a tu banco ni a las autoridades." (texto del borrador de `conexion-ai`).
- **"Más detalles"** abre la política de datos que ya existe en la app (`politica.js`), a la que se agrega el párrafo del asistente de IA. Se abre en un diálogo, para no perder la conversación.
- **Después de una respuesta de la IA** no se ofrecen botones; la persona puede seguir escribiendo.
- **"Escribiendo" en respuestas locales:** pausa breve (menos de 1 s); con movimiento reducido no hay pausa.
- **Pantalla completa:** mientras el chat está abierto se oculta la barra de navegación inferior de la app.
- **Largo máximo:** 500 caracteres por mensaje y 2.000 por respuesta de la IA.
- **"Sin conexión":** se usa el estado que informa el navegador; si dice que hay conexión, deciden los tiempos de 10 s y 60 s.
- **"Sesión"** = mientras Emergencia está abierta. Al cerrarla o recargar, el aviso vuelve a pedirse.
- **Workflow de n8n:** el flujo publicado (agente de IA) se exporta a `/n8n/asistente-emergencia.json`, con `allowedOrigins` de `http://localhost:5173` y `https://escudo-digital-ciudadano.netlify.app`. La exportación la hace el equipo desde n8n Cloud.
- **Variable de entorno:** la dirección del webhook pasa a `VITE_N8N_URL` (antes `VITE_URL_ASISTENTE_IA`).
- **Prototipo:** la comparación con `docs/prototipos/prototipo-emergencia.html` se hace cuando el archivo esté en el repositorio. Si algo difiere de esta spec, gana el prototipo, salvo en la conexión con n8n.
