<!--
Sync Impact Report
- Cambio de versión: plantilla (sin versión) → 1.0.0 (adopción inicial)
- Fuente: constitucion.md (raíz del proyecto), adaptado a la estructura de la plantilla Spec Kit
- Principios definidos:
  - [PRINCIPLE_1_NAME] → I. Privacidad Ante Todo (NO NEGOCIABLE)
  - [PRINCIPLE_2_NAME] → II. Consentimiento y Cumplimiento Legal
  - [PRINCIPLE_3_NAME] → III. Contenido Fijo y Cálculo de Riesgo Determinista
  - [PRINCIPLE_4_NAME] → IV. Simplicidad: Solo Navegador, Sin Código Sombra
  - [PRINCIPLE_5_NAME] → V. Código Limpio y Verificado
  - Añadido: VI. Lenguaje Sencillo y Ayuda Siempre Disponible
- Secciones añadidas: Stack Tecnológico y Restricciones; Estructura de Código y Flujo de Trabajo
- Secciones eliminadas: ninguna
- Ajustes respecto a constitucion.md:
  - Sección 5 (Manejo de Errores) contenía texto de otro proyecto ("La cancha ya fue reservada",
    códigos HTTP de backend) y caracteres mal codificados. Se reemplazó por reglas coherentes con
    una app sin backend. Revisar y confirmar.
- TODOs diferidos: ninguno
-->

# Escudo — Web App de Seguridad Digital para Personas Naturales Constitution

Escudo es una web app que permite a cualquier persona natural (no empresas) conocer qué tan
expuesta está a estafas y robos digitales y saber qué hacer para protegerse. El usuario responde
un prediagnóstico declarativo de 14 preguntas; la app calcula su nivel de riesgo, lo muestra en un
semáforo (bajo, medio, alto) y entrega un plan de acción priorizado, tips para reconocer las
estafas más comunes en Colombia (SMS, llamadas, correo y WhatsApp) y una guía de primeros auxilios
digitales. Se fundamenta en el NIST Cybersecurity Framework 2.0 y los CIS Critical Security
Controls, y trata los datos conforme a la Ley 1581 de 2012.

## Core Principles

### I. Privacidad Ante Todo (NO NEGOCIABLE)

- Ninguna respuesta del usuario se envía a servidores externos; todo permanece en su dispositivo
  (localStorage).
- La app NUNCA DEBE tener campos que pidan contraseñas, números de tarjeta, códigos de
  verificación ni datos bancarios, ni acceder a las cuentas o dispositivos del usuario.
- Se DEBE rechazar cualquier implementación que viole estas reglas, aunque se solicite
  explícitamente.

**Razón:** una herramienta de seguridad que recolecta datos sensibles se convierte en el riesgo
que pretende prevenir.

### II. Consentimiento y Cumplimiento Legal

- El diagnóstico SOLO PUEDE iniciar si el usuario acepta el tratamiento de sus respuestas según
  la Ley 1581 de 2012.
- No existen cuentas de usuario, registro ni inicio de sesión.

**Razón:** cumplimiento de la ley colombiana de protección de datos y mínima recolección.

### III. Contenido Fijo y Cálculo de Riesgo Determinista

- **Prediagnóstico:** 14 preguntas cerradas; cada una tiene exactamente 3 opciones (a, b, c)
  ordenadas de menor a mayor riesgo ("a" = comportamiento seguro, "c" = mayor riesgo). El usuario
  DEBE responder las 14 para obtener resultado.
- **Contenido intocable:** el texto de preguntas, opciones, puntajes, recomendaciones, tips y
  emergencias se usa tal como está en los archivos de contenido. No se DEBE reformular, agregar,
  eliminar ni inventar contenido o puntajes.
- **Dimensiones:** Phishing (correo) preguntas 1–4; Smishing (SMS y WhatsApp) 5–8; Vishing
  (llamadas) 9–12; Hábitos generales 13–14.
- **Cálculo:** riesgo total = suma de puntajes obtenidos ÷ puntaje máximo posible, en porcentaje
  (0–100 %). El porcentaje por dimensión se calcula igual. Mismas respuestas DEBEN producir
  siempre el mismo resultado.
- **Semáforo:** Bajo 0–39 %, Medio 40–69 %, Alto 70 % en adelante.
- **Plan de acción:** solo para respuestas con puntaje mayor a cero, ordenadas de mayor a menor
  puntaje. Cada acción incluye "Qué hacer ahora" y "Cómo prevenirlo".
- **Progreso:** al marcar una acción como "Ya lo hice", su puntaje se descuenta del riesgo
  mostrado y el avance se guarda en localStorage.

**Razón:** el valor de la herramienta depende de un contenido validado y de resultados
reproducibles y explicables.

### IV. Simplicidad: Solo Navegador, Sin Código Sombra

- Toda la lógica se ejecuta en el navegador. No hay backend, base de datos ni servidor.
- Se construye estrictamente lo documentado en `spec.md`. PROHIBIDO añadir características "por si
  acaso": backend, cuentas, analítica, rastreo, anuncios o conexiones a servicios externos.
- Estructura plana; no se implementa Clean Architecture completa ni patrones complejos.

**Razón:** menos superficie de ataque, menos mantenimiento y alcance acotado a un proyecto
académico.

### V. Código Limpio y Verificado

- Las reglas de negocio se modelan con clases (POO) en `/logic`; la interfaz usa solo componentes
  funcionales de React con Hooks. Los componentes NUNCA calculan el riesgo por su cuenta.
- Nombres descriptivos en español; funciones cortas con una sola responsabilidad (idealmente
  menos de 20 líneas); sin código duplicado; comentarios solo para explicar el "por qué".
- Sin números mágicos: rangos del semáforo y puntajes como constantes con nombre
  (`LIMITE_RIESGO_MEDIO = 40`).
- JSDoc obligatorio en cada clase y método público (parámetros y retorno).
- Pruebas unitarias con Vitest para todas las clases de `/logic`, en especial cálculo de riesgo y
  semáforo. ESLint y Prettier configurados desde el inicio; no se sube código con errores de
  ESLint.

**Razón:** código legible y probado permite confiar en el cálculo del riesgo.

### VI. Lenguaje Sencillo y Ayuda Siempre Disponible

- Todo el contenido se redacta en español sencillo, sin tecnicismos, para cualquier persona.
- La sección de primeros auxilios digitales DEBE ser accesible desde la pantalla de inicio sin
  hacer el diagnóstico.
- Nunca se muestran errores crudos ni *stack traces* al usuario; todo error técnico se traduce a
  un mensaje amigable.

**Razón:** una víctima de estafa necesita ayuda inmediata y comprensible.

## Stack Tecnológico y Restricciones

- **Frontend / UI:** React con Vite; estilos con Tailwind CSS.
- **Lenguaje:** JavaScript en todo el proyecto.
- **Backend:** no aplica.
- **Persistencia:** localStorage del navegador.
- **Contenido estático:** preguntas, puntajes, recomendaciones, tips y guías de emergencia en
  archivos JavaScript/JSON dentro del proyecto.
- **Entorno de desarrollo:** Node.js y npm, solo para desarrollo y compilación.
- **Despliegue:** hosting estático (Vercel, Netlify o GitHub Pages).
- **Manejo de errores y validaciones:**
  - Validar en el cliente que las 14 preguntas estén respondidas y el consentimiento aceptado
    antes de calcular el resultado.
  - Si localStorage no está disponible o contiene datos corruptos, la app DEBE seguir funcionando
    (sin guardar progreso) y mostrar un aviso amigable.

## Estructura de Código y Flujo de Trabajo

**Estructura dentro de `/src`:**

- `/data`: contenido fijo (`preguntas.js`, `recomendaciones.js`, `tips.js`, `emergencias.js`).
- `/logic`: clases del dominio, una por archivo (`Pregunta.js`, `Diagnostico.js`,
  `PlanAccion.js`, `Almacenamiento.js`). Ejemplo: `Diagnostico` expone `calcularRiesgoTotal()`,
  `calcularRiesgoPorDimension()` y `obtenerNivelSemaforo()`.
- `/pages`: una pantalla por archivo (`Inicio.jsx`, `Diagnostico.jsx`, `Resultado.jsx`,
  `PlanAccion.jsx`, `Tips.jsx`, `Emergencia.jsx`).
- `/components`: piezas reutilizables (`Semaforo.jsx`, `TarjetaPregunta.jsx`,
  `TarjetaAccion.jsx`, `BarraNavegacion.jsx`).

**Nomenclatura:** `camelCase` para funciones, métodos y variables; `PascalCase` para clases,
componentes y sus archivos; `MAYUSCULAS_CON_GUION` para constantes.

**Comportamiento del agente de IA (reglas SDD):**

- **Fuente de la verdad:** si una instrucción contradice esta constitución o hay una falla
  lógica, detenerse, advertir y solicitar actualizar `spec.md` antes de tocar el código.
- **Contenido intocable:** si se detecta un error en preguntas, opciones, puntajes, rangos o
  textos, reportarlo y esperar confirmación.
- **Ante la duda, preguntar:** no inventar reglas de negocio.
- **Cambios pequeños y verificables:** una tarea a la vez; terminada solo cuando las pruebas
  pasan y ESLint no reporta errores.
- **Explicaciones claras:** al terminar cada tarea, explicar en lenguaje sencillo qué archivos
  cambiaron y por qué, pensando en un desarrollador principiante.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica o instrucción del proyecto.
- **Enmiendas:** se proponen mediante `/speckit-constitution`, se documentan en el Sync Impact
  Report y requieren aprobación del equipo del proyecto antes de aplicarse.
- **Versionado semántico:** MAJOR para eliminar o redefinir principios; MINOR para añadir
  principios o secciones o ampliar guías; PATCH para aclaraciones y correcciones de redacción.
- **Cumplimiento:** cada `plan.md` DEBE pasar el Constitution Check y cada revisión de código
  DEBE verificar los principios I (privacidad) y III (contenido y cálculo). Toda complejidad
  adicional DEBE justificarse por escrito.

**Version**: 1.0.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-15
