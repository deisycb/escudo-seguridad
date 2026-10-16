<!--
Sync Impact Report
- Cambio de versión: 1.0.0 → 1.1.0 (MINOR: se añade una sección nueva; nada se elimina ni redefine)
- Principios modificados: ninguno
- Secciones añadidas: 7. Sistema de Diseño (Reglas de UI)
- Secciones eliminadas: ninguna
- Historial:
  - 1.1.0 (2026-10-16): se cambió el sistema de diseño a "Confianza institucional" (paleta,
    tipografía, formas, componentes base, responsive, accesibilidad, tono visual e íconos).
    Sección añadida también en constitucion.md (raíz).
  - 1.0.0 (2026-10-15): adopción inicial a partir de constitucion.md.
- TODOs diferidos: ninguno. Nota: los mockups de /docs/diseno/ aún no existen en el repositorio.
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

## Governance

- Esta constitución prevalece sobre cualquier otra práctica o instrucción del proyecto.
- **Enmiendas:** se proponen mediante `/speckit-constitution`, se documentan en el Sync Impact
  Report y requieren aprobación del equipo del proyecto antes de aplicarse.
- **Versionado semántico:** MAJOR para eliminar o redefinir principios; MINOR para añadir
  principios o secciones o ampliar guías; PATCH para aclaraciones y correcciones de redacción.
- **Cumplimiento:** cada `plan.md` DEBE pasar el Constitution Check y cada revisión de código
  DEBE verificar los principios I (privacidad) y III (contenido y cálculo). Toda complejidad
  adicional DEBE justificarse por escrito.

**Version**: 1.1.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-16
