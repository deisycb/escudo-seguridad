# Quickstart — validar el asistente guiado de emergencia

**Spec**: [spec.md](./spec.md) | **Contratos**: [contracts/](./contracts/)

## Requisitos

Node.js 22+ y dependencias instaladas (`npm install`). No se agrega ninguna dependencia nueva.

## Verificación automática

```bash
npm test        # incluye tests/logic/ConversacionEmergencia.test.js
npm run lint    # sin errores (incluye jsx-a11y)
npm run build   # build con la CSP connect-src 'none'
```

Esperado: todas las pruebas de [contracts/logica-conversacion.md](./contracts/logica-conversacion.md) pasan. La validación del contenido real reporta **pendientes** hasta que el equipo entregue `emergencias.js`, pero ningún **error** de estructura.

## Escenarios manuales (`npm run dev`, celular de 390 px en DevTools)

| # | Pasos | Esperado | Spec |
|---|---|---|---|
| 1 | Abrir Inicio sin datos | Botón con TriangleAlert, "Tengo una emergencia ahora" y debajo "Un asistente te guía paso a paso"; nada cortado a 360 px ni con zoom de texto al 200 % | FR-001, FR-002, SC-006 |
| 2 | Tocar el botón sin marcar el consentimiento | Llega a Emergencia: título, presentación (ShieldCheck en círculo), aviso "No borres nada", saludo y 7 situaciones | FR-003…FR-007 |
| 3 | Elegir cada situación y recorrer la guía | Elección a la derecha en `primario`; pasos uno a uno con "Paso N de M"; al final, las 3 opciones de cierre. Situación + seguimiento + primer paso en ≤ 3 toques desde Inicio | FR-008…FR-011, SC-001, SC-002 |
| 4 | En el paso 2, tocar "Llamar a la línea de mi banco" | Lista de bancos con número visible (`tel:`); luego sigue disponible "Listo, ¿qué sigue?" y lleva al paso 3 | FR-015, FR-017, SC-003 |
| 5 | Durante una pregunta de seguimiento, tocar "Más ayuda" → "Cómo denunciar en Colombia" | El panel se abre (lector: "expandido"), muestra las dos acciones y se cierra al elegir; aparecen los canales de denuncia y luego las mismas respuestas pendientes (2 toques) | FR-014, FR-016, FR-017, SC-003 |
| 6 | Al cierre: "Me pasó otra cosa"; después "Eso es todo, gracias" | Vuelven las 7 situaciones con el historial arriba; luego la despedida y ninguna opción en la conversación; "Llamar" y "Más ayuda" siguen al pie | FR-011 |
| 7 | A mitad de una guía, "Más ayuda" → "Empezar de nuevo"; primero "Seguir aquí", luego repetir y confirmar | "¿Empezar de nuevo?" con el foco en "Seguir aquí"; al cancelar sigue el mismo paso; al confirmar, solo el saludo y las 7 situaciones. Con solo el saludo en pantalla, no aparece diálogo | FR-018 |
| 8 | Tocar dos veces rápido "Listo, ¿qué sigue?" | Avanza un solo paso | FR-012 |
| 9 | Desplazar una conversación larga, con el panel "Más ayuda" cerrado y abierto | "Llamar" y "Más ayuda" siempre visibles sin tapar la última opción; con diagnóstico, quedan encima de la barra inferior | FR-014 |
| 9a | A mitad de una guía: (a) "atrás" del navegador o gesto de Android, (b) Tips en la barra inferior, (c) "Volver al inicio" sin diagnóstico. En cada uno, primero "Seguir aquí" y luego "Salir" | "¿Salir del asistente? Perderás el paso en que vas."; al cancelar, mismo paso y foco de vuelta; al salir, va al destino (la pantalla anterior en el caso de "atrás") y al volver la conversación empieza de cero | FR-031 |
| 9b | Abrir Emergencia y, sin tocar nada, usar "atrás" o la barra | Sale sin diálogo | FR-031 |
| 9c | A mitad de una guía, recargar la página | Sin diálogo; la conversación empieza de cero | FR-031, FR-027 |
| 10 | DevTools → Network en "Offline" tras cargar; recorrer todo | Funciona; cero peticiones en Network | FR-028, SC-004 |
| 11 | Salir de Emergencia y volver; revisar Application → Local Storage | La conversación empieza de cero; nada nuevo guardado | FR-027, SC-004 |
| 12 | Activar "reducir movimiento" en el sistema | Sin desplazamientos suaves ni animaciones | FR-023 |
| 13 | Solo teclado: Tab / Enter por todo el flujo | Foco visible; tras cada elección el foco cae en la siguiente opción; nunca vuelve al inicio de la página | FR-025 |
| 14 | VoiceOver (macOS/iOS) o NVDA | Cada mensaje nuevo se anuncia ("El asistente dice: Paso 2 de 5…"); las elecciones se leen como "Tú elegiste…" | FR-024, FR-026, SC-005 |
| 15 | axe DevTools o Lighthouse en Inicio y Emergencia | Sin incumplimientos de WCAG 2.1 AA | SC-005 |
| 16 | Ancho de 1440 px | Columna centrada de máximo 560 px; acciones rápidas del mismo ancho | FR-022 |
| 17 | Solo teclado en "Más ayuda" y en los diálogos | Enter abre/cierra el panel, Esc lo cierra y el foco vuelve a "Más ayuda"; en el diálogo el foco empieza en "Seguir aquí" y vuelve al control que lo abrió al cancelar | FR-014, FR-025 |
