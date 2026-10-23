# Quickstart: validar Tips interactivos (006)

## Preparación

```bash
git checkout 006-tips
npm install
npm test && npm run lint && npm run format:check
npm run dev
```

Abrir la app, aceptar el consentimiento y completar el diagnóstico; ir a **Tips** en la barra inferior. En otra pestaña abrir `scripts/prototipos/prototipo-tips.html` a 390 px de ancho.

## Escenarios

1. **Estructura**: título, subtítulo, Regla de oro, "0 de 8 retos superados", 5 chips, 8 tarjetas con la primera abierta, acceso a Emergencia (spec US1-1).
2. **Trampas**: en cada tip, tocar las 3 frases → contador 1, 2, 3; caja "Trampa:" con la explicación; al final "¡Las encontraste todas!" y sin ayuda. Repetir solo con Tab + Enter/Espacio.
3. **Correo**: en "Tu cuenta será suspendida", la primera trampa es el remitente.
4. **Llamada**: "Lo que te dicen:" en vez de "De:".
5. **Reto**: opción incorrecta → roja, deshabilitada, mensaje de fallo; correcta → verde, todo bloqueado, acierto, "· Reto superado" y barra "1 de 8".
6. **Persistencia**: recargar → retos y barra se conservan; trampas vuelven a 0.
7. **Filtros**: cada chip muestra 2 tips y ninguno abierto; "Todos" muestra 8.
8. **Acordeón**: abrir otra tarjeta cierra la anterior.
9. **Bloqueo de almacenamiento**: en DevTools bloquear el sitio para almacenamiento → la pantalla sigue funcionando y se ve el aviso amigable.
10. **Movimiento reducido**: activar "reducir movimiento" → sin pop ni transiciones.
11. **Accesibilidad**: axe DevTools sin errores; foco visible; controles de 44 px.
12. **Red**: la pestaña Network no muestra peticiones nuevas al usar Tips.
