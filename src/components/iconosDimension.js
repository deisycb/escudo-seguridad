import { Lock, Mail, MessageSquare, Phone } from "lucide-react";

/** Ícono de cada dimensión según el mapa de la constitución §7.9 (lo usan pregunta y resultado). */
export const ICONOS_DIMENSION = Object.freeze({
  phishing: Mail,
  smishing: MessageSquare,
  vishing: Phone,
  habitos: Lock,
});
