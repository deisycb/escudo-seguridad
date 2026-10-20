# Feature Specification: Asistente guiado de emergencia

**Feature Branch**: `003-rediseno-emergencia-agente`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Rediseño del botón de emergencia y de su página como asistente guiado. Botón en Inicio con dos líneas ('Tengo una emergencia ahora' / 'Un asistente te guía paso a paso') y estilo de §7.5. Página de Emergencia como conversación tipo agente que funciona solo con botones, sin texto libre ni conexión a internet: presentación del asistente, 7 situaciones, pregunta de seguimiento cuando aplica, guías un paso a la vez ('Paso N de M', 'Listo, ¿qué sigue?'), cierre con denuncia / otra cosa / gracias, acciones rápidas siempre visibles (línea del banco, cómo denunciar, empezar de nuevo) y aviso 'No borres nada'. Diseño según constitución §7, WCAG 2.1 AA, contenido desde emergencias.js, la conversación no se guarda ni sale del dispositivo. Reemplaza FR-030, FR-031, FR-033 y FR-034 de la spec 001."

## Relación con la spec 001

- Esta spec **reemplaza** FR-030, FR-031, FR-033 y FR-034 de `specs/001-escudo-web-app/spec.md`, y los escenarios 2 a 5 de su User Story 2.
- **Ajusta** FR-004 de la spec 001 solo en la apariencia y el texto del botón (FR-001 y FR-002 de esta spec); su comportamiento (solo en Inicio, sin consentimiento ni diagnóstico) no cambia.
- **Se mantienen sin cambios**: FR-032 (aviso "No borres nada"), FR-035 (barra inferior con Emergencia), FR-036 a FR-036d (presentación, accesibilidad, diseño y fondo `superficie`), FR-037 a FR-040 (lenguaje y privacidad), y el acceso "¿Ya caíste en una? Ve a primeros auxilios" de Tips (FR-029), que ahora lleva al asistente.
- La entidad "Guía de emergencia" de la spec 001 se amplía con las entidades de esta spec (Situación, Pregunta de seguimiento, Guía).

## Clarifications

### Session 2026-10-20

- Q: Mientras el equipo no entregue el contenido de emergencias, ¿puede el asistente usar textos y destinos provisionales para las 7 situaciones? → A: Sí, con límite. Cada situación usa como texto su descripción de FR-007 y apunta a una de las 3 guías existentes; todo marcado `PROVISIONAL`. Los mensajes del asistente, pasos, líneas bancarias y canales de denuncia no se inventan: quedan vacíos y se muestra el mensaje de contenido pendiente. No se publica hasta tener el contenido real.
- Q: ¿Qué debe pasar si la persona toca "atrás" (navegador o celular) a mitad de la conversación? → A: Se pide confirmación antes de salir ("¿Salir del asistente? Perderás el paso en que vas"); si confirma, sale a la pantalla anterior y la conversación se descarta; si cancela, sigue en el mismo paso. (Cuenta también haber usado una acción rápida.)
- Q: Si la persona está a mitad de la conversación y toca otra sección de la barra inferior o "Volver al inicio", ¿también se pide confirmación? → A: Sí. Toda salida de la pantalla a mitad de la conversación ("atrás", barra inferior y "Volver al inicio") usa la misma confirmación de FR-041.
- Q: Si la persona toca "Empezar de nuevo" a mitad de una guía, ¿se pide confirmación antes de borrar la conversación? → A: Sí, con una confirmación igual a la de FR-041 ("¿Empezar de nuevo? Perderás el paso en que vas"), salvo si solo se ve el saludo.
- Q: ¿El botón de emergencia de Inicio puede medir más de los 52 px que fija §7.5 de la constitución? → A: Sí, como excepción: alto mínimo de 52 px que crece para mostrar las dos líneas (FR-002). El acceso de Tips conserva los 52 px.
- Q: ¿Se aprueban las decisiones de diseño que el plan propuso para los elementos sin regla en §7? → A: Sí (aprobado por el equipo el 2026-10-20): texto de respaldo cuando falta contenido ("Esta parte de la guía aún no está lista. Usa los botones de abajo para llamar a tu banco o ver cómo denunciar."), estilo de burbujas, chip "Paso N de M" (fondo `pista`, texto `texto-secundario`), acciones fijas al pie ("Llamar a la línea de mi banco" + "Más ayuda") y los botones de los diálogos "Seguir aquí" / "Salir" (research R3, R4, R7, R9 y R12).
- Q: ¿Dónde quedan fijas las acciones rápidas mientras la persona avanza en la conversación? → A: Al pie de la pantalla (encima de la barra inferior cuando existe) solo quedan "Llamar a la línea de mi banco" y un botón "Más ayuda"; "Más ayuda" despliega "Cómo denunciar en Colombia" y "Empezar de nuevo".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recibir una guía paso a paso para lo que me pasó (Priority: P1)

Una persona que acaba de caer en una estafa abre Escudo y, sin aceptar nada ni hacer el diagnóstico, toca "Tengo una emergencia ahora — Un asistente te guía paso a paso". Llega a una pantalla tranquila que le dice "Respira. Vamos paso a paso." y le presenta al "Asistente de emergencias", que le asegura que nunca le pedirá claves, códigos ni datos de su tarjeta. El asistente la saluda y le pregunta qué le pasó, ofreciendo 7 situaciones como botones. La persona elige una; si hace falta, el asistente le hace una pregunta más para entender mejor, y luego le entrega la guía un paso a la vez. Al terminar cada paso toca "Listo, ¿qué sigue?". Cuando acaba la guía, el asistente le ofrece ver cómo denunciar, contar otra cosa que le pasó o terminar.

**Why this priority**: Es el núcleo del rediseño: una víctima en crisis recibe instrucciones de una en una, sin tener que leer una lista larga ni escribir nada. Por sí solo ya entrega valor.

**Independent Test**: Desde Inicio, sin consentimiento ni diagnóstico, tocar el botón de emergencia, elegir cada una de las 7 situaciones (y cada respuesta de seguimiento, cuando exista) y recorrer la guía hasta el final, verificando que los textos coinciden exactamente con el archivo de contenido y que al final aparecen las tres opciones de cierre.

**Acceptance Scenarios**:

1. **Given** la pantalla de Inicio (con o sin consentimiento marcado, con o sin diagnóstico), **When** el usuario la ve, **Then** el botón de emergencia muestra el ícono TriangleAlert, el texto principal "Tengo una emergencia ahora" y debajo, en letra más pequeña, "Un asistente te guía paso a paso", con fondo blanco, borde de color peligro y texto de color peligro.
2. **Given** la pantalla de Inicio, **When** el usuario toca el botón de emergencia, **Then** llega a la pantalla de Emergencia sin que se le pida consentimiento ni diagnóstico.
3. **Given** la pantalla de Emergencia recién abierta, **When** se muestra, **Then** aparecen el título "Respira. Vamos paso a paso.", la presentación del asistente (ícono ShieldCheck dentro de un círculo de color primario, el nombre "Asistente de emergencias" y la frase "Nunca te pediré claves, códigos ni datos de tu tarjeta"), el aviso "No borres nada", las acciones rápidas y un primer mensaje del asistente con su saludo y las 7 situaciones como botones.
4. **Given** el asistente ofrece las 7 situaciones, **When** el usuario toca una, **Then** su elección aparece como un mensaje suyo (a la derecha) con el texto del botón elegido, y el asistente responde con la pregunta de seguimiento de esa situación o, si no tiene, con el primer paso de su guía.
5. **Given** el asistente hizo una pregunta de seguimiento, **When** el usuario elige una respuesta, **Then** la respuesta aparece como mensaje suyo y el asistente entrega el primer paso de la guía que corresponde a esa respuesta.
6. **Given** el asistente muestra un paso de una guía de M pasos, **When** se muestra, **Then** el mensaje lleva el chip "Paso N de M" y el texto de ese paso, y debajo el botón "Listo, ¿qué sigue?".
7. **Given** un paso N menor que M, **When** el usuario toca "Listo, ¿qué sigue?", **Then** aparece como mensaje suyo y el asistente muestra el paso N+1.
8. **Given** el último paso de la guía, **When** el usuario toca "Listo, ¿qué sigue?", **Then** el asistente muestra su mensaje de cierre de la guía y ofrece tres opciones: "Ver cómo denunciar en Colombia", "Me pasó otra cosa" y "Eso es todo, gracias".
9. **Given** las opciones de cierre, **When** el usuario toca "Me pasó otra cosa", **Then** el asistente vuelve a ofrecer las 7 situaciones, sin borrar la conversación anterior.
10. **Given** las opciones de cierre, **When** el usuario toca "Eso es todo, gracias", **Then** el asistente responde con su mensaje de despedida y no ofrece más opciones en la conversación; las acciones rápidas siguen disponibles.
11. **Given** las opciones de cierre, **When** el usuario toca "Ver cómo denunciar en Colombia", **Then** el asistente muestra los canales oficiales de denuncia dentro de la conversación y luego ofrece "Me pasó otra cosa" y "Eso es todo, gracias".
12. **Given** la persona ya eligió una opción o usó una acción rápida, **When** toca "atrás" en el navegador o el celular, otra sección de la barra inferior o "Volver al inicio", **Then** ve la confirmación "¿Salir del asistente? Perderás el paso en que vas"; **When** confirma, **Then** va a la pantalla elegida (la anterior, en el caso de "atrás") y la conversación se descarta; **When** cancela, **Then** sigue en el mismo paso con la conversación intacta.

---

### User Story 2 - Llamar a mi banco o saber cómo denunciar en cualquier momento (Priority: P1)

En cualquier punto de la conversación —incluso a mitad de una guía— la persona puede tocar "Llamar a la línea de mi banco" o "Cómo denunciar en Colombia". La información aparece dentro de la conversación y, cuando termina de verla, puede seguir con el paso en el que iba sin empezar de nuevo. También puede tocar "Empezar de nuevo" para volver al saludo inicial.

**Why this priority**: Llamar al banco es con frecuencia lo más urgente (bloquear una tarjeta o una transferencia). No puede depender de terminar la guía ni hacer perder el avance.

**Independent Test**: Avanzar hasta el paso 2 de una guía, tocar "Llamar a la línea de mi banco", verificar la lista de bancos y que cada número es visible y abre la llamada; verificar que el botón "Listo, ¿qué sigue?" del paso 2 sigue disponible y lleva al paso 3. Repetir abriendo "Más ayuda" y tocando "Cómo denunciar en Colombia". Luego, desde "Más ayuda", tocar "Empezar de nuevo" y verificar que la conversación vuelve al saludo inicial.

**Acceptance Scenarios**:

1. **Given** cualquier momento de la conversación, **When** el usuario mira la pantalla, **Then** "Llamar a la línea de mi banco" y "Más ayuda" están fijos al pie, visibles sin desplazarse; **When** toca "Más ayuda", **Then** se despliegan "Cómo denunciar en Colombia" y "Empezar de nuevo"; **When** vuelve a tocar "Más ayuda" o elige una de las dos, **Then** el panel se cierra.
2. **Given** el usuario está en el paso N de una guía, **When** toca "Llamar a la línea de mi banco", **Then** su acción aparece como mensaje suyo, el asistente muestra la lista de líneas oficiales de los bancos (nombre y número visible) y a continuación vuelve a ofrecer la acción pendiente del paso N ("Listo, ¿qué sigue?"), sin perder el número de paso.
3. **Given** la lista de líneas bancarias, **When** el usuario toca una línea, **Then** el dispositivo inicia la llamada a ese número.
4. **Given** el usuario está esperando elegir una opción (situación, seguimiento o cierre), **When** abre "Más ayuda" y toca "Cómo denunciar en Colombia", **Then** el asistente muestra los canales oficiales de denuncia dentro de la conversación y vuelve a ofrecer las mismas opciones pendientes.
5. **Given** la persona ya eligió una opción o usó una acción rápida, **When** abre "Más ayuda" y toca "Empezar de nuevo", **Then** ve la confirmación "¿Empezar de nuevo? Perderás el paso en que vas"; **When** confirma, **Then** la conversación se borra y el asistente muestra de nuevo su saludo con las 7 situaciones; **When** cancela, **Then** sigue en el mismo paso sin cambios. Si solo se ve el saludo, "Empezar de nuevo" no hace nada visible ni pide confirmación.

---

### User Story 3 - Usar el asistente con lector de pantalla o teclado (Priority: P2)

Una persona que usa lector de pantalla o solo teclado abre la pantalla de Emergencia. Cada mensaje nuevo del asistente se le anuncia, sabe cuál es el paso actual y cuántos faltan, y el foco queda en un lugar útil después de cada elección.

**Why this priority**: La constitución y la spec 001 exigen WCAG 2.1 AA; una conversación que cambia sola es una barrera si no se anuncia ni se maneja el foco.

**Independent Test**: Con lector de pantalla y solo teclado, recorrer una situación completa (incluida la pregunta de seguimiento y una acción rápida a mitad de la guía) y verificar que cada mensaje nuevo se anuncia y que el foco nunca se pierde.

**Acceptance Scenarios**:

1. **Given** el asistente agrega un mensaje, **When** aparece, **Then** el lector de pantalla lo anuncia sin interrumpir lo que esté leyendo en ese momento, incluido el texto "Paso N de M" cuando es un paso de guía.
2. **Given** el usuario elige una opción con el teclado, **When** aparece la respuesta del asistente, **Then** el foco pasa al nuevo mensaje o a su primera opción, nunca al inicio de la página ni a un botón que ya no está disponible.
3. **Given** cualquier botón de la conversación o de las acciones rápidas, **When** el lector de pantalla lo lee, **Then** su nombre accesible coincide con su texto visible; los mensajes se identifican como del asistente o de la persona por algo más que su color o su posición.

---

### Edge Cases

- **Contenido pendiente**: mientras el equipo no entregue los pasos de una guía, las líneas bancarias o los canales de denuncia en el archivo de contenido, el asistente muestra en su lugar un mensaje amigable definido en ese mismo archivo; nunca inventa pasos, números ni canales, y nunca muestra un mensaje vacío ni un error técnico.
- **Situación sin pregunta de seguimiento**: el asistente pasa directamente al primer paso de su guía.
- **Guía de un solo paso**: el chip muestra "Paso 1 de 1" y "Listo, ¿qué sigue?" lleva directamente al cierre.
- **Opciones ya respondidas**: los botones de mensajes anteriores dejan de estar disponibles una vez respondidos (la elección queda como mensaje de la persona); solo se puede actuar sobre las opciones pendientes y las acciones rápidas. Tocar dos veces seguidas un botón no duplica mensajes ni salta pasos.
- **Acción rápida repetida**: tocar varias veces "Llamar a la línea de mi banco" o "Cómo denunciar en Colombia" muestra la información cada vez y siempre vuelve a ofrecer la misma acción pendiente.
- **Acción rápida después de "Eso es todo, gracias"**: la información se muestra igual; como no hay acción pendiente, no se ofrecen opciones nuevas (el usuario puede usar "Empezar de nuevo").
- **Conversación larga**: la pantalla se desplaza para dejar a la vista el mensaje más reciente y sus opciones; "Llamar a la línea de mi banco" y "Más ayuda" siguen visibles al pie.
- **Sin conexión**: una vez cargada la web app, toda la conversación (saludo, situaciones, seguimiento, guías, líneas bancarias, denuncia y cierre) funciona sin internet.
- **Salir de la pantalla o recargar**: la conversación se descarta; al volver a Emergencia se empieza desde el saludo. Al salir con "atrás", la barra inferior o "Volver al inicio" se pide confirmación antes (FR-041), salvo si la persona aún no ha elegido nada (solo ve el saludo), en cuyo caso sale directamente.
- **Computador sin función de llamadas**: el número de cada línea bancaria es visible para marcarlo desde un teléfono.
- **Movimiento reducido**: si el usuario pidió reducir el movimiento en su dispositivo, los mensajes aparecen sin animaciones ni desplazamientos suaves.
- **Pantalla de Emergencia abierta con diagnóstico**: la barra inferior (FR-035 de la spec 001) sigue visible y no tapa las acciones rápidas ni las opciones pendientes.

## Requirements *(mandatory)*

### Functional Requirements

**Botón de emergencia en Inicio** (ajusta la apariencia de FR-004 de la spec 001)

- **FR-001**: El botón de emergencia de Inicio MUST seguir el estilo de botón de emergencia de la constitución (§7.5): fondo blanco, borde de 1,5 px color `peligro`, texto color `peligro` e ícono TriangleAlert.
- **FR-002**: El botón MUST mostrar dos líneas: el texto principal "Tengo una emergencia ahora" y debajo, en letra más pequeña, "Un asistente te guía paso a paso". Su alto mínimo MUST ser 52 px y MUST crecer lo necesario para mostrar ambas líneas completas (excepción a §7.5 de la constitución, que fija 52 px de alto: con dos líneas, un alto fijo cortaría la segunda), sin cortar texto, también en 360 px de ancho y con el texto ampliado al 200 %. Su nombre accesible MUST empezar por "Tengo una emergencia ahora" e incluir la segunda línea.
- **FR-003**: El botón MUST seguir apareciendo solo en Inicio y MUST llevar a la pantalla de Emergencia sin requerir consentimiento ni diagnóstico.

**Pantalla de Emergencia: estructura** (reemplaza FR-030 de la spec 001)

- **FR-004**: La pantalla de Emergencia MUST mostrar el título "Respira. Vamos paso a paso." y, debajo, la presentación del asistente: el ícono ShieldCheck dentro de un círculo de color `primario` (ícono en blanco), el nombre "Asistente de emergencias" y la frase "Nunca te pediré claves, códigos ni datos de tu tarjeta". Este asistente no es el asistente de IA de los principios I, II y IV de la constitución: no envía datos, no usa IA ni texto libre y entrega las guías fijas del principio VI, por lo que no requiere el consentimiento del asistente de IA.
- **FR-005**: La pantalla MUST presentar la ayuda como una conversación entre el asistente y la persona que funciona solo con botones. MUST NOT existir ningún campo de texto ni otra forma de escribir mensajes libres.
- **FR-006**: La pantalla MUST seguir mostrando el aviso "No borres nada" de FR-032 de la spec 001, sin que el usuario tenga que tocar nada para verlo.
- **FR-007**: Al abrirse, el asistente MUST saludar con su mensaje inicial y ofrecer, como botones, 7 situaciones: problema con la tarjeta o el banco; abrí un enlace falso; compartí un código; perdí mi WhatsApp; se están haciendo pasar por mí (suplantación); le pagué o transferí a un estafador; y tengo una duda / no estoy seguro de qué me pasó. El texto exacto del saludo y de cada situación MUST tomarse del archivo de contenido.

**Flujo de la conversación** (reemplaza FR-031 de la spec 001)

- **FR-008**: Al elegir una situación, el sistema MUST mostrar la elección como mensaje de la persona y luego: si la situación tiene pregunta de seguimiento en el archivo de contenido, el asistente MUST hacerla con sus respuestas como botones; si no la tiene, MUST entregar el primer paso de la guía de esa situación.
- **FR-009**: Cada respuesta de una pregunta de seguimiento MUST llevar a una guía definida en el archivo de contenido. La elección de la persona MUST mostrarse como mensaje suyo antes de la respuesta del asistente.
- **FR-010**: El asistente MUST entregar las guías un paso a la vez. Cada paso MUST mostrar un chip "Paso N de M" (N = paso actual, M = total de pasos de esa guía), el texto exacto del paso y el botón "Listo, ¿qué sigue?". Al tocarlo, MUST mostrarse como mensaje de la persona y el asistente MUST mostrar el paso siguiente.
- **FR-011**: Tras el último paso, el asistente MUST mostrar su mensaje de cierre de la guía y ofrecer tres opciones: "Ver cómo denunciar en Colombia", "Me pasó otra cosa" y "Eso es todo, gracias".
  - "Ver cómo denunciar en Colombia" MUST mostrar los canales de denuncia (FR-014) y luego ofrecer "Me pasó otra cosa" y "Eso es todo, gracias".
  - "Me pasó otra cosa" MUST volver a ofrecer las 7 situaciones, conservando la conversación anterior en pantalla.
  - "Eso es todo, gracias" MUST mostrar el mensaje de despedida del asistente y no ofrecer más opciones dentro de la conversación.
- **FR-012**: Solo las opciones pendientes (las del último mensaje del asistente) MUST poder usarse; las de mensajes anteriores MUST quedar no disponibles una vez respondidas. Una misma pulsación MUST NOT producir mensajes duplicados ni saltar pasos.
- **FR-013**: Todos los textos del asistente (saludo, situaciones, preguntas de seguimiento y sus respuestas, pasos de cada guía, cierre, despedida y mensajes de contenido pendiente), la relación situación → seguimiento → guía, las líneas bancarias y los canales de denuncia MUST tomarse tal cual del archivo de contenido de emergencias, sin reformularse ni inventarse. Única excepción temporal, hasta que el equipo entregue el contenido: el texto de cada situación puede ser su descripción de FR-007 y su destino una de las guías existentes, marcados como provisionales; la web app MUST NOT publicarse con contenido provisional ni pendiente. Los textos de la interfaz fijados por esta spec ("Respira. Vamos paso a paso.", "Asistente de emergencias", "Nunca te pediré claves, códigos ni datos de tu tarjeta", "Paso N de M", "Listo, ¿qué sigue?", las tres opciones de cierre y las tres acciones rápidas) se usan exactamente como aquí aparecen.

**Acciones rápidas** (reemplaza FR-033 y FR-034 de la spec 001)

- **FR-014**: La pantalla MUST mostrar fijas al pie, en todo momento y sin tener que desplazarse, dos acciones: "Llamar a la línea de mi banco" (la más destacada) y "Más ayuda". Si existe la barra inferior, van encima de ella sin taparla. "Más ayuda" MUST desplegar y plegar un panel con "Cómo denunciar en Colombia" y "Empezar de nuevo", comunicar a lectores de pantalla si está abierto o cerrado, y cerrarse al elegir una de las dos. Las tres son las acciones rápidas de esta spec.
- **FR-015**: "Llamar a la línea de mi banco" MUST mostrar dentro de la conversación la lista de líneas oficiales de los principales bancos de Colombia del archivo de contenido; cada línea MUST mostrar el nombre del banco y el número visible y, al tocarla, iniciar la llamada en el dispositivo.
- **FR-016**: "Cómo denunciar en Colombia" MUST mostrar dentro de la conversación los canales oficiales de denuncia de delitos informáticos del archivo de contenido.
- **FR-017**: Después de mostrar la información de FR-015 o FR-016, el asistente MUST volver a ofrecer exactamente las opciones que estaban pendientes antes (por ejemplo, "Listo, ¿qué sigue?" del mismo paso N), sin perder el paso ni la situación en curso. Si no había opciones pendientes (después de "Eso es todo, gracias"), no ofrece ninguna.
- **FR-018**: "Empezar de nuevo" MUST pedir confirmación con el texto "¿Empezar de nuevo? Perderás el paso en que vas" y dos botones (empezar de nuevo / seguir aquí), igual que FR-041. Al confirmar, MUST borrar la conversación y mostrar otra vez el saludo con las 7 situaciones; al cancelar, MUST seguir en el mismo paso sin cambios. La confirmación aplica si la persona ya eligió una opción o usó una acción rápida; si solo se ve el saludo, "Empezar de nuevo" no hace nada.

**Diseño** (según la constitución §7; complementa FR-036 a FR-036d de la spec 001)

- **FR-019**: La pantalla MUST usar el fondo `superficie`. Los mensajes del asistente MUST ir alineados a la izquierda, con fondo `fondo` (blanco), borde de 1 px `borde` y texto `texto`; los mensajes de la persona MUST ir alineados a la derecha, con fondo `primario` y texto blanco.
- **FR-020**: Las opciones del asistente (situaciones, respuestas de seguimiento, "Listo, ¿qué sigue?" y opciones de cierre) MUST mostrarse como botones de ancho completo de la columna, con su texto a la izquierda y el ícono ChevronRight a la derecha, con área táctil mínima de 44×44 px.
- **FR-021**: La pantalla MUST usar solo los tokens de color de §7.2, la tipografía de §7.3, las formas de §7.4 y los íconos de lucide-react de §7.9; MUST NOT usar emojis, ilustraciones ni colores sueltos. El chip "Paso N de M" MUST tener forma de píldora y texto de al menos 12 px.
- **FR-022**: La pantalla MUST ser mobile-first (referencia 390 px de ancho), sin desplazamiento horizontal, y en pantallas grandes MUST centrarse en una columna de máximo 560 px.
- **FR-023**: El asistente MUST NOT simular que está escribiendo ni hacer esperar al usuario: cada respuesta aparece de inmediato tras la elección. La vista MUST desplazarse para dejar a la vista el mensaje más reciente y sus opciones; si el dispositivo pide reducir el movimiento, sin animaciones.

**Accesibilidad** (complementa FR-036a de la spec 001)

- **FR-024**: La pantalla MUST cumplir WCAG 2.1 nivel AA. Cada mensaje nuevo del asistente MUST anunciarse a los lectores de pantalla sin interrumpir la lectura en curso, incluido el texto "Paso N de M" en los pasos de guía.
- **FR-025**: Tras cada elección, el foco MUST moverse al nuevo mensaje del asistente o a su primera opción; MUST NOT quedar en un botón ya no disponible ni volver al inicio de la página. Todas las acciones MUST poder hacerse con teclado y con foco visible.
- **FR-026**: Cada mensaje MUST identificarse como del asistente o de la persona también para lectores de pantalla (no solo por color o posición), y el nombre accesible de cada botón MUST coincidir con su texto visible.

**Privacidad**

- **FR-027**: La conversación MUST NOT guardarse en el dispositivo (ni en el almacenamiento del navegador) ni enviarse fuera de él; MUST descartarse al salir de la pantalla de Emergencia o recargar la web app.
- **FR-028**: Una vez cargada la web app, la pantalla de Emergencia MUST funcionar completa sin conexión a internet y MUST NOT hacer ninguna petición de red durante la conversación.
- **FR-029**: El asistente MUST NOT pedir ni ofrecer espacio para ingresar claves, códigos, números de tarjeta o de cuenta ni ningún otro dato personal (FR-039 de la spec 001).

**Salida a mitad de la conversación**

- **FR-041**: Si la persona ya eligió al menos una opción o usó una acción rápida e intenta salir de la pantalla de Emergencia ("atrás" del navegador o del celular, otra sección de la barra inferior o "Volver al inicio"), el sistema MUST pedir confirmación con el texto "¿Salir del asistente? Perderás el paso en que vas" y dos botones (salir / seguir aquí). Al confirmar, MUST ir a la pantalla elegida (la anterior, con "atrás") y descartar la conversación; al cancelar, MUST seguir en el mismo paso sin cambios. Si solo se ve el saludo, sale sin confirmar. La recarga o el cierre de la pestaña no piden confirmación. "Atrás" MUST NOT deshacer pasos dentro de la conversación.

### Key Entities

- **Situación**: una de las 7 opciones iniciales. Atributos: identificador, texto del botón, pregunta de seguimiento (opcional) o guía directa. Contenido fijo.
- **Pregunta de seguimiento**: texto de la pregunta del asistente y sus respuestas; cada respuesta tiene su texto y la guía a la que lleva. Contenido fijo.
- **Guía**: lista ordenada de pasos (M ≥ 1), cada uno con su texto. Puede compartirse entre varias situaciones o respuestas. Contenido fijo.
- **Mensajes del asistente**: saludo, cierre de guía, despedida y mensajes de contenido pendiente. Contenido fijo.
- **Línea bancaria** y **Canal de denuncia**: las mismas entidades de la spec 001.
- **Conversación**: secuencia de mensajes del asistente y de la persona en la sesión actual, más las opciones pendientes y la posición actual (situación, guía y paso N). Vive solo mientras la pantalla está abierta; no se guarda ni se envía.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde Inicio, sin consentimiento ni diagnóstico, un usuario ve el primer paso de la guía de su situación en 3 toques o menos (botón de emergencia, situación y, si existe, respuesta de seguimiento). Esto reemplaza el criterio SC-002 de la spec 001 para la pantalla de Emergencia.
- **SC-002**: Para las 7 situaciones y todas sus respuestas de seguimiento, el 100 % de los caminos llega a una guía, muestra todos sus pasos en orden con el "Paso N de M" correcto y termina en las tres opciones de cierre, con textos idénticos al archivo de contenido.
- **SC-003**: Desde cualquier punto de la conversación, el usuario ve el número de la línea de su banco con 1 toque e inicia la llamada con 1 toque más, y llega a los canales de denuncia con 2 toques ("Más ayuda" y "Cómo denunciar en Colombia"); en el 100 % de las pruebas, después de ver líneas bancarias o canales de denuncia, puede continuar en el mismo paso donde estaba.
- **SC-004**: Con el dispositivo en modo avión después de cargar la web app, el 100 % de la conversación funciona; una revisión de red durante el uso de Emergencia registra cero peticiones, y tras salir de la pantalla no queda ningún rastro de la conversación en el almacenamiento del navegador.
- **SC-005**: Una auditoría automática de accesibilidad y una revisión manual con teclado y lector de pantalla no encuentran incumplimientos de WCAG 2.1 AA en Inicio ni en Emergencia, y un usuario de lector de pantalla completa una guía de principio a fin sin ayuda.
- **SC-006**: Inicio y Emergencia se usan sin desplazamiento horizontal ni texto cortado en anchos desde 360 px hasta 1440 px, incluido el botón de emergencia con sus dos líneas.
- **SC-007**: En pruebas con usuarios, al menos el 80 % completa la guía de una situación de emergencia simulada sin ayuda externa y sabe, en cada paso, qué hacer a continuación.

## Assumptions

- **Contenido como dependencia**: el equipo entrega en el archivo de contenido de emergencias el texto del saludo, de las 7 situaciones, de las preguntas de seguimiento y sus respuestas, los pasos de cada guía, los mensajes de cierre, despedida y contenido pendiente, las líneas bancarias y los canales de denuncia, además de qué situaciones llevan pregunta de seguimiento y a qué guía lleva cada camino. Hoy ese archivo solo tiene los títulos de tres guías sin pasos; esta spec no inventa contenido (principio III de la constitución). Las 7 situaciones de FR-007 se nombran aquí por su significado; su texto visible es el del archivo. Mientras tanto se usan textos y destinos provisionales según la clarificación del 2026-10-20 (FR-013).
- **Las tres guías existentes** ("Bloquear mis tarjetas", "Reportar fraude en WhatsApp", "Fui víctima de phishing") pueden reutilizarse como guías de destino; el equipo decide su relación con las 7 situaciones en el archivo de contenido.
- **No es un asistente de IA**: este asistente es un recorrido fijo y determinista, construido solo con el contenido del proyecto; no genera respuestas ni usa servicios externos, por eso no requiere el consentimiento del asistente de IA (principio II) ni se identifica como generado por IA. El chat con IA vía n8n que contempla la constitución (principio IV) queda fuera de alcance de esta spec; si se agrega después, será un complemento separado dentro de Emergencia y este asistente seguirá siendo la ayuda que funciona sin conexión (principio VI).
- **Elementos visuales nuevos**: las burbujas de conversación, el círculo del asistente y el chip "Paso N de M" no están descritos en §7.5. Se construyen con los tokens, formas y tipografía de §7 según esta descripción del equipo, que hace de referencia hasta que exista un mockup en `/docs/diseno/` (que mandaría). Valores aprobado por el equipo el 2026-10-20: burbujas con esquinas de 16 px (como tarjetas); chip "Paso N de M" con fondo `pista` y texto `texto-secundario`, como el chip neutro de §7.5; ícono del asistente en blanco sobre el círculo `primario`. El uso de ShieldCheck para el asistente extiende su uso de "logo" en §7.9, porque el asistente habla en nombre de Escudo.
- **Acciones rápidas al pie**: el bloque fijo ("Llamar a la línea de mi banco" + "Más ayuda") y su panel desplegado no tapan las opciones pendientes ni la barra inferior; la conversación deja espacio debajo para que nada quede oculto.
- **Sin conexión** significa que, una vez abierta la web app, nada de la pantalla de Emergencia depende de la red; poder abrir la web app por primera vez sin internet (instalación como app sin conexión) queda fuera de alcance.
- Fuera de alcance: escribir mensajes libres, chat con IA, guardar o compartir la conversación, enviar datos a bancos o autoridades, presentar denuncias desde la web app, y cambios en las demás pantallas aparte del botón de Inicio.
