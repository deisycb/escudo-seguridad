// PROVISIONAL: borrador para poder probar el plan de acción; pendiente de validar por el equipo
// (constitución III). Indexado por número de pregunta: { titulo, queHacerAhora, comoPrevenirlo }.
export const RECOMENDACIONES = {
  1: {
    titulo: "Usa una contraseña distinta en cada cuenta",
    queHacerAhora: [
      "Cambia la contraseña de tu correo por una que no uses en ningún otro lado.",
      "Cambia también la de tus cuentas de banco y redes sociales.",
    ],
    comoPrevenirlo: [
      "Usa frases largas y fáciles de recordar para ti.",
      "Considera un administrador de contraseñas.",
    ],
  },
  2: {
    titulo: "Activa la verificación en dos pasos en tu correo",
    queHacerAhora: [
      "Entra a la configuración de seguridad de tu correo.",
      "Activa la verificación en dos pasos con tu celular.",
    ],
    comoPrevenirlo: ["Actívala también en tus redes sociales y en la app de tu banco."],
  },
  3: {
    titulo: "Cambia la contraseña de tu correo",
    queHacerAhora: ["Cambia hoy la contraseña de tu correo por una nueva y larga."],
    comoPrevenirlo: ["Cámbiala si sospechas que alguien más la conoce."],
  },
  4: {
    titulo: "No actualices datos desde enlaces de correos",
    queHacerAhora: [
      "Si diste datos en un enlace de correo, cambia esa contraseña y llama a tu banco.",
    ],
    comoPrevenirlo: [
      "Entra tú mismo a la app o página oficial escribiendo la dirección.",
      "Reporta y borra los correos sospechosos.",
    ],
  },
  5: {
    titulo: "No abras enlaces de números desconocidos",
    queHacerAhora: ["Borra o reporta los mensajes con enlaces de números que no conoces."],
    comoPrevenirlo: ["Si el mensaje dice ser de una empresa, entra por su app oficial."],
  },
  6: {
    titulo: "Nunca compartas códigos de verificación",
    queHacerAhora: [
      "Si compartiste un código, cambia la contraseña de esa cuenta y revisa sus sesiones abiertas.",
    ],
    comoPrevenirlo: ["Nadie de confianza te pedirá un código de 6 dígitos: no lo compartas."],
  },
  7: {
    titulo: "Activa la verificación en dos pasos en WhatsApp",
    queHacerAhora: ["En WhatsApp ve a Ajustes > Cuenta > Verificación en dos pasos y crea un PIN."],
    comoPrevenirlo: ["No compartas ese PIN con nadie."],
  },
  8: {
    titulo: "Ignora los mensajes de paquetes retenidos",
    queHacerAhora: [
      "Si pagaste o diste datos, llama a tu banco para bloquear la tarjeta.",
      "Guarda el mensaje como evidencia.",
    ],
    comoPrevenirlo: ["Revisa tus envíos solo en la página oficial de la transportadora."],
  },
  9: {
    titulo: "No respondas llamadas silenciosas",
    queHacerAhora: ["Bloquea los números desconocidos que cuelgan sin hablar."],
    comoPrevenirlo: ['No devuelvas esas llamadas ni digas "sí" a desconocidos.'],
  },
  10: {
    titulo: "Cuelga y llama tú al banco",
    queHacerAhora: ["Si diste datos en una llamada, llama ya a la línea oficial de tu banco."],
    comoPrevenirlo: ["Si te llaman del banco, cuelga y marca tú la línea oficial."],
  },
  11: {
    titulo: "Recuerda: tu banco nunca pide claves",
    queHacerAhora: ["Ten presente que el banco nunca pide claves ni códigos por teléfono."],
    comoPrevenirlo: ["Cuéntale esta regla a tu familia."],
  },
  12: {
    titulo: "Confirma siempre con la línea oficial",
    queHacerAhora: ["Guarda en tu celular la línea oficial de tu banco."],
    comoPrevenirlo: ["Ante una llamada sospechosa, cuelga y llama tú a esa línea."],
  },
  13: {
    titulo: "Protege tus datos en redes sociales",
    queHacerAhora: ["Quita de tus perfiles tu celular, dirección y fecha de nacimiento."],
    comoPrevenirlo: ["Pon tus perfiles en privado y piensa antes de publicar datos personales."],
  },
  14: {
    titulo: "Ten a la mano a quién acudir",
    queHacerAhora: ["Revisa la sección Emergencia de Escudo para conocer los pasos y líneas."],
    comoPrevenirlo: ["Guarda la línea de tu banco y los canales de denuncia en tu celular."],
  },
};
