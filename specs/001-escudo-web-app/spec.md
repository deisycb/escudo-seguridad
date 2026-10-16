# Feature Specification: Escudo — Diagnóstico de riesgo digital, plan de acción, tips y primeros auxilios

**Feature Branch**: `001-escudo-web-app`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Web app Escudo: inicio y consentimiento (Ley 1581 de 2012), prediagnóstico de 14 preguntas, resultado con semáforo de riesgo, plan de acción con progreso, tips de seguridad por canal, primeros auxilios digitales y navegación inferior. Sin cuentas, sin backend, todo en localStorage."

## Clarifications

### Session 2026-10-15

- Q: ¿El botón "Tengo una emergencia ahora" debe verse solo en inicio o en todas las pantallas? → A: Solo en la pantalla de inicio; con diagnóstico, la barra inferior (sección Emergencia) cubre el resto.
- Q: ¿Cuánto baja el riesgo cada acción se muestra en puntos del contenido o en puntos porcentuales? → A: En puntos porcentuales del riesgo total, redondeados al entero (por ejemplo, "Baja 7 %").
- Q: ¿Cómo se entra a Tips sin diagnóstico? → A: No se entra. Tips solo está disponible cuando hay un diagnóstico guardado; quien no lo tiene siempre empieza por la encuesta (tras el consentimiento). Emergencia sigue disponible desde inicio.
- Q: ¿Qué nivel de accesibilidad debe cumplir la web app? → A: WCAG 2.1 nivel AA; el semáforo nunca depende solo del color.

### Session 2026-10-16

- Q: ¿Cuáles son las 14 preguntas y opciones del prediagnóstico y qué puntaje y criticidad tiene cada opción mientras el equipo define los definitivos? → A: El equipo entregó el texto de las 14 preguntas y sus opciones (ver "Banco de preguntas" en Assumptions). Puntajes y criticidades **provisionales (mock)**, iguales para todas las preguntas: a = 0 (sin criticidad), b = 1 (Importante), c = 2 (Urgente); puntaje máximo 28. Se reemplazan cuando el equipo defina los valores reales, sin cambiar el cálculo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hacer el diagnóstico y conocer mi nivel de riesgo (Priority: P1)

Una persona entra a Escudo, lee qué hace la web app y sus garantías de privacidad, acepta el tratamiento de sus respuestas y responde las 14 preguntas, una por pantalla. Al terminar ve su nivel de riesgo total en un semáforo (Bajo, Medio o Alto), el riesgo de cada dimensión (Phishing, Smishing, Vishing, Hábitos generales) y la lista de hábitos que la ponen en riesgo, ordenada de mayor a menor puntaje.

**Why this priority**: Es el núcleo del producto. Sin diagnóstico no hay resultado ni plan de acción; por sí solo ya le entrega valor al usuario (saber qué tan expuesto está y por qué).

**Independent Test**: Abrir la web app sin datos guardados, aceptar el consentimiento, responder las 14 preguntas y verificar que el porcentaje, el color del semáforo, los porcentajes por dimensión y la lista "Dónde estás en riesgo" coinciden con el cálculo manual a partir de los puntajes del archivo de contenido.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio sin diagnóstico guardado, **When** el usuario la abre, **Then** ve el nombre "Escudo", una frase que explica qué hace, las tres garantías ("Nunca te pedimos contraseñas", "Respuestas anónimas", "No accedemos a tu celular ni a tus cuentas"), la casilla de consentimiento con el enlace "Ver política", el botón "Empezar diagnóstico" deshabilitado y el botón "Tengo una emergencia ahora".
2. **Given** la casilla de consentimiento sin marcar, **When** el usuario la marca, **Then** el botón "Empezar diagnóstico" se habilita; **When** la desmarca, **Then** se vuelve a deshabilitar.
3. **Given** el usuario toca "Ver política", **When** se muestra la política de privacidad y la cierra, **Then** vuelve a la pantalla de inicio sin perder el estado de la casilla.
4. **Given** el usuario está en la pregunta X, **When** la pantalla se muestra, **Then** ve "Pregunta X de 14", una barra de avance proporcional, la dimensión de la pregunta, el texto exacto de la pregunta y sus 3 opciones (a, b, c), y el botón "Siguiente" deshabilitado hasta que elija una opción.
5. **Given** el usuario está en la pregunta 2 o posterior, **When** vuelve a la pregunta anterior, **Then** ve su respuesta previa seleccionada y puede cambiarla.
6. **Given** el usuario está a mitad del diagnóstico, **When** toca "Salir" y confirma, **Then** sus respuestas parciales se descartan y vuelve a la pantalla de inicio; **When** cancela la confirmación, **Then** sigue en la misma pregunta con sus respuestas intactas.
7. **Given** el usuario responde la pregunta 14, **When** avanza, **Then** el sistema calcula el resultado, lo guarda en el dispositivo junto con la fecha del diagnóstico y muestra la pantalla de Resultado.
8. **Given** la pantalla de Resultado, **When** se muestra, **Then** aparece el porcentaje total en un indicador circular con el color y la etiqueta del semáforo, la leyenda de los tres rangos (Bajo 0–39 %, Medio 40–69 %, Alto 70 % en adelante), el porcentaje de cada una de las cuatro dimensiones, la sección "Dónde estás en riesgo" y un botón que lleva al Plan de Acción.
9. **Given** un diagnóstico guardado, **When** el usuario vuelve a abrir la web app, **Then** ve directamente su resultado con la opción de repetir el diagnóstico.

---

### User Story 2 - Pedir ayuda inmediata ante una emergencia (Priority: P1)

Una persona que acaba de caer en una estafa abre Escudo y, sin aceptar nada ni hacer el diagnóstico, toca "Tengo una emergencia ahora". Ve un mensaje de calma, elige lo que le pasó y sigue una guía de pasos numerados. Puede ver las líneas oficiales de su banco y llamar con un toque, y saber cómo denunciar en Colombia.

**Why this priority**: Una víctima necesita ayuda inmediata; la constitución exige que esta sección esté disponible desde el inicio sin diagnóstico. Es independiente del resto de la web app.

**Independent Test**: Desde la pantalla de inicio sin consentimiento marcado ni diagnóstico, tocar "Tengo una emergencia ahora" y recorrer las tres guías, la lista de líneas bancarias y los canales de denuncia.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio (con o sin consentimiento marcado, con o sin diagnóstico), **When** el usuario toca "Tengo una emergencia ahora", **Then** llega a Primeros Auxilios Digitales.
2. **Given** la pantalla de Primeros Auxilios, **When** se abre, **Then** muestra "Respira. Vamos paso a paso.", pide elegir lo que le pasó entre "Bloquear mis tarjetas", "Reportar fraude en WhatsApp" y "Fui víctima de phishing", y muestra el aviso "No borres nada" (guardar capturas, números y comprobantes como evidencia para el banco y la denuncia, Ley 1273 de 2009).
3. **Given** el usuario elige una situación, **When** se muestra su guía, **Then** ve los pasos numerados de esa situación; en "Fui víctima de phishing" los pasos incluyen cambiar la contraseña comprometida y las que se repiten, llamar al banco si se entregaron datos financieros, guardar evidencia y denunciar.
4. **Given** el usuario toca "Llamar a la línea de mi banco", **When** se muestra la lista de bancos, **Then** cada banco aparece con su línea oficial y al tocarlo el dispositivo inicia la llamada a ese número.
5. **Given** el usuario toca "Cómo denunciar en Colombia", **When** se muestra la información, **Then** ve los canales oficiales de denuncia de delitos informáticos.

---

### User Story 3 - Seguir mi plan de acción y ver bajar mi riesgo (Priority: P2)

Después del diagnóstico, el usuario abre "Mi plan" y ve una acción por cada hábito de riesgo, en el mismo orden de prioridad del resultado. Al tocar una acción ve "Qué hacer ahora" y "Cómo prevenirlo". Cuando la cumple, toca "Ya lo hice" y ve cómo baja su riesgo y sube su avance. Si se equivocó, la desmarca.

**Why this priority**: Convierte el diagnóstico en cambios concretos de comportamiento; depende de que exista un diagnóstico (US1).

**Independent Test**: Con un diagnóstico guardado que tenga al menos dos hábitos de riesgo, marcar y desmarcar acciones, recargar la web app y verificar riesgo actual, contador "X de N hechas" y persistencia.

**Acceptance Scenarios**:

1. **Given** un diagnóstico con N hábitos de riesgo, **When** el usuario abre "Mi plan", **Then** ve una tarjeta resumen con el riesgo actual en porcentaje y "0 de N hechas", y la lista de N acciones con título, prioridad y cuánto baja el riesgo en puntos porcentuales (por ejemplo, "Baja 7 %"), en el mismo orden que "Dónde estás en riesgo".
2. **Given** una acción cerrada, **When** el usuario la toca, **Then** se despliega su detalle con los bloques "Qué hacer ahora" y "Cómo prevenirlo".
3. **Given** una acción no hecha, **When** el usuario toca "Ya lo hice", **Then** el riesgo actual se recalcula descontando los puntos de esa acción, el contador pasa a "X+1 de N hechas" y el progreso queda guardado.
4. **Given** una acción marcada, **When** el usuario la desmarca, **Then** los puntos se vuelven a sumar al riesgo actual y el contador disminuye.
5. **Given** acciones marcadas, **When** el usuario cierra y vuelve a abrir la web app, **Then** el progreso y el riesgo actual se conservan.

---

### User Story 4 - Aprender a reconocer las estafas más comunes (Priority: P3)

Un usuario que ya hizo su diagnóstico consulta la sección de Tips desde la barra inferior, ve la "Regla de oro" destacada y tarjetas de las estafas más comunes en Colombia. Filtra por canal y toca una tarjeta para saber cómo reconocerla y qué hacer.

**Why this priority**: Es contenido preventivo de apoyo; aporta valor pero no es el flujo principal y depende de que exista un diagnóstico (US1).

**Independent Test**: Con un diagnóstico guardado, abrir Tips desde la barra inferior, verificar la Regla de oro, las 8 tarjetas, cada filtro de canal, el detalle de una tarjeta y el acceso a primeros auxilios.

**Acceptance Scenarios**:

1. **Given** no existe diagnóstico guardado, **When** el usuario abre la web app, **Then** no ve ningún acceso a Tips; solo puede empezar el diagnóstico (tras el consentimiento) o ir a Emergencia.
2. **Given** la sección Tips, **When** se abre, **Then** muestra de forma destacada la Regla de oro: "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo".
3. **Given** el filtro "Todos", **When** se muestran las tarjetas, **Then** aparecen las 8 estafas, cada una con su canal y tipo de ataque (SMS · Smishing, Llamada · Vishing, Correo · Phishing, WhatsApp · Suplantación).
4. **Given** la lista de tarjetas, **When** el usuario elige un filtro (SMS, Llamadas, Correo o WhatsApp), **Then** solo se muestran las 2 tarjetas de ese canal.
5. **Given** una tarjeta, **When** el usuario la toca, **Then** ve cómo reconocer esa estafa y qué hacer.
6. **Given** la sección Tips, **When** el usuario toca "¿Ya caíste en una? Ve a primeros auxilios", **Then** llega a Primeros Auxilios Digitales.

---

### User Story 5 - Moverme entre secciones y repetir el diagnóstico (Priority: P3)

Un usuario con diagnóstico guardado usa la barra inferior para moverse entre Resultado, Mi plan, Tips y Emergencia, en celular o computador, y puede repetir el diagnóstico cuando quiera.

**Why this priority**: Mejora la experiencia de uso continuo; las secciones ya funcionan por separado.

**Independent Test**: Con un diagnóstico guardado, recorrer las cuatro secciones desde la barra en una pantalla de celular y en una de computador; repetir el diagnóstico y verificar que el resultado nuevo reemplaza al anterior.

**Acceptance Scenarios**:

1. **Given** existe un diagnóstico, **When** el usuario está en Resultado, Mi plan, Tips o Emergencia, **Then** ve una barra inferior con esas cuatro secciones, la sección actual resaltada y Emergencia con color de alerta.
2. **Given** no existe diagnóstico, **When** el usuario está en cualquier pantalla, **Then** no se muestra la barra inferior.
3. **Given** un diagnóstico guardado, **When** el usuario elige repetir el diagnóstico, acepta el consentimiento y completa las 14 preguntas, **Then** el nuevo resultado reemplaza al anterior y el progreso del plan anterior se reinicia.
4. **Given** un diagnóstico guardado, **When** el usuario inicia la repetición pero sale antes de terminar, **Then** conserva su resultado y progreso anteriores.

---

### Edge Cases

- **Almacenamiento no disponible o bloqueado** (modo privado, permisos del navegador): la web app sigue funcionando en la sesión actual sin guardar resultado ni progreso y muestra un aviso amigable explicando que no se guardará.
- **Datos guardados corruptos o incompletos** (por ejemplo, editados a mano o de una versión anterior): la web app no se rompe; los descarta, muestra un aviso amigable y vuelve a la pantalla de inicio como usuario nuevo.
- **Usuario sin hábitos de riesgo** (todas las respuestas con puntaje cero): el resultado muestra 0 % (Bajo), la sección "Dónde estás en riesgo" y "Mi plan" muestran un mensaje positivo en lugar de una lista vacía, y el contador muestra "0 de 0 hechas".
- **Todas las acciones marcadas**: el riesgo actual llega a 0 % y el semáforo del riesgo actual refleja Bajo.
- **Porcentajes con decimales en el límite** (por ejemplo 39,6 %): el porcentaje se redondea al entero más cercano y el semáforo se asigna sobre el valor redondeado, de modo que el número mostrado y el color siempre coinciden.
- **Empate de puntaje entre hábitos**: se ordenan por número de pregunta ascendente.
- **Recarga o cierre a mitad del diagnóstico**: las respuestas parciales no se conservan; al volver, el usuario ve la pantalla que corresponda (inicio o su resultado anterior).
- **Llamar desde un computador sin función de llamadas**: el número de la línea bancaria es visible en pantalla para que el usuario lo marque desde su teléfono.
- **Navegación con el botón "atrás" del navegador** durante el diagnóstico: equivale a volver a la pregunta anterior; en la pregunta 1 equivale a "Salir" con confirmación.

## Requirements *(mandatory)*

### Functional Requirements

**Inicio y consentimiento**

- **FR-001**: La pantalla de inicio MUST mostrar el nombre "Escudo", una frase que explique qué hace la web app y las tres garantías de privacidad: "Nunca te pedimos contraseñas", "Respuestas anónimas" y "No accedemos a tu celular ni a tus cuentas".
- **FR-002**: La pantalla de inicio MUST incluir una casilla de aceptación del tratamiento de las respuestas según la Ley 1581 de 2012, desmarcada por defecto, con un enlace "Ver política" que muestre la política de privacidad sin salir de la web app.
- **FR-003**: El botón "Empezar diagnóstico" MUST estar deshabilitado mientras la casilla de consentimiento no esté marcada, y el diagnóstico MUST NOT poder iniciar por ninguna otra vía sin consentimiento.
- **FR-004**: La pantalla de inicio MUST mostrar siempre el botón "Tengo una emergencia ahora", que lleva a Primeros Auxilios Digitales sin requerir consentimiento ni diagnóstico. El botón aparece solo en la pantalla de inicio; en las demás pantallas el acceso a Emergencia lo da la barra inferior cuando existe diagnóstico (FR-035), o el acceso "¿Ya caíste en una? Ve a primeros auxilios" en Tips.
- **FR-005**: Si existe un diagnóstico guardado válido, la web app MUST abrir mostrando ese resultado y ofrecer la opción de repetir el diagnóstico. Repetir el diagnóstico MUST requerir aceptar de nuevo el consentimiento.
- **FR-006**: Sin un diagnóstico guardado, la web app MUST NOT ofrecer acceso a Tips, Resultado ni Mi plan: el único camino es la encuesta (tras aceptar el consentimiento), además del botón de emergencia de FR-004.

**Prediagnóstico**

- **FR-007**: El sistema MUST mostrar una pregunta por pantalla con el texto exacto y las 3 opciones (a, b, c) definidas en el archivo de contenido, sin reformularlas.
- **FR-008**: Cada pantalla de pregunta MUST mostrar "Pregunta X de 14", una barra de avance proporcional y la dimensión de la pregunta: Phishing (preguntas 1–4), Smishing (5–8), Vishing (9–12) o Hábitos generales (13–14).
- **FR-009**: El botón "Siguiente" MUST permanecer deshabilitado hasta que el usuario seleccione una opción.
- **FR-010**: El usuario MUST poder volver a la pregunta anterior, ver su respuesta previa seleccionada y cambiarla.
- **FR-011**: El botón "Salir" MUST pedir confirmación; al confirmar, las respuestas parciales se descartan y el usuario vuelve a la pantalla anterior al diagnóstico (inicio o su resultado previo, si existe).
- **FR-012**: El sistema MUST calcular el resultado solo cuando las 14 preguntas estén respondidas y el consentimiento aceptado, y MUST guardarlo en el dispositivo junto con la fecha del diagnóstico.

**Cálculo y resultado**

- **FR-013**: El riesgo total MUST calcularse como la suma de los puntajes de las opciones elegidas dividida entre el puntaje máximo posible, en porcentaje (0–100 %); el riesgo de cada dimensión MUST calcularse igual con las preguntas de esa dimensión. Las mismas respuestas MUST producir siempre el mismo resultado.
- **FR-014**: Los porcentajes MUST mostrarse redondeados al entero más cercano, y el nivel del semáforo MUST asignarse sobre el valor redondeado: Bajo 0–39 %, Medio 40–69 %, Alto 70 % en adelante.
- **FR-015**: La pantalla de Resultado MUST mostrar el riesgo total en un indicador circular con el color y la etiqueta del semáforo, la leyenda de los tres rangos debajo del indicador y el porcentaje de riesgo de cada una de las cuatro dimensiones.
- **FR-016**: La sección "Dónde estás en riesgo" MUST listar solo las respuestas con puntaje mayor a cero, ordenadas de mayor a menor puntaje (empates por número de pregunta ascendente). Cada ítem MUST mostrar el número de la pregunta, una descripción corta del hábito, su prioridad (Urgente, Importante o Revisa) y los puntos que suma.
- **FR-017**: La prioridad de cada hábito (Urgente, Importante o Revisa) MUST tomarse del nivel de criticidad asignado a la opción elegida en el archivo de contenido. La criticidad crece de "a" (menor) a "c" (mayor); los valores concretos por pregunta y opción los define el equipo en el archivo de contenido. Mientras tanto se usan los valores provisionales del Banco de preguntas (b = Importante, c = Urgente).
- **FR-018**: La pantalla de Resultado MUST incluir un botón que lleve al Plan de Acción.

**Plan de acción**

- **FR-019**: "Mi plan" MUST mostrar una tarjeta resumen con el riesgo actual en porcentaje y el avance "X de N hechas", donde N es el número de hábitos de riesgo detectados.
- **FR-020**: "Mi plan" MUST listar una acción por cada hábito de riesgo, en el mismo orden que "Dónde estás en riesgo", mostrando título, prioridad y cuánto baja el riesgo en puntos porcentuales del riesgo total (puntos del hábito ÷ puntaje máximo × 100, redondeado al entero; por ejemplo, "Baja 7 %"). El riesgo actual se recalcula siempre desde los puntos sin redondear, por lo que la suma de los porcentajes mostrados puede diferir en ±1 del cambio real.
- **FR-021**: Al tocar una acción, el sistema MUST desplegar su detalle con dos bloques: "Qué hacer ahora" y "Cómo prevenirlo", con el texto definido en el archivo de contenido.
- **FR-022**: Cada acción MUST tener un botón "Ya lo hice". Al marcarla, el riesgo actual MUST recalcularse como (suma de puntajes − puntos de las acciones hechas) ÷ puntaje máximo, el contador MUST actualizarse y el progreso MUST guardarse en el dispositivo.
- **FR-023**: El usuario MUST poder desmarcar una acción hecha; el riesgo actual y el contador MUST recalcularse y guardarse.
- **FR-024**: El resultado original del diagnóstico (pantalla Resultado) MUST conservarse sin cambios; solo el riesgo actual de "Mi plan" refleja las acciones hechas.

**Tips de seguridad**

- **FR-025**: La sección Tips MUST mostrar de forma destacada la Regla de oro: "tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta, ni por llamada, ni por mensaje, ni por correo".
- **FR-026**: La sección Tips MUST mostrar estas 8 tarjetas, cada una con su canal y tipo de ataque:
  - SMS · Smishing: "Tu paquete está retenido"; "Descuento o premio en tu plan de celular".
  - Llamada · Vishing: "Le hablamos del banco por un movimiento sospechoso"; "Falso técnico o asesor de tu operador".
  - Correo · Phishing: "Tu cuenta será suspendida"; "Factura o recibo que no esperabas".
  - WhatsApp · Suplantación: "Cambié de número, necesito un favor"; "Te piden el código de 6 dígitos".
- **FR-027**: El usuario MUST poder filtrar las tarjetas por canal: Todos (por defecto), SMS, Llamadas, Correo y WhatsApp.
- **FR-028**: Al tocar una tarjeta, el sistema MUST mostrar cómo reconocer esa estafa y qué hacer, con el texto del archivo de contenido.
- **FR-029**: La sección Tips MUST incluir el acceso "¿Ya caíste en una? Ve a primeros auxilios" ; solo MUST estar disponible cuando existe un diagnóstico guardado (FR-006).

**Primeros auxilios digitales**

- **FR-030**: La pantalla MUST abrir con el mensaje "Respira. Vamos paso a paso." y pedir al usuario que elija lo que le pasó.
- **FR-031**: El sistema MUST ofrecer tres situaciones, cada una con su guía de pasos numerados definida en el archivo de contenido: "Bloquear mis tarjetas", "Reportar fraude en WhatsApp" y "Fui víctima de phishing" (esta última cubre cambiar la contraseña comprometida y las que se repiten, llamar al banco si se entregaron datos financieros, guardar evidencia y denunciar).
- **FR-032**: La pantalla MUST mostrar siempre el aviso "No borres nada": guardar capturas, números y comprobantes como evidencia para el banco y la denuncia (Ley 1273 de 2009).
- **FR-033**: El botón "Llamar a la línea de mi banco" MUST mostrar la lista de líneas oficiales de los principales bancos de Colombia definida en el archivo de contenido; cada línea MUST mostrar el número visible y, al tocarla, abrir la llamada en el dispositivo.
- **FR-034**: El botón "Cómo denunciar en Colombia" MUST mostrar los canales oficiales de denuncia de delitos informáticos definidos en el archivo de contenido.

**Navegación y presentación**

- **FR-035**: Cuando existe un diagnóstico, la web app MUST mostrar una barra de navegación inferior con cuatro secciones: Resultado, Mi plan, Tips y Emergencia; la sección actual MUST distinguirse y Emergencia MUST tener un color de alerta distinto al resto. Sin diagnóstico, la barra MUST NOT mostrarse.
- **FR-036**: La web app MUST verse y usarse correctamente en pantallas de celular y de computador, sin desplazamiento horizontal.
- **FR-036a**: La web app MUST cumplir WCAG 2.1 nivel AA: contraste de texto mínimo 4.5:1 (3:1 en texto grande), todas las acciones usables con teclado y con foco visible, controles con nombre accesible para lectores de pantalla, y áreas táctiles de al menos 44×44 px. El nivel del semáforo, la prioridad de cada acción y la sección activa de la barra MUST comunicarse también con texto o forma, nunca solo con color.
- **FR-037**: Todo el texto visible MUST estar en español sencillo; ningún error técnico MUST mostrarse en crudo al usuario, sino como un mensaje amigable.

**Privacidad y datos**

- **FR-038**: La web app MUST NOT enviar respuestas, resultados ni progreso fuera del dispositivo, ni incluir analítica, rastreo o publicidad.
- **FR-039**: La web app MUST NOT tener campos para ingresar contraseñas, números de tarjeta, códigos de verificación ni datos bancarios, ni acceder a cuentas, dispositivos o mensajes del usuario.
- **FR-040**: Si el almacenamiento del navegador no está disponible, la web app MUST seguir funcionando sin guardar y mostrar un aviso amigable; si los datos guardados están corruptos, MUST descartarlos y tratar al usuario como nuevo, con un aviso amigable.

### Key Entities

- **Pregunta**: una de las 14 preguntas del prediagnóstico. Atributos: número (1–14), dimensión, texto, 3 opciones (a, b, c) con su texto, puntaje de riesgo y criticidad, descripción corta del hábito de riesgo. Contenido fijo; textos entregados (Banco de preguntas), puntajes y criticidades provisionales.
- **Dimensión**: agrupación de preguntas (Phishing, Smishing, Vishing, Hábitos generales) con su rango de preguntas.
- **Diagnóstico**: resultado de un prediagnóstico completo. Atributos: las 14 respuestas, fecha, riesgo total (%), riesgo por dimensión (%), nivel del semáforo, lista de hábitos de riesgo. Se guarda uno solo por dispositivo; uno nuevo reemplaza al anterior.
- **Hábito de riesgo / Acción**: cada respuesta con puntaje mayor a cero. Atributos: número de pregunta, descripción corta, título de la acción, prioridad, puntos (y su equivalente en puntos porcentuales del riesgo total), "Qué hacer ahora", "Cómo prevenirlo", estado hecha / no hecha.
- **Progreso del plan**: conjunto de acciones marcadas como hechas, asociado al diagnóstico vigente. Determina el riesgo actual y el contador "X de N hechas".
- **Tip de estafa**: tarjeta con canal (SMS, Llamada, Correo, WhatsApp), tipo de ataque, título, cómo reconocerla y qué hacer. Contenido fijo.
- **Guía de emergencia**: situación (bloquear tarjetas, fraude en WhatsApp, phishing) con sus pasos numerados. Contenido fijo.
- **Línea bancaria**: nombre del banco y número oficial. Contenido fijo.
- **Canal de denuncia**: entidad y forma de contacto oficial para denunciar delitos informáticos. Contenido fijo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo completa el diagnóstico (desde la pantalla de inicio hasta ver su resultado) en menos de 5 minutos.
- **SC-002**: Desde la pantalla de inicio, un usuario llega a la guía de pasos de su emergencia en 2 toques o menos, sin aceptar consentimiento ni hacer diagnóstico.
- **SC-003**: Para cualquier combinación de respuestas, el porcentaje total, los porcentajes por dimensión y el nivel del semáforo coinciden en el 100 % de los casos con el cálculo manual a partir del archivo de contenido, y repetir las mismas respuestas produce el mismo resultado.
- **SC-004**: En una revisión de red durante el uso completo de la web app (diagnóstico, plan, tips y emergencia), no se envía ninguna respuesta, resultado ni progreso del usuario a ningún servidor.
- **SC-005**: Tras cerrar y volver a abrir la web app en el mismo navegador, el 100 % de los resultados y del progreso del plan se conservan.
- **SC-006**: Todas las pantallas se usan sin desplazamiento horizontal ni elementos cortados en anchos de pantalla desde 360 px (celular) hasta 1440 px (computador).
- **SC-006a**: Una auditoría con una herramienta automática de accesibilidad y una revisión manual con teclado y lector de pantalla no encuentran incumplimientos de WCAG 2.1 AA en ninguna pantalla.
- **SC-007**: Al menos el 80 % de los usuarios de prueba entienden su nivel de riesgo y cuál es su acción más urgente sin ayuda externa, tras ver la pantalla de Resultado.
- **SC-008**: Con el almacenamiento del navegador bloqueado o con datos corruptos, la web app nunca queda en blanco ni muestra errores técnicos: el usuario siempre puede hacer el diagnóstico y acceder a emergencia, y tras el diagnóstico puede ver su resultado, su plan y los tips durante la sesión.

## Assumptions

- **Contenido fijo como dependencia**: los puntajes definitivos, las descripciones cortas de hábitos, los textos de acciones ("Qué hacer ahora" / "Cómo prevenirlo"), los textos de reconocimiento de cada tip, los pasos de las tres guías de emergencia, las líneas bancarias, los canales de denuncia y la política de privacidad serán entregados por el equipo del proyecto en los archivos de contenido. Esta especificación no inventa ni modifica ese contenido.
- Cada opción (a, b, c) tiene un nivel de criticidad definido en el archivo de contenido, de menor en "a" a mayor en "c"; ese nivel determina la prioridad mostrada. Los valores definitivos están pendientes del equipo.
- **Puntajes provisionales (mock)**: hasta que el equipo los defina, todas las preguntas usan a = 0 (sin criticidad, no genera hábito), b = 1 (Importante) y c = 2 (Urgente). Puntaje máximo: 28 (8 por dimensión de 4 preguntas; 4 en Hábitos generales). Cambiarlos solo modifica el archivo de contenido.
- **Banco de preguntas** (texto entregado por el equipo el 2026-10-16; se usa tal cual):
  - **Phishing**
    1. ¿Usas la misma contraseña para tu correo y para otras cuentas (redes sociales, bancos, tiendas en línea)? — a) No, cada cuenta tiene una contraseña distinta · b) En algunas cuentas sí la repito · c) Sí, uso la misma en casi todo
    2. ¿Tienes activada la verificación en dos pasos en tu correo electrónico? — a) Sí, está activada · b) No · c) No sé qué es
    3. ¿Cuándo fue la última vez que cambiaste la contraseña de tu correo? — a) Hace menos de 6 meses · b) Entre 6 meses y 2 años · c) Hace más de 2 años o nunca
    4. Si recibes un correo de tu banco o de una entidad pidiéndote "actualizar tus datos" o "verificar tu cuenta", ¿qué haces? — a) Lo reporto o lo borro, y si tengo dudas entro yo mismo a la app o página oficial · b) Lo abro para ver qué dice · c) Hago clic en el enlace y actualizo mis datos
  - **Smishing**
    5. Cuando te llega un SMS o WhatsApp con un enlace de un número desconocido, ¿qué haces normalmente? — a) Lo borro o lo reporto sin abrirlo · b) Lo abro si parece de una empresa conocida · c) Lo abro para ver de qué se trata
    6. ¿Has compartido alguna vez un código de verificación de 6 dígitos que te llegó por SMS porque alguien te lo pidió? — a) Nunca · b) No lo recuerdo · c) Sí
    7. ¿Tienes activada la verificación en dos pasos (PIN) dentro de WhatsApp? — a) Sí · b) No · c) No sé
    8. Si has recibido mensajes como "tu paquete está retenido, paga aquí", ¿qué hiciste? — a) Nunca he recibido uno, o no hice clic · b) Hice clic, pero no pagué ni di datos · c) Pagué o ingresé mis datos
  - **Vishing**
    9. Cuando recibes llamadas de números desconocidos que se cuelgan sin decir nada, ¿qué haces? — a) Las ignoro o bloqueo el número · b) Contesto y digo "aló" o "sí" · c) Devuelvo la llamada
    10. Si alguien te llama diciendo ser de tu banco y te pide confirmar tu clave, número de tarjeta o código de seguridad, ¿qué haces? — a) Cuelgo y llamo yo a la línea oficial del banco · b) Doy algunos datos, pero no la clave · c) Doy lo que me piden para resolver el problema
    11. ¿Sabías que tu banco nunca te pedirá contraseñas ni códigos de seguridad por teléfono? — a) Sí, lo sabía · b) No estaba seguro · c) Creía que sí pueden pedirlos
    12. Ante una llamada sospechosa, ¿cuelgas y llamas tú mismo a la línea oficial de la entidad para confirmar? — a) Siempre · b) A veces · c) Nunca
  - **Hábitos generales**
    13. ¿Publicas en redes sociales información personal como tu celular, dirección, fecha de nacimiento o lugar de trabajo? — a) No · b) Algunos de esos datos · c) Sí, varios de ellos
    14. Si sospecharas que fuiste víctima de una estafa digital, ¿sabrías a quién acudir? — a) Sí, sé exactamente qué hacer · b) Tengo una idea general · c) No sabría a quién acudir
- La opción "a" de cada pregunta corresponde al comportamiento seguro y "c" al de mayor riesgo, según la constitución; una opción con puntaje cero no genera hábito de riesgo ni acción.
- Solo se guarda un diagnóstico por dispositivo; repetirlo y completarlo reemplaza el anterior y reinicia el progreso del plan. No hay historial de diagnósticos.
- El consentimiento se pide cada vez que se inicia un diagnóstico (incluida la repetición).
- La "fecha del diagnóstico" se guarda junto al resultado; esta iteración no define una pantalla que la muestre.
- La política de privacidad se muestra dentro de la web app (por ejemplo, en una ventana o pantalla), sin salir a un sitio externo.
- El usuario tiene un navegador moderno en celular o computador; la web app no requiere instalación.
- Fuera de alcance en esta iteración: cuentas y registro, backend o base de datos, envío de datos a servidores, analítica o rastreo, campos de datos sensibles, acceso a cuentas o dispositivos, análisis de enlaces o correos reales, sincronización entre dispositivos, panel de administrador, notificaciones o recordatorios, app móvil nativa, y contacto directo con bancos o presentación de denuncias desde la web app.
