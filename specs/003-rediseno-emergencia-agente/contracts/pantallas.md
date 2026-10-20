# Contrato: pantallas que cambian (Inicio y Emergencia)

Complementa [../../001-escudo-web-app/contracts/pantallas.md](../../001-escudo-web-app/contracts/pantallas.md). Las reglas generales de esa página (tokens, columna de 560 px, fondos, foco en el `<h1>` al cambiar de pantalla) siguen vigentes.

## Cambios en la tabla de pantallas

| Pantalla | Antes | Ahora |
|---|---|---|
| `emergencia` | `+ vista: menu \| guia:<id> \| bancos \| denuncia` | Sin `vista`: `{ pantalla: "emergencia" }`. La conversación es estado local de la página (R7) |
| "atrás" en Emergencia | Vista interna → `menu` | Sin progreso: sale a la pantalla anterior. Con progreso: diálogo "¿Salir del asistente?" (R7, FR-031) |
| Barra inferior desde Emergencia | Navega directo | Pasa por `navegarConGuarda`: misma confirmación que "atrás" |

## Cambio en `useNavegacion`

- Nuevo `navegarConGuarda(destino)`: si el interceptor registrado devuelve `true` para `destino`, no navega; si no, llama a `navegar(destino)`.
- `App.navegarDesdeBarra` usa `navegarConGuarda`. `registrarInterceptorAtras` y `navegar` no cambian.

## Inicio — botón de emergencia

- Clase `BOTON_EMERGENCIA_ASISTENTE` (R8): fondo `fondo`, borde 1,5 px `peligro`, texto `peligro`, radio 12 px, ancho completo, `min-h-[52px]`, `py-2`.
- Contenido: TriangleAlert 20 px + bloque de dos líneas: **"Tengo una emergencia ahora"** (16 px/700) y **"Un asistente te guía paso a paso"** (13 px/500).
- Nombre accesible = texto visible (sin `aria-label`). Navega a `{ pantalla: "emergencia" }`.
- El acceso de Tips conserva `BOTON_EMERGENCIA` y su texto.

## Emergencia — estructura (de arriba a abajo)

1. `<h1 tabIndex={-1}>` **"Respira. Vamos paso a paso."** (28 px/800).
2. Presentación del asistente: círculo de 44 px `primario` + ShieldCheck blanco de 24 px; **"Asistente de emergencias"** (16 px/700) y **"Nunca te pediré claves, códigos ni datos de tu tarjeta"** (14 px/500 `texto-secundario`).
3. Aviso **"No borres nada"** (`AvisoNoBorres` actual, sin cambios).
4. Conversación: `<ol role="log" aria-live="polite" aria-label="Conversación con el asistente">`.
   - Asistente: `<li>` a la izquierda, burbuja `fondo` + borde `borde`, radio 16 px; prefijo `sr-only` "El asistente dice:".
     - `paso`: chip **"Paso N de M"** (píldora `pista` / `texto-secundario`, 12 px/700) + texto.
     - `lineasBancarias`: introducción + lista de `<a href="tel:…">` con banco y número visible.
     - `canalesDenuncia`: introducción + lista de canales (enlace externo opcional, como hoy).
   - Persona: `<li>` a la derecha, burbuja `primario` con texto blanco 16 px/600; prefijo `sr-only` "Tú elegiste:".
5. Opciones pendientes (debajo del último mensaje, fuera del `log`): `<button>` de ancho completo, texto a la izquierda + ChevronRight 20 px, alto mínimo 52 px. La primera recibe el foco tras cada elección (R5).
6. "Volver al inicio" (solo sin diagnóstico, como hoy), antes de las acciones rápidas; pasa por `interceptarSalida` (R7).
7. Acciones rápidas (`sticky`, R4), en `<nav aria-label="Acciones rápidas">`:
   - Fila fija: **"Llamar a la línea de mi banco"** (ícono Phone, primario, `flex-1`, mínimo 52 px) + **"Más ayuda"** (secundario, ChevronDown, `aria-expanded`, `aria-controls="panel-mas-ayuda"`).
   - Panel `#panel-mas-ayuda` (solo si está abierto, encima de la fila): **"Cómo denunciar en Colombia"** y **"Empezar de nuevo"**, botones secundarios de ancho completo (mínimo 44 px). Se cierra al elegir, al volver a tocar "Más ayuda" o con Esc (el foco vuelve a "Más ayuda").
   - Posición: `bottom-barra` si hay barra inferior; si no, `bottom-0`. Fondo `superficie`, borde superior `borde`.
8. Un único `Dialogo` de confirmación (R7, R12), controlado por el estado `confirmacion`:

   | `confirmacion` | Título | Texto | Botones |
   |---|---|---|---|
   | `{ tipo: "salir", destino }` | "¿Salir del asistente?" | "Perderás el paso en que vas." | "Seguir aquí" (primario, foco inicial) · "Salir" (secundario) → `navegar(destino)` |
   | `{ tipo: "reiniciar" }` | "¿Empezar de nuevo?" | "Perderás el paso en que vas." | "Seguir aquí" (primario, foco inicial) · "Empezar de nuevo" (secundario) → `reiniciar()` |

   La X, Esc y "Seguir aquí" cierran sin cambios y devuelven el foco al control que abrió el diálogo.

## Comportamiento

| Evento | Efecto en pantalla |
|---|---|
| Tocar opción | `conversacion.elegir(id)` → mensajes nuevos, foco en la primera opción nueva (o en el último mensaje si no hay), desplazamiento al final (R6) |
| "Llamar a la línea de mi banco" / "Más ayuda" → "Cómo denunciar en Colombia" | `mostrarLineasBancarias()` / `mostrarCanalesDenuncia()` (y se cierra el panel); el foco va a la primera opción pendiente (la misma de antes) o al mensaje nuevo si no hay |
| "Más ayuda" → "Empezar de nuevo" | Sin progreso: nada. Con progreso: `confirmacion = { tipo: "reiniciar" }`. Al confirmar: `reiniciar()`, foco en la primera situación, desplazamiento arriba de la conversación |
| "Atrás", barra inferior o "Volver al inicio" | `interceptarSalida(destino)`: sin progreso, navega; con progreso, `confirmacion = { tipo: "salir", destino }` |
| Confirmar salida / recargar / cerrar pestaña | Estado descartado; nada en `localStorage` ni `history.state`; recargar o cerrar no piden confirmación |

## Prohibido en esta pantalla

- `<input>`, `<textarea>` o `contenteditable`.
- Animaciones de "escribiendo" o retardos.
- Hex sueltos o íconos fuera de §7.9.
- Peticiones de red.
