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

## TABLA DE SEGUIMIENTO DE MECÁNICAS

| # | Paso | Riesgo | Descripción | Archivos clave | Estado |
|---|------|--------|-------------|----------------|--------|
| **BLOQUE 0 -- Quick Wins (sin dependencias, sin riesgo)** ||||||
| 1 | **PASO A** - `[DEV]` | Verde | Panel de desarrollo Ctrl+Shift+D | ui-render.js, ui-events.js | Pendiente |
| 2 | **PASO B** - `[UI-DIAS]` | Verde | Tasas de produccion en dias de juego | ui-render.js | Pendiente |
| 3 | **PASO C** - `[UI-AYTO]` | Verde | Renombrar Ayuntamiento por tiers | buildings.csv, ui-render.js | Pendiente |
| 4 | **PASO D** - `[COL-HAMBRE]` | Verde | Hambre reactiva (colonos comen al instante) | gameloop.js | Pendiente |
| **BLOQUE 1 -- Infraestructura basica** ||||||
| 5 | **PASO E** - `[CON-OBRA]` | Amarillo | Jugador bloqueado durante construccion | gamestate.js, gameloop.js, ui | Pendiente |
| 6 | **PASO F** - `[INF-POZO]` | Rojo | Pozo de agua (recurso diario limitado) | 8 archivos | Pendiente |
| 7 | **PASO G** - `[INF-ALMA]` | Rojo | Almacenes y capacidad maxima de recursos | 8 archivos | Pendiente |
| 7.B | BACKUP | - | Backup vBloque1 | - | Pendiente |
| **BLOQUE 2 -- Produccion y reputacion** ||||||
| 8 | **PASO H** - `[PROD-RAND]` | Verde | Aleatoriedad en produccion (rango min-max) | production.csv, gameloop.js | Pendiente |
| 9 | **PASO I** - `[REP-TABL]` | Amarillo | Tablon de pedidos (reputacion sin misiones) | 6 archivos | Pendiente |
| 10 | **PASO J** - `[REP-MISI]` | Rojo | Sistema de misiones + especialistas (missiondata.csv) | missiondata.csv + 8 archivos | Pendiente |
| 10.B | BACKUP | - | Backup vBloque2 | - | Pendiente |
| **BLOQUE 3 -- Arbol de tecnologia** ||||||
| 11 | **PASO K** - `[TEC-ARBOL]` | Rojo | Arbol de tecnologia (desbloqueo de edificios) | tech.csv + 6 archivos | Pendiente |
| 11.B | BACKUP | - | Backup vBloque3 | - | Pendiente |
| **BLOQUE 4 -- Herramientas y metal** ||||||
| 12 | **PASO L** - `[MET-TALL]` | Amarillo | Herramientas + Taller del Herrero | 8 archivos | Pendiente |
| 13 | **PASO M** - `[MET-FORJA]` | Amarillo | Mineral de hierro + Forja | 8 archivos | Pendiente |
| 13.B | BACKUP | - | Backup vBloque4 | - | Pendiente |
| **BLOQUE 5 -- Sistema de trabajo (RUPTURA)** ||||||
| 14 | **PASO N** - `[WORK-PRIO]` | Rojo | Prioridades de colonos [RUPTURA] | 4 archivos | Pendiente |
| 15 | **PASO O** - `[WORK-EDIF]` | Amarillo | Prioridades de edificios | 3 archivos | Pendiente |
| 16 | **PASO P** - `[WORK-SLOT]` | Rojo | Slots multiples por tier | mechanics.csv + 4 archivos | Pendiente |
| 16.B | BACKUP | - | Backup vBloque5 | - | Pendiente |
| **BLOQUE 6 -- Cadena alimentaria** ||||||
| 17 | **PASO Q** - `[FOOD-GRAN]` | Amarillo | Ganaderia y sub-productos | 6 archivos | Pendiente |
| 18 | **PASO R** - `[FOOD-MOLI]` | Amarillo | Molino + cadena harina->pan | 8 archivos | Pendiente |
| 19 | **PASO S** - `[FOOD-GRANO]` | Amarillo | Trigo->grano+paja [MIGRACION CRITICA] | 6 archivos + grep | Pendiente |
| 19.B | BACKUP | - | Backup vBloque6 | - | Pendiente |
| **BLOQUE 7 -- Combate y defensa** ||||||
| 20 | **PASO T** - `[COMB-ARME]` | Amarillo | Armeria + equipo para colonos | 7 archivos | Pendiente |
| 21 | **PASO U** - `[COMB-RAID]` | Rojo | Sistema de bandidos e incursiones | 5 archivos | Pendiente |
| 22 | **PASO V** - `[COMB-ESCA]` | Amarillo | Escalado de raids + historial | gameloop.js, ui-render.js | Pendiente |
| 23 | **PASO W** - `[COMB-MURA]` | Amarillo | Murallas + Puestos de guardia | 8 archivos | Pendiente |
| 23.B | BACKUP | - | Backup vBloque7 | - | Pendiente |
| **BLOQUE 8 -- Medioambiente** ||||||
| 24 | **PASO X** - `[ENV-ESTA]` | Rojo | Estaciones del anyo | 4 archivos | Pendiente |
| 25 | **PASO Y** - `[ENV-CALO]` | Amarillo | Quemador + recurso Calor | 8 archivos | Pendiente |
| 26 | **PASO Z** - `[ENV-INVI]` | Amarillo | Calor en casas (invierno) | 3 archivos | Pendiente |
| 26.B | BACKUP | - | Backup vBloque8 | - | Pendiente |
| **BLOQUE 9 -- Materiales avanzados** ||||||
| 27 | **PASO AA** - `[MAT-BARRO]` | Verde | Recolector de barro | 10 archivos | Pendiente |
| 28 | **PASO AB** - `[MAT-ADOBE]` | Amarillo | Adobe + aislamiento de casas | 7 archivos | Pendiente |
| 28.B | BACKUP | - | Backup vBloque9 | - | Pendiente |
| **BLOQUE 10 -- Pulido final** ||||||
| 29 | **PASO AC** - `[POL-METR]` | Amarillo | Panel de metricas de economia | gameloop.js, ui-render.js | Pendiente |
| 30 | **PASO AD** - `[POL-BALA]` | Amarillo | Balance pass de CSVs | CSVs | Pendiente |
| 31 | **PASO AE** - `[POL-TUTO]` | Amarillo | Tutorial de primera partida | 5 archivos | Pendiente |
| 32 | **PASO AF** - `[POL-VISTA]` | Amarillo | Vista 2D del pueblo (opcional) | ui-render.js, CSS | Pendiente |

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

### PASO A - [DEV] Panel de desarrollo Ctrl+Shift+D

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

PRUEBAS -- [DEV] -- CSV: test/test_DEV_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Panel aparece al pulsar Ctrl+Shift+D;Juego cargado;Pulsar Ctrl+Shift+D;Panel dev visible;-;Pendiente
  U02;Unit;Panel desaparece al volver a pulsar;Panel visible;Pulsar otra vez;Panel oculto;-;Pendiente
  U03;Unit;Boton x5 acelera el juego x5;Panel abierto;Clic x5;dayDelta multiplicado;-;Pendiente
  U04;Unit;Inyectar +500 madera funciona;Panel abierto;Clic boton Madera;state.wood += 500;-;Pendiente
  U05;Unit;Max All inyecta todos los recursos;Panel abierto;Clic Max All;Todos recursos en max;-;Pendiente
  U06;Unit;Panel no rompe el juego al estar abierto;Panel abierto;Jugar 5 min;Sin errores;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_DEV_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_DEV_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO B - [UI-DIAS] Mostrar tasas de produccion en dias de juego

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

PRUEBAS -- [UI-DIAS] -- CSV: test/test_UI-DIAS_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Tasa madera muestra /dia no /s;Aserradero activo;Ver panel recursos;Texto "X/dia";-;Pendiente
  U02;Unit;Tasa piedra muestra /dia;Cantera activa;Ver panel;Texto "X/dia";-;Pendiente
  U03;Unit;Tasa negativa (consumo) muestra -X/dia;Colono activo;Ver comida;"-X/dia";-;Pendiente
  U04;Unit;Sin produccion: 0/dia;Sin edificios;Ver tasas;"0/dia";-;Pendiente
  R01;Regresion;Valores internos state.wood no cambiaron;Antes y despues;Verificar incremento;Mismo valor;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_UI-DIAS_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_UI-DIAS_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO C - [UI-AYTO] Renombrar Ayuntamiento segun tier

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

PRUEBAS -- [UI-AYTO] -- CSV: test/test_UI-AYTO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;T1 muestra Casa del Jugador;Ayto T1;Ver header;Texto correcto;-;Pendiente
  U02;Unit;T2 muestra Centro Comunitario;Ayto T2;Ver header;Texto correcto;-;Pendiente
  U03;Unit;T3 muestra Ayuntamiento;Ayto T3;Ver header;Texto correcto;-;Pendiente
  U04;Unit;Toast de mejora muestra nombre nuevo;Mejorar T1->T2;Ver toast;Nombre actualizado;-;Pendiente
  R01;Regresion;Gate de construcciones no afectado;Ayto T1;Intentar edificio T2;Sigue bloqueado;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_UI-AYTO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_UI-AYTO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO D - [COL-HAMBRE] Hambre reactiva (colonos comen al instante)

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

PRUEBAS -- [COL-HAMBRE] -- CSV: test/test_COL-HAMBRE_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Colono hambriento come al anadir comida;isStarving=true food=0;Anadir 10 comida;isStarving=false;-;Pendiente
  U02;Unit;Colono sano no consume fuera de horario;isStarving=false;Anadir comida;food no baja;-;Pendiente
  U03;Unit;2 hambrientos comida para 1: solo 1 come;2 starving food para 1;Tick;1 sated 1 hambriento;-;Pendiente
  R01;Regresion;Ciclo normal de comida (manana/noche) no afectado;food>0;Esperar ciclo;Colonos comen en horario;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_COL-HAMBRE_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_COL-HAMBRE_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

---

## BLOQUE 1 -- Infraestructura basica

---

### PASO E - [CON-OBRA] Jugador bloqueado durante construccion

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

PRUEBAS -- [CON-OBRA] -- CSV: test/test_CON-OBRA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Construir yo pone playerBuilding!=null;Edificio en obra;Clic Construir yo;state.playerBuilding set;-;Pendiente
  U02;Unit;Recolectar mientras construye muestra toast;playerBuilding set;Clic recolectar;Toast de aviso;-;Pendiente
  U03;Unit;Botones recoleccion deshabilitados;playerBuilding set;Ver UI;Botones disabled;-;Pendiente
  U04;Unit;Edificio avanza de noche con playerSpeed;playerBuilding set noche;Esperar noche;constructionElapsed sube;-;Pendiente
  U05;Unit;Retirarme pone playerBuilding=null;playerBuilding set;Clic Retirarme;state.playerBuilding=null;-;Pendiente
  R01;Regresion;Construccion por colonos no afectada;Colono en obra;Ver progreso;Colono sigue avanzando;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_CON-OBRA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_CON-OBRA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO F - [INF-POZO] Pozo de agua (recurso diario limitado)

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

PRUEBAS -- [INF-POZO] -- CSV: test/test_INF-POZO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Sin pozo waterMax=0;Sin pozos;Ver state.waterMax;0;-;Pendiente
  U02;Unit;1 pozo T1 waterMax=50;Pozo T1 construido;Ver waterMax;50;-;Pendiente
  U03;Unit;2 pozos T1 waterMax=100;2 pozos T1;Ver waterMax;100;-;Pendiente
  U04;Unit;Agua se repone al amanecer;waterToday=0 llega amanecer;Amanecer;waterToday=waterMax-consumo;-;Pendiente
  U05;Unit;Colono consume 2 agua al amanecer;1 colono 1 pozo T1;Amanecer;waterToday=48;-;Pendiente
  U06;Unit;Granja water espera si waterToday=0;waterToday=0 granja en water;Tick;stageElapsed no avanza;-;Pendiente
  U07;Unit;Granja riega y descuenta 5 agua;waterToday=10;Tick;waterToday=5;-;Pendiente
  I01;Integracion;Ciclo completo cultivo con pozo;1 pozo 1 granja;Cultivar completo;Cosecha exitosa;-;Pendiente
  I02;Integracion;Sin pozo la granja nunca cosecha;0 pozos 1 granja;50 dias;Atascada en stage water;-;Pendiente
  R01;Regresion;Eficiencia colonos no afectada;Sistema anterior;Jugar con pozo;Eficiencia igual;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_INF-POZO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_INF-POZO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO G - [INF-ALMA] Almacenes y capacidad maxima de recursos

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

PRUEBAS -- [INF-ALMA] -- CSV: test/test_INF-ALMA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Capacidad base Ayto T1 = 100 madera;Ayto T1 sin almacenes;Ver storageCapacity.wood;100;-;Pendiente
  U02;Unit;Capacidad Ayto T2 = 200;Ayto T2;Ver storageCapacity.wood;200;-;Pendiente
  U03;Unit;Almacen madera T1 anade 200 de cap;1 almacen madera T1;Ver storageCapacity.wood;300;-;Pendiente
  U04;Unit;Produccion se detiene al llegar al cap;wood=100 cap=100;Tick;wood sigue en 100;-;Pendiente
  U05;Unit;Toast almacen lleno al tocar el cap;wood=99 prod=5;Tick;Toast visible;-;Pendiente
  U06;Unit;Barra roja al >90% cap;wood=95 cap=100;Ver UI;Barra roja;-;Pendiente
  I01;Integracion;Produccion madera + almacen conjuntamente;Almacen construido;Producir hasta lleno;Para al llegar cap;-;Pendiente
  R01;Regresion;Produccion comida no se rompe;Fogata activa;Producir hasta cap;Comida acumula normal;-;Pendiente
  R02;Regresion;Mercado puede vender aunque lleno;Almacen lleno;Venta manual;Venta exitosa;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_INF-ALMA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_INF-ALMA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: Pulsa 'Backup ZIP' -> guarda como aetheria_bkp_vBloque1.zip
---

## BLOQUE 2 -- Produccion y reputacion

---

### PASO H - [PROD-RAND] Aleatoriedad en produccion (rango min-max)

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

PRUEBAS -- [PROD-RAND] -- CSV: test/test_PROD-RAND_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;10 ciclos aserradero T1 entre 10 y 20;Aserradero T1;Dev x50 10 ciclos;Min>=10 Max<=20;-;Pendiente
  U02;Unit;Recoleccion manual puede dar 0;Recoleccion activa;Clic 20 veces;Al menos 1 resultado 0;-;Pendiente
  U03;Unit;Media 10 cosechas trigo cerca de 60;Granja trigo;10 cosechas dev;Media 50-70;-;Pendiente
  U04;Unit;UI muestra rango 10-20/dia;Aserradero activo;Ver tasas;"X-Y/dia";-;Pendiente
  R01;Regresion;Balance economico no cambia drasticamente;Juego normal;120 dias;Madera en rango esperado;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_PROD-RAND_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_PROD-RAND_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO I - [REP-TABL] Tablon de pedidos (reputacion sin misiones)

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

PRUEBAS -- [REP-TABL] -- CSV: test/test_REP-TABL_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;3 pedidos generados al inicio cada dia;Nuevo dia;Ver tablon;3 pedidos visibles;-;Pendiente
  U02;Unit;Entregar pedido descuenta recurso correcto;10 madera pedido=5;Clic Entregar;state.wood-=5;-;Pendiente
  U03;Unit;Entregar anade reputacion;rep=0;Entregar;rep>0;-;Pendiente
  U04;Unit;Boton Entregar disabled sin stock;0 madera pedido madera;Ver boton;boton disabled;-;Pendiente
  U05;Unit;Pedidos se refrescan al dia siguiente;Dia 1 pedidos;Llega dia 2;Nuevos 3 pedidos;-;Pendiente
  I01;Integracion;Rep de pedidos permite contratar 4o colono;3 colonos rep suficiente;Contratar;Exitoso;-;Pendiente
  R01;Regresion;Mercado sigue funcionando con reputacion activa;Mercado previo;Comprar y vender;Sin cambios;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_REP-TABL_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_REP-TABL_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO J - [REP-MISI] Sistema de misiones + especialistas (missiondata.csv)

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

PRUEBAS -- [REP-MISI] -- CSV: test/test_REP-MISI_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;3 misiones disponibles al inicio;Juego cargado;Ver Misiones;3 tarjetas visibles;-;Pendiente
  U02;Unit;Colono en mision: badge En mision;1 colono libre;Enviar a mision;Badge visible;-;Pendiente
  U03;Unit;Colono en mision no asignable a edificio;En mision;Intentar asignar;Controles disabled;-;Pendiente
  U04;Unit;Mision exitosa: recompensas aplicadas;Mision activa;Esperar duracion;Gold/Rep subieron;-;Pendiente
  U05;Unit;Mision fallida: XP parcial (50%) para colonos;Mision activa;Forzar fallo;XP < exito;-;Pendiente
  U06;Unit;headhunt exitoso anade especialista dorado;Mision headhunt;Completar;Colono con border dorado;-;Pendiente
  I01;Integracion;Rep misiones + pedidos se acumula;Ambos sistemas;5 pedidos + 2 misiones;Rep total correcta;-;Pendiente
  I02;Integracion;Especialista tiene atributo >= 8 en especialidad;headhunt OK;Ver stats;Atributo >= 8;-;Pendiente
  R01;Regresion;REP-TABL no afectado;Pedidos activos;Tener misiones activas;Pedidos siguen generandose;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_REP-MISI_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_REP-MISI_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque2.zip
---

## BLOQUE 3 -- Arbol de tecnologia

---

### PASO K - [TEC-ARBOL] Arbol de tecnologia (desbloqueo de edificios)

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

PRUEBAS -- [TEC-ARBOL] -- CSV: test/test_TEC-ARBOL_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Sin basic_construction: construir Choza da error;unlockedTechs=[];Intentar buildHouse;Toast Requiere investigacion;-;Pendiente
  U02;Unit;basic_construction desbloqueada por defecto;Estado inicial;Ver unlockedTechs;Contiene basic_construction;-;Pendiente
  U03;Unit;startResearch descuenta recursos correctamente;Recursos suficientes;Iniciar improved_tools;Recursos descontados;-;Pendiente
  U04;Unit;Solo 1 investigacion activa;researchQueue activo;Intentar otra tech;Toast de error;-;Pendiente
  U05;Unit;Investigacion completa en N dias;improved_tools en curso;Esperar N dias;Tech desbloqueada;-;Pendiente
  U06;Unit;Tech desbloqueada habilita edificios;improved_tools OK;Ver Construccion;Smithy visible;-;Pendiente
  I01;Integracion;Flujo: investigar -> construir -> producir;basic_construction OK;Todo el flujo;Produccion activa;-;Pendiente
  R01;Regresion;Edificios pre-existentes siguen funcionando;Edificios antes de tech;Cargar save;Edificios activos;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_TEC-ARBOL_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_TEC-ARBOL_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque3.zip
---

## BLOQUE 4 -- Herramientas y metal

---

### PASO L - [MET-TALL] Herramientas + Taller del Herrero

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

PRUEBAS -- [MET-TALL] -- CSV: test/test_MET-TALL_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Construir Taller descuenta madera y piedra;Recursos OK;Construir smithy;Recursos descontados;-;Pendiente
  U02;Unit;Taller produce hacha al completar timer;Worker asignado;Esperar 4 dias;axe en inventario;-;Pendiente
  U03;Unit;Sin hacha aserradero produce 0;Aserradero T1 sin hacha;Ver produccion;woodRate=0;-;Pendiente
  U04;Unit;Hacha pierde durabilidad;Hacha asignada;10 dias;durability < 100;-;Pendiente
  U05;Unit;Hacha a 0 durabilidad se desasigna;Hacha en 1%;Esperar;assignedTo=null toast;-;Pendiente
  I01;Integracion;Ciclo: producir hacha -> asignar -> aserradero produce;0 hachas;Producir y asignar;Madera produciendose;-;Pendiente
  R01;Regresion;Canteras sin pico existen pero rate=0;Cantera construida;Quitar pico;Visible pero rate=0;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_MET-TALL_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_MET-TALL_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO M - [MET-FORJA] Mineral de hierro + Forja

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

PRUEBAS -- [MET-FORJA] -- CSV: test/test_MET-FORJA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Cantera con pico produce mineral de hierro;Cantera T1 pico asignado;Tick;state.iron sube;-;Pendiente
  U02;Unit;Forja convierte 5 mineral en 1 lingote;iron=5 Forja activa;Ciclo;ironBars+=1 iron-=5;-;Pendiente
  U03;Unit;Herramienta T2 requiere ironBars;ironBars=2 Taller T2;Producir pico T2;ironBars-=2;-;Pendiente
  U04;Unit;Sin mineral Forja no produce;iron=0;Tick;ironBars sin cambio;-;Pendiente
  I01;Integracion;Cadena completa cantera->mineral->forja->lingote->herramienta T2;Todo construido;Producir;Pico T2 obtenido;-;Pendiente
  R01;Regresion;Herramientas T1 siguen produciendose;Taller T1;Producir hacha T1;Hacha T1 OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_MET-FORJA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_MET-FORJA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque4.zip
---

## BLOQUE 5 -- Sistema de trabajo (RUPTURA -- backup OBLIGATORIO antes)

---

### PASO N - [WORK-PRIO] Prioridades de colonos (sustituye asignacion directa)

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

PRUEBAS -- [WORK-PRIO] -- CSV: test/test_WORK-PRIO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Colono P1=fogata asignado a fogata;1 fogata 1 colono P1=fogata;Tick;currentTask=fogata;-;Pendiente
  U02;Unit;Colono pasa a P2 si P1 llena;P1=fogata llena P2=granja;Tick;currentTask=granja;-;Pendiente
  U03;Unit;Colono idle si todas prioridades llenas;Todas ocupadas;Tick;currentTask=null;-;Pendiente
  U04;Unit;Sin prioridades colono idle;priorities=[];Tick;currentTask=null;-;Pendiente
  U05;Unit;Tasas de produccion correctas;2 colonos fogata;Ver rates;foodRate x2 vs 1 colono;-;Pendiente
  I01;Integracion;Produccion colonia correcta con prioridades;5 colonos 3 edificios;10 dias;Produccion similar a antes;-;Pendiente
  R01;Regresion;INF-POZO sigue funcionando;Pozo activo;Colono P1=granja;Granja avanza con agua;-;Pendiente
  R02;Regresion;COL-HAMBRE sigue funcionando;isStarving=true;Anadir comida;Come inmediatamente;-;Pendiente
  R03;Regresion;CON-OBRA sigue funcionando;playerBuilding set;Intentar recolectar;Toast de error;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_WORK-PRIO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_WORK-PRIO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO O - [WORK-EDIF] Prioridades de edificios (fallback automatico de recetas)

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

PRUEBAS -- [WORK-EDIF] -- CSV: test/test_WORK-EDIF_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Fogata sin trigo cambia a patata;trigo=0 patata>0;Tick;cookingRecipeNow=patata;-;Pendiente
  U02;Unit;Fogata vuelve a trigo al haber trigo;cocinando patata;Anadir trigo;cookingRecipeNow=trigo;-;Pendiente
  U03;Unit;Para si no hay ninguna receta;Todas sin stock;Tick;cookingRecipeNow=null badge Sin ingredientes;-;Pendiente
  U04;Unit;Granero sin semillas trigo pasa a patata;sem_trigo=0 sem_patata>0;Tick;produce sem patata;-;Pendiente
  R01;Regresion;selectedRecipe no cambia solo cookingRecipeNow;selectedRecipe=trigo;Sin trigo;selectedRecipe sigue trigo;-;Pendiente
  R02;Regresion;WORK-PRIO funciona junto a prioridades edificios;WORK-PRIO activo;Activar fallback;Prioridades colonos OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_WORK-EDIF_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_WORK-EDIF_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO P - [WORK-SLOT] Slots multiples por tier en edificios

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

PRUEBAS -- [WORK-SLOT] -- CSV: test/test_WORK-SLOT_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Fogata T1 solo permite 1 worker;Fogata T1;Asignar 2 colonos;Solo 1 aceptado;-;Pendiente
  U02;Unit;Caldero T2 permite 2 workers con recetas distintas;Caldero T2;Asignar 2 colonos;Ambos producen;-;Pendiente
  U03;Unit;Cocina T3 bonus +30% velocidad;Cocina T3 1 worker;Comparar ciclo;Ciclo mas rapido;-;Pendiente
  U04;Unit;Cambiar receta slot 1 no afecta slot 2;Caldero T2 2 slots;Cambiar receta slot 1;Slot 2 sin cambio;-;Pendiente
  U05;Unit;Migracion save con workerAssigned carga OK;Save antiguo;Cargar;workers array OK;-;Pendiente
  I01;Integracion;2 colonos Caldero T2 doblan produccion vs 1 Fogata T1;Ambos activos;10 dias;Caldero T2 x2;-;Pendiente
  R01;Regresion;WORK-PRIO sigue asignando correctamente;WORK-PRIO activo;Asignar via prioridades;Slots respetan limites;-;Pendiente
  R02;Regresion;WORK-EDIF sigue funcionando con slots;Fallback activo;Sin ingredientes slot 1;Slot 2 sin cambios;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_WORK-SLOT_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_WORK-SLOT_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque5.zip
---

## BLOQUE 6 -- Cadena alimentaria

---

### PASO Q - [FOOD-GRAN] Ganaderia y sub-productos (huevos, pieles, fertilizante)

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

PRUEBAS -- [FOOD-GRAN] -- CSV: test/test_FOOD-GRAN_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Comprar gallina descuenta oro;gold>=30;Comprar gallina;gallina en state.animals gold-=30;-;Pendiente
  U02;Unit;Gallina produce huevos por tick;1 gallina;1 dia;state.eggs>0;-;Pendiente
  U03;Unit;Cerdo produce fertilizante;1 cerdo;1 dia;state.fertilizer>0;-;Pendiente
  U04;Unit;Fertilizar granja acelera crecimiento;Granja en grow fert>1;Clic Fertilizar;stageElapsed+=0.5;-;Pendiente
  U05;Unit;Animales consumen comida diariamente;1 gallina;Ver consumo;food disminuye;-;Pendiente
  I01;Integracion;Ciclo gallina->huevos->venta mercado;Sistema activo;Producir y vender;Gold sube;-;Pendiente
  R01;Regresion;Granjas siguen funcionando con animales;Granjas existentes;Comprar animales;Granjas sin cambio;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_FOOD-GRAN_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_FOOD-GRAN_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO R - [FOOD-MOLI] Molino + cadena trigo-harina-pan

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

PRUEBAS -- [FOOD-MOLI] -- CSV: test/test_FOOD-MOLI_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Molino convierte 5 trigos en 1 harina;wheat=5 Molino activo;Ciclo T1;flour+=1 wheat-=5;-;Pendiente
  U02;Unit;Fogata T2 puede seleccionar Pan;Fogata T2 flour>=2;Ver selector;Opcion Pan disponible;-;Pendiente
  U03;Unit;Pan requiere 2 harinas;Caldero T2 flour=2;Ciclo pan;bread+=1 flour-=2;-;Pendiente
  U04;Unit;Pan equivale a mas comida que trigo;Ambos disponibles;Ver equivalencias;pan_value > wheat_value;-;Pendiente
  I01;Integracion;Cadena: granja->trigo->molino->harina->pan->comida;Todo activo;30 dias;Colonos alimentados con pan;-;Pendiente
  R01;Regresion;Recetas previas de fogata siguen disponibles;Fogata T2;Ver selector;Zanahoria patata visibles;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_FOOD-MOLI_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_FOOD-MOLI_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO S - [FOOD-GRANO] Trigo produce grano + paja (MIGRACION CRITICA state.wheat)

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

PRUEBAS -- [FOOD-GRANO] -- CSV: test/test_FOOD-GRANO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Cosechar produce grano Y paja;Granja trigo cosecha;Cosechar;state.grain>0 AND state.straw>0;-;Pendiente
  U02;Unit;Ratio paja/grano correcto;Cosechar 60 grano;Ver straw;straw=30;-;Pendiente
  U03;Unit;Save antiguo con wheat carga como grain;Save con wheat>0;Cargar;state.grain=wheat anterior;-;Pendiente
  U04;Unit;state.wheat=0 tras migracion;Save antiguo;Cargar;wheat=0;-;Pendiente
  U05;Unit;Fogata sigue cocinando con grain;Fogata grain>0;Tick;Comida producida;-;Pendiente
  U06;Unit;Mercado muestra grain no wheat;Mercado;Ver lista venta;Grano visible no Trigo;-;Pendiente
  I01;Integracion;FOOD-MOLI funciona con grain;Molino activo;Moler grano;Harina producida;-;Pendiente
  R01;Regresion;Equivalencias de comida OK con grain;grain>0;Ver eficiencia;Sin cambio vs antes;-;Pendiente
  R02;Regresion;Grep state.wheat: 0 resultados excepto migracion;-;Grep src/js;0 refs a wheat;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_FOOD-GRANO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_FOOD-GRANO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque6.zip
---

## BLOQUE 7 -- Combate y defensa

---

### PASO T - [COMB-ARME] Armeria y equipo para colonos

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

PRUEBAS -- [COMB-ARME] -- CSV: test/test_COMB-ARME_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Armeria requiere ironBars>=20;ironBars<20;Construir;Toast de error;-;Pendiente
  U02;Unit;Armeria produce armadura cuero con pieles;skins>=2;Completar ciclo;1 armadura cuero;-;Pendiente
  U03;Unit;Equipar colono con armadura;1 armadura;Equipar;state.equipment set;-;Pendiente
  U04;Unit;Badge Armadura en colono equipado;Colono equipado;Ver ficha;Badge visible;-;Pendiente
  I01;Integracion;Cadena: pieles->armeria->armar colonos;Todo activo;Producir y equipar;Colonos armados;-;Pendiente
  R01;Regresion;FOOD-GRAN sigue produciendo pieles;Ganaderia activa;10 dias;Pieles aumentando;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_COMB-ARME_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_COMB-ARME_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO U - [COMB-RAID] Sistema de bandidos e incursiones

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

PRUEBAS -- [COMB-RAID] -- CSV: test/test_COMB-RAID_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Probabilidad raid aumenta con dias;Dia 1 vs dia 200;Ver prob;Dia 200 > Dia 1;-;Pendiente
  U02;Unit;Toast aviso con dias de cuenta atras;Raid activado;Ver UI;Toast visible;-;Pendiente
  U03;Unit;Banner rojo visible durante cuenta atras;Raid activo;Ver UI;Banner rojo;-;Pendiente
  U04;Unit;Victoria si defensePoints >= strength;dp>=strength;Ejecutar raid;Gold ganado;-;Pendiente
  U05;Unit;Derrota pierde 20% madera y comida;dp<strength;Ejecutar raid;Recursos reducidos;-;Pendiente
  U06;Unit;raidHistory actualizado tras cada raid;1 raid;Ver state.raidHistory;1 entrada;-;Pendiente
  I01;Integracion;Armadura COMB-ARME anade bonus defensa;Colono equipado;Raid;defensePoints mas alto;-;Pendiente
  R01;Regresion;Produccion no se detiene durante aviso;Raid en curso;Ver produccion;Edificios produciendo;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_COMB-RAID_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_COMB-RAID_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO V - [COMB-ESCA] Escalado de raids y panel de defensa

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

PRUEBAS -- [COMB-ESCA] -- CSV: test/test_COMB-ESCA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Raid 2 mas fuerte que raid 1;2 raids historial;Comparar strength;strength[1]>strength[0];-;Pendiente
  U02;Unit;Raid epico (cada 10) tiene doble fuerza;10 raids OK;Raid 11;strength x2;-;Pendiente
  U03;Unit;Historial visible con al menos 1 raid;1 raid;Ver historial;Tabla con 1 fila;-;Pendiente
  U04;Unit;Contador raids repelidos correcto;3 victorias 1 derrota;Ver stats;Repelidos=3 Derrotas=1;-;Pendiente
  R01;Regresion;COMB-RAID base no afectado por escalado;Raids activos;Ver base;Aviso y resultado OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_COMB-ESCA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_COMB-ESCA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO W - [COMB-MURA] Murallas + Puestos de guardia

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

PRUEBAS -- [COMB-MURA] -- CSV: test/test_COMB-MURA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Empalizada T1 reduce prob raid 20%;Sin vs con empalizada;Ver effectiveProbability;Baja 0.20;-;Pendiente
  U02;Unit;2 empalizadas T1 reducen 40%;2 empalizadas T1;Ver prob;Baja 0.40;-;Pendiente
  U03;Unit;Guardia anade 5 defensePoints;1 guardia;Ver defensePoints;+5;-;Pendiente
  U04;Unit;Puesto max 3 guardias;4 colonos;Asignar 4;Solo 3 aceptados;-;Pendiente
  I01;Integracion;Empalizada T2 + 3 guardias: raids muy poco frecuentes;Todo activo;500 dias dev;Pocos raids;-;Pendiente
  R01;Regresion;COMB-RAID sigue ocurriendo (menos frecuente);Raids activos;Jugar con muralla;Raids ocurren;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_COMB-MURA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_COMB-MURA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque7.zip
---

## BLOQUE 8 -- Medioambiente (estaciones + calor)

---

### PASO X - [ENV-ESTA] Estaciones del anyo (primavera/verano/otono/invierno)

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

PRUEBAS -- [ENV-ESTA] -- CSV: test/test_ENV-ESTA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Dia 1-30 del anyo: primavera;yearDay=1;Ver currentSeason;spring;-;Pendiente
  U02;Unit;Dia 91 del anyo: invierno;yearDay=91;Ver currentSeason;winter;-;Pendiente
  U03;Unit;Al llegar invierno: cultivos reseteados;Granja en grow dia 91;Ver granjas;stage=idle activeCrop=null;-;Pendiente
  U04;Unit;En invierno granjas no avanzan;Invierno granja sembrada;Tick;stageElapsed no cambia;-;Pendiente
  U05;Unit;Frutos silvestres: produccion=0 en invierno;Invierno recoleccion;Tick;berries sin aumento;-;Pendiente
  U06;Unit;Primavera: cultivo disponible de nuevo;Invierno->primavera;Plantar;Granja avanza;-;Pendiente
  I01;Integracion;Jugador sobrevive el invierno con stock;Comida stockeada;Pasar invierno;Colonos vivos;-;Pendiente
  R01;Regresion;PROD-RAND no afectado en invierno (solo granjas y frutos);Aserradero activo;Invierno;Madera sigue produciendose;-;Pendiente
  R02;Regresion;INF-POZO: agua se repone en invierno;Pozo activo;Amanecer invierno;waterToday=waterMax-consumo;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_ENV-ESTA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_ENV-ESTA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO Y - [ENV-CALO] Quemador de madera + recurso Calor global

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

PRUEBAS -- [ENV-CALO] -- CSV: test/test_ENV-CALO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Sin quemador: fogata no cocina;0 quemadores;Tick fogata;foodRate=0;-;Pendiente
  U02;Unit;Quemador activo: heatStock sube;Quemador activo wood>0;1 dia;heatStock>0;-;Pendiente
  U03;Unit;Fogata consume heatStock;heatStock=10 fogata ON;Tick;heatStock<10;-;Pendiente
  U04;Unit;heatStock no supera heatCapacity;Quemador activo;Muchos dias;heatStock<=heatCapacity;-;Pendiente
  U05;Unit;Sin madera quemador para;wood=0;Tick;heatStock no sube;-;Pendiente
  I01;Integracion;Cadena: madera->quemador->calor->fogata cocina;Todo activo;5 dias;Comida produciendose;-;Pendiente
  R01;Regresion;Invierno no afecta al quemador;Invierno quemador;Tick;Sigue generando calor;-;Pendiente
  R02;Regresion;MET-FORJA: forja necesita calor;Forja activa sin calor;Tick;Forja no produce;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_ENV-CALO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_ENV-CALO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO Z - [ENV-INVI] Calor en casas durante el invierno

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

PRUEBAS -- [ENV-INVI] -- CSV: test/test_ENV-INVI_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Verano: coldPenaltyActive=false;Verano;Ver eficiencia;Sin penalizacion;-;Pendiente
  U02;Unit;Invierno con calor suficiente: sin penalizacion;Invierno heatStock OK;Cambio dia;coldPenaltyActive=false;-;Pendiente
  U03;Unit;Invierno sin calor: -30% eficiencia;Invierno heatStock=0;Cambio dia;Eficiencia *= 0.7;-;Pendiente
  U04;Unit;Casa aislada consume -50% calor;1 aislada 1 sin aislar;Invierno;heatNeeded reducido;-;Pendiente
  U05;Unit;Primavera: penalizacion eliminada;Invierno->primavera;Ver estado;coldPenaltyActive=false;-;Pendiente
  I01;Integracion;Todas casas aisladas + quemador: sin penalizacion;Todo activo;Pasar invierno;Sin badge Frio;-;Pendiente
  R01;Regresion;ENV-ESTA sigue calculando invierno OK;Sistema estaciones;Transicion;currentSeason=winter;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_ENV-INVI_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_ENV-INVI_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque8.zip
---

## BLOQUE 9 -- Materiales avanzados

---

### PASO AA - [MAT-BARRO] Recolector de barro (requiere Pala)

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

PRUEBAS -- [MAT-BARRO] -- CSV: test/test_MAT-BARRO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Sin Pala mudpit produce 0;Mudpit sin pala;Ver produccion;mud no aumenta;-;Pendiente
  U02;Unit;Con Pala T1: produce barro en 3 dias;Pala T1 asignada;3 dias;mud+=8;-;Pendiente
  U03;Unit;Barro en panel de recursos;mud>0;Ver recursos;Card barro visible;-;Pendiente
  U04;Unit;Pala fabricada en Taller;Taller activo;Producir pala;shovel_t1 en inventario;-;Pendiente
  R01;Regresion;MET-TALL: durabilidad afecta a la Pala;Pala asignada;N dias;Durabilidad baja;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_MAT-BARRO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_MAT-BARRO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO AB - [MAT-ADOBE] Adobe + aislamiento de casas

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

PRUEBAS -- [MAT-ADOBE] -- CSV: test/test_MAT-ADOBE_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Granero puede seleccionar receta Adobe;Granero mud>0 straw>0;Ver selector;Opcion Adobe disponible;-;Pendiente
  U02;Unit;Adobe consume barro (3) y paja (2);mud=3 straw=2;Ciclo Adobe;adobe+=2 mud-=3 straw-=2;-;Pendiente
  U03;Unit;Boton aislar disabled si adobe=0;adobe=0;Ver boton casa;Boton disabled;-;Pendiente
  U04;Unit;Aislar casa T1 descuenta 5 adobe;adobe=5;Clic Aislar;adobe=0 insulated=true;-;Pendiente
  U05;Unit;Badge Aislada visible en casa aislada;insulated=true;Ver UI;Badge visible;-;Pendiente
  I01;Integracion;Cadena barro+paja->adobe->aislar->invierno sin penalizacion;Todo activo;Pasar invierno;Sin penalizacion;-;Pendiente
  R01;Regresion;MAT-BARRO sigue produciendo barro;Mudpit activo;Adobe en paralelo;Barro OK;-;Pendiente
  R02;Regresion;FOOD-GRANO produce paja;Granja activa;Cosechar;paja producida;-;Pendiente
  R03;Regresion;ENV-INVI calcula calor con casas aisladas;Sistema invierno;Pasar invierno;heatNeeded reducido;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_MAT-ADOBE_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_MAT-ADOBE_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---


> BACKUP: aetheria_bkp_vBloque9.zip
---

## BLOQUE 10 -- Pulido final

---

### PASO AC - [POL-METR] Panel de metricas de economia

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

PRUEBAS -- [POL-METR] -- CSV: test/test_POL-METR_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Panel de metricas visible;Juego cargado;Ver UI;Panel visible;-;Pendiente
  U02;Unit;Ingreso diario de oro correcto;Mercado auto activo;Ver metrica oro;Valor correcto;-;Pendiente
  U03;Unit;Consumo comida diario correcto;3 colonos;Ver metrica comida;3*consumo_colono;-;Pendiente
  U04;Unit;Eficiencia colonia visible;Colonos hambrientos;Ver metricas;Porcentaje<100%;-;Pendiente
  R01;Regresion;Metricas no afectan logica del juego;Panel visible;Ver tasas reales;Produccion sin cambio;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_POL-METR_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_POL-METR_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO AD - [POL-BALA] Balance pass: ajuste de parametros en CSVs

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

PRUEBAS -- [POL-BALA] -- CSV: test/test_POL-BALA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;1 colono + 1 granja: sobrevivir 10 dias;Reset partida;10 dias;Colono vivo;-;Pendiente
  U02;Unit;Primeros edificios alcanzables en <5 dias;Partida nueva;5 dias recoleccion;Madera+piedra para Choza;-;Pendiente
  U03;Unit;Vender pan mas rentable que trigo crudo;Mercado activo;Comparar precios;pan>trigo;-;Pendiente
  U04;Unit;Herramienta T1: vida ~67 dias;Hacha T1 asignada;Modo dev;durability=0 en dia ~67;-;Pendiente
  U05;Unit;5o colono alcanzable en ~30 dias;Partida normal;30 dias;Rep suficiente para 5o colono;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_POL-BALA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_POL-BALA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
---

---

### PASO AE - [POL-TUTO] Tutorial de primera partida

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

PRUEBAS -- [POL-TUTO] -- CSV: test/test_POL-TUTO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Tutorial aparece en partida nueva;Reset partida;Ver UI;Panel tutorial visible;-;Pendiente
  U02;Unit;Tutorial no aparece si ya completado;tutorialCompleted=true;Cargar;Panel oculto;-;Pendiente
  U03;Unit;Paso 0 resalta botones de recoleccion;Tutorial paso 0;Ver UI;Clase highlight en botones;-;Pendiente
  U04;Unit;Avanza al cumplir condicion;Tutorial paso 0;Recolectar wood=10;Avanza paso 1;-;Pendiente
  U05;Unit;Saltar tutorial oculta panel;Tutorial visible;Clic Saltar;Panel oculto tutorialCompleted=true;-;Pendiente
  R01;Regresion;Juego funciona con tutorial visible;Tutorial activo;5 dias;Sin errores;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_POL-TUTO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_POL-TUTO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
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

### PASO AF - [POL-VISTA] Vista 2D del pueblo (baja prioridad, opcional)

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

PRUEBAS -- [POL-VISTA] -- CSV: test/test_POL-VISTA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Edificios aparecen en mapa al construirlos;Construir aserradero;Ver pestana Pueblo;Icono en grid;-;Pendiente
  U02;Unit;Colono tiene posicion que corresponde a su tarea;Colono en granja;Ver mapa;Punto en celda granja;-;Pendiente
  U03;Unit;Colono idle en celda central o casa;Colono idle;Ver mapa;Punto en home;-;Pendiente
  R01;Regresion;Rendimiento no afectado por vista 2D;Grid visible;10 dias;Sin lag notable;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_POL-VISTA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_POL-VISTA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).
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