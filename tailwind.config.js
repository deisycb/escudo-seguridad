/**
 * Tokens del sistema de diseño "Confianza institucional" (constitución §7).
 * Los componentes solo usan estos nombres; nunca colores hexadecimales sueltos (§7.2).
 * Tailwind 4 lo carga desde src/index.css con @config (research R14).
 * @type {import('tailwindcss').Config}
 */
export default {
  theme: {
    extend: {
      colors: {
        fondo: "#FFFFFF",
        superficie: "#F2F5FA",
        borde: "#E1E7F0",
        pista: "#E9EEF5",
        texto: "#0B1B33",
        "texto-secundario": "#3A4A63",
        "texto-suave": "#5B6B82",
        primario: "#1D4ED8",
        "primario-oscuro": "#1E3A8A",
        peligro: "#B42318",
        "peligro-suave": "#FDECEA",
        advertencia: "#B45309",
        "advertencia-texto": "#7A3E06",
        "advertencia-suave": "#FCEBD3",
        exito: "#15803D",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        boton: "12px",
        tarjeta: "16px",
        etiqueta: "6px",
      },
      maxWidth: {
        columna: "560px",
      },
      spacing: {
        barra: "72px",
      },
      fontSize: {
        bienvenida: ["38px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "800" }],
        pantalla: ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "800" }],
        riesgo: ["64px", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "800" }],
      },
    },
  },
};
