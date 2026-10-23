# Contrato: pantalla Tips y componentes

Referencia visual: `scripts/prototipos/prototipo-tips.html`. Diferencias permitidas: spec, "Decisiones frente al prototipo".

## Hook (`useEstadoEscudo`) → `Tips.jsx`

`escudo.tips = { visibles, filtro, tipAbierto, progreso, reto, cambiarFiltro(canal), alternarTip(id), marcarTrampa(id, i), responder(id, j) → { correcta, mensaje } }`

- Estado inicial: `filtro = null`, `tipAbierto = TIPS[0].id`.
- `cambiarFiltro` deja `tipAbierto = null`.
- `alternarTip(id)` abre `id` o, si ya estaba abierto, cierra.
- `responder` guarda los retos si cambió el progreso; si falla, aviso amigable existente.

## Componentes (`src/components`)

| Componente | Props | Responsabilidad |
|---|---|---|
| `FraseTrampa` | `texto`, `encontrada`, `onActivar` | `span role="button"`, teclado Enter/Espacio, `aria-pressed`, pop (R6, R7). |
| `MensajeEjemplo` | `tip`, `segmentos`, `encontradas`, `onActivarTrampa(i)` | Caja punteada, "De:" / "Lo que te dicen:", hora, "Ejemplo", burbuja. |
| `MiniReto` | `reto`, `onResponder(j) → { correcta, mensaje }` | Caja `primario-suave`, 3 opciones, fallo rojo deshabilitado, acierto verde y bloqueo, mensaje en `aria-live`. |
| `BarraProgreso` | `progreso` | Texto "X de 8 retos superados" + barra (`aria-hidden`). |
| `FiltrosCanal` | `canales`, `activo`, `onCambiar` | `role="group"`, chips `aria-pressed`, 44 px. |
| `TarjetaTip` | `tip`, `abierta`, `superado`, `segmentos`, `encontradas`, `onAlternar`, `onActivarTrampa`, `onResponder` | Cabecera con `aria-expanded`/`aria-controls`; cuerpo con los 5 bloques; caja "Trampa:" en `aria-live`. |

## Textos (`TEXTOS_TIPS`)

titulo, subtitulo, etiquetaRegla ("Regla de oro"), filtrosAria ("Filtrar por canal"), progreso(s, t), asiSeVe, contadorTrampas(n, t) ("n de t trampas"), de ("De:"), loQueTeDicen ("Lo que te dicen:"), ejemplo, ayudaTrampas, prefijoTrampa ("Trampa:"), todasEncontradas ("¡Las encontraste todas!"), comoReconocerla, queHacer, retoSuperado ("Reto superado"), prefijoDato ("Dato:"), emergenciaPregunta ("¿Ya caíste en una?"), emergenciaAccion ("Ve a Emergencia y sigue los primeros auxilios.").
