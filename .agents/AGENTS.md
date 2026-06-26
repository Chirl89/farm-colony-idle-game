# AGENTS.md — Aetheria: Granja & Colonia
> Rutas locales al proyecto — todo en git bajo `farm-colony-idle-game/`

## Rol del agente
Eres un desarrollador senior trabajando en el juego idle **Aetheria: Granja & Colonia**.
El usuario NO quiere que ejecutes el código — solo que lo modifiques.
Siempre que el usuario diga "paso X completado", mueve ese paso al backlog.

---

## ⚡ Reglas de eficiencia de tokens

1. **Lee SOLO el fichero que vas a modificar** en ese paso. No leas todos.
2. **Antes de empezar cualquier tarea**, lee `CONTEXT.md` (este directorio) para saber qué hay implementado. No leas el código para descubrirlo.
3. **Referencia el plan** en `brain/8ea6f553-bf44-47fd-b41f-4f44add1dc94/plan_v2_aetheria.md` antes de proponer cambios.
4. **No leas `ui-render.js` completo** — tiene 170 KB. Busca con grep la función específica que necesites editar.
5. **No propongas más de 1 paso por turno** salvo que el usuario lo pida explícitamente.
6. Si necesitas ver una función específica, usa `grep_search` primero para localizar la línea, luego `view_file` con rango estrecho.

---

## 🗂️ Mapa de ficheros (NO leer completos salvo necesidad)

| Fichero | Responsabilidad | Tamaño |
|---------|----------------|--------|
| `index.html` | Solo HTML + links a scripts. < 700 líneas | 38 KB |
| `src/css/styles.css` | Todo el CSS del juego | 26 KB |
| `src/js/utils.js` | formatNumber, showToast, createBackupZip | 12 KB |
| `src/js/data-loader.js` | loadAllCSVs, parseCSV, CONFIG global | 24 KB |
| `src/js/gamestate.js` | DEFAULT_STATE, save/load/reset, generateColonist | 30 KB |
| `src/js/buildings.js` | buildX(), upgradeX(), hireColonist() | 39 KB |
| `src/js/gameloop.js` | gameTick(), feedColonists(), recalculateRates() | 53 KB |
| `src/js/ui-render.js` | renderX() funciones, updateUI() | 170 KB ⚠️ |
| `src/js/ui-events.js` | initEventHandlers(), listeners | 31 KB |
| `src/data/*.csv` | Configuración dinámica, editable sin tocar JS | varios |

**Variables globales accesibles en todo el código:** `state`, `CONFIG`, `GAME_MISSIONS`

---

## 📋 Plan activo
Ver: `docs/plan.md` (en la raíz del proyecto, en git)
Próximo paso: **PASO A** — Tablón de pedidos

Backlog completado: `docs/backlog.md`
Prompts para nuevas conversaciones: `docs/prompts.md`

---

## 🏗️ Patrones de código establecidos

### Construir un edificio nuevo
1. CSV: añadir fila en `buildings.csv` y `timings.csv`
2. Estado: añadir array en `DEFAULT_STATE` en `gamestate.js`
3. Lógica: `buildX()` en `buildings.js` (copiar patrón de `buildGranary`)
4. Producción: añadir bloque en `gameTick()` en `gameloop.js`
5. Render: añadir `renderX()` en `ui-render.js` + llamarla desde `updateUI()`
6. HTML: añadir ítem en pestaña Construcción + div lista en pestaña Producción

### Añadir un recurso nuevo
1. `gamestate.js` → `DEFAULT_STATE`: `miRecurso: 0`
2. `gamestate.js` → `loadGame()`: migración `if (typeof state.miRecurso === 'undefined') state.miRecurso = 0`
3. `ui-render.js` → `renderResourcesDetails()`: añadir mini-card

### Añadir un CSV nuevo
1. Crear fichero en `src/data/`
2. `data-loader.js` → añadir al array `CSV_FILES`
3. Añadir parse y fallback `DEFAULT_CSV_DATA.nombreCsv`

---

## 🚫 Lo que NO está implementado (no asumir que existe)
- Misiones externas / missiondata.csv
- Tablón de pedidos / reputación
- Herramientas (pico, hacha, azada) y Taller del Herrero
- Forja / mineral de hierro / lingotes
- Ganadería (animales, huevos, pieles)
- Molino / harina / pan
- Armería / equipo para colonos
- Sistema de bandidos / raids
- Panel de desarrollo (Ctrl+Shift+D)
- Tutorial de primera partida
