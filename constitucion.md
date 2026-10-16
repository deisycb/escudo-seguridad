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