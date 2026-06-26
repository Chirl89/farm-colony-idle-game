# Plan de Implementacion v4 - Aetheria: Granja & Colonia
## Reordenado por prioridad optima de implementacion (2026-06-26)

> REGLAS:
> - Cada paso indica archivos exactos. Solo tocar esos.
> - Al completar: avisar -> marca completado -> mover a docs/backlog.md.
> - Backups = boton "Backup ZIP" en la UI del juego.
> - CSVs de test se generan AL COMPLETAR cada bloque (ver test/README.md).
> - ui-render.js ~170KB: usar grep_search antes de view_file.

---

## YA IMPLEMENTADO (no tocar)

| Sistema | Archivos | Estado |
|---------|----------|--------|
| Estructura multi-fichero | index.html, src/js/, src/css/, src/data/ | OK |
| Estado global + save/load/reset | src/js/gamestate.js | OK |
| Reloj in-game + cooldown 30min | src/js/gameloop.js | OK |
| Ciclo dia/noche configurable | src/js/gameloop.js, timings.csv | OK |
| Recoleccion manual madera/piedra/frutos | buildings.js, ui-events.js | OK |
| Asignacion colonos a edificios | ui-render.js, ui-events.js | OK |
| Etapas de cultivo plow/sow/water/grow | gameloop.js, ui-render.js | OK |
| Sistema de semillas + Granero 3 tiers | buildings.js, gameloop.js | OK |
| Fogata / Caldero / Cocina (3 tiers) | buildings.js, gameloop.js | OK |
| Colonos: nombre + 8 atributos + XP | gamestate.js | OK |
| 3 candidatos para contratar | ui-render.js | OK |
| Eficiencia colonia: hambre/vivienda | gameloop.js | OK |
| Prioridad de comida (drag) | ui-render.js | OK |
| Mercado automatico + manual | gameloop.js, ui-render.js | OK |
| Ayuntamiento T1/T2/T3 (gate) | buildings.js, ui-render.js | OK |
| Backup ZIP + importar CSV | utils.js, data-loader.js | OK |
| Modo Test 10K | gamestate.js | OK |
| CSVs reorganizados (9 archivos) | src/data/ | OK |

---

## TABLA DE SEGUIMIENTO

| # | Paso | Riesgo | Descripcion | Archivos clave | Estado |
|---|------|--------|-------------|----------------|--------|
| **BLOQUE 0 -- Quick Wins (sin dependencias)** ||||||
| 1 | Q | Verde | Panel de desarrollo Ctrl+Shift+D | ui-render.js, ui-events.js | Pendiente |
| 2 | M1 | Verde | Tasas de produccion en dias de juego | ui-render.js | Pendiente |
| 3 | M2 | Verde | Renombrar Ayto por tiers | buildings.csv, ui-render.js | Pendiente |
| 4 | M4 | Verde | Hambre reactiva | gameloop.js | Pendiente |
| **BLOQUE 1 -- Infraestructura basica** ||||||
| 5 | M5 | Amarillo | Jugador bloqueado durante construccion | gamestate.js, gameloop.js, ui | Pendiente |
| 6 | M3 | Rojo | Pozo de agua | 8 archivos | Pendiente |
| 7 | M6 | Rojo | Almacenes + capacidad maxima | 8 archivos | Pendiente |
| 7.B | BACKUP | - | Backup vBloque1 | - | Pendiente |
| **BLOQUE 2 -- Produccion y reputacion** ||||||
| 8 | M11 | Verde | Aleatoriedad en produccion | production.csv, gameloop.js | Pendiente |
| 9 | A | Amarillo | Tablon de pedidos (reputacion) | 6 archivos | Pendiente |
| 10 | C | Rojo | Sistema de misiones completo | missiondata.csv + 8 archivos | Pendiente |
| 10.B | BACKUP | - | Backup vBloque2 | - | Pendiente |
| **BLOQUE 3 -- Arbol de tecnologia** ||||||
| 11 | M9 | Rojo | Arbol de tecnologia | tech.csv + 6 archivos | Pendiente |
| 11.B | BACKUP | - | Backup vBloque3 | - | Pendiente |
| **BLOQUE 4 -- Herramientas y metal** ||||||
| 12 | E | Amarillo | Herramientas + Taller del Herrero | 8 archivos | Pendiente |
| 13 | G | Amarillo | Mineral de hierro + Forja | 8 archivos | Pendiente |
| 13.B | BACKUP | - | Backup vBloque4 | - | Pendiente |
| **BLOQUE 5 -- Sistema de trabajo (RUPTURA)** ||||||
| 14 | M7 | Rojo | Prioridades de colonos [RUPTURA] | 4 archivos | Pendiente |
| 15 | M8 | Amarillo | Prioridades de edificios | 3 archivos | Pendiente |
| 16 | M15 | Rojo | Slots multiples por tier | mechanics.csv + 4 archivos | Pendiente |
| 16.B | BACKUP | - | Backup vBloque5 | - | Pendiente |
| **BLOQUE 6 -- Cadena alimentaria** ||||||
| 17 | I | Amarillo | Ganaderia + sub-productos | 6 archivos | Pendiente |
| 18 | K | Amarillo | Molino + cadena harina->pan | 8 archivos | Pendiente |
| 19 | M17 | Amarillo | Trigo->grano+paja [MIGRACION CRITICA] | 6 archivos + grep | Pendiente |
| 19.B | BACKUP | - | Backup vBloque6 | - | Pendiente |
| **BLOQUE 7 -- Combate y defensa** ||||||
| 20 | L | Amarillo | Armeria + equipo para colonos | 7 archivos | Pendiente |
| 21 | N | Rojo | Sistema de bandidos e incursiones | 5 archivos | Pendiente |
| 22 | O | Amarillo | Escalado de raids + historial | gameloop.js, ui-render.js | Pendiente |
| 23 | M14 | Amarillo | Murallas + Puestos de guardia | 8 archivos | Pendiente |
| 23.B | BACKUP | - | Backup vBloque7 | - | Pendiente |
| **BLOQUE 8 -- Medioambiente** ||||||
| 24 | M12 | Rojo | Estaciones del anyo | 4 archivos | Pendiente |
| 25 | M13a | Amarillo | Quemador + recurso Calor | 8 archivos | Pendiente |
| 26 | M13b | Amarillo | Calor en casas (invierno) | 3 archivos | Pendiente |
| 26.B | BACKUP | - | Backup vBloque8 | - | Pendiente |
| **BLOQUE 9 -- Materiales avanzados** ||||||
| 27 | M16 | Verde | Recolector de barro | 10 archivos | Pendiente |
| 28 | M18 | Amarillo | Adobe + aislamiento de casas | 7 archivos | Pendiente |
| 28.B | BACKUP | - | Backup vBloque9 | - | Pendiente |
| **BLOQUE 10 -- Pulido final** ||||||
| 29 | R | Amarillo | Panel de metricas de economia | gameloop.js, ui-render.js | Pendiente |
| 30 | T | Amarillo | Balance pass de CSVs | CSVs | Pendiente |
| 31 | V | Amarillo | Tutorial de primera partida | 5 archivos | Pendiente |
| 32 | M10 | Amarillo | Vista 2D del pueblo (opcional) | ui-render.js, CSS | Pendiente |

---

## POR QUE ESTE ORDEN?

```
BLOQUE 0 primero: Q (panel dev) acelera todos los tests siguientes.
                  M1/M2 son cosmetics sin riesgo. M4 es 1 solo archivo.

BLOQUE 1: M5 antes que M3 (M5 mas simple). M3 antes que M6 porque el agua
          afecta granjas que ya existen. M6 crea el sistema de capacidad
          que todos los bloques siguientes produciran mas recursos.

BLOQUE 2: M11 (aleatoriedad) antes que A/C porque las misiones usan tasas
          de produccion. A antes que C (C depende de A para reputacion).

BLOQUE 3: M9 (arbol tech) DESPUES de tener reputacion (de A/C) para poder
          investigar. Si se pone antes, el arbol no tiene valor.

BLOQUE 4: E antes que G (G usa herramientas de E para el pico de hierro).
          Ambos antes de M7 porque M7 cambia como los colonos se asignan
          a estos edificios.

BLOQUE 5: M7 (RUPTURA) en bloque propio. M8 depende de M7.
          M15 (slots) depende de M7. Juntos para que la regresion sea acotada.

BLOQUE 6: I (ganaderia) usa fertilizante en granjas que ya existen.
          K (molino) convierte el trigo que produce la granja.
          M17 (grano+paja) DESPUES de K porque K usa wheat/trigo --
          si renombramos antes, K tiene que refactorizarse dos veces.

BLOQUE 7: L antes que N (N usa armaduras de L para defensa).
          O despues de N (escala raids existentes).
          M14 (murallas) DESPUES de N porque sin raids, las murallas
          no tienen sentido.

BLOQUE 8: M12 (estaciones) antes que M13a/b (calor en invierno requiere
          saber que es invierno). M13b depende de M12 + M13a.

BLOQUE 9: M16 (barro) antes que M18 (adobe usa barro).
          M17 antes que M18 (adobe usa paja -- ya resuelta en bloque 6).

BLOQUE 10: R (metricas) antes que T (necesitas ver las metricas para
           hacer el balance). V (tutorial) al final cuando el juego
           esta completo. M10 (vista 2D) opcional, sin impacto en gameplay.
```

---

## PLAN DETALLADO EN ORDEN DE IMPLEMENTACION

---

## BLOQUE 0 -- Quick Wins (sin dependencias, sin riesgo)

---

### PASO Q — 🟢 Panel de desarrollo (modo dev) ⬜

**Archivos:** `src/js/ui-render.js`, `src/js/ui-events.js`, `src/css/styles.css`

```
En src/js/ui-events.js:
  let devSpeedMultiplier = 1;
  let devModeActive = false;

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') toggleDevPanel();
  });

  function toggleDevPanel():
    devModeActive = !devModeActive;
    const panel = document.getElementById('dev-panel');
    if (panel) panel.style.display = devModeActive ? 'block' : 'none';

En src/js/gameloop.js:
  En el cálculo de delta: const effectiveDelta = delta * (devSpeedMultiplier || 1)
  (sustituye todas las ocurrencias de delta en gameTick por effectiveDelta)

En src/js/ui-render.js — función renderDevPanel() (llama a updateUI()):
  Renderiza contenido del panel dev (si cambia devSpeedMultiplier)

En index.html — añade al final del body (antes del toast-container):
  <div id="dev-panel" style="display:none; position:fixed; bottom:1rem; right:1rem;
       background:rgba(0,0,0,0.85); border:1px solid rgba(99,102,241,0.5);
       padding:1rem; border-radius:0.75rem; z-index:9999; min-width:220px;">
    <div style="font-size:0.7rem; color:#a5b4fc; text-transform:uppercase;
         font-weight:700; margin-bottom:0.75rem;">⚙️ Panel Dev (Ctrl+Shift+D)</div>
    
    <!-- Velocidad -->
    <div style="margin-bottom:0.75rem;">
      <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.35rem;">⏱️ Velocidad:</div>
      <div style="display:flex; gap:0.35rem;">
        <button onclick="devSpeedMultiplier=1" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">x1</button>
        <button onclick="devSpeedMultiplier=5" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">x5</button>
        <button onclick="devSpeedMultiplier=10" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">x10</button>
        <button onclick="devSpeedMultiplier=50" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">x50</button>
      </div>
    </div>
    
    <!-- Inyectar recursos -->
    <div style="margin-bottom:0.75rem;">
      <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.35rem;">💰 Inyectar +500:</div>
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
        <button onclick="state.gold+=500;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🪙 Oro</button>
        <button onclick="state.wood+=500;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🪵 Madera</button>
        <button onclick="state.stone+=500;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🪨 Piedra</button>
        <button onclick="state.wheat+=500;updateGlobalFood();updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🌾 Trigo</button>
        <button onclick="state.reputation=(state.reputation||0)+100;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🏆 Rep</button>
      </div>
      <button onclick="state.gold+=10000;state.wood+=10000;state.stone+=10000;state.wheat+=1000;state.potato+=1000;state.carrot+=1000;updateGlobalFood();updateUI()" class="btn" style="width:100%;margin-top:0.35rem;background:#7c3aed;color:#fff;padding:0.3rem;font-size:0.75rem;">⚡ Max All</button>
    </div>
    
    <!-- Ciclo -->
    <div>
      <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.35rem;">☀️ Ciclo rápido:</div>
      <div style="display:flex; gap:0.35rem;">
        <button onclick="state.timePhase='day';state.phaseElapsed=0;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🌅 Amanecer</button>
        <button onclick="state.timePhase='night';state.phaseElapsed=0;updateUI()" class="btn btn-secondary" style="flex:1;padding:0.25rem;font-size:0.7rem;">🌙 Noche</button>
      </div>
    </div>
  </div>

✅ Verificar: Ctrl+Shift+D abre/cierra panel; x50 acelera visiblemente el juego.
```

---

---

### M1 -- VERDE Mostrar producciones en dias de juego [PENDIENTE]

Archivos: src/js/ui-render.js, src/js/gameloop.js

OBJETIVO: Las tasas de produccion se muestran como "X/dia" en la UI.
          La logica interna no cambia -- solo el display.

En src/js/gameloop.js -- recalculateRates():
  Verificar que calculatedRates.woodRate, stoneRate, etc. son unidades/dia.
  Si estan en /s: multiplicar por dayDuration al exponerlos.

En src/js/ui-render.js -- renderResourcesDetails() y barra de recursos global:
  Buscar con grep: "/s" o "Rate" en ui-render.js
  Cambiar sufijo de display: "/s" -> "/dia"
  Para tasas negativas: mostrar "-X/dia" (consumo)
  Anadir nota pequena "(por dia de juego)" como tooltip.

VERIFICAR -> TEST: test/test_ui_proddia_[timestamp].csv

---

---

### M2 -- VERDE Renombrar Ayuntamiento por tiers [PENDIENTE]

Archivos: src/data/buildings.csv, src/js/ui-render.js, src/js/buildings.js, index.html

OBJETIVO: T1="Casa del Jugador" | T2="Centro Comunitario" | T3="Ayuntamiento"

En buildings.csv: modificar nombres de townhall, townhall_t2, townhall_t3.

En ui-render.js -- grep "Ayuntamiento" y "townhall":
  tier===1 -> "Casa del Jugador"
  tier===2 -> "Centro Comunitario"
  tier===3 -> "Ayuntamiento"

En buildings.js -- grep "Ayuntamiento": actualizar toasts.
En index.html -- grep "Ayuntamiento": actualizar textos hardcodeados.

VERIFICAR: Nombre correcto en cada tier. Logica de gate no se rompe.
TEST: test/test_renombrar_ayto_[timestamp].csv

---

---

### M4 -- AMARILLO Hambre reactiva [PENDIENTE]

Archivos: src/js/gameloop.js

OBJETIVO: Colono hambriento come inmediatamente cuando hay comida disponible,
          sin esperar al siguiente ciclo programado de alimentacion.

En gameTick() -- chequeo continuo despues de la produccion:
  const starvingColonists = state.colonists.filter(c => c.isStarving);
  if (starvingColonists.length > 0 && state.food > 0) {
    starvingColonists.forEach(c => {
      const fed = tryFeedColonist(c);
      if (fed) c.isStarving = false;
    });
    updateGlobalFood();
  }

Extraer tryFeedColonist(colonist) de la logica existente de feedColonists.
No cambiar el comportamiento de colonos no hambrientos.

VERIFICAR:
  - Colono hambriento + comida anadida -> come sin esperar amanecer
  - No hambriento -> no consume fuera de horario
TEST: test/test_hambre_reactiva_[timestamp].csv

---

---

---

## BLOQUE 1 -- Infraestructura basica

---

### M5 -- AMARILLO Jugador bloqueado durante construccion [PENDIENTE]

Archivos: gamestate.js, gameloop.js, ui-render.js, ui-events.js

OBJETIVO: El jugador no puede recolectar manualmente mientras construye.
          Sigue construyendo por la noche.

En gamestate.js: playerBuilding: null  // null | { buildingType, buildingIdx }
  MIGRACION: if (typeof state.playerBuilding === 'undefined') state.playerBuilding = null;

En ui-events.js -- handlers recoleccion manual:
  if (state.playerBuilding !== null) { showToast('Estas construyendo...', 'warning'); return; }
  Al pulsar "Construir yo": state.playerBuilding = { buildingType, buildingIdx }
  Al completarse: state.playerBuilding = null
  Boton "Retirarme": state.playerBuilding = null

En gameloop.js -- bloque NOCHE:
  Si playerBuilding !== null: aplicar playerSpeed=0.25 al edificio activo
  (extender logica que actualmente solo aplica de dia)

En ui-render.js:
  Si playerBuilding: deshabilitar botones recoleccion + badge + banner con boton Retirarme

VERIFICAR:
  - Construir -> recoleccion deshabilitada con toast al intentar
  - Edificio avanza de noche con playerSpeed
  - "Retirarme" libera al jugador
TEST: test/test_jugador_construyendo_[timestamp].csv

---

---

### M3 -- ROJO Pozo de agua [PENDIENTE]

Archivos: buildings.csv, timings.csv, mechanics.csv, gamestate.js, buildings.js, gameloop.js, ui-render.js, index.html

OBJETIVO: El agua es un recurso diario limitado (no se acumula entre dias).
          Sin pozo -> granjas no pueden regar (se bloquean en stage 'water').
          Colonos consumen agua cada manana. El pozo no tiene trabajadores asignados.

En mechanics.csv -- nueva categoria Water:
  Water;well_t1_capacity;Capacidad diaria Pozo T1;50
  Water;well_t2_capacity;Capacidad diaria Pozo T2;120
  Water;colonist_water_need;Consumo diario por colono;2
  Water;water_per_irrigation;Agua por ciclo de riego;5

En buildings.csv: Building;well;Pozo;...
En timings.csv: Construction;well;Construccion Pozo;5

En gamestate.js -- DEFAULT_STATE:
  wells:[], waterToday:0, waterMax:0
  MIGRACION: if (!Array.isArray(state.wells)) state.wells = [];

En buildings.js: buildWell(), upgradeWell(idx), recalculateWaterMax()

En gameloop.js:
  AL AMANECER: state.waterToday = waterMax - (colonists.length * colonistNeed);
  EN RIEGO stage='water': si waterToday < waterCost -> granja espera (no avanza).
                           si >= waterCost -> waterToday -= waterCost; continua.

En ui-render.js:
  renderWells(): lista de pozos (sin asignacion de colonos)
  Card agua en recursos (visible solo si waterMax > 0)
  En renderFarms(): badge "Sin agua hoy" si stage='water' y waterToday=0

VERIFICAR:
  - Sin pozo: granjas en stage water no avanzan
  - Pozo T1 con 10 colonos: 50 - 20 = 30 agua para riego
  - Al amanecer: agua se repone
TEST: test/test_pozo_agua_[timestamp].csv

---

---

### M6 -- ROJO Almacenes + limite de capacidad de recursos [PENDIENTE]

Archivos: buildings.csv, timings.csv, mechanics.csv, gamestate.js, buildings.js, gameloop.js, ui-render.js, index.html

BACKUP antes de este paso.

OBJETIVO: Recursos con capacidad maxima. Ayto da capacidad base por tipo.
          Almacenes la amplian. Oro y reputacion no tienen limite.

En mechanics.csv -- categoria Storage:
  Storage;townhall_t1_capacity;Capacidad base Ayto T1;100
  Storage;townhall_t2_capacity;Capacidad base Ayto T2;200
  Storage;townhall_t3_capacity;Capacidad base Ayto T3;500
  Storage;warehouse_t1_bonus;Bonus Almacen T1;200
  Storage;warehouse_t2_bonus;Bonus Almacen T2;500
  Storage;warehouse_t3_bonus;Bonus Almacen T3;1000

En buildings.csv -- categoria Storage:
  Storage;warehouse_wood;Almacen de Madera;1;1;20;10;0;0;0;none
  Storage;warehouse_stone;Almacen de Piedra;1;1;15;25;0;0;0;none
  Storage;warehouse_food;Almacen de Alimentos;1;1;25;15;0;0;0;none
  Storage;warehouse_seeds;Almacen de Semillas;1;1;20;10;0;0;0;none

En gamestate.js: warehouses:[], storageCapacity:{}
  Funcion recalculateStorageCapacity()

En gameloop.js -- al producir cualquier recurso:
  const cap = state.storageCapacity[recurso] ?? Infinity;
  const toAdd = Math.min(produced, Math.max(0, cap - state[recurso]));
  state[recurso] += toAdd;
  // Warning "almacen lleno" una vez por ciclo

En ui-render.js:
  Barra capacidad en cada card de recurso: < 75%=gris | 75-90%=amarillo | > 90%=rojo
  Badge "LLENO" al 100%
  RENOMBRAR: "Edificios de Produccion" -> "Construcciones" (grep en ui-render.js e index.html)

VERIFICAR:
  - Madera topa en 100 (Ayto T1) y para
  - Almacen de madera -> cap sube a 300
  - Subir Ayto T2 -> caps base suben a 200
TEST: test/test_almacenes_cap_[timestamp].csv + REGRESION: produccion madera, piedra, comida

---

---


> BACKUP: Pulsa 'Backup ZIP' -> guarda como aetheria_bkp_vBloque1.zip
---

## BLOQUE 2 -- Produccion y reputacion

---

### M11 -- VERDE Aleatoriedad en produccion [PENDIENTE]

Archivos: src/data/production.csv, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Cada produccion tiene rango min-max. La cantidad producida es aleatoria.
          La recoleccion manual puede producir 0.

En production.csv -- anadir columnas Output_Min y Output_Max:
  Building;lumbermill_t1;Aserradero T1;wood;15;10;20;...
  Gathering;wood_manual;Recoleccion Manual Madera;wood;1;0;3;...
  Crop;wheat;Cosecha Trigo;wheat;60;40;80;...

En gameloop.js -- en TODOS los bloques de produccion:
  const amount = minAmt + Math.random() * (maxAmt - minAmt);

En ui-render.js -- tasas: mostrar "10-20/dia" en vez de "15/dia"

VERIFICAR: 10 ciclos -> valores entre 10 y 20. Media aprox 15.
TEST: test/test_aleatoriedad_prod_[timestamp].csv

---

---

### PASO A — 🟡 Tablón de pedidos (misiones de entrega de recursos) ⬜

**Archivos:** `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `src/js/ui-events.js`, `index.html`

```
OBJETIVO: El jugador puede generar reputación entregando recursos sin
depender de colonos en misiones externas.

En src/js/gamestate.js — añade a DEFAULT_STATE:
  orders: [],
  ordersRefreshDay: 0,
  reputation: 0

  ESTRUCTURA de pedido:
  { id, resource, amount, reward, deadline, completed: false }

En src/js/buildings.js — función generateDailyOrders():
  Genera 3 pedidos cada vez que state.currentDay > state.ordersRefreshDay
  Recursos posibles: wood, stone, wheat, potato, carrot, berries,
                     cooked_wheat, cooked_potato, cooked_carrot, wheat_seeds,
                     potato_seeds, carrot_seeds
  Cantidad: aleatorio entre 20-100 según recurso
  Recompensa: Math.ceil(amount / 10) * 2 de reputación
  state.ordersRefreshDay = state.currentDay

  Función fulfillOrder(orderId):
    Si state[order.resource] >= order.amount:
      state[order.resource] -= order.amount
      state.reputation += order.reward
      showToast(`✅ Pedido entregado! +${order.reward} Reputación`, 'success')
      order.completed = true
    updateGlobalFood()
    recalculateRates()
    updateUI()

En src/js/gameloop.js — al cambiar de día (transición día):
  if (typeof generateDailyOrders === 'function') generateDailyOrders()

En index.html — añade en el TAB de "Recolección" (tab-basic), después de "Mercado Manual":
  <section class="module-card" id="orders-section">
    <div class="module-title"><span>📋 Tablón de Pedidos</span></div>
    <div id="active-orders-list"><!-- dinámico --></div>
  </section>

  Y añade en la barra de recursos globales (resources-grid):
  <div class="resource-card" id="card-reputation" style="...">
    <div class="resource-info">
      <div class="resource-label"><span>🏆 Reputación</span></div>
      <div class="resource-value" id="res-reputation">0</div>
    </div>
    <div class="resource-icon">🏆</div>
  </div>

En src/js/ui-render.js — función renderOrders():
  3 tarjetas de pedido: icono recurso, cantidad, recompensa Rep, stock actual,
  botón "Entregar" (deshabilitado si no hay stock suficiente)
  Al completar: tarjeta ↔ "✅ Entregado"

  En updateUI() añade: renderOrders()

En src/js/ui-events.js — en initEventHandlers():
  Añade listener delegado para botones "btn-fulfill-order-N"

✅ Verificar: 3 pedidos nuevos cada día; entregar reduce stock y añade reputación.
```

---

---

### PASO C — 🔴 Sistema de misiones (missiondata.csv) ⬜

**Archivos:** `src/data/missiondata.csv` (nuevo), `src/js/data-loader.js`, `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `src/js/ui-events.js`, `index.html`

```
PARTE 1 — CSV de misiones
Crea src/data/missiondata.csv:

Category;ID;Name;Description;Weight;MinDays;MaxDays;Difficulty;Attribute;BaseSuccessRate;RewardRep;RewardGold;RewardSeedsType;RewardSeedsAmt;RewardSpecialist;ColMin;ColMax
Mission;gather_wood;Buscar Madera;La aldea necesita madera urgentemente.;20;2;5;1;woodcutting;0.75;8;0;none;0;none;1;3
Mission;gather_stone;Extraer Piedra;Las canteras necesitan refuerzo.;20;2;5;1;mining;0.75;8;0;none;0;none;1;3
Mission;gather_food;Buscar Provisiones;Los almacenes se agotan.;20;2;5;1;farming;0.80;10;0;none;0;none;1;3
Mission;explore_ruins;Explorar Ruinas;Ruinas avistadas al norte.;12;4;8;2;exploration;0.60;15;5;none;0;none;1;2
Mission;explore_deep;Expedición Profunda;Tierras desconocidas.;5;8;14;3;exploration;0.40;30;20;none;0;none;2;4
Mission;trade_convoy;Escoltar Caravana;Una caravana necesita protección.;12;3;7;2;trading;0.65;12;20;none;0;none;2;3
Mission;gold_delivery;Entrega Especial;Un mercader paga bien.;6;4;8;2;trading;0.70;5;100;none;0;none;1;2
Mission;defend_village;Defender Aldea;Una aldea pide ayuda.;10;3;6;2;combat;0.55;20;10;none;0;none;2;4
Mission;seeds_rare;Buscar Semillas Raras;Plantas únicas en el bosque.;10;5;10;2;farming;0.60;5;0;wheat;2;none;1;3
Mission;seeds_potato;Conseguir Tubérculos;Semillas de un agricultor.;6;4;8;2;farming;0.65;5;0;potato;2;none;1;2
Mission;seeds_carrot;Rastrear Semillas;Jardín abandonado.;6;4;8;2;farming;0.65;5;0;carrot;2;none;1;2
Mission;headhunt_any;Reclutar Especialista;Localizar a un experto.;8;8;15;3;exploration;0.45;0;0;none;0;random;2;4
Mission;headhunt_miner;Reclutar Maestro Minero;Un legendario minero.;4;10;15;3;exploration;0.40;0;0;none;0;mining;2;4
Mission;headhunt_farmer;Reclutar Maestro Agricultor;Un experto en colinas.;4;10;15;3;farming;0.40;0;0;none;0;farming;2;4
Mission;headhunt_warrior;Reclutar Guerrero;Un veterano busca causa.;4;10;15;3;combat;0.40;0;0;none;0;combat;2;4

En src/js/data-loader.js:
  Añade 'missiondata' al array de CSVs a cargar:
    const CSV_FILES = ['buildings','prices','production','timings','missiondata'];
  
  Parsea rows de missiondata.csv a array global GAME_MISSIONS:
    window.GAME_MISSIONS = rows.filter(r => r.Category === 'Mission').map(r => ({
      id: r.ID, name: r.Name, description: r.Description,
      weight: parseFloat(r.Weight), minDays: parseInt(r.MinDays),
      maxDays: parseInt(r.MaxDays), difficulty: parseInt(r.Difficulty),
      attribute: r.Attribute, baseSuccessRate: parseFloat(r.BaseSuccessRate),
      rewardRep: parseInt(r.RewardRep), rewardGold: parseInt(r.RewardGold),
      rewardSeedsType: r.RewardSeedsType, rewardSeedsAmt: parseInt(r.RewardSeedsAmt),
      rewardSpecialist: r.RewardSpecialist,
      colonistsMin: parseInt(r.ColMin), colonistsMax: parseInt(r.ColMax)
    }));
  
  Añade GAME_MISSIONS como fallback DEFAULT_CSV_DATA.missiondata (copiar el CSV como string).

PARTE 2 — Estado
En src/js/gamestate.js — añade a DEFAULT_STATE:
  missions: [],          // misiones activas
  availableMissions: [], // 3 disponibles en la UI
  missionHistory: []

Añade función generateAvailableMissions() (en gamestate.js o buildings.js):
  Selección ponderada de 3 misiones distintas de GAME_MISSIONS
  Para headhunt: solo si no hay otro headhunt activo o en historia reciente (<20 días)
  Sortea duración entre minDays y maxDays
  Misión disponible: { defId, name, description, duration, colonistsMin, colonistsMax,
                       rewardRep, rewardGold, rewardSeedsType, rewardSeedsAmt, rewardSpecialist }

PARTE 3 — Lógica
En src/js/buildings.js — función launchMission(missionAvailIdx, colonistIds):
  Para cada colono: prevJob=job, job='mission', onMission=true, missionId=ID
  Crea objeto misión activa en state.missions:
    { id, defId, name, description, assignedColonistIds, prevJobs,
      durationDays, elapsedDays:0, status:'active' }
  Elimina de state.availableMissions
  Si availableMissions < 3: generateAvailableMissions() para rellenar
  showToast(`🗺️ Misión iniciada: ${name}`)
  updateUI()

En src/js/gameloop.js — en gameTick(), fuera del ciclo día/noche, siempre:
  Para cada misión activa:
    mission.elapsedDays += delta / dayDuration
    Si elapsedDays >= durationDays: completeMission(mission)

Función completeMission(mission) (en buildings.js o gameloop.js):
  const def = GAME_MISSIONS.find(m => m.id === mission.defId)
  Calcular éxito: 
    attrSum = colonos.reduce(sum de def.attribute)
    successChance = def.baseSuccessRate + (attrSum / (colonos.length * 10)) * 0.4
    éxito = Math.random() < successChance

  Si éxito:
    state.reputation += def.rewardRep
    state.gold += def.rewardGold
    Si def.rewardSeedsType !== 'none': state.seeds[def.rewardSeedsType] += def.rewardSeedsAmt
    Si def.rewardSpecialist !== 'none': generateSpecialistColonist(def.rewardSpecialist)
    XP de def.attribute a todos los colonos asignados
    showToast(`🏆 Misión "${mission.name}" completada con éxito!`, 'success')
  Si no:
    XP parcial (50%)
    showToast(`💀 Misión "${mission.name}" fallida.`, 'error')

  Restaurar trabajos de los colonos (prevJob)
  state.missionHistory.push({ ...mission, success: éxito })
  generateAvailableMissions()
  updateUI()

PARTE 4 — Colonos especialistas
En src/js/gamestate.js — función generateSpecialistColonist(speciality):
  const SPECIALIST_TITLES = {
    woodcutting: ['Maestro Leñador', 'Talabosques', 'Veterano Maderero'],
    mining: ['Maestro Minero', 'Experto en Vetas', 'Veterano de la Roca'],
    farming: ['Maestro Agricultor', 'Sembradora Experta', 'Veterano del Campo'],
    cooking: ['Chef Maestro', 'Cocinera Experta', 'Veterano de Fogones'],
    trading: ['Maestro Mercader', 'Comerciante Experta', 'Veterano de Ferias'],
    exploration: ['Explorador Leyenda', 'Rastreadora Maestra', 'Veterano Expedicionario'],
    combat: ['Guerrero Legendario', 'Combatiente Maestra', 'Veterano de Batallas'],
    random: () → elige speciality aleatoria de las de arriba
  };
  Genera colono normal con generateNewColonist()
  Especialidad: 8-10 aleatorio
  Resto de atributos: 1-3 aleatorio
  Añade: specialist:true, speciality, title

  state.colonists.push(specialist)
  showToast(`🌟 ¡${title} ${name} se une a la colonia!`, 'success')

PARTE 5 — UI
En index.html — añade nueva pestaña después de "👥 Aldeanos":
  <button id="tab-btn-missions" class="tab-btn">🗺️ Misiones</button>
  ...
  <div id="tab-missions" class="tab-content">
    <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
      <div id="available-missions-panel" style="flex:1; min-width:300px;"></div>
      <div id="active-missions-panel" style="flex:1; min-width:300px;"></div>
    </div>
  </div>

En src/js/ui-render.js — función renderMissions():
  PANEL IZQUIERDO "📋 Misiones Disponibles":
    Por cada state.availableMissions:
      Tarjeta: nombre + emoji dificultad (🟢/🟡/🔴), descripción
      Duración estimada, recompensas
      Colonos necesarios (min-max)
      Selector de colonos libres (checkboxes o multiselect)
      Botón "Enviar →" (llama a launchMission)
  
  PANEL DERECHO "⚔️ Misiones Activas":
    Por cada state.missions (status==='active'):
      Nombre, colonos asignados (nombres)
      Barra de progreso (elapsedDays / durationDays)
      Días restantes

  En ui-render.js, función renderColonists() (pestaña aldeanos):
    Si colono.onMission:
      Badge "🗺️ En misión" (gris), controles de asignación deshabilitados
    Si colono.specialist:
      Border dorado, badge "⭐ Especialista", título en cursiva dorada

En src/js/ui-events.js — en initEventHandlers():
  Listener para tab-btn-missions → switchTab('missions')
  Listener delegado para botones de launch-mission-N

En updateUI() — añade: renderMissions()

PARTE 6 — Reputación como requisito de contratación
En src/js/buildings.js — función hireColonist(candidateIdx):
  coste_rep = Math.max(0, (state.colonists.length - 2) * 5)
  Si state.reputation < coste_rep:
    showToast(`❌ Necesitas ${coste_rep} Reputación para contratar más aldeanos`, 'error')
    return

✅ Verificar completo:
  - 3 misiones disponibles en la nueva pestaña
  - Enviar colonos → desaparecen de libres
  - Al completarse: recompensas aplicadas
  - headhunt → aparece colono especialista dorado
  - Contratar colonos 4+ requiere reputación
```

---

---


> BACKUP: aetheria_bkp_vBloque2.zip
---

## BLOQUE 3 -- Arbol de tecnologia

---

### M9 -- ROJO Arbol de tecnologia [PENDIENTE]

Archivos: src/data/tech.csv (nuevo), data-loader.js, gamestate.js, buildings.js, ui-render.js, ui-events.js, index.html

BACKUP antes de este paso.

OBJETIVO: Desbloquear construcciones requiere investigar en el arbol de tech.
          Coste: tiempo + recursos + reputacion. Cuello de botella de progreso.

NUEVO CSV src/data/tech.csv -- columnas:
  Category;ID;Name;Description;Req_TH;Req_Tech;Cost_Gold;Cost_Wood;Cost_Stone;Cost_Rep;Research_Days;Unlocks

  Tech;basic_construction;Construccion Basica;...;1;none;0;0;0;0;0;basic_house,farm,bonfire
  Tech;improved_tools;Herramientas Mejoradas;...;1;basic_construction;0;20;10;5;3;smithy
  Tech;iron_working;Trabajo en Hierro;...;2;improved_tools;0;30;50;15;7;forge
  Tech;advanced_farming;Agricultura Avanzada;...;1;basic_construction;0;10;0;10;4;granary_t2,farm_t2
  Tech;masonry;Albanileria;...;2;basic_construction;10;20;30;20;5;quarry_t2,house_t2
  Tech;water_management;Gestion del Agua;...;1;basic_construction;0;15;20;8;3;well
  Tech;storage_basic;Almacenamiento Basico;...;1;basic_construction;0;20;15;5;3;warehouse_wood,warehouse_stone
  Tech;military_basic;Defensa Basica;...;2;basic_construction;0;20;20;15;5;palisade,guardpost
  Tech;advanced_cooking;Alta Cocina;...;2;advanced_farming;5;10;0;10;4;bonfire_t3,mill

En data-loader.js: anadir 'tech' al array de CSVs. Parsear a TECH_TREE global.
En gamestate.js: unlockedTechs:['basic_construction'], researchQueue:null
  Funcion isBuildingUnlocked(buildingId)

En buildings.js -- inicio de buildX()/upgradeX():
  if (!isBuildingUnlocked(id)) { showToast('Requiere investigacion', 'error'); return; }
  Funcion startResearch(techId): verifica req, descuenta recursos, inicia cola.
  Funcion completeResearch(): anade a unlockedTechs, showToast.

En gameloop.js -- al cambiar de dia:
  if (state.researchQueue) { elapsed += dayDelta; if done: completeResearch(); }

En ui-render.js -- renderTechTree():
  Nodos: bloqueado (gris) / disponible (boton Investigar) / en curso (progreso) / completado (verde)
En index.html: nueva pestana "Tecnologia"

VERIFICAR:
  - Sin basic_construction: no se puede construir Choza ni Granja
  - Al desbloquear tech: edificios se habilitan
  - Solo una investigacion activa a la vez
TEST: test/test_arbol_tecnologia_[timestamp].csv

---

---


> BACKUP: aetheria_bkp_vBloque3.zip
---

## BLOQUE 4 -- Herramientas y metal

---

### PASO E — 🟡 Modelo de herramientas + Taller del Herrero ⬜

**Archivos:** `src/data/buildings.csv`, `src/data/production.csv`, `src/data/timings.csv`, `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `index.html`

```
PARTE 1 — CSV
En src/data/buildings.csv — añade:
  Building;smithy;Taller del Herrero;0;30;20;0;;
  Building;smithy_t2;Mejorar Taller T2;60;60;40;0;;

En src/data/timings.csv — añade:
  Timing;smithy;Construcción Taller;15
  Timing;smithy_t2;Mejora Taller T2;25
  Timing;smithy_pickaxe_t1;Producir Pico T1;5
  Timing;smithy_axe_t1;Producir Hacha T1;4
  Timing;smithy_hoe_t1;Producir Azada T1;3
  Timing;smithy_weapon_t1;Producir Arma T1;8

En src/data/production.csv — añade:
  ProductionRate;smithy_pickaxe_t1;Pico de Madera;0;5;3;1;pickaxe_t1;
  ProductionRate;smithy_axe_t1;Hacha de Madera;0;4;2;1;axe_t1;
  ProductionRate;smithy_hoe_t1;Azada de Madera;0;3;2;1;hoe_t1;
  ProductionRate;smithy_weapon_t1;Arma Básica;0;6;4;1;weapon_t1;

PARTE 2 — Estado
En src/js/gamestate.js — añade a DEFAULT_STATE:
  smithies: [],
  tools: []

  ESTRUCTURA smithy:
  { id, tier:1, workerAssigned:0, isUnderConstruction:true,
    constructionElapsed:0, constructionDuration:15,
    isUpgrading:false, upgradeElapsed:0,
    selectedTool:'pickaxe_t1', elapsed:0, isRunning:false }

  ESTRUCTURA tool:
  { id, type:'pickaxe', tier:1, durability:100, assignedTo:null }

  Constante TOOL_REQUIREMENTS:
  { lumbermills:'axe', quarries:'pickaxe', farms:'hoe', bonfires:null, markets:null, granaries:null }

PARTE 3 — Lógica
En src/js/buildings.js:
  - buildSmithy(): crea smithy en state.smithies, descuenta madera+piedra
  - upgradeSmithy(idx): similar a otros upgrades
  - Función assignTool(toolId, buildingType, buildingIdx):
      tool.assignedTo = `${buildingType}_${buildingIdx}`

En src/js/gameloop.js — en gameTick():
  SMITHIES: Para cada smithy con workerAssigned > 0:
    elapsed += delta / dayDuration
    Si elapsed >= timingDuration[smithy.selectedTool]:
      Descuenta materiales (del CSV)
      Crea herramienta: state.tools.push({ id, type, tier:1, durability:100, assignedTo:null })
      elapsed = 0
      showToast(`🔨 Nueva ${toolName} producida!`, 'success')

  DESGASTE de herramientas (todos los ticks):
    Para cada tool con assignedTo !== null:
      tool.durability -= 1.5 * (delta / dayDuration)
      Si durability <= 0:
        tool.durability = 0
        tool.assignedTo = null
        showToast(`⚠️ Herramienta rota`, 'warning')

  PRODUCCIÓN CON HERRAMIENTA:
    Para aserraderos y canteras, antes de calcular producción:
      const tool = state.tools.find(t =>
        t.assignedTo === `lumbermills_${idx}` && t.durability > 0)
      Si no hay: producción × 0 (o multiplicador reducido según diseño)
      Si hay: producción normal

PARTE 4 — UI
En src/js/ui-render.js — función renderSmithies():
  Tarjeta por smithy: badge tier, selector tipo herramienta
  Barra de progreso del ciclo
  Allocator de trabajadores (mismo estilo que edificios actuales)
  Lista de herramientas en inventario (agrupadas por tipo y tier)
    Barra de durabilidad verde→amarillo→rojo

  En renderLumberMills() y renderQuarries():
    Añadir sección "🔧 Herramienta asignada":
      Si tiene: nombre + barra durabilidad + botón "Desasignar"
      Si no tiene: badge "⚠️ Sin herramienta" (producción 0%) +
                   dropdown de herramientas disponibles del tipo correcto

En index.html — en pestaña Construcción, añade:
  Fila Taller del Herrero (similar a las otras con coste y contador)

  En pestaña Producción/subtab Recursos Básicos, añade:
  <section class="module-card">
    <div class="module-title"><span>⚒️ Talleres del Herrero</span></div>
    <div id="active-smithies-list" class="building-boxes-container"></div>
  </section>

En updateUI() añade: renderSmithies()

✅ Verificar:
  - Construir Taller → aparece en pestaña Producción
  - Con trabajador → produce herramienta al completar timer
  - Sin hacha en aserradero → producción 0
  - Herramienta pierde durabilidad; al llegar a 0 se desasigna con toast
```

---

---

### PASO G — 🟡 Sub-recurso mineral de hierro + Forja ⬜

**Archivos:** `src/data/buildings.csv`, `src/data/production.csv`, `src/data/timings.csv`, `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `index.html`

```
En src/data/buildings.csv:
  Building;forge;Forja;0;40;60;0;;
  Building;forge_t2;Mejorar Forja T2;100;80;100;0;;

En src/data/timings.csv:
  Timing;forge;Construcción Forja;20
  Timing;forge_t2;Mejora Forja T2;30
  Timing;forge_iron_t1;Fundir Lingotes T1;3
  Timing;forge_iron_t2;Fundir Lingotes T2;2

En src/data/production.csv:
  ProductionRate;forge_iron_t1;Fundir Lingotes T1;0;0;0;1;ironBar;Consumes:5:iron
  ProductionRate;forge_iron_t2;Fundir Lingotes T2;0;0;0;1;ironBar;Consumes:4:iron

En src/js/gamestate.js — añade:
  iron: 0       (mineral en bruto)
  ironBars: 0   (lingotes)
  forges: []

En src/js/gameloop.js:
  CANTERAS — producen hierro mineral (ratio 1:5, un mineral por 5 piedras):
    Al producir piedra en canteras T1+:
      state.iron += (stone_produced / 5)

  FORJAS — procesan mineral → lingotes:
    Similar a graneros, consume iron, produce ironBar

  HERRAMIENTAS T2 (en smithies) — requieren ironBars:
    Al seleccionar herramienta T2: verificar stock de ironBars
    Al completar ciclo T2: consumir ironBars (2 por hacha/pico)

  Sub-recursos en UI — en renderResourcesDetails() (o donde se muestra el detalle):
    Añade: ⚙️ Mineral: [N] | 🔩 Lingotes: [N]

En src/js/buildings.js:
  buildForge(), upgradeForge(idx)

En src/js/ui-render.js — renderForges():
  Similar a renderSmithies()

En index.html — añade Forja en pestaña Construcción y en Producción/subtab Procesado.

✅ Verificar:
  - Canteras con pico producen mineral de hierro
  - Forja convierte 5 minerales en 1 lingote
  - Herramienta T2 (pico de hierro) requiere 2 lingotes al producirse
```

---

---


> BACKUP: aetheria_bkp_vBloque4.zip
---

## BLOQUE 5 -- Sistema de trabajo (RUPTURA -- backup OBLIGATORIO antes)

---

### M7 -- ROJO Sistema de prioridades para colonos [PENDIENTE]

Archivos: gamestate.js, gameloop.js, ui-render.js, ui-events.js

BACKUP OBLIGATORIO. Rompe el sistema de asignacion actual.

OBJETIVO: Sustituye asignacion directa (job unico) por lista de prioridades ordenadas.
          El colono trabaja en la tarea disponible de mayor prioridad.

NUEVO CAMPO en colonists[i]:
  priorities: []  // [{ taskType, buildingIdx, weight }] -- weight 1=maxima prioridad
  currentTask: null  // calculado dinamicamente

  MIGRACION:
    colonist.priorities = [];
    colonist.currentTask = null;
    // 'job' se mantiene como legacy pero ya no se escribe directamente

En gameloop.js -- funcion assignColonistTask(colonist):
  Ordenar priorities por weight (ascendente)
  Para cada priority: verificar si edificio existe, no en construccion, y tiene slot libre
  Si hay slot: colonist.currentTask = priority; break;
  Si ninguna: currentTask = null (idle)
  Llamar al inicio de cada gameTick() para cada colono.

En ui-render.js -- renderColonists():
  Lista editable de prioridades: botones arriba/abajo + selector tarea + selector edificio + eliminar
  Boton "Anadir prioridad"
  Badge tarea actual
  NO mostrar dropdown 'job' unico -- esta deprecado.

VERIFICAR:
  - P1=cocina, P2=granja -> trabaja en cocina si hay slot
  - Cocina llena -> pasa a granja
  - Sin prioridades -> idle
  - recalculateRates() sigue correcta
TEST: test/test_prioridades_colonos_[timestamp].csv + REGRESION: M3, M4, M5 y toda la produccion

---

---

### M8 -- AMARILLO Prioridades de edificios (fallback automatico de recetas) [PENDIENTE]

Archivos: gamestate.js, gameloop.js, ui-render.js

Depende de M7.

OBJETIVO: Si falta input para la receta preferida, el edificio cambia automaticamente
          a la siguiente con stock. Vuelve a la preferida cuando hay.

En gamestate.js -- bonfires[i]:
  recipePriorities: ['carrot', 'wheat', 'potato', 'berries']
  cookingRecipeNow: null
  MISMA ESTRUCTURA para granaries: seedsPriorities: ['wheat', 'potato', 'carrot']

En gameloop.js -- bonfires:
  Si sin input de selectedRecipe: iterar recipePriorities -> cocinar la primera con stock
  Si hay stock de selectedRecipe: cookingRecipeNow = selectedRecipe (normal)
  MISMA LOGICA para graneros, molinos y talleres.

En ui-render.js:
  Badge "Cocinando [alternativa] (sin [principal])" si diffiere de selectedRecipe
  Badge "Sin ingredientes" si cookingRecipeNow = null
  UI para reordenar recipePriorities (botones arriba/abajo)

VERIFICAR:
  - Sin trigo -> fogata cocina patata automaticamente
  - Al llegar trigo: vuelve a trigo
TEST: test/test_prioridades_edificios_[timestamp].csv + REGRESION: bonfires y graneros

---

---

### M15 -- ROJO Slots multiples por tier en edificios [PENDIENTE]

Archivos: mechanics.csv, gamestate.js, gameloop.js, ui-render.js

Depende de M7 (prioridades colonos).

OBJETIVO: T2 -> 2 slots paralelos (recetas distintas). T3 -> 2 slots + bonus velocidad.

En mechanics.csv -- categoria BuildingSlots:
  BuildingSlots;bonfire_t1_slots;1 | bonfire_t2_slots;2 | bonfire_t3_slots;2
  BuildingSlots;bonfire_t3_speed;0.3 (=+30% velocidad)
  BuildingSlots;granary_t1_slots;1 | granary_t2_slots;2 | granary_t3_slots;2
  BuildingSlots;granary_t3_speed;0.3
  (anadir para smithy, mill, armory)

En gamestate.js -- bonfires[i], granaries[i]:
  workerAssigned (int) -> workers: [{ colonistId, selectedRecipe, elapsed }]
  MIGRACION: convertir workerAssigned al nuevo formato si existe

En gameloop.js: ejecutar cada slot independientemente. En T3: yield * (1 + speedBonus)

En ui-render.js:
  T2/T3: mostrar slots separados con panel expandible
  T1: sin cambios

VERIFICAR:
  - Caldero T2: 2 colonos cocinan recetas distintas en paralelo
  - Cocina T3: 2 colonos + velocidad +30%
  - T1: comportamiento sin cambios
TEST: test/test_slots_multiples_[timestamp].csv + REGRESION: bonfires, graneros, M7

---

---


> BACKUP: aetheria_bkp_vBloque5.zip
---

## BLOQUE 6 -- Cadena alimentaria

---

### PASO I — 🟡 Ganadería y sub-productos ⬜

**Archivos:** `src/js/gamestate.js`, `src/data/prices.csv`, `src/js/gameloop.js`, `src/js/ui-render.js`, `src/js/ui-events.js`, `index.html`

```
En src/js/gamestate.js — añade:
  animals: [],   // { id, type, fedToday:false }
  eggs: 0
  feathers: 0
  skins: 0
  fertilizer: 0

  Constante ANIMAL_TYPES:
  {
    chicken: { name:'Gallina', emoji:'🐔', foodCost:0.5, output:'eggs',
               outputRate:0.5, cost:30 },
    pig:     { name:'Cerdo', emoji:'🐷', foodCost:1.5, output:'skins',
               outputRate:0.1, cost:80 },
    cow:     { name:'Vaca', emoji:'🐄', foodCost:2.0, output:'skins',
               outputRate:0.05, cost:150 }
  }

En src/data/prices.csv — añade:
  Sales;buy_chicken;Comprar Gallina;30;0;0;1;chicken;
  Sales;buy_pig;Comprar Cerdo;80;0;0;1;pig;
  Sales;buy_cow;Comprar Vaca;150;0;0;1;cow;

En src/js/gameloop.js — en gameTick(), sección diaria o continua:
  ANIMALES:
    Para cada animal en state.animals:
      El consumo de comida se integra en feedColonistsMorning/Evening
      (los animales consumen de la prioridad de comida igual que colonos)
      O bien: consumo separado al cambiar de día
    
    Producción por tick:
      state[def.output] += def.outputRate * (delta / dayDuration)
    
    Producción de fertilizante (cerdos/vacas):
      state.fertilizer += 0.1 * (delta / dayDuration) * pigsAndCows

  FERTILIZANTE en granjas:
    Añade función fertilizeFarm(farmIdx) en buildings.js:
      Si state.fertilizer >= 1 && farm.stage === 'grow' o 'grow2':
        state.fertilizer -= 1
        farm.stageElapsed += 0.5  (acelera crecimiento)
        showToast(`🌱 Campo #${farmIdx+1} fertilizado!`)

En src/js/ui-render.js:
  Nueva sección "🐄 Ganadería" visible en pestaña Producción o en tab-basic:
    Botones compra (deshabilitados sin oro)
    Lista de animales (agrupados: Gallinas: N | Cerdos: N | Vacas: N)
    Sub-recursos: 🥚 Huevos: N | 🪶 Plumas: N | 🐾 Pieles: N | 💩 Fertiliz.: N
  
  En renderFarms():
    Si farm.stage==='grow' y state.fertilizer >= 1:
      Botón "🌿 Fertilizar" activo
    Si no: botón deshabilitado con "Sin fertilizante"

En src/js/ui-events.js — en initEventHandlers():
  Listeners de compra de animales (buy_chicken, buy_pig, buy_cow)
  Listeners de botones fertilizar-farm-N

En index.html:
  Añade div #animals-section en algún subtab de producción o en pestaña básica
  Añade sub-recursos (eggs, feathers, skins, fertilizer) al panel de "Ver detalles"
  Añade botón fertilizar en template de granja (renderizado por JS)

✅ Verificar:
  - Comprar gallina → añade a animals → consume comida → produce huevos
  - Fertilizar campo en crecimiento → acelera visiblemente la barra
  - Pieles de cerdos/vacas se acumulan en state.skins
```

---

---

### PASO K — 🟡 Molino + Cadena de Harina ⬜

**Archivos:** `src/data/buildings.csv`, `src/data/timings.csv`, `src/data/production.csv`, `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `index.html`

```
En src/data/buildings.csv:
  Building;mill;Molino;0;40;30;0;;
  Building;mill_t2;Mejorar Molino T2;80;60;50;0;;

En src/data/timings.csv:
  Timing;mill;Construcción Molino;15
  Timing;mill_t2;Mejora Molino T2;25
  Timing;mill_flour_t1;Moler Harina T1;2
  Timing;mill_flour_t2;Moler Harina T2;1

En src/data/production.csv:
  Processing;mill_flour_t1;Moler Harina T1;0;0;0;1;flour;Consumes:5:wheat
  Processing;mill_flour_t2;Moler Harina T2;0;0;0;2;flour;Consumes:5:wheat

En src/js/gamestate.js — añade:
  flour: 0
  bread: 0
  mills: []

En src/js/buildings.js — buildMill(), upgradeMill(idx)

En src/js/gameloop.js — procesa mills igual que graneros:
  Consume wheat, produce flour según tier

  En bonfires (fogatas T2+):
    Si selectedRecipe === 'bread': consume 2 flour, produce 1 bread (=3 comida)
    Si selectedRecipe === 'stew': consume 1 potato + 1 carrot, produce 2 food
  
  En la función de harvest de granjas:
    state.bread se suma a la comida global equivalente (si se usa updateGlobalFood)
    O bien: bread se configura en equivalences.csv como equivalente a X food

En src/js/ui-render.js — renderMills():
  Similar a graneros, con selector de receta en bonfires actualizado.
  Muestra: 🌾 Harina: N | 🍞 Pan: N

En index.html:
  Añade Molino en pestaña Construcción
  Añade en subtab Procesado: <div id="active-mills-list">

En updateUI() añade: renderMills()

✅ Verificar:
  - Molino convierte 5 trigos en 1 harina
  - Fogata T2 puede seleccionar receta "Pan" (consume 2 harinas → 1 pan)
  - Pan tiene equivalencia de comida mayor que trigo crudo
```

---

---

### M17 -- AMARILLO Trigo -> grano + paja (MIGRACION CRITICA) [PENDIENTE]

Archivos: production.csv, resources.csv, equivalences.csv, gamestate.js, gameloop.js + GREP en todos los JS

ATENCION: CAMBIO SEMANTICO state.wheat -> state.grain. Requiere migracion en save.

En resources.csv: Raw;grain;Grano | Raw;straw;Paja
En production.csv:
  Crop;wheat;Cosecha Trigo (Grano);grain;60;40;80;...
  Crop;wheat_straw;Subproducto (Paja);straw;30;20;40;...
En mechanics.csv: Crop;wheat_straw_ratio;Ratio paja/grano;0.5
En equivalences.csv: FoodEquivalence;grain;Grano;1  (actualizar wheat->grain)

En gamestate.js: grain:0, straw:0
  MIGRACION CRITICA:
    if (typeof state.grain === 'undefined') {
      state.grain = state.wheat || 0;
      state.wheat = 0;
    }
    if (typeof state.straw === 'undefined') state.straw = 0;

En gameloop.js -- cosecha de trigo:
  state.grain += grainYield;
  state.straw += grainYield * (wheat_straw_ratio ?? 0.5);

BUSCAR "state.wheat" con grep en TODOS los JS antes de modificar.
Sustituir cada ocurrencia por "state.grain" (excepto en la migracion loadGame).

VERIFICAR:
  - Cosechar trigo -> grano + paja en inventario
  - Partida guardada con wheat -> carga como grain correctamente
  - Fogata sigue cocinando grain
TEST: test/test_grano_paja_[timestamp].csv + REGRESION CRITICA: granjas, fogatas, mercado, equivalencias, save/load

---

---


> BACKUP: aetheria_bkp_vBloque6.zip
---

## BLOQUE 7 -- Combate y defensa

---

### PASO L — 🟡 Armería y equipo para colonos ⬜

**Archivos:** `src/data/buildings.csv`, `src/data/timings.csv`, `src/js/gamestate.js`, `src/js/buildings.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `index.html`

```
En src/data/buildings.csv:
  Building;armory;Armería;0;60;40;0;;ExtraRequires:ironBars:20

En src/data/timings.csv:
  Timing;armory;Construcción Armería;25
  Timing;armory_leather;Fabricar Armadura Cuero;5
  Timing;armory_iron;Fabricar Armadura Hierro;8

En src/js/gamestate.js — añade:
  armories: []
  equipment: {}   // { colonistId: { type:'leather'|'iron', bonus:5|10 } }

En src/js/buildings.js:
  buildArmory(): requiere ironBars >= 20
  equipColonist(colonistId, armorType):
    equipment[colonistId] = { type: armorType, bonus: armorType==='iron'?10:5 }

En src/js/gameloop.js — Armería produce equipo:
  leather_armor: consume skins (2) → produce 1 armadura cuero
  iron_armor: consume ironBars (3) + skins (1) → produce 1 armadura hierro

  En combate (para paso de bandidos):
    colono equipado añade bonus al calculateDefensePoints()

En src/js/ui-render.js — renderArmories():
  Lista de equipo producido
  Por colono: dropdown asignar equipo
  En renderColonists(): si equipado, badge "🛡️ Armadura [tipo]"

En index.html:
  Añade Armería en pestaña Construcción
  Añade en subtab Procesado o nuevo subtab: active-armories-list

✅ Verificar: Armería produce armaduras; equipar colono muestra badge.
```

---

---

### PASO N — 🔴 Sistema de bandidos e incursiones ⬜

**Archivos:** `src/js/gamestate.js`, `src/js/gameloop.js`, `src/js/ui-render.js`, `src/js/buildings.js`, `index.html`

```
En src/js/gamestate.js — añade:
  raids: [],
  raidHistory: [],
  defensePoints: 0

  Función calculateDefensePoints():
    let dp = 0
    state.colonists.forEach(c => {
      if (c.job === 'combat' || /* tiene arma asignada */)
        dp += (c.attributes.combat || 1) + (state.equipment[c.id]?.bonus || 0)
    })
    state.tools.filter(t => t.type === 'weapon' && t.durability > 0)
              .forEach(t => dp += t.tier * 2)
    state.arrows = dp bonus leve si hay flechas (futura expansión)
    state.defensePoints = dp
    return dp

En src/js/gameloop.js — al cambiar de día (transición a noche o día):
  Probabilidad de incursión: 0.003 * (1 + state.currentDay / 300)
  Si se activa y no hay raid ya activo:
    const raid = {
      id: Date.now(), warningDays: 2 + Math.floor(Math.random() * 3),
      strength: 5 + Math.floor(state.currentDay * 0.1)
    }
    state.raids.push(raid)
    showToast(`⚠️ ¡Se acercan bandidos! Incursión en ${raid.warningDays} días`, 'warning')

  Para cada raid activo:
    raid.warningDays--
    Si warningDays <= 0: executeRaid(raid)

  Función executeRaid(raid):
    const dp = calculateDefensePoints()
    Si dp >= raid.strength:
      Victoria: reward = { gold: 20 + raidHistory.length * 10 }
      state.gold += reward.gold
      XP de combat a colonos asignados a combate
      showToast(`🏆 ¡Incursión repelida! +${reward.gold}🪙`, 'success')
    Si no:
      Derrota:
        const loss_wood = Math.floor(state.wood * 0.2)
        const loss_food = Math.floor((state.wheat + state.potato + state.carrot) * 0.2)
        state.wood -= loss_wood
        Reducir estado de comida proporcionalmente
        showToast(`💀 Incursión exitosa. -${loss_wood}🪵`, 'error')
    
    Quita raid de state.raids
    state.raidHistory.push({ ...raid, result, dp, day: state.currentDay })
    updateUI()

En src/js/ui-render.js:
  Añade panel de alerta de raid si state.raids.length > 0:
    Banner rojo pulsante en la parte superior del contenido:
    "⚔️ ¡Bandidos en X días! Fuerza: N | Tu defensa: M"
  
  Actualiza el res-defense en panel de recursos (add "⚔️ Defensa: N" card)

En index.html:
  Añade en resources-grid una card más: ⚔️ Defensa
  Añade div #raid-alert-banner justo después de time-cycle-panel:
    <div id="raid-alert-banner" style="display:none; ...">⚔️ ...</div>

✅ Verificar:
  - Después de días, aparece toast de aviso de raid
  - Banner de cuenta atrás visible
  - Con suficiente defensa: victoria + recompensa
  - Sin defensa: pérdida de recursos
```

---

---

### PASO O — 🟡 Escalado de raids y panel de defensa ⬜

**Archivos:** `src/js/gameloop.js`, `src/js/ui-render.js`

```
En src/js/gameloop.js:
  Escalar dificultad: raidStrength *= (1 + raidHistory.length * 0.15)
  Raid épico cada 10 raids (doble fuerza, triple recompensa)

En src/js/ui-render.js:
  Nueva función renderRaidHistory() si hay al menos 1 raid en raidHistory:
    Tabla pequeña: Día | Fuerza | Defensa | Resultado | Recompensa
    Estadísticas: "Raids repelidos: X | Derrotas: Y"

  Sección de historial añadida al tab de misiones o nuevo subtab "⚔️ Defensa"

✅ Verificar: historial de raids se muestra y escala correctamente.
```

---

---

### M14 -- AMARILLO Murallas + Puestos de guardia [PENDIENTE]

Archivos: buildings.csv, timings.csv, mechanics.csv, gamestate.js, buildings.js, gameloop.js, ui-render.js, index.html

Depende de Paso N (bandidos ya implementados).

OBJETIVO: Murallas reducen probabilidad de raid. Puestos de guardia permiten asignar
          colonos que determinan exito/fracaso del asalto.

En buildings.csv:
  Building;palisade;Empalizada;1;1;0;30;0;0;0;combat
  Upgrade;palisade_t2;Mejorar Empalizada T2;2;2;0;50;20;0;0;combat
  Building;guardpost;Puesto de Guardia;1;2;0;25;30;0;0;combat

En mechanics.csv -- categoria Defense:
  Defense;palisade_t1_raid_reduction;Reduccion raid Empalizada T1;0.20
  Defense;palisade_t2_raid_reduction;Reduccion raid Empalizada T2;0.40
  Defense;guardpost_defense_per_colonist;Defensa por guardia;5
  Defense;guardpost_max_colonists;Colonos max por puesto;3

En gamestate.js: palisades:[], guardposts:[]
En buildings.js: buildPalisade(), upgradePalisade(idx), buildGuardpost()

En gameloop.js -- probabilidad de raid:
  raidReduction = sum(palisadas * reduccion_por_tier)
  effectiveProbability = Math.max(0, baseProbability - raidReduction)
  En calculateDefensePoints(): sumar guardias en puestos x defensa por guardia

VERIFICAR:
  - Empalizada T1: raid -20%
  - 3 guardias en puesto: +15 puntos defensa
TEST: test/test_murallas_guardia_[timestamp].csv + REGRESION: raids (Paso N)

---

---


> BACKUP: aetheria_bkp_vBloque7.zip
---

## BLOQUE 8 -- Medioambiente (estaciones + calor)

---

### M12 -- ROJO Estaciones del anyo [PENDIENTE]

Archivos: mechanics.csv, gamestate.js, gameloop.js, ui-render.js, index.html

OBJETIVO: 4 estaciones de 30 dias (120 dias/anyo). En invierno no se cultiva
          ni se recogen frutos. Cultivos en curso al inicio del invierno se pierden.

En mechanics.csv: Season;days_per_season;30 | Season;year_length;120

En gamestate.js: currentSeason:'spring', yearDay:1
  MIGRACION: if (typeof state.currentSeason === 'undefined') state.currentSeason = 'spring';

En gameloop.js -- al cambiar de dia:
  state.yearDay = ((state.currentDay - 1) % 120) + 1;
  const newSeason = yearDay<=30?'spring':yearDay<=60?'summer':yearDay<=90?'autumn':'winter';

  Si transicion a winter:
    Cancelar cultivos en curso (stage -> 'idle', activeCrop -> null)
    showToast aviso
  Si transicion a spring: showToast bienvenida

  EN INVIERNO:
    Granjas: skip todo el bloque de produccion
    Frutos silvestres: produccion = 0

En ui-render.js:
  Estacion + anyo en panel ciclo dia/noche
  En invierno: banner "Sin cultivos ni frutos"
  renderFarms(): badge "Inactivo (invierno)"

VERIFICAR:
  - Dia 91 del anyo: cultivos cancelados, toast
  - Granjas no avanzan en invierno
  - Frutos: 0 en invierno
  - Anyo 2 empieza en dia 121
TEST: test/test_estaciones_[timestamp].csv + REGRESION: granjas y recoleccion frutos

---

---

### M13a -- AMARILLO Quemador de madera + recurso Calor [PENDIENTE]

Archivos: buildings.csv, timings.csv, mechanics.csv, gamestate.js, buildings.js, gameloop.js, ui-render.js, index.html

Depende de Paso G (forja ya implementada).

OBJETIVO: El Calor es un recurso global continuo producido quemando combustible.
          Fogatas, forjas y talleres necesitan Calor para funcionar.

En buildings.csv: Building;burner;Quemador;1;1;0;20;5;0;0;none
En timings.csv:   Construction;burner;Construccion Quemador;8

En mechanics.csv -- categorias Fuel y HeatCost:
  Fuel;wood;Calor por Madera quemada;2
  Fuel;charcoal;Calor por Carbon quemado;10
  Fuel;burn_rate_t1;Combustible/dia Quemador T1;5
  Fuel;heat_capacity_t1;Calor max almacenable T1;50
  HeatCost;bonfire_t1_cooking;Calor/dia Fogata T1;3
  HeatCost;bonfire_t2_cooking;Calor/dia Caldero T2;2
  HeatCost;bonfire_t3_cooking;Calor/dia Cocina T3;1.5
  HeatCost;forge_iron;Calor/dia Forja;8
  HeatCost;smithy_tool;Calor/herramienta;3
  HeatCost;smithy_weapon;Calor/arma;5
  HeatCost;mill_flour;Calor Molino;0
  HeatCost;armory_leather;Calor armadura cuero;2
  HeatCost;armory_iron;Calor armadura hierro;6

En gamestate.js: burners:[], heatStock:0, heatCapacity:0, heatRate:0, heatDemand:0
  MIGRACION: if (!Array.isArray(state.burners)) state.burners = [];

En gameloop.js:
  Quemadores: consumir combustible -> generar heatStock (hasta heatCapacity)
  Fogatas/Forjas: verificar heatStock antes de ejecutar; consumir si ejecutan.
  Si heatStock < coste -> skip ese tick.

En ui-render.js: Card "Calor: X/Y | +Z/dia | -W/dia"
  Si sin calor y hay demanda: card roja de aviso

VERIFICAR:
  - Sin quemador: fogatas no cocinan
  - Con quemador + madera: heatStock sube -> fogata cocina
  - Con deficit: fogata para automaticamente
TEST: test/test_calor_quemador_[timestamp].csv + REGRESION: fogatas y forjas

---

---

### M13b -- AMARILLO Calor en casas (invierno) [PENDIENTE]

Archivos: mechanics.csv, gameloop.js, ui-render.js

Depende de M12 + M13a.

En mechanics.csv -- categoria HeatNeed:
  HeatNeed;basic_house_t1;Calor/dia Casa T1 en invierno;2
  HeatNeed;basic_house_t2;Calor/dia Cabanya T2 en invierno;3
  HeatNeed;basic_house_t3;Calor/dia Casa Grande T3 en invierno;4
  HeatNeed;insulated_bonus;Reduccion calor con aislamiento adobe;0.5

En gameloop.js -- al cambiar de dia si es invierno:
  heatNeeded = sum(casas * calor_por_tier * factor_aislamiento)
  Si heatStock >= needed: descontar. Si no: coldPenaltyActive = true (-30% eficiencia)
  Si no es invierno: coldPenaltyActive = false
  En getColonistEfficiency(): if (state.coldPenaltyActive) efficiency *= 0.7;
  Anadir state.coldPenaltyActive al DEFAULT_STATE y migracion.

En ui-render.js:
  En casas: "Calor X/dia" | "Aislada (-50%)"
  Si coldPenaltyActive: badge rojo "Penalizacion por frio"

VERIFICAR:
  - Invierno con calor -> eficiencia normal
  - Invierno sin calor -> -30% eficiencia + badge
  - Primavera -> penalizacion eliminada
TEST: test/test_calor_casas_invierno_[timestamp].csv + REGRESION: M12, M13a, eficiencia colonos

---

---


> BACKUP: aetheria_bkp_vBloque8.zip
---

## BLOQUE 9 -- Materiales avanzados

---

### M16 -- VERDE Recolector de barro [PENDIENTE]

Archivos: buildings.csv, timings.csv, production.csv, resources.csv, mechanics.csv, gamestate.js, buildings.js, gameloop.js, ui-render.js, index.html

OBJETIVO: Nuevo edificio que produce barro con Pala. El barro se usara para adobe (M18).

En resources.csv: Material;mud;Barro;...
En buildings.csv: Building;mudpit;Recolector de Barro;...
En timings.csv:   Construction;mudpit;...;5
En production.csv: Building;mudpit_t1;...;mud;8;5;...
En mechanics.csv -- ToolReq;mudpit;Herramienta requerida;shovel
En production.csv -- en smithy: recetas para Pala T1 y T2

En gamestate.js: mudpits:[], mud:0
En gameloop.js: procesar igual que quarries (verificar herramienta shovel)

VERIFICAR:
  - Sin Pala: produccion = 0
  - Con Pala T1: produce barro en ciclos de 3 dias
TEST: test/test_recolector_barro_[timestamp].csv

---

---

### M18 -- AMARILLO Adobe + aislamiento de casas [PENDIENTE]

Archivos: production.csv, resources.csv, mechanics.csv, gamestate.js, buildings.js, ui-render.js, ui-events.js

Depende de M16 (barro), M17 (paja), M13b (calor en casas).

OBJETIVO: Granero fabrica adobe (barro+paja). Adobe aisla casas individualmente.
          Casas aisladas consumen menos calor en invierno (-50%).

En resources.csv: Processed;adobe;Adobe;...
En production.csv: Processing;granary_adobe;Granero Fabricar Adobe;adobe;2;mud;3;...;consume straw:2
En timings.csv: Production;granary_adobe;Ciclo Adobe;4
En mechanics.csv -- categoria Adobe:
  Adobe;adobe_insulate_cost_t1;Coste adobe Casa T1;5
  Adobe;adobe_insulate_cost_t2;Coste adobe Cabanya T2;8
  Adobe;adobe_insulate_cost_t3;Coste adobe Casa Grande T3;12

En gamestate.js: adobe:0, houses[i].insulated:false
  MIGRACION: if (typeof state.adobe === 'undefined') state.adobe = 0;

En buildings.js -- insulateHouse(houseIdx):
  Verificar adobe >= cost_t${house.tier}
  state.adobe -= cost; house.insulated = true; showToast; updateUI();

En ui-render.js: boton "Aislar con adobe" | badge "Aislada (-50%)"
En ui-events.js: listener btn-insulate-house-N

VERIFICAR:
  - Granero puede producir Adobe (consume barro + paja)
  - Aislar -> descuenta adobe + badge "Aislada"
  - En invierno: casa aislada consume -50% calor
TEST: test/test_adobe_aislamiento_[timestamp].csv + REGRESION: M13b, M16, M17

---

---


> BACKUP: aetheria_bkp_vBloque9.zip
---

## BLOQUE 10 -- Pulido final

---

### PASO R — 🟡 Panel de métricas de economía ⬜

**Archivos:** `src/js/ui-render.js`, `src/js/gameloop.js`

```
En src/js/gameloop.js — función recalculateRates() ya existe. Añade al objeto calculatedRates:
  calculatedRates.foodConsumption   // colonos + animales
  calculatedRates.foodProduction    // granjas activas estimado
  calculatedRates.woodNet           // producción - consumo
  calculatedRates.stoneNet

En src/js/ui-render.js — añade al panel dev (dentro de #dev-panel en index.html
  o como tab separado visible solo en devMode):

  Sección "📊 Métricas de Economía":
    Tabla: Recurso | Prod/día | Cons/día | Balance | Estado
    Color de Balance: verde si positivo, rojo si negativo
    
    Alimentación:
      Consumo total: colonos.length * dailyNeed + animales * foodCost
      Reservas (días): state.food / Math.max(consumoTotal, 0.1)
      Badge "⚠️ Déficit" si < 5 días de reservas

    Herramientas (cuando esté implementado):
      Total | Asignadas | Rotas

Se actualiza en cada updateUI() solo si devModeActive.

✅ Verificar: el panel muestra balances de comida coherentes con el estado actual.
```

---

---

### PASO T — 🟡 Balance pass: ajuste de CSVs ⬜

**Archivos:** `src/data/timings.csv`, `src/data/production.csv`, `src/data/buildings.csv`, `src/data/prices.csv`

```
Usa el panel de métricas (paso R) para identificar desequilibrios.
Objetivos de diseño:

SUPERVIVENCIA TEMPRANA:
  Con 1 colono y solo recolección + 1 granja de trigo:
    Debe ser posible mantener al colono alimentado
  Tiempos de cultivo (ya en timings.csv): trigo=30d, patata=50d, zanahoria=100d
    ¿Son adecuados? Ajustar si el jugador no puede subsistir.

EDIFICIOS:
  Costes en buildings.csv — revisar que los primeros edificios
  (casa, granja, fogata) sean alcanzables con recolección manual
  en < 5 días de juego.

SEMILLAS:
  Granero T1 debe proveer semillas suficientes para 1-2 granjas del mismo tipo.
  Revisar ratios en production.csv (granary_wheat_t1: Consumes:5:wheat)
  y timings.csv (granary_wheat_t1: 3 días).

MERCADO:
  Precios de compra/venta en prices.csv — verificar que vender comida
  cocinada sea más rentable que cruda (ya es así: cooked=15🪙 vs raw=3🪙)
  pero asegurar que no sea la única estrategia viable.

HERRAMIENTAS (cuando estén):
  Desgaste T1: 1.5%/día → ~67 días de vida
  ¿Taller produce suficiente para compensar el desgaste?

REPUTACIÓN:
  Coste de contratar aldeano 4+: ¿Es alcanzable con los pedidos del tablón?
  Target: ~30 días de juego para poder contratar el 5º colono.

Documenta cambios con comentarios (#) en cada CSV.

✅ Verificar: con el modo test desactivado y partida limpia,
  un jugador puede sobrevivir sus primeros 10 días.
```

---

---

### PASO V — 🟡 Tutorial de primera partida ⬜

**Archivos:** `src/js/gamestate.js`, `src/js/ui-render.js`, `src/js/ui-events.js`, `src/css/styles.css`, `index.html`

```
En src/js/gamestate.js — añade a DEFAULT_STATE:
  tutorialStep: 0
  tutorialCompleted: false

En src/js/ui-render.js — función checkTutorialProgress():
  Solo si !state.tutorialCompleted
  Panel fijo parte inferior (no modal, no bloquea el juego):

  PASOS Y CONDICIONES:
  0 "👋 Bienvenido a Aetheria":
    Texto: "Comienza recolectando Madera y Piedra manualmente"
    Resalta botones #btn-gather-wood y #btn-gather-stone con .tutorial-highlight
    Condición avance: state.wood >= 10 || state.stone >= 5

  1 "🏛️ Construye el Ayuntamiento":
    Texto: "Ve a la pestaña Construcción y levanta el Ayuntamiento"
    Resalta #tab-btn-construction con .tutorial-highlight
    Condición: state.townHall.built === true

  2 "🏠 Primera vivienda":
    Texto: "Construye una Choza para poder contratar aldeanos"
    Resalta botón #btn-build-basic
    Condición: state.houses.length >= 1

  3 "🧑‍🌾 Contrata tu primer aldeano":
    Texto: "Ve a Aldeanos → Contratación y elige un candidato"
    Resalta #tab-btn-colonists
    Condición: state.colonists.length >= 1

  4 "🌾 Primera granja":
    Texto: "Construye una Granja y asigna tu aldeano a ella"
    Resalta #btn-build-farm
    Condición: state.farms.length >= 1 && state.colonists.some(c => c.job?.startsWith('farms'))

  5 "✅ ¡Estás en marcha!":
    Texto: "Tu colonia está funcionando. ¡Sigue expandiéndola!"
    Botón: "Comenzar a jugar" → tutorialCompleted=true

  Panel HTML (añadir a index.html, justo antes del footer):
  <div id="tutorial-panel" style="display:none; position:fixed; bottom:0; left:0; right:0;
       background:rgba(15,23,42,0.95); border-top:2px solid hsl(45,100%,55%);
       padding:0.75rem 1.5rem; display:flex; justify-content:space-between;
       align-items:center; gap:1rem; z-index:5000; backdrop-filter:blur(12px);">
    <div>
      <div id="tutorial-title" style="font-size:0.9rem; font-weight:700; color:hsl(45,100%,65%);"></div>
      <div id="tutorial-text" style="font-size:0.8rem; color:#94a3b8; margin-top:0.15rem;"></div>
    </div>
    <div style="display:flex; gap:0.5rem; flex-shrink:0;">
      <button id="btn-tutorial-skip" class="btn btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.75rem;">
        Saltar tutorial
      </button>
      <button id="btn-tutorial-next" class="btn btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.75rem; display:none;">
        Siguiente →
      </button>
    </div>
  </div>

En src/css/styles.css — añade:
  .tutorial-highlight {
    box-shadow: 0 0 0 3px hsl(45,100%,55%), 0 0 20px rgba(255,200,0,0.3);
    animation: tutorialPulse 1.5s ease-in-out infinite;
  }
  @keyframes tutorialPulse {
    0%, 100% { box-shadow: 0 0 0 3px hsl(45,100%,55%), 0 0 20px rgba(255,200,0,0.3); }
    50% { box-shadow: 0 0 0 5px hsl(45,100%,65%), 0 0 30px rgba(255,200,0,0.5); }
  }

En src/js/ui-events.js — en initEventHandlers():
  document.getElementById('btn-tutorial-skip')?.addEventListener('click', () => {
    state.tutorialCompleted = true;
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    document.getElementById('tutorial-panel').style.display = 'none';
  });
  document.getElementById('btn-tutorial-next')?.addEventListener('click', () => {
    state.tutorialStep++;
    updateUI();
  });

Llama a checkTutorialProgress() desde updateUI()

✅ Verificar: partida nueva muestra el tutorial. Al cumplir condición, avanza.
  Saltar lo oculta. Partida cargada no muestra tutorial si ya fue completado.
```

---

## 📊 Tabla de seguimiento

| Paso | Tipo | Descripción | Estado |
|------|------|-------------|--------|
| **✅ COMPLETADO — Ver backlog_completado.md** ||||
| FR-1 a FR-13 | ✅ | Refactorización multi-fichero | ✅ |
| Paso 1 | ✅ | Cooldown reloj in-game 30min | ✅ |
| MVP completo | ✅ | Todos los sistemas base | ✅ |
| **📋 PENDIENTE** ||||
| A | 🟡 | Tablón de pedidos (reputación sin misiones) | ⬜ |
| B | 💾 | Backup vA | ⬜ |
| C | 🔴 | Sistema de misiones completo + especialistas | ⬜ |
| D | 💾 | Backup vC | ⬜ |
| E | 🟡 | Herramientas + Taller del Herrero | ⬜ |
| F | 💾 | Backup vE | ⬜ |
| G | 🟡 | Mineral de hierro + Forja | ⬜ |
| H | 💾 | Backup vG | ⬜ |
| I | 🟡 | Ganadería + sub-productos + fertilizante | ⬜ |
| J | 💾 | Backup vI | ⬜ |
| K | 🟡 | Molino + cadena grano→harina→pan | ⬜ |
| L | 🟡 | Armería + equipo para colonos | ⬜ |
| M | 💾 | Backup vL | ⬜ |
| N | 🔴 | Sistema de bandidos e incursiones | ⬜ |
| O | 🟡 | Escalado de raids + historial | ⬜ |
| P | 💾 | Backup vO | ⬜ |
| Q | 🟢 | Panel de desarrollo (modo dev Ctrl+Shift+D) | ⬜ |
| R | 🟡 | Panel de métricas de economía | ⬜ |
| S | 💾 | Backup vR | ⬜ |
| T | 🟡 | Balance pass de CSVs | ⬜ |
| U | 💾 | Backup vT | ⬜ |
| V | 🟡 | Tutorial de primera partida | ⬜ |

---

### M10 -- AMARILLO Vista 2D del pueblo (baja prioridad) [PENDIENTE]

Archivos: src/js/ui-render.js, src/css/styles.css, index.html

OBJETIVO: Vista top-down 2D de edificios y colonos moviendose.
          Feedback visual -- evaluar complejidad antes de implementar.
          Si > 200 lineas de logica nueva -> mover a NX.

PROPUESTA SIMPLIFICADA:
  - Nueva pestana "Pueblo"
  - Grid CSS 10x10 de 60px por celda
  - Edificios colocados automaticamente al construirlos (emoji grande)
  - Colonos: circulos de color -- posicion = edificio de currentTask
  - CSS transition 1s para movimiento suave

TEST: test/test_vista_2d_[timestamp].csv

---

## BACKLOG NX -- Largo plazo (implementar tras M18)

| ID | Mecanica | Depende de | Complejidad |
|----|----------|-----------|-------------|
| NX1 | Barra alimentacion 1-24h (hambre continua -- reemplaza sistema actual) | M4 | Alta |
| NX2 | Comer consume tiempo (pausa el trabajo del colono) | NX1 | Media |
| NX3 | Comida obligatoria en misiones y caravanas | Paso C | Baja |
| NX4 | Otras ciudades + rutas comerciales + caravanas | Paso K | Muy alta |
| NX5 | Incursiones activas -> descubrir nuevas minas | Paso N | Media |
| NX6 | Carros y caballos (mejoran velocidad de caravanas) | NX4 | Baja |
| NX7 | Ataques a caravanas durante el trayecto | NX4 + Paso N | Media |
| NX8 | Deterioro de alimentos en CSV (tiempo hasta caducar) | M12 | Media |
| NX9 | Mercado mejorable: ambulante -> caravanas -> fijo | NX4 | Alta |
| NX10 | Atributos de reclutas escalables segun tier del Ayto | M9 | Baja |
| NX11 | Atributo unico de recoleccion (unifica pestana basica) | M7 | Media |
| NX12 | Panel aldeanos desplegable mejorado (homeless/starving/productividad) | M7 | Baja |

---

## PLAN PENDIENTE -- PASOS ORIGINALES A-V (detalle completo)

> Ejecutar segun el orden del mapa de dependencias arriba.

---

---

---

---

## BACKLOG NX -- Largo plazo (implementar tras completar Bloque 10)

| ID | Mecanica | Depende de | Complejidad |
|----|----------|-----------|-------------|
| NX1 | Barra alimentacion 1-24h (hambre continua -- reemplaza sistema actual) | M4 | Alta |
| NX2 | Comer consume tiempo (pausa el trabajo del colono) | NX1 | Media |
| NX3 | Comida obligatoria en misiones y caravanas | Paso C | Baja |
| NX4 | Otras ciudades + rutas comerciales + caravanas | Paso K | Muy alta |
| NX5 | Incursiones activas -> descubrir nuevas minas | Paso N | Media |
| NX6 | Carros y caballos (mejoran velocidad de caravanas) | NX4 | Baja |
| NX7 | Ataques a caravanas durante el trayecto | NX4 + Paso N | Media |
| NX8 | Deterioro de alimentos en CSV (tiempo hasta caducar) | M12 | Media |
| NX9 | Mercado mejorable: ambulante -> caravanas -> fijo | NX4 | Alta |
| NX10 | Atributos de reclutas escalables segun tier del Ayto | M9 | Baja |
| NX11 | Atributo unico de recoleccion (unifica pestana basica) | M7 | Media |
| NX12 | Panel aldeanos desplegable mejorado | M7 | Baja |