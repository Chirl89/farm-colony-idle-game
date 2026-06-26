# ✅ Backlog de Tareas Completadas — Aetheria: Granja & Colonia

> Historial de todo lo ya implementado. Se añaden entradas cuando el usuario confirma la finalización de un paso.
> Última actualización: 2026-06-19

---

## 🎮 MVP Inicial (Chat: Farm Colony Idle MVP)
> Implementado en el chat `163c5402-7af8-4f5a-9fa1-4122ff034502` — 2026-06-16

| # | Feature | Descripción |
|---|---------|-------------|
| M1 | **MVP completo** | Juego idle de granja y colonia en un solo `index.html` |
| M2 | **Estado global** | Variables: Oro, Madera, Piedra, Comida, Comida Envasada, Colonos |
| M3 | **Panel de recursos** | Barra global siempre visible con tasas de generación |
| M4 | **Recolección manual** | Botones de click para Madera y Piedra |
| M5 | **Asignación de colonos** | Colonos asignables a recolección manual automática (+1 recurso/3s) |
| M6 | **3 parcelas de cultivo** | Trigo (5🪙/5s/15🍎), Patata (10🪙/10s/35🍎), Zanahoria (20🪙/18s/80🍎) |
| M7 | **Auto-siembra** | Colono asignado a parcela re-siembra automáticamente si hay oro |
| M8 | **Panel de Colonia** | Casa Básica, Mejora de Casa, Contratar Colono con prerrequisitos |
| M9 | **Envasadora** | Construcción (requiere 1 colono), modo manual (1s), modo auto con colono (5s) |
| M10 | **Comercio** | Vender Comida x10 → 15🪙 / Vender Comida Envasada x10 → 100🪙 |
| M11 | **Guardado persistente** | localStorage: auto-guardado cada 10s + manual + reset |
| M12 | **Diseño glassmorphism** | Tema oscuro premium, fuente Outfit, efectos de vidrio, micro-animaciones |
| M13 | **Fix auto-update UI** | Corrección: updateUI() no se llamaba desde gameTick() automático |

---

## 🔧 Mejoras Post-MVP (Chat: Farm Colony Idle MVP — continuación)
> Implementado en el mismo chat — 2026-06-16 al 2026-06-18

*(Se completarán cuando el subagente termine de analizar el transcript completo)*

---

## 📋 Plan Principal (Chat: este chat — 8ea6f553)

| Paso | Descripción | Fecha |
|------|-------------|-------|
| ✅ 1 | Corrección cooldown: reloj in-game (30 minutos de juego) | 2026-06-18 |
| ✅ FR-1..13 | Refactorización multi-fichero completa (estructura `src/js/`, `src/css/`, `src/data/`) | 2026-06-24 |
| ✅ CSV-R | Reorganización completa de CSVs — nuevos schemas y 2 ficheros nuevos | 2026-06-25 |

---

## 🗂️ Estructura de ficheros actual (completada)

```
farm-colony-idle-game/
├── index.html              ← Solo HTML + script tags (~700 líneas)
├── .agents/
│   ├── AGENTS.md           ← Reglas del agente
│   └── CONTEXT.md          ← Contexto del juego (leer antes de codificar)
├── docs/
│   ├── plan.md             ← Plan de iteración (git)
│   ├── backlog.md          ← Este fichero (git)
│   └── prompts.md          ← Plantillas de chat (git)
├── src/
│   ├── css/styles.css
│   ├── js/
│   │   ├── utils.js        ← formatNumber, showToast, createBackupZip
│   │   ├── data-loader.js  ← loadAllCSVs, parseCSV, CONFIG global
│   │   ├── gamestate.js    ← DEFAULT_STATE, save/load/reset
│   │   ├── buildings.js    ← buildX(), upgradeX(), hireColonist()
│   │   ├── gameloop.js     ← gameTick(), feedColonists(), recalculateRates()
│   │   ├── ui-render.js    ← renderX(), updateUI()
│   │   └── ui-events.js    ← initEventHandlers()
│   └── data/
│       ├── buildings.csv   ← Building;Upgrade — costes y tiers
│       ├── timings.csv     ← Cycle;Construction;Production;Crop — duraciones
│       ├── production.csv  ← Gathering;Building;Crop;Processing;Crafting — yields
│       ├── prices.csv      ← Buy;Sell;Action — precios mercado
│       ├── equivalences.csv← FoodEquivalence;FoodNeed — nutrición
│       ├── levelling.csv   ← XPCurve;XPYield — subida de nivel
│       ├── weights.csv     ← AttributeWeight — distribución inicial atributos
│       ├── mechanics.csv ⭐← Colonist;Efficiency;TierMult;Economy;Raid;Tool
│       └── resources.csv ⭐← Registro maestro de todos los recursos
└── bkp/                    ← ZIPs de backup (.gitignore recomendado)
```

