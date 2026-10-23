# Feature Specification: Tips de seguridad interactivos

**Feature Branch**: `006-tips`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "Rediseñar la pantalla de Tips de seguridad para que sea interactiva, entretenida y fácil de leer, manteniendo los colores del sistema de diseño. La persona aprende a reconocer las 8 estafas más comunes en Colombia 'jugando': descubre las trampas dentro de un mensaje real de ejemplo y responde un mini reto. Referencia obligatoria: `scripts/prototipos/prototipo-tips.html` (prototipo aprobado; si la especificación y el prototipo no coinciden, gana el prototipo). Contenido real de los 8 tips entregado por el equipo."

## Relación con otras specs y con el prototipo

- **Prototipo aprobado**: `scripts/prototipos/prototipo-tips.html`. Define estructura, textos, interacciones y colores. Ante una diferencia entre esta spec y el prototipo, gana el prototipo, **salvo** donde la constitución fija una regla explícita (la constitución prevalece sobre todo, ver Governance). Esas excepciones están listadas en "Decisiones frente al prototipo".
- **Reemplaza** de `specs/001-escudo-web-app/spec.md`: FR-025 (texto de la Regla de oro), FR-026 (títulos: dos de ellos ahora van entre comillas), FR-028 (detalle de la tarjeta) y FR-029 (texto del acceso a Emergencia), y los escenarios de su User Story de Tips que dependen de ellos.
- **Se mantienen sin cambios**: FR-006 (Tips solo existe con un diagnóstico guardado), FR-027 (filtros Todos, SMS, Llamadas, Correo, WhatsApp), FR-035 (barra inferior) y FR-036d (Tips usa fondo `superficie`).
- **Amplía** el contrato de almacenamiento de la spec 001 con un único dato nuevo: los retos superados (FR-030).

## Decisiones frente al prototipo

| Tema | Prototipo | Esta spec | Motivo |
|---|---|---|---|
| Tema oscuro | Tiene tema oscuro | Solo tema claro | Constitución §7.6: "Solo tema claro en esta versión". |
| Colores | Hexadecimales propios | Tokens de `tailwind.config.js` con el mismo papel (azul = `primario`, rojo = `peligro`, ámbar = `advertencia`, verde = `exito`); se agregan los tokens suaves que faltan (azul suave y verde suave) | Constitución §7.2. |
| Texto de lectura | 14,5–15 px | Mínimo 16 px en mensaje, señales, pasos, opciones y resultados | Constitución §7.3. Etiquetas, contador, ayuda y "Dato" pueden ir más pequeños (≥ 12 px). |
| Redondeo y relleno de tarjetas | 20 px / 16 px | 16 px / 20 px | Constitución §7.4. |
| Acceso a Emergencia | Caja no interactiva | Botón que lleva a Emergencia, con el texto del prototipo | Debe navegar (constitución §7.7: elementos interactivos reales). |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descubrir las trampas en un mensaje de ejemplo (Priority: P1)

Una persona con diagnóstico guardado abre Tips desde la barra inferior. Ve el título, la Regla de oro en una tarjeta azul y la lista de 8 estafas; la primera ya está abierta. Dentro, ve "Así se ve" con un mensaje de ejemplo (remitente, hora, etiqueta "Ejemplo" y la burbuja) en el que algunas frases están subrayadas con punteado rojo. Toca una: la frase se pinta de rojo, hace un pequeño salto, el contador pasa a "1 de 3 trampas" y aparece debajo una caja roja suave con "Trampa: …" y la explicación. Repite hasta encontrar las 3; la ayuda desaparece y la caja agrega "¡Las encontraste todas!". Debajo lee "Cómo reconocerla", "Qué hacer" y el "Dato".

**Why this priority**: Es la mecánica central de aprendizaje: reconocer en un mensaje real dónde está el engaño. Por sí sola ya vale más que la lista de texto actual.

**Independent Test**: Con un diagnóstico guardado, abrir Tips y, en cada uno de los 8 tips, tocar (y luego activar con teclado) las 3 frases trampa, comprobando el contador, la caja de explicación con el texto exacto del contenido, la desaparición de la ayuda y el mensaje final.

**Acceptance Scenarios**:

1. **Given** la persona abre Tips, **When** se muestra la pantalla, **Then** ve de arriba hacia abajo: el título "Tips de seguridad", el subtítulo "Las estafas más comunes en Colombia. Abre cada una, busca las trampas en el mensaje y pon a prueba lo que harías.", la tarjeta azul "Regla de oro" con "Tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta. Ni por llamada, ni por mensaje, ni por correo.", la barra de progreso, los filtros, las 8 tarjetas (la primera abierta) y el acceso "¿Ya caíste en una? Ve a Emergencia y sigue los primeros auxilios."
2. **Given** una tarjeta abierta con 0 trampas encontradas, **When** se muestra, **Then** el bloque "Así se ve" muestra "0 de 3 trampas", el mensaje con sus 3 frases subrayadas en punteado rojo y la ayuda "Toca las partes subrayadas en rojo para descubrir cada trampa."
3. **Given** una frase trampa no encontrada, **When** la persona la toca o la activa con Enter o Espacio, **Then** la frase queda resaltada en rojo, hace la animación "pop", el contador sube en 1 y debajo aparece la caja "Trampa: <explicación de esa frase>".
4. **Given** una frase trampa ya encontrada, **When** la persona la vuelve a tocar, **Then** la caja muestra otra vez su explicación y el contador no cambia.
5. **Given** que la persona encuentra la tercera trampa, **When** aparece la caja, **Then** termina con "¡Las encontraste todas!" y la ayuda desaparece.
6. **Given** un tip de llamada, **When** se abre, **Then** en lugar de "De:" el encabezado dice "Lo que te dicen:" y la burbuja tiene las esquinas redondeadas por igual.
7. **Given** el tip "Tu cuenta será suspendida", **When** se abre, **Then** la primera trampa es la dirección del remitente (`seguridad@cuenta-verificacion.net`) y las otras dos están en el mensaje.
8. **Given** la persona encontró trampas en un tip, **When** cierra y vuelve a abrir esa tarjeta o va a otra sección y regresa, **Then** las trampas encontradas siguen marcadas y el contador las refleja; **When** recarga la página, **Then** vuelven a 0.
9. **Given** una tarjeta abierta, **When** se muestra, **Then** "Cómo reconocerla" lista 3 señales con un punto rojo, "Qué hacer" lista 3 pasos con un círculo azul numerado, y al final aparece "Dato:" con la frase del contenido en gris.

---

### User Story 2 - Poner a prueba lo que haría con el mini reto (Priority: P1)

Dentro de la tarjeta abierta, la persona lee la pregunta del "Mini reto" en una caja azul suave y elige entre 3 opciones. Si elige mal, la opción se pinta de rojo, queda deshabilitada y lee "Esa opción te deja expuesto. Intenta otra."; puede seguir intentando. Si acierta, la opción se pinta de verde, todas se bloquean, lee el mensaje de acierto, la tarjeta muestra "· Reto superado" y la barra de progreso sube.

**Why this priority**: Convierte la lectura en decisión práctica y da la sensación de avance; junto con la Historia 1 forma la experiencia completa.

**Independent Test**: En cada tip, elegir primero una opción incorrecta (ver rojo, deshabilitada, mensaje de fallo) y luego la correcta (ver verde, opciones bloqueadas, mensaje de acierto, "Reto superado" en la cabecera y la barra en "N de 8").

**Acceptance Scenarios**:

1. **Given** el mini reto sin responder, **When** la persona elige una opción incorrecta, **Then** esa opción toma borde y fondo rojos, queda deshabilitada, aparece "Esa opción te deja expuesto. Intenta otra." en rojo y las demás siguen disponibles.
2. **Given** el mini reto, **When** la persona elige la opción correcta, **Then** esa opción toma borde y fondo verdes, todas las opciones quedan deshabilitadas, aparece el mensaje de acierto del contenido en verde, la cabecera de la tarjeta agrega "· Reto superado" en verde y la barra pasa a "N de 8 retos superados" al instante.
3. **Given** un reto ya superado, **When** la persona recarga la página, **Then** la barra y la etiqueta "Reto superado" de esa tarjeta se conservan.
4. **Given** un reto ya superado, **When** la persona cierra y abre otra vez la tarjeta, **Then** el reto se muestra sin responder y puede jugarlo de nuevo; una respuesta incorrecta no le quita el "Reto superado" ni baja la barra.
5. **Given** cualquier resultado del reto, **When** aparece el mensaje, **Then** se anuncia a lectores de pantalla y lleva texto, no solo color.

---

### User Story 3 - Elegir qué tips ver y moverse entre ellos (Priority: P2)

La persona filtra por canal con los chips Todos, SMS, Llamadas, Correo y WhatsApp. Solo puede tener una tarjeta abierta a la vez; al abrir otra, la anterior se cierra. Al cambiar de filtro se cierran todas.

**Why this priority**: Ordena la experiencia pero no es la mecánica de aprendizaje.

**Independent Test**: Tocar cada chip y verificar que solo aparecen los tips de ese canal, que el chip queda azul y que no queda ninguna tarjeta abierta; abrir dos tarjetas seguidas y verificar que solo queda abierta la segunda.

**Acceptance Scenarios**:

1. **Given** el filtro "Todos" activo, **When** la persona toca "Llamadas", **Then** solo se ven los 2 tips de llamada, el chip "Llamadas" se pinta de azul con texto blanco y queda marcado como presionado, y ninguna tarjeta queda abierta.
2. **Given** una tarjeta abierta, **When** la persona toca la cabecera de otra, **Then** la primera se cierra y la otra se abre; la flecha de la abierta queda girada.
3. **Given** una tarjeta abierta, **When** la persona toca su cabecera, **Then** se cierra y no queda ninguna abierta.
4. **Given** una tarjeta cerrada, **When** se muestra, **Then** ve el ícono del canal en un cuadro de color (SMS azul, Llamada rojo, Correo ámbar, WhatsApp verde), la etiqueta "Canal · Tipo" (por ejemplo "SMS · Smishing"), el título y la flecha.
5. **Given** la pantalla de Tips, **When** la persona toca "¿Ya caíste en una? Ve a Emergencia y sigue los primeros auxilios.", **Then** llega a la pantalla de Emergencia.

---

### Edge Cases

- **Almacenamiento bloqueado o lleno**: la pantalla funciona igual; los retos superados se ven durante la sesión pero no se conservan al recargar. No se muestra ningún error técnico.
- **Dato guardado de retos con formato inválido** (no es lista, ids repetidos o desconocidos): se ignora lo inválido y se conserva el diagnóstico; los ids desconocidos no cuentan para la barra.
- **Repetir el diagnóstico**: los retos superados se conservan (son aprendizaje, no parte del diagnóstico).
- **Diagnóstico guardado corrupto**: se borra el registro completo (regla de la spec 001), así que los retos también se pierden.
- **Filtro sin la tarjeta abierta**: al cambiar de filtro no queda ninguna abierta, ni siquiera la primera del nuevo filtro.
- **Movimiento reducido**: con "reducir movimiento" activo en el sistema, no hay animación "pop", ni giro animado de la flecha, ni transición de la barra; el estado final se ve igual.
- **Textos largos** (dominios, enlaces): se parten para no generar desplazamiento horizontal a 390 px de ancho.

## Requirements *(mandatory)*

### Functional Requirements

**Estructura de la pantalla**

- **FR-001**: La pantalla Tips MUST mostrar, en este orden: título "Tips de seguridad"; subtítulo "Las estafas más comunes en Colombia. Abre cada una, busca las trampas en el mensaje y pon a prueba lo que harías."; tarjeta "Regla de oro"; barra de progreso; filtros; lista de 8 tarjetas; acceso a Emergencia.
- **FR-002**: La tarjeta "Regla de oro" MUST tener fondo `primario`, texto blanco, el ícono ShieldCheck, la etiqueta "Regla de oro" y el texto "Tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta. Ni por llamada, ni por mensaje, ni por correo." (reemplaza FR-025 de la spec 001).
- **FR-003**: La barra de progreso MUST mostrar el texto "X de 8 retos superados" y una barra rellena en proporción X/8.
- **FR-004**: Los filtros MUST ser los chips Todos, SMS, Llamadas, Correo y WhatsApp (Todos por defecto); el activo va con fondo `primario` y texto blanco y se marca como presionado. Al cambiar de filtro, la lista MUST mostrar solo los tips de ese canal y cerrar cualquier tarjeta abierta.
- **FR-005**: La lista MUST funcionar como acordeón: como máximo una tarjeta abierta; al entrar a la pantalla la primera tarjeta está abierta.
- **FR-006**: El acceso final MUST ser un botón con el ícono TriangleAlert y el texto "¿Ya caíste en una?" seguido de "Ve a Emergencia y sigue los primeros auxilios.", que lleva a la pantalla Emergencia (reemplaza FR-029 de la spec 001).

**Tarjeta cerrada**

- **FR-007**: La cabecera de cada tarjeta MUST mostrar el ícono del canal en un cuadro de color (SMS: MessageSquare, azul; Llamada: Phone, rojo; Correo: Mail, ámbar; WhatsApp: MessageCircle, verde), la etiqueta "Canal · Tipo" (SMS · Smishing, Llamada · Vishing, Correo · Phishing, WhatsApp · Suplantación), el texto "· Reto superado" en verde si ese reto está superado, el título del tip y una flecha ChevronDown que gira al abrir.

**Tarjeta abierta**

- **FR-008**: El bloque "Así se ve" MUST mostrar el contador "X de 3 trampas", la simulación del mensaje (encabezado "De:" con el remitente, o "Lo que te dicen:" en llamadas; la hora o estado; la etiqueta "Ejemplo"; la burbuja con el mensaje) y la zona de explicación.
- **FR-009**: Las frases trampa MUST verse subrayadas con punteado rojo y ser activables con toque, clic, Enter y Espacio. Al activarlas MUST: quedar resaltadas en rojo, hacer la animación "pop", contarse una sola vez y mostrar debajo la caja "Trampa: <explicación>" con la explicación de esa frase.
- **FR-010**: La ayuda "Toca las partes subrayadas en rojo para descubrir cada trampa." MUST verse mientras falten trampas; al encontrar las 3, MUST ocultarse y la caja MUST agregar "¡Las encontraste todas!".
- **FR-011**: Las trampas encontradas MUST conservarse mientras la app esté abierta (al cerrar y abrir tarjetas, al filtrar o al ir a otra sección) y MUST reiniciarse al recargar.
- **FR-012**: "Cómo reconocerla" MUST mostrar las 3 señales del tip con un punto rojo; "Qué hacer" MUST mostrar los 3 pasos con un círculo `primario` numerado.
- **FR-013**: El "Mini reto" MUST mostrarse en una caja azul suave con la pregunta y 3 opciones como botones.
- **FR-014**: Al elegir una opción incorrecta, esa opción MUST tomar borde y fondo rojos y deshabilitarse, y MUST mostrarse "Esa opción te deja expuesto. Intenta otra." en rojo; las otras siguen disponibles.
- **FR-015**: Al elegir la correcta, esa opción MUST tomar borde y fondo verdes, todas las opciones MUST deshabilitarse, MUST mostrarse el mensaje de acierto del tip en verde, el reto MUST quedar superado y la barra y la cabecera MUST actualizarse al instante.
- **FR-016**: Al volver a abrir una tarjeta, el reto MUST mostrarse sin responder; un reto superado nunca deja de estarlo.
- **FR-017**: Al final de la tarjeta MUST mostrarse "Dato:" y la frase del tip, en gris y separada por una línea.

**Contenido**

- **FR-018**: Todos los textos de la pantalla (títulos, regla, subtítulo, etiquetas, ayudas, mensajes de fallo y de acierto y los 8 tips) MUST salir del archivo de contenido; ningún texto visible se escribe dentro de los componentes.
- **FR-019**: El contenido MUST tener exactamente los 8 tips, en este orden y con los textos del prototipo: "Tu paquete está retenido" (SMS), "Descuento o premio en tu plan de celular" (SMS), "\"Le hablamos del banco por un movimiento sospechoso\"" (Llamada), "Falso técnico o asesor de tu operador" (Llamada), "Tu cuenta será suspendida" (Correo), "Factura o recibo que no esperabas" (Correo), "\"Cambié de número, necesito un favor\"" (WhatsApp), "Te piden el código de 6 dígitos" (WhatsApp). Cada uno con remitente, hora, mensaje, 3 trampas, 3 señales, 3 pasos, reto (pregunta, 3 opciones con exactamente una correcta, mensaje de acierto) y dato, copiados del arreglo `TIPS` del prototipo (reemplaza FR-026 y FR-028 de la spec 001).
- **FR-020**: Cada tip MUST tener exactamente 3 frases trampa marcadas entre su remitente y su mensaje, y su orden MUST coincidir con el de la lista de explicaciones.
- **FR-021**: Remitentes, números y dominios de ejemplo MUST ser inventados; ningún texto usa una marca real.

**Persistencia y privacidad**

- **FR-030**: Solo se MUST guardar la lista de ids de retos superados, dentro del registro local existente de Escudo. No se guardan las trampas encontradas, las respuestas incorrectas, el filtro ni la tarjeta abierta.
- **FR-031**: Si el almacenamiento no está disponible o falla, la pantalla MUST funcionar igual, sin mostrar errores técnicos.
- **FR-032**: La pantalla MUST NOT hacer ninguna conexión externa.

**Accesibilidad y diseño**

- **FR-040**: Las frases trampa MUST tener rol de botón, estar en el orden de tabulación y mostrar foco visible; las cabeceras de tarjeta MUST indicar si están abiertas o cerradas (expandido) y qué bloque controlan.
- **FR-041**: Chips, cabeceras, opciones del reto y el acceso a Emergencia MUST tener un área táctil mínima de 44 × 44 px.
- **FR-042**: El estado MUST comunicarse con texto además del color: "Reto superado", "X de 3 trampas", "Trampa:", el mensaje de fallo y el de acierto. La caja de explicación y el resultado del reto MUST anunciarse a lectores de pantalla.
- **FR-043**: Con "reducir movimiento" activo, MUST NOT haber animaciones ni transiciones.
- **FR-044**: Colores solo con tokens del sistema de diseño, solo tema claro, contraste mínimo 4.5:1 en texto normal, mobile-first a 390 px y columna máxima de 560 px, sin desplazamiento horizontal.

### Key Entities

- **Tip**: una estafa común. Atributos: id, canal (sms, llamada, correo, whatsapp), tipo de ataque, título, remitente, hora, mensaje (con frases trampa marcadas), explicaciones de las 3 trampas, 3 señales, 3 pasos, reto y dato.
- **Frase trampa**: parte marcada del remitente o del mensaje de un tip; se identifica por su posición (0, 1, 2) y se asocia a la explicación con la misma posición.
- **Reto**: pregunta, 3 opciones (texto y si es la correcta) y mensaje de acierto.
- **Progreso de retos**: conjunto de ids de tips cuyo reto fue superado; es lo único que se guarda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los 8 tips, las 3 trampas se pueden descubrir tanto tocando como solo con teclado, y el contador siempre coincide con el número de trampas distintas encontradas.
- **SC-002**: El reto se marca como superado solo con la opción correcta en el 100 % de los tips, y la barra de progreso cambia en el mismo instante en que aparece el mensaje de acierto.
- **SC-003**: Tras recargar, el 100 % de los retos superados siguen marcados; con el almacenamiento bloqueado, la pantalla completa sigue usable de principio a fin.
- **SC-004**: Cada filtro muestra exactamente los 2 tips de su canal (8 con "Todos").
- **SC-005**: El 100 % de los textos visibles de la pantalla salen del archivo de contenido y coinciden con el prototipo.
- **SC-006**: Comparada lado a lado con el prototipo a 390 px, la pantalla tiene los mismos bloques, textos e interacciones; las únicas diferencias son las listadas en "Decisiones frente al prototipo".
- **SC-007**: Todos los elementos interactivos se alcanzan con teclado, tienen foco visible y miden al menos 44 × 44 px; ningún estado depende solo del color.

## Assumptions

- Tips sigue disponible solo con un diagnóstico guardado (FR-006 de la spec 001), así que siempre existe un registro local donde guardar los retos.
- Los ids de los tips se mantienen (`sms-paquete`, `sms-premio`, `llamada-banco`, `llamada-tecnico`, `correo-suspension`, `correo-factura`, `whatsapp-numero`, `whatsapp-codigo`) para que los retos guardados sean estables.
- Los textos de los tips son los del arreglo `TIPS` del prototipo. Donde difieren del mensaje del usuario (comillas en "técnico" en la pregunta del tip 4 y en los títulos 3 y 7), gana el prototipo. El equipo entregó este contenido, así que reemplaza al borrador provisional actual (constitución III).
- Las trampas encontradas viven en la memoria de la sesión: se conservan al navegar dentro de la app y se pierden al recargar.
- El texto de la caja de explicación muestra solo la última trampa tocada (como el prototipo).
