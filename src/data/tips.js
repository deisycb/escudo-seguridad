// Contenido de Tips (spec 006), copiado del prototipo aprobado scripts/prototipos/prototipo-tips.html.
// Las frases entre [[ ]] son las trampas tocables; su orden (remitente y luego mensaje) coincide con
// el de `trampas`. Remitentes, números y dominios son inventados (FR-021).
// Única diferencia con el prototipo, aprobada por el equipo: en "Te piden el código de 6 dígitos"
// el remitente es la tercera trampa (el prototipo tenía 3 explicaciones y solo 2 frases marcadas).

export const REGLA_DE_ORO =
  "Tu banco nunca te pedirá claves, códigos ni el número completo de tu tarjeta. Ni por llamada, ni por mensaje, ni por correo.";

/** Filtros en orden; `nombre` es el que va en la etiqueta "Canal · Tipo" (FR-004, FR-007). */
export const CANALES_TIPS = [
  { id: null, filtro: "Todos" },
  { id: "sms", filtro: "SMS", nombre: "SMS" },
  { id: "llamada", filtro: "Llamadas", nombre: "Llamada" },
  { id: "correo", filtro: "Correo", nombre: "Correo" },
  { id: "whatsapp", filtro: "WhatsApp", nombre: "WhatsApp" },
];

/** Textos fijos de la pantalla (FR-018). */
export const TEXTOS_TIPS = {
  titulo: "Tips de seguridad",
  subtitulo:
    "Las estafas más comunes en Colombia. Abre cada una, busca las trampas en el mensaje y pon a prueba lo que harías.",
  etiquetaRegla: "Regla de oro",
  filtrosAria: "Filtrar por canal",
  progreso: (superados, total) => `${superados} de ${total} retos superados`,
  asiSeVe: "Así se ve",
  contadorTrampas: (encontradas, total) => `${encontradas} de ${total} trampas`,
  de: "De:",
  loQueTeDicen: "Lo que te dicen:",
  ejemplo: "Ejemplo",
  ayudaTrampas: "Toca las partes subrayadas en rojo para descubrir cada trampa.",
  prefijoTrampa: "Trampa:",
  todasEncontradas: "¡Las encontraste todas!",
  comoReconocerla: "Cómo reconocerla",
  queHacer: "Qué hacer",
  retoSuperado: "Reto superado",
  prefijoDato: "Dato:",
  emergenciaPregunta: "¿Ya caíste en una?",
  emergenciaAccion: "Ve a Emergencia y sigue los primeros auxilios.",
};

function opciones(lista) {
  return lista.map(([texto, esCorrecta]) => ({ texto, esCorrecta }));
}

export const TIPS = [
  {
    id: "sms-paquete",
    canal: "sms",
    tipo: "Smishing",
    titulo: "Tu paquete está retenido",
    remitente: "Envíos Col",
    hora: "10:42 a. m.",
    mensaje:
      "Tu paquete está retenido por [[dirección incompleta]]. [[Paga $3.900]] para reprogramar la entrega: [[bit.ly/entrega-co8841]]",
    trampas: [
      "Pretexto genérico: sirve para cualquier persona, esperes o no un paquete.",
      "El cobro es pequeño a propósito. Lo que buscan son los datos de tu tarjeta.",
      "Enlace acortado: esconde a qué página te lleva en realidad.",
    ],
    senales: [
      "No estabas esperando ningún envío, o no lo pediste por ese medio.",
      'Te cobran una tarifa pequeña para "liberar" el paquete.',
      "El enlace no es la página oficial de la transportadora.",
    ],
    pasos: [
      "No abras el enlace ni pagues.",
      "Si sí esperas algo, rastréalo desde la app o página oficial de la tienda.",
      "Borra el mensaje y bloquea el número.",
    ],
    reto: {
      pregunta: "No estás esperando nada y te llega este SMS. ¿Qué haces?",
      opciones: opciones([
        ["Pago, son solo $3.900", false],
        ["Borro el mensaje y rastreo mis pedidos en la app oficial", true],
        ["Respondo preguntando de qué paquete se trata", false],
      ]),
      acierto: "Exacto. Lo que pierdes no son $3.900: son los datos de tu tarjeta.",
    },
    dato: "El monto bajo es el gancho: casi nadie desconfía de un cobro tan pequeño.",
  },
  {
    id: "sms-premio",
    canal: "sms",
    tipo: "Smishing",
    titulo: "Descuento o premio en tu plan de celular",
    remitente: "890123",
    hora: "Ayer",
    mensaje:
      "¡FELICIDADES! [[Ganaste 50% de descuento]] en tu plan por 12 meses. Reclámalo [[HOY antes de las 11:59 p. m.]] en [[planes-promo.co/reclamar]]",
    trampas: [
      "Ganaste algo sin haber participado en nada.",
      "Urgencia artificial: quieren que actúes sin pensar.",
      "Dominio que no es el de tu operador.",
    ],
    senales: [
      "Premios o descuentos que no pediste.",
      'Plazos que vencen "hoy" o "en minutos".',
      'Te piden datos personales o de tarjeta para "activar" el beneficio.',
    ],
    pasos: [
      "No entres al enlace.",
      "Revisa las promociones reales en la app oficial de tu operador.",
      "Reporta el número como spam.",
    ],
    reto: {
      pregunta: "El descuento suena muy bien y vence hoy. ¿Qué haces?",
      opciones: opciones([
        ["Entro rápido antes de que se acabe", false],
        ["Lo verifico en la app oficial de mi operador", true],
        ["Se lo reenvío a mi familia para que también reclamen", false],
      ]),
      acierto: "Bien. Si la promoción es real, también aparece en la app oficial.",
    },
    dato: "Las promociones reales no desaparecen porque te tomes cinco minutos para verificar.",
  },
  {
    id: "llamada-banco",
    canal: "llamada",
    tipo: "Vishing",
    titulo: '"Le hablamos del banco por un movimiento sospechoso"',
    remitente: "Número desconocido",
    hora: "Llamada entrante",
    mensaje:
      "Buenas tardes, le hablamos del [[área de seguridad de su banco]]. Detectamos una [[compra por $1.850.000]]. Para cancelarla, [[dígame el código que le acaba de llegar]].",
    trampas: [
      "Te llaman ellos. No tienes cómo comprobar quién está al otro lado.",
      "Una cifra alta para asustarte y que actúes sin pensar.",
      "Ese código es la llave de tu cuenta. El banco nunca lo pide.",
    ],
    senales: [
      "Te llaman a ti, no tú a ellos.",
      "Te asustan con una compra o un bloqueo.",
      "Te piden claves, códigos o el número completo de la tarjeta.",
    ],
    pasos: [
      "Cuelga sin dar ningún dato.",
      "Llama tú al número que aparece detrás de tu tarjeta o en la app.",
      "Revisa tus movimientos directamente en la app del banco.",
    ],
    reto: {
      pregunta: "Te dicen que si no das el código perderás $1.850.000. ¿Qué haces?",
      opciones: opciones([
        ["Doy el código para cancelar la compra", false],
        ["Doy mi cédula pero no el código", false],
        ["Cuelgo y llamo yo a la línea oficial del banco", true],
      ]),
      acierto: "Perfecto. Colgar es seguro: si el problema es real, el banco te lo confirma.",
    },
    dato: "Los estafadores pueden saber tu nombre y tus últimos dígitos. Eso no los vuelve el banco.",
  },
  {
    id: "llamada-tecnico",
    canal: "llamada",
    tipo: "Vishing",
    titulo: "Falso técnico o asesor de tu operador",
    remitente: "Soporte técnico",
    hora: "Llamada entrante",
    mensaje:
      "Le llamamos de soporte de su operador. [[Su línea será suspendida hoy]]. Para evitarlo, [[instale la aplicación que le voy a indicar]] y [[léame el número que aparece en pantalla]].",
    trampas: [
      "Amenaza de corte inmediato para presionarte.",
      "Esas apps dan control remoto de tu celular.",
      "Con ese número entran a tu equipo y ven todo lo que haces.",
    ],
    senales: [
      "Te piden instalar una app que no buscaste.",
      "Te piden leer códigos o números que aparecen en pantalla.",
      "Amenazan con suspender tu servicio si no actúas ya.",
    ],
    pasos: [
      "Cuelga. Tu operador no te pide instalar apps por llamada.",
      "Si dudas, llama tú a la línea oficial del operador.",
      "Si ya instalaste algo, desinstálalo y cambia tus claves desde otro equipo.",
    ],
    reto: {
      pregunta: 'El "técnico" insiste en que instales una app para no perder la línea. ¿Qué haces?',
      opciones: opciones([
        ["La instalo, no quiero quedarme sin servicio", false],
        ["Cuelgo y llamo yo a la línea oficial de mi operador", true],
        ["La instalo pero no le leo el código", false],
      ]),
      acierto:
        "Muy bien. Una app de control remoto es como darle las llaves de tu casa a un extraño.",
    },
    dato: "Con acceso remoto pueden abrir tu app bancaria mientras tú miras la pantalla.",
  },
  {
    id: "correo-suspension",
    canal: "correo",
    tipo: "Phishing",
    titulo: "Tu cuenta será suspendida",
    remitente: "Soporte <[[seguridad@cuenta-verificacion.net]]>",
    hora: "7:15 a. m.",
    mensaje:
      "Estimado usuario: detectamos actividad inusual. Su cuenta será [[suspendida en 24 horas]]. Verifique su identidad aquí: [[Verificar ahora]]",
    trampas: [
      "El dominio no es el de la empresa real. Mira siempre después de la @.",
      "Plazo corto para que no te detengas a revisar.",
      "El botón te lleva a una página falsa que copia el inicio de sesión.",
    ],
    senales: [
      'El saludo es genérico: "Estimado usuario".',
      "El remitente tiene un dominio raro o con letras cambiadas.",
      "Te piden iniciar sesión desde un botón del correo.",
    ],
    pasos: [
      "No toques el botón.",
      "Entra tú escribiendo la dirección oficial o desde la app.",
      "Marca el correo como phishing y bórralo.",
    ],
    reto: {
      pregunta: "El correo tiene el logo de la empresa y se ve muy real. ¿Qué miras primero?",
      opciones: opciones([
        ["Que el logo esté bien hecho", false],
        ["El dominio después de la @ del remitente", true],
        ["Que no tenga errores de ortografía", false],
      ]),
      acierto: "Así es. Copiar un logo es fácil; el dominio real no lo pueden usar.",
    },
    dato: "Hoy muchos correos falsos no tienen errores de ortografía. El remitente sigue siendo la mejor pista.",
  },
  {
    id: "correo-factura",
    canal: "correo",
    tipo: "Phishing",
    titulo: "Factura o recibo que no esperabas",
    remitente: "Facturación <cobros@notifica-pagos.com>",
    hora: "Lunes",
    mensaje:
      "Adjuntamos factura electrónica N.° 55902 por [[$2.340.000 vencida]]. Descargue [[Factura_55902.zip]] para evitar [[cobro jurídico]].",
    trampas: [
      "Una deuda que no reconoces, pensada para que abras por curiosidad o miedo.",
      "Los archivos .zip, .exe o .html pueden instalar programas maliciosos.",
      "Amenaza legal para presionarte.",
    ],
    senales: [
      "No reconoces la compra ni la empresa.",
      "El adjunto es comprimido o ejecutable, no un PDF normal.",
      "Amenazan con cobro jurídico o reportes.",
    ],
    pasos: [
      "No descargues el archivo.",
      "Si crees que puede ser real, contacta a la empresa por su canal oficial.",
      "Borra el correo y mantén tu equipo actualizado.",
    ],
    reto: {
      pregunta: "No reconoces la factura, pero te preocupa el cobro jurídico. ¿Qué haces?",
      opciones: opciones([
        ["Abro el .zip para ver qué es", false],
        ["Lo ignoro y, si dudo, consulto a la empresa por su canal oficial", true],
        ["Respondo el correo pidiendo explicaciones", false],
      ]),
      acierto: "Correcto. Abrir el adjunto es justo lo que buscan.",
    },
    dato: "Un cobro real llega con tu nombre completo y datos que tú puedes verificar.",
  },
  {
    id: "whatsapp-numero",
    canal: "whatsapp",
    tipo: "Suplantación",
    titulo: '"Cambié de número, necesito un favor"',
    remitente: "+57 312 000 0000",
    hora: "9:03 p. m.",
    mensaje:
      "Hola mami, [[este es mi número nuevo]], guárdalo. Estoy en un problema, [[¿me prestas $450.000?]] Te los devuelvo mañana, [[no puedo hablar ahora]].",
    trampas: [
      "Número desconocido que dice ser alguien cercano.",
      "Pedido de plata urgente apenas escribe.",
      "Evitan la llamada para que no reconozcas la voz.",
    ],
    senales: [
      "Un contacto conocido escribe desde un número nuevo.",
      "Te pide dinero o una transferencia rápido.",
      "Pone excusas para no hablar por llamada o videollamada.",
    ],
    pasos: [
      "No transfieras.",
      "Llama al número de siempre de esa persona o haz una pregunta que solo ella sepa.",
      "Bloquea y reporta el número en WhatsApp.",
    ],
    reto: {
      pregunta: "El mensaje suena igual a tu hijo y dice que es urgente. ¿Qué haces?",
      opciones: opciones([
        ["Transfiero, es mi familia", false],
        ["Lo llamo a su número de siempre antes de hacer cualquier cosa", true],
        ["Le pido una foto para confirmar", false],
      ]),
      acierto: "Exacto. Una llamada al número de siempre resuelve la duda en segundos.",
    },
    dato: "Una foto no confirma nada: la pueden sacar de las redes sociales.",
  },
  {
    id: "whatsapp-codigo",
    canal: "whatsapp",
    tipo: "Suplantación",
    titulo: "Te piden el código de 6 dígitos",
    remitente: "[[Laura (contacto)]]",
    hora: "4:20 p. m.",
    mensaje:
      "Hola! [[Te envié un código por error]] a tu celular, [[¿me lo reenvías porfa?]] Es para entrar a mi cuenta.",
    trampas: [
      "Puede ser un contacto real cuya cuenta ya fue robada.",
      "Ese código no llegó por error: es el de tu propio WhatsApp.",
      "Si lo reenvías, se quedan con tu cuenta y escriben a tus contactos.",
    ],
    senales: [
      "Te llega un código que no pediste.",
      "Alguien te lo pide, aunque sea un conocido.",
      "Te escriben con prisa y mucha confianza.",
    ],
    pasos: [
      "Nunca compartas ese código, con nadie.",
      "Activa la verificación en dos pasos (PIN) en WhatsApp.",
      "Avisa a tu contacto por otro medio: su cuenta puede estar robada.",
    ],
    reto: {
      pregunta: "Es una amiga de verdad quien te pide el código. ¿Qué haces?",
      opciones: opciones([
        ["Se lo mando, la conozco", false],
        ["No lo comparto y la llamo para avisarle que la pudieron hackear", true],
        ["Le mando solo los primeros 3 números", false],
      ]),
      acierto: "Muy bien. Ese código abre tu cuenta, no la de ella.",
    },
    dato: "Con el PIN de verificación en dos pasos, aunque alguien tenga el código, no puede entrar.",
  },
];
