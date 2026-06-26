# CONTEXT.md — Estado actual del juego Aetheria
> Actualizado: 2026-06-25. Leer esto ANTES de tocar ningún fichero de código.
> **Plan completo y backlog en `docs/plan.md` y `docs/backlog.md` (en git)**

---

## 🎮 ¿Qué es el juego?
Idle de gestión de colonia medieval. Ciclo día/noche configurable. El jugador
recolecta recursos, construye edificios, gestiona colonos y produce comida/bienes.
Stack: HTML + Vanilla JS + CSS. Sin frameworks. Sin npm. Abre directo en navegador.

---

## ✅ Sistemas completamente implementados

### Recursos en `state`
```
gold, wood, stone, food (calculado)
wheat, potato, carrot, berries         ← sub-alimentos crudos
cooked_wheat, cooked_potato, cooked_carrot, cooked_berries  ← cocinados
seeds: { wheat, potato, carrot }       ← semillas para granjas
```

### Edificios en `state` (todos con array de objetos)
```
houses[]       ← {id, tier:1/2/3}
lumberMills[]  ← {id, tier, workerAssigned, isUnderConstruction, ...}
quarries[]     ← igual
farms[]        ← {id, tier, workerAssigned, crop, stage, stageElapsed, activeCrop, ...}
bonfires[]     ← {id, tier:1/2/3, workerAssigned, selectedRecipe, elapsed, isRunning}
markets[]      ← {id, tier, workerAssigned, elapsed, isRunning}
granaries[]    ← {id, tier, workerAssigned, selectedCrop, elapsed, isRunning, isUnderConstruction, ...}
townHall       ← {built, tier:1/2/3, isUpgrading, isUnderConstruction, workerAssigned}
```

### Colonos en `state.colonists[]`
```javascript
{
  id, name: "Aldric Ashwood",
  job: null | 'wood' | 'stone' | 'berries' | 'lumbermills_0' | 'farms_2' | etc.,
  attributes: { woodcutting, mining, farming, cooking, trading, exploration, combat, construction },
  attributeXP: { ... },   // XP sube con el trabajo, al llenarse → atributo++
  onMission: false, missionId: null,
  isStarving: false
}
```

### Contratación
- `state.candidates[]` — 3 candidatos siempre disponibles
- Se rotan automáticamente cada X días (configurable en `timings.csv`)
- Se puede rotar manualmente pagando oro (precios.csv → `rotate_candidates`)
- Coste contratación: desde CSV `buildings.csv → hire_colonist`

### Ciclo día/noche
- Configurable: `timings.csv → day_duration` (default 100s) / `night_duration` (5s)
- Colonos comen 2 veces: al amanecer y al anochecer (`feedColonistsMorning/Evening`)
- Prioridad de comida drag-and-drop configurada por el jugador
- Sistema de eficiencia: hambre y falta de casa reducen producción

### Granjas — etapas
```
'idle' → 'plow' → 'sow' (consume semilla) → 'water' → 'grow' → cosecha → 'plow'
```
Si no hay semilla al llegar a 'sow': granja se queda esperando.

### Fogata (bonfire) — tiers
- T1 Fogata: cocina 1 alimento cada 5s auto / 20s manual (configurable)
- T2 Caldero: mejora tiempos
- T3 Cocina de Taberna: mejora más

### Mercado — dos modos
- **Manual**: compra/venta x1/x10/x100 en pestaña Recolección
- **Automático**: auto-buy/sell con thresholds configurables por recurso

### Ayuntamiento — gates de tier
- Sin townHall: `state.maxBuildingTier = 0`, solo recolección manual
- T1: desbloquea construcción de edificios básicos
- T2: desbloquea upgrades T2
- T3: desbloquea upgrades T3

---

## 📐 Patrones de código importantes

### getAttributeMult(level)
```javascript
// En gameloop.js — producción escalada por atributo del colono
return 1 + ((level || 3) - 3) * 0.1;
// Nivel 3 (base) → x1.0 | Nivel 6 → x1.3 | Nivel 1 → x0.8
```

### Obtener colonos por trabajo
```javascript
state.colonists.filter(c => c.job === 'lumbermills_0')  // colonos en aserradero 0
state.colonists.filter(c => c.job === null)              // libres
state.colonists.filter(c => !c.onMission && c.job === null)  // libres y no en misión
```

### updateGlobalFood()
```javascript
// SIEMPRE llamar después de modificar wheat/potato/carrot/berries/cooked_*
// Recalcula state.food como suma ponderada según CONFIG.FoodEquivalence
updateGlobalFood();
```

### Añadir edificio al gameTick
```javascript
// Patrón en gameloop.js — bloque de día (dentro del if timePhase==='day'):
if (Array.isArray(state.miEdificio)) {
  state.miEdificio.forEach((ed, idx) => {
    if (ed.isUnderConstruction || !ed.workerAssigned) return;
    ed.elapsed += delta / dayDuration;
    const timing = CONFIG?.Timing?.miEdificio_prod?.yield || 5;
    if (ed.elapsed >= timing) {
      ed.elapsed = 0;
      // producir recurso
    }
  });
}
```

### Patrón de migración en loadGame()
```javascript
// Al añadir nueva propiedad al state, añadir en loadGame():
if (typeof state.miNuevoProp === 'undefined') state.miNuevoProp = valorDefault;
if (!Array.isArray(state.miNuevoArray)) state.miNuevoArray = [];
```

---

## 🗂️ CSVs — Estructura actual (refactorización 2026-06-25)

> El `data-loader.js` parsea todos los CSVs al objeto global `CONFIG`.
> Acceso: `CONFIG.Categoria.id.campo`
> Los comentarios con `#` al inicio de línea son ignorados por el parser.

| Archivo | Categorías | Columnas clave |
|---------|-----------|----------------|
| `buildings.csv` | `Building`, `Upgrade` | `ID;Name;Tier;Req_TH;Cost_Gold;Cost_Wood;Cost_Stone;Cost_Iron;Yield_Pop;Attribute` |
| `timings.csv` | `Cycle`, `Construction`, `Production`, `Crop` | `ID;Name;Duration` |
| `production.csv` | `Gathering`, `Building`, `Crop`, `Processing`, `Crafting` | `ID;Name;Output;Output_Amt;Input;Input_Amt;Attr` |
| `prices.csv` | `Buy`, `Sell`, `Action` | `ID;Name;Resource;Amount;Gold_Each;Min_Stock` |
| `equivalences.csv` | `FoodEquivalence`, `FoodNeed` | `ID;Name;Food_Value` |
| `levelling.csv` | `XPCurve`, `XPYield` | `ID;Name;Value;Attr` |
| `weights.csv` | `AttributeWeight` | `Level;Name;Weight` |
| `mechanics.csv` ⭐ | `Colonist`, `Efficiency`, `TierMult`, `Economy`, `Raid`, `Tool` | `ID;Name;Value` |
| `resources.csv` ⭐ | `Currency`, `Material`, `Raw`, `Cooked`, `Seed`, `Processed`, `Animal` | `ID;Name;Emoji;Food_Value;Sellable;Min_Stock_Def;Max_Stock_Def` |

### Ejemplos de acceso en código
```javascript
// Antes (hardcodeado en JS):
const mult = 1 + ((level - 3) * 0.1);
const noHousePenalty = 0.40;
const farmTierMult = farmTier === 2 ? 1.5 : 2.5;

// Ahora (desde CSV):
const scale = CONFIG?.Colonist?.attr_scale?.value ?? 0.1;
const noHousePenalty = CONFIG?.Efficiency?.no_house?.value ?? 0.40;
const farmTierMult = CONFIG?.TierMult?.[`farm_t${farmTier}`]?.value ?? 1.0;
const tierMult = CONFIG?.TierMult?.[`lumbermill_t${tier}`]?.value ?? 1.0;
```

### Campos del parser (compatibilidad legacy + nuevo)
El `parseCSV` detecta automáticamente columnas por nombre. Columnas aceptadas:
- `type` ó `id` → identificador del registro
- `yield_amount` ó `value` ó `output_amt` ó `food_value` → valor numérico principal
- `yield_type` ó `output` → tipo de recurso producido
- `extra_info` ó `notes` → notas (no usadas por la lógica)

---

## 🚫 NO implementado (próximos pasos)
Ver plan completo: `docs/plan.md`

- **Paso A**: Tablón de pedidos + `state.reputation` + `state.orders`
- **Paso C**: Sistema de misiones + `src/data/missiondata.csv` + colonos especialistas
- **Paso E**: Herramientas + Taller del Herrero + `state.tools[]` + `state.smithies[]`
- **Paso G**: Mineral de hierro + Forja + `state.iron` + `state.iron_bars` + `state.forges[]`
- **Paso I**: Ganadería + `state.animals[]` + `state.eggs/feathers/skins/fertilizer`
- **Paso K**: Molino + `state.flour` + `state.bread` + `state.mills[]`
- **Paso L**: Armería + `state.armories[]` + `state.equipment{}`
- **Paso N**: Bandidos + `state.raids[]` + `state.defensePoints`
- **Paso Q**: Panel dev (Ctrl+Shift+D) + `devSpeedMultiplier`
- **Paso V**: Tutorial de primera partida

> ⚠️ El código en `gameloop.js` y `buildings.js` aún usa algunos valores hardcodeados
> (como `1 + (level-3) * 0.1` o `farmTier === 2 ? 1.5 : 2.5`).
> Migrarlos a `CONFIG.TierMult` y `CONFIG.Colonist` es opcional y puede hacerse
> de forma incremental en cada paso sin romper nada.

---

## 💾 Convención de backups
- Botón "💾 Backup ZIP" en la cabecera del juego
- ZIPs guardados en `bkp/`
- Formato nombre: `aetheria_bkp_v[Paso]_[descripcion].zip`
