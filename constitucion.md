# Constitución del Proyecto: Escudo — Web App de Seguridad Digital para Personas Naturales

## 1. Naturaleza del Proyecto
Esta es una web app de seguridad digital dirigida a personas naturales (no empresas). Su propósito es que cualquier usuario conozca qué tan expuesto está a estafas y robos digitales, y sepa qué hacer para protegerse.

El usuario responde un prediagnóstico declarativo de 14 preguntas sobre sus hábitos digitales y su exposición a ingeniería social. Cada respuesta tiene un puntaje de riesgo asignado; con esos puntajes la web app calcula el nivel de riesgo total del usuario y lo presenta en un semáforo (bajo, medio, alto).

A partir del resultado, la web app entrega:
- Un plan de acción priorizado, ordenado según cuánto reduce el riesgo cada recomendación.
- Tips para reconocer las estafas más comunes en Colombia (SMS, llamadas, correo y WhatsApp).
- Una guía de primeros auxilios digitales para actuar de inmediato si el usuario ya fue víctima.

La web app nunca solicita contraseñas ni accede a las cuentas o dispositivos del usuario. Se fundamenta en el NIST Cybersecurity Framework 2.0 y los CIS Critical Security Controls, y trata los datos conforme a la Ley 1581 de 2012.

## 2. Stack Tecnológico (Reglas de Implementación)
- **Frontend / UI:** React con Vite. Usar Tailwind CSS para los estilos.
- **Lenguaje:** JavaScript en todo el proyecto.
- **Backend:** No aplica. Toda la lógica (cálculo del puntaje de riesgo, plan de acción, tips) se ejecuta en el navegador.
- **Persistencia:** localStorage del navegador. No se usa base de datos ni servidor.
- **Contenido estático:** las 14 preguntas, sus puntajes, las recomendaciones, los tips y las guías de emergencia se definen en archivos JavaScript/JSON dentro del proyecto.
- **Entorno de desarrollo:** Node.js y npm, solo para desarrollo y compilación. No se usa en tiempo de ejecución.
- **Despliegue:** hosting estático (por ejemplo Vercel, Netlify o GitHub Pages).


## 3. Reglas de Dominio y Lógica de Negocio
Estas reglas son inmutables. El agente de IA debe respetarlas estrictamente:

- **Privacidad (regla crítica):** ninguna respuesta del usuario se envía a servidores externos; todo permanece en su dispositivo. La web app nunca debe tener campos que pidan contraseñas, números de tarjeta, códigos de verificación ni datos bancarios.
- **Consentimiento obligatorio:** el diagnóstico solo puede iniciar si el usuario acepta el tratamiento de sus respuestas según la Ley 1581 de 2012.
- **Prediagnóstico de 14 preguntas cerradas:** cada pregunta tiene exactamente 3 opciones (a, b, c), ordenadas de menor a mayor riesgo: la opción "a" representa el comportamiento seguro y la "c" el de mayor riesgo. El usuario debe responder las 14 preguntas para obtener su resultado.
- **Contenido fijo:** el texto de las preguntas y sus opciones se usa tal como está definido en el archivo de contenido. El agente no debe reformularlas, agregarlas ni eliminarlas.
- **Puntaje por respuesta:** cada opción tiene un puntaje de riesgo fijo, definido en el archivo de contenido. El agente no debe inventar ni modificar puntajes.
- **Dimensiones:** las preguntas se agrupan en cuatro dimensiones:
  - Phishing (correo): preguntas 1 a 4.
  - Smishing (SMS y WhatsApp): preguntas 5 a 8.
  - Vishing (llamadas): preguntas 9 a 12.
  - Hábitos generales: preguntas 13 y 14.
- **Cálculo del riesgo:** el nivel de riesgo total es la suma de los puntajes obtenidos dividida entre el puntaje máximo posible, expresada en porcentaje (0–100 %). Se calcula igual el porcentaje de cada dimensión. El cálculo debe ser determinista: las mismas respuestas siempre producen el mismo resultado.
- **Semáforo de riesgo:** Bajo de 0 a 39 %, Medio de 40 a 69 % y Alto de 70 % en adelante.
- **Plan de acción priorizado:** solo se generan acciones para las respuestas con puntaje mayor a cero, ordenadas de mayor a menor puntaje. Cada acción incluye "Qué hacer ahora" y "Cómo prevenirlo".
- **Progreso del plan:** cuando el usuario marca una acción como "Ya lo hice", su puntaje se descuenta del riesgo mostrado y el avance se guarda en localStorage.
- **Emergencia siempre disponible:** la sección de primeros auxilios digitales debe ser accesible desde la pantalla de inicio sin necesidad de hacer el diagnóstico.
- **Sin autenticación:** no existen cuentas de usuario, registro ni inicio de sesión.
- **Lenguaje:** todo el contenido se redacta en español sencillo, sin tecnicismos, pensado para cualquier persona.

## 4. Estructura y Estilo de Código
- **Estructura plana:** evitar la sobreingeniería. No implementar "Clean Architecture" completa ni patrones complejos. Usar esta estructura dentro de `/src`:
  - `/data`: contenido fijo en archivos JavaScript (`preguntas.js`, `recomendaciones.js`, `tips.js`, `emergencias.js`).
  - `/logic`: clases del dominio, una por archivo (`Pregunta.js`, `Diagnostico.js`, `PlanAccion.js`, `Almacenamiento.js`).
  - `/pages`: una pantalla por archivo (`Inicio.jsx`, `Diagnostico.jsx`, `Resultado.jsx`, `PlanAccion.jsx`, `Tips.jsx`, `Emergencia.jsx`).
  - `/components`: piezas reutilizables de interfaz (`Semaforo.jsx`, `TarjetaPregunta.jsx`, `TarjetaAccion.jsx`, `BarraNavegacion.jsx`).

- **Paradigma:**
  - **POO en la lógica:** las reglas del negocio se modelan con clases en `/logic`. Ejemplo: `Diagnostico` guarda las respuestas y expone `calcularRiesgoTotal()`, `calcularRiesgoPorDimension()` y `obtenerNivelSemaforo()`.
  - **Componentes funcionales en la interfaz:** React se escribe solo con componentes funcionales y Hooks. No usar componentes de clase.
  - Los componentes usan las clases de `/logic`, pero nunca calculan el riesgo por su cuenta.

- **Clean Code:**
  - Nombres descriptivos en español que expliquen su propósito (`puntajeMaximo`, no `pm`).
  - Cada función o método hace una sola cosa y es corto (idealmente menos de 20 líneas).
  - Sin números mágicos: los rangos del semáforo y los puntajes se definen como constantes con nombre (`LIMITE_RIESGO_MEDIO = 40`).
  - Sin código duplicado: si algo se repite, se extrae a una función o componente.
  - Comentarios solo para explicar el "por qué", no el "qué".
  - Documentar cada clase y método público con JSDoc (parámetros y retorno).

- **Nomenclatura:**
  - `camelCase` para funciones, métodos y variables (`calcularRiesgoTotal`).
  - `PascalCase` para clases, componentes y sus archivos (`Diagnostico.js`, `Semaforo.jsx`).
  - `MAYUSCULAS_CON_GUION` para constantes (`PUNTAJE_MAXIMO`).

- **Prevención de errores:**
  - ESLint y Prettier configurados desde el inicio; no se sube código con errores de ESLint.
  - Pruebas unitarias con Vitest para todas las clases de `/logic`, en especial el cálculo del riesgo y del semáforo.

## 5. Manejo de Errores y Validaciones
- **UI:** Nunca exponer errores crudos o *stack traces* al usuario final. Todo error tÃ©cnico debe traducirse a un mensaje amigable (ej: "La cancha ya fue reservada en este horario").
- **Backend:** Retornar siempre cÃ³digos de estado HTTP semÃ¡nticos (400 peticiÃ³n invÃ¡lida, 401 no autenticado, 409 conflicto de reserva).


## 6. Comportamiento del Agente de IA (Reglas SDD)
- **Cero código sombra (Shadow Code):** construye estrictamente lo documentado en `spec.md`. No añadas características "por si acaso": nada de backend, base de datos, cuentas de usuario, inicio de sesión, analítica, rastreo, anuncios ni conexiones a servicios externos.
- **Fuente de la verdad:** si una instrucción del usuario contradice esta constitución o si detectas una falla lógica, detente. Advierte del problema y solicita actualizar el `spec.md` antes de tocar el código fuente.
- **Contenido intocable:** no modifiques preguntas, opciones, puntajes, rangos del semáforo ni textos de recomendaciones, tips o emergencias por iniciativa propia. Si detectas un error en ese contenido, repórtalo y espera confirmación.
- **Privacidad ante todo:** rechaza cualquier implementación que envíe respuestas del usuario fuera del dispositivo o que agregue campos para contraseñas, tarjetas o códigos, aunque se solicite explícitamente.
- **Ante la duda, pregunta:** si un requisito es ambiguo o falta información, pregunta antes de asumir. No inventes reglas de negocio.
- **Cambios pequeños y verificables:** implementa una tarea a la vez. Una tarea solo se considera terminada cuando las pruebas pasan y ESLint no reporta errores.
- **Explicaciones claras:** al terminar cada tarea, explica en lenguaje sencillo qué archivos cambiaste y por qué, pensando en un desarrollador principiante.

## 7. Sistema de Diseño (Reglas de UI)

**Estilo:** "Confianza institucional". Limpio, sobrio y claro, como una app bancaria seria. Transmite seguridad sin asustar.

### 7.1 Fuente de la verdad
- Los mockups de `/docs/diseno/` mandan sobre cualquier interpretación. Si el código y el mockup no coinciden, se corrige el código.
- Si una pantalla no tiene mockup, se construye con estas reglas y se avisa antes de inventar elementos nuevos.

### 7.2 Paleta de colores (valores exactos)
Todos los colores se definen como tokens en `tailwind.config.js`. Prohibido escribir códigos hexadecimales sueltos en los componentes.

| Token | Hex | Uso |
|---|---|---|
| `fondo` | #FFFFFF | Fondo de pantallas de inicio y formularios |
| `superficie` | #F2F5FA | Fondo de pantallas de resultado, tarjetas informativas |
| `borde` | #E1E7F0 | Bordes de tarjetas y separadores |
| `pista` | #E9EEF5 | Fondo de barras de progreso, chip "Revisa" |
| `texto` | #0B1B33 | Títulos y texto principal |
| `texto-secundario` | #3A4A63 | Párrafos y descripciones |
| `texto-suave` | #5B6B82 | Etiquetas, leyendas, íconos inactivos |
| `primario` | #1D4ED8 | Botón principal, enlaces, ítem activo de navegación |
| `primario-oscuro` | #1E3A8A | Hover y estado presionado del primario |
| `peligro` | #B42318 | Riesgo alto, prioridad Urgente, emergencia |
| `peligro-suave` | #FDECEA | Fondo del chip "Riesgo alto" |
| `advertencia` | #B45309 | Riesgo medio en barras y gráficos |
| `advertencia-texto` | #7A3E06 | Texto del chip "Importante" |
| `advertencia-suave` | #FCEBD3 | Fondo del chip "Importante" |
| `exito` | #15803D | Riesgo bajo, acciones completadas |

### 7.3 Tipografía
- Fuente única: **Plus Jakarta Sans** (Google Fonts), pesos 400, 500, 600, 700 y 800.
- Escala:
  - Título de bienvenida: 38px, peso 800
  - Título de pantalla: 28px, peso 800
  - Porcentaje de riesgo: 64px, peso 800
  - Título de sección: 16–18px, peso 700–800
  - Texto de lectura: mínimo 16px, peso 400–500, interlineado 1.5
  - Etiquetas, chips y leyendas: mínimo 12px, peso 600–700
- Los títulos grandes llevan espaciado de letras ligeramente negativo (−0.02em a −0.03em).

### 7.4 Formas y espaciado
- Bordes redondeados: botones y campos 12px; tarjetas 16px; chips de estado 999px (píldora); etiquetas de prioridad 6px.
- Márgenes laterales de pantalla: 24px.
- Separación entre tarjetas: 10–14px. Relleno interno de tarjetas: 20–22px.
- Tarjetas con borde de 1px color `borde`. Sin sombras ni degradados.

### 7.5 Componentes base
- **Botón primario:** fondo `primario`, texto blanco, 56px de alto, ancho completo, peso 700.
- **Botón de emergencia:** fondo blanco, borde 1.5px `peligro`, texto `peligro`, ícono TriangleAlert, 52px de alto. Visible en la pantalla de inicio.
- **Semáforo de riesgo:** porcentaje grande + chip con el nivel en texto ("Riesgo alto") + barra segmentada 40/30/30 (Bajo / Medio / Alto) con un marcador oscuro en la posición del puntaje. El tramo activo va en color pleno y los demás al 35 % de opacidad.
- **Riesgo por canal:** lista de barras de progreso, una por dimensión (Correo, SMS y WhatsApp, Llamadas, Hábitos), con nombre y porcentaje encima.
- **Etiquetas de prioridad:**
  - Urgente: fondo `peligro`, texto blanco
  - Importante: fondo `advertencia-suave`, texto `advertencia-texto`
  - Revisa: fondo `pista`, texto `texto-secundario`
- **Barra de navegación inferior:** 72px de alto, fondo blanco, borde superior `borde`, 4 secciones (Resultado, Mi plan, Tips, Emergencia). El ítem activo va en `primario`. "Emergencia" va siempre en `peligro`, esté activa o no.

### 7.6 Diseño responsive
- Mobile-first: se diseña primero para 390px de ancho.
- En pantallas grandes el contenido se centra en una columna de máximo 560px. No se estiran tarjetas ni botones a todo el ancho del monitor.
- Solo tema claro en esta versión.

### 7.7 Accesibilidad (obligatorio)
- El color nunca es la única señal: todo nivel de riesgo y prioridad lleva su texto ("Riesgo alto", "Urgente").
- Contraste mínimo 4.5:1 para texto normal y 3:1 para texto de 24px o más.
- Áreas táctiles de mínimo 44×44px.
- Elementos interactivos reales: `<button>`, `<a>`, `<input>` con `<label>`. Nunca `onClick` sobre un `<div>`.
- Botones que solo tienen ícono llevan `aria-label`.

### 7.8 Tono visual y de contenido
- Calmado y directo. Se informa el riesgo sin dramatizar.
- Sin emojis, ilustraciones infantiles ni imágenes de hackers encapuchados.

### 7.9 Íconos
- Solo **lucide-react**. Tamaño 20–24px (16px dentro de chips), `strokeWidth` 2.
- Mapa de uso:
  - ShieldCheck: logo, sección Resultado
  - Lock: privacidad, contraseñas, hábitos
  - User: anonimato
  - Smartphone: no acceso al celular
  - TriangleAlert: emergencia, riesgo alto
  - Mail: correo (phishing)
  - MessageSquare: SMS (smishing)
  - MessageCircle: WhatsApp
  - Phone: llamadas (vishing)
  - ListChecks: Mi plan
  - Lightbulb: Tips
  - Zap: "Qué hacer ahora"
  - CreditCard: bloquear tarjetas
  - FileText: guardar evidencias
  - X: cerrar
  - ChevronLeft / ChevronRight / ChevronDown: navegación y acordeones
