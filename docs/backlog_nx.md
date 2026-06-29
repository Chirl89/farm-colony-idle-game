# Backlog NX - Aetheria: Granja & Colonia
## Mecanicas de largo plazo (implementar tras completar todos los bloques del plan)

> Seguir el mismo protocolo que el plan principal:
> - Cada paso indica archivos exactos. Solo tocar esos.
> - CSV de tests al completar cada mecanica.
> - Backup ZIP antes de mecanicas de alto riesgo.

---

### PASO NX-A - [NX-BARRA] Barra de alimentacion continua 1-24h (reemplaza sistema actual)

Riesgo: Muy Alto -- depende de [COL-HAMBRE]
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: En vez de comer 2 veces al dia (manana/noche), el colono tiene
          una barra de hambre de 0 a 1 que baja continuamente.
          Cuando llega a 0: el colono intenta comer (misma logica de food priority).
          Esto reemplaza el sistema de horario fijo.

En gamestate.js -- colonists[i]:
  hungerBar: 1.0  // 1=lleno 0=hambriento -- MIGRACION: si undefined -> 1.0
  hungerDecayRate: 0.04  // baja 4% por hora de juego (1/24 por dia -- configurable en mechanics.csv)

  Categoria Hunger en mechanics.csv:
    Hunger;hunger_decay_per_day;Decaimiento de hambre por dia de juego;1.0
    Hunger;hunger_warning_threshold;Umbral de aviso de hambre;0.25
    Hunger;hunger_emergency_threshold;Umbral de emergencia de hambre;0.10

En gameloop.js -- en gameTick():
  state.colonists.forEach(c => {
    const decay = (CONFIG?.Hunger?.hunger_decay_per_day?.value ?? 1.0) * dayDelta;
    c.hungerBar = Math.max(0, c.hungerBar - decay);
    if (c.hungerBar <= 0) {
      const fed = tryFeedColonist(c);  // misma funcion de COL-HAMBRE
      if (fed) c.hungerBar = 1.0;      // resetear al comer
    }
  });

  ELIMINAR: feedColonistsMorning() y feedColonistsEvening() (sustituidos por el tick continuo)
  MANTENER: tryFeedColonist(c) que ya existe de COL-HAMBRE

  EFICIENCIA: si hungerBar < 0.25 -> efficiency *= 0.8 (aviso)
              si hungerBar < 0.10 -> efficiency *= 0.5 (emergencia)
              si hungerBar == 0 y no puede comer: colonist.isDying = true
  (Sustituye el flag isStarving boolean por la barra continua)

En ui-render.js -- renderColonistCard(colonist):
  Mostrar barra de hambre debajo del nombre:
    > 50%: verde | 25-50%: amarillo | < 25%: rojo pulsando
    Badge "Hambriento" si hungerBar < 0.10
    Badge "Muriendo" si isDying

MIGRACION:
  if (typeof c.hungerBar === 'undefined') c.hungerBar = 1.0;
  if (typeof c.isDying === 'undefined') c.isDying = false;
  delete c.isStarving; // deprecated

PRUEBAS -- [NX-BARRA] -- CSV: test/test_NX-BARRA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;hungerBar baja continuamente;Colono activo;Tick;hungerBar < 1.0;-;Pendiente
  U02;Unit;Colono come automaticamente al llegar a 0;hungerBar=0 food>0;Tick;hungerBar reset a 1.0;-;Pendiente
  U03;Unit;Barra verde por encima de 50%;hungerBar=0.8;Ver UI;Barra verde;-;Pendiente
  U04;Unit;Barra roja por debajo de 25%;hungerBar=0.2;Ver UI;Barra roja;-;Pendiente
  U05;Unit;Migracion save anterior con isStarving;Save con isStarving;Cargar;hungerBar set correctamente;-;Pendiente
  I01;Integracion;Colonos sobreviven sin cambios de horario;Sistema activo;30 dias;Sin muertes inesperadas;-;Pendiente
  R01;Regresion;Comida sigue consumiendose correctamente;Sistema alimentacion;Ver state.food;Baja al ritmo esperado;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-BARRA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-BARRA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-B - [NX-COMER] Comer consume tiempo del colono (pausa el trabajo)

Riesgo: Alto -- depende de [NX-BARRA] y [WORK-PRIO]
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Cuando un colono come (hungerBar = 0 -> reset), pasa N minutos
          de juego sin producir (esta "comiendo"). Solo entonces vuelve a trabajar.
          Hace el balance de comida mas exigente.

En gamestate.js -- colonists[i]:
  eatingTimer: 0  // segundos de juego restantes comiendo (0 = no comiendo)
  MECHANICS.csv: Hunger;eating_duration_days;Duracion de la comida en dias de juego;0.2

En gameloop.js -- en tryFeedColonist() (tras comer exitosamente):
  c.eatingTimer = CONFIG?.Hunger?.eating_duration_days?.value ?? 0.2;

En gameTick():
  if (c.eatingTimer > 0) {
    c.eatingTimer -= dayDelta;
    c.currentTask = null;  // no produce mientras come
    return;  // skip resto de asignacion
  }

En ui-render.js:
  Badge "Comiendo" si eatingTimer > 0 (con spinner o animacion)
  La barra de hambre muestra el reset al 1.0

PRUEBAS -- [NX-COMER] -- CSV: test/test_NX-COMER_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Colono no produce mientras eatingTimer>0;eatingTimer=0.2;Tick;currentTask=null;-;Pendiente
  U02;Unit;eatingTimer baja con cada tick;eatingTimer=0.2;Tick;eatingTimer<0.2;-;Pendiente
  U03;Unit;Colono vuelve a trabajar al terminar de comer;eatingTimer=0;Tick;currentTask asignado;-;Pendiente
  U04;Unit;Badge Comiendo visible mientras eatingTimer>0;eatingTimer>0;Ver UI;Badge visible;-;Pendiente
  I01;Integracion;Con mas colonos la produccion baja un poco (comer pausa);10 colonos;30 dias;Produccion < sin NX-COMER;-;Pendiente
  R01;Regresion;WORK-PRIO reasigna correctamente tras comer;WORK-PRIO activo;Colono termina de comer;currentTask correcto;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-COMER_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-COMER_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-C - [NX-COMID] Comida obligatoria para misiones y caravanas

Riesgo: Bajo -- depende de [REP-MISI]
Archivos: src/js/gamestate.js, src/js/buildings.js, src/js/ui-render.js

OBJETIVO: Al enviar colonos en mision, se descuenta comida del inventario
          para el suministro del viaje. Sin comida suficiente: mision bloqueada.

En mechanics.csv -- Categoria Mission:
  Mission;food_per_colonist_per_day;Comida por colono por dia de mision;2
  Mission;min_food_buffer;Buffer minimo de comida para permitir mision;5

En buildings.js -- startMission(missionId, colonistIds):
  const mission = getMission(missionId);
  const foodNeeded = colonistIds.length * mission.duration * (CONFIG.Mission.food_per_colonist_per_day.value ?? 2);
  const buffer = CONFIG.Mission.min_food_buffer.value ?? 5;
  if (state.totalFood < foodNeeded + buffer) {
    showToast("Sin comida suficiente para la mision", "error");
    return;
  }
  state.totalFood -= foodNeeded;
  // iniciar mision normal

En ui-render.js -- renderMissions():
  Mostrar coste de comida en la tarjeta de mision
  Si no hay comida: boton Enviar disabled con tooltip

PRUEBAS -- [NX-COMID] -- CSV: test/test_NX-COMID_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Mision muestra coste de comida en tarjeta;Mision disponible;Ver tarjeta;Coste visible;-;Pendiente
  U02;Unit;Sin comida suficiente boton disabled;food<coste;Ver boton;Boton disabled;-;Pendiente
  U03;Unit;Enviar mision descuenta comida;food suficiente;Enviar;food reducida;-;Pendiente
  R01;Regresion;REP-MISI sigue funcionando (misiones completan normalmente);Sistema misiones;Mision exitosa;Recompensas OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-COMID_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-COMID_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-D - [NX-CIUDA] Otras ciudades + rutas comerciales + caravanas

Riesgo: Muy Alto -- depende de [FOOD-MOLI]
Archivos: src/data/cities.csv (nuevo), src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js, src/js/ui-events.js, index.html

OBJETIVO: Descubrir otras ciudades abriendo rutas comerciales.
          Las caravanas viajan automaticamente cada N dias segun la ruta.
          Cada ciudad tiene lista de recursos que compra/vende (distinta al mercado global).

NUEVO CSV src/data/cities.csv:
  ID;Name;Distance_Days;Buys_Resource;Buys_Price;Sells_Resource;Sells_Price;Min_Rep_Required
  city_farmhaven;Puerto Granero;5;grain;3;tools;15;0
  city_ironhold;Ciudadela de Hierro;10;iron_bar;8;iron_ore;2;5
  city_lumbervale;Valle Maderero;7;wood;2;charcoal;5;10
  city_silkport;Puerto Seda;15;food;4;cloth;12;20
  city_stonegate;Puerta de Piedra;8;stone;3;marble;20;15

En gamestate.js:
  discoveredCities: []   // IDs de ciudades descubiertas
  activeRoutes: []       // { cityId, resourceSell, resourceBuy, elapsed, durationDays, caravan }
  MIGRACION: if (!state.discoveredCities) state.discoveredCities = [];

En gameloop.js -- al completar N dias:
  Cada ruta activa: elapsed += dayDelta
  Si elapsed >= durationDays:
    Ejecutar intercambio (vender recurso, recibir recurso)
    elapsed = 0
    showToast("Caravana de [ciudad] ha vuelto")

En ui-render.js -- nueva pestana "Comercio":
  Lista de ciudades descubiertas con distancia y precios
  Por ciudad: botones "Establecer ruta" + selector recurso vender/comprar
  Caravanas activas: barra de progreso con dias restantes

En ui-events.js: listeners para establecer/cancelar rutas

DESCUBRIR CIUDADES: al completar ciertas misiones o al alcanzar cierta reputacion

PRUEBAS -- [NX-CIUDA] -- CSV: test/test_NX-CIUDA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Ciudad descubierta aparece en lista;discoveredCities=['city_farmhaven'];Ver Comercio;Ciudad visible;-;Pendiente
  U02;Unit;Establecer ruta crea activeRoute;Ciudad descubierta;Establecer ruta;activeRoute anadido;-;Pendiente
  U03;Unit;Caravana llega tras N dias y hace intercambio;Ruta activa 5 dias;5 dias;Intercambio ejecutado;-;Pendiente
  U04;Unit;Sin rep suficiente: ciudad bloqueada;rep < min_rep;Ver ciudad;Bloqueada;-;Pendiente
  I01;Integracion;Ruta de grano a city_farmhaven da beneficio;Ruta activa;50 dias;Gold aumenta;-;Pendiente
  R01;Regresion;Mercado global no afectado;Mercado activo;Ruta activa;Mercado OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-CIUDA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-CIUDA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-E - [NX-MINAS] Incursiones activas para descubrir nuevas minas

Riesgo: Medio -- depende de [COMB-RAID]
Archivos: src/data/missiondata.csv, src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Nuevas misiones de tipo "exploracion" envian colonos a zonas peligrosas.
          Si tienen exito, descubren una nueva zona de recursos
          (tipo: mina de cobre, cantera de granito, bosque denso).
          Las zonas descubiertas permiten construir edificios de extraccion con mayor yield.

En missiondata.csv -- nuevas misiones tipo exploration:
  exploration_copper;Mision;Explorar: Minas de Cobre;2;7;0;0;0;25;copper_vein
  exploration_granite;Mision;Explorar: Cantera de Granito;1;5;0;0;0;15;granite_deposit
  exploration_deepforest;Mision;Explorar: Bosque Profundo;2;8;0;0;0;30;ancient_forest

En gamestate.js:
  discoveredZones: []  // ['copper_vein', 'granite_deposit', ...]

En gameloop.js -- completeExplorationMission():
  if (success && mission.discovery) {
    state.discoveredZones.push(mission.discovery);
    showToast("Has descubierto [nombre zona]", "success");
    updateUI();  // refrescar construccion con nuevas opciones
  }

En buildings.js -- isBuildingUnlocked():
  Algunas construcciones requieren discoveredZone ademas de tech:
    buildCopperMine() solo disponible si 'copper_vein' en discoveredZones

En ui-render.js -- renderBuildings():
  Edificios de zona especial: bloqueados hasta que se descubre la zona
  Icono de ojo con tooltip "Requiere explorar esta zona"

PRUEBAS -- [NX-MINAS] -- CSV: test/test_NX-MINAS_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Mision exploracion disponible en lista;missiondata con exploration;Ver misiones;Mision visible;-;Pendiente
  U02;Unit;Exito exploracion anade zona a discoveredZones;Mision exploration_copper exito;Completar;copper_vein en discoveredZones;-;Pendiente
  U03;Unit;Zona descubierta habilita edificio de extraccion;copper_vein en zones;Ver construccion;Mina de cobre habilitada;-;Pendiente
  R01;Regresion;COMB-RAID no afectado por exploraciones;Raids activos;Explorar;Raids siguen funcionando;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-MINAS_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-MINAS_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-F - [NX-CARRO] Carros y caballos para caravanas

Riesgo: Bajo -- depende de [NX-CIUDA]
Archivos: src/data/prices.csv, src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Comprar carros y caballos en el mercado para reducir el tiempo
          de viaje de las caravanas y aumentar la cantidad de recursos que llevan.

En prices.csv -- nuevas compras en mercado:
  Vehicle;cart;Carro de transporte;50;0;aumenta cap caravana +50%
  Vehicle;horse;Caballo;80;0;reduce tiempo viaje -30%

En gamestate.js:
  vehicles: { carts: 0, horses: 0 }

En gameloop.js -- calculo de ruta de caravana:
  const speedMult  = 1 - (state.vehicles.horses * 0.1);  // cada caballo -10% tiempo
  const capacityMult = 1 + (state.vehicles.carts * 0.2); // cada carro +20% cantidad
  const routeDuration = baseDuration * speedMult;
  const tradeAmount = baseAmount * capacityMult;

PRUEBAS -- [NX-CARRO] -- CSV: test/test_NX-CARRO_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Comprar caballo reduce duracion de ruta;1 caballo ruta 10 dias;Ver duracion;9 dias;-;Pendiente
  U02;Unit;Comprar carro aumenta cantidad de intercambio;1 carro;Ver cantidad;+20% recursos;-;Pendiente
  R01;Regresion;NX-CIUDA sigue funcionando con vehiculos;Ruta activa;Anadir caballo;Ruta sigue;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-CARRO_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-CARRO_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-G - [NX-ATACA] Ataques a caravanas durante el trayecto

Riesgo: Medio -- depende de [NX-CIUDA] y [COMB-RAID]
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Las caravanas pueden ser atacadas en el camino.
          La probabilidad aumenta con la distancia de la ciudad.
          El jugador puede asignar colonos como escolta para reducir el riesgo.

En gamestate.js -- activeRoutes[i]:
  escort: []        // colonistIds asignados como escolta
  attackRisk: 0.05  // calculado en base a distancia

En gameloop.js -- al hacer tick de caravana:
  if (Math.random() < route.attackRisk * (1 - escort.length * 0.15)) {
    // Caravana atacada: pierde el 50% de los recursos intercambiados
    showToast("La caravana a [ciudad] fue atacada", "error");
  }

En ui-render.js: UI para asignar escolta a cada ruta activa

PRUEBAS -- [NX-ATACA] -- CSV: test/test_NX-ATACA_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Caravana sin escolta puede ser atacada;attackRisk>0;Simular ataque forzado;Pierden 50% recursos;-;Pendiente
  U02;Unit;Cada escolta reduce riesgo 15%;1 escolta;Comparar prob;Prob reducida;-;Pendiente
  U03;Unit;Toast de ataque visible;Caravana atacada;Ver UI;Toast rojo;-;Pendiente
  R01;Regresion;NX-CIUDA ruta sigue completandose tras ataque (si no pierde todo);Ataque leve;Caravana llega;Intercambio parcial;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-ATACA_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-ATACA_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-H - [NX-DETER] Deterioro de alimentos

Riesgo: Medio -- depende de [ENV-ESTA]
Archivos: src/data/resources.csv, src/data/mechanics.csv, src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Los alimentos se deterioran con el tiempo. En verano mas rapido.
          Alimentos elaborados (pan, cocido) duran mas que crudos (frutos, carne cruda).

En resources.csv -- nueva columna Decay_Days:
  FoodRaw;berries;Frutos silvestres;7;alta tasa de deterioro
  FoodRaw;carrot;Zanahoria;14;
  FoodRaw;potato;Patata;21;
  FoodRaw;grain;Grano;60;
  FoodProcessed;bread;Pan;30;elaborado dura mas
  FoodProcessed;stew;Guiso;14;ya cocinado pero perecedero

En mechanics.csv -- Decay:
  Decay;summer_multiplier;Multiplicador de deterioro en verano;1.5;mas calor = mas rapido
  Decay;winter_multiplier;Multiplicador de deterioro en invierno;0.5;frio conserva
  Decay;daily_decay_fraction;Fraccion diaria de perdida (del stock);0.01;1% del stock por dia

En gameloop.js -- al cambiar de dia:
  const seasonMult = state.currentSeason === 'summer' ? 1.5 :
                     state.currentSeason === 'winter' ? 0.5 : 1.0;
  const baseFrac = CONFIG?.Decay?.daily_decay_fraction?.value ?? 0.01;
  // Para cada recurso perecedero:
  const decayFrac = (1/resource.Decay_Days) * seasonMult;
  state[resourceKey] = Math.floor(state[resourceKey] * (1 - decayFrac));

En ui-render.js -- cards de recursos perecederos:
  Icono de deterioro + "Caduca en ~X dias" segun stock y tasa
  Barra de frescura (verde -> amarillo -> rojo)

PRUEBAS -- [NX-DETER] -- CSV: test/test_NX-DETER_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Frutos pierden 1/7 al dia;100 frutos dia 1;Ver dia 8;frutos < 100 (aprox 25);-;Pendiente
  U02;Unit;Pan dura mas que frutos;100 pan 100 frutos;Ver dia 8;pan > frutos;-;Pendiente
  U03;Unit;En verano deterioro x1.5;Verano 100 frutos;Ver dia 8;< deterioro normal;-;Pendiente
  U04;Unit;En invierno deterioro x0.5;Invierno 100 frutos;Ver dia 8;> deterioro normal (menos perdida);-;Pendiente
  R01;Regresion;Grano no se deteriora demasiado rapido;100 grano;60 dias;Queda bastante grano;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-DETER_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-DETER_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-I - [NX-MERC2] Mercado mejorable (ambulante -> red de caravanas -> mercado fijo)

Riesgo: Alto -- depende de [NX-CIUDA]
Archivos: src/data/buildings.csv, src/js/gamestate.js, src/js/buildings.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: El mercado actual (ambulante) es el tier 1. Se puede mejorar:
          T1 Mercado Ambulante: precios actuales, disponible siempre
          T2 Red de Caravanas: mejores precios, requiere NX-CIUDA con 2 rutas activas
          T3 Mercado Fijo: mejores precios aun, nuevas opciones de compra, requiere Ayto T3

En buildings.csv -- nuevos upgrades al mercado:
  Upgrade;market_t2;Red de Caravanas;2;1;0;30;20;50;0;none
  Upgrade;market_t3;Mercado Fijo;3;3;100;50;50;100;0;none

En gamestate.js -- state.market:
  tier: 1  // 1-3
  MIGRACION: if (!state.market?.tier) state.market = { tier: 1 };

En gameloop.js -- precios de compra/venta:
  const priceMult = state.market.tier === 3 ? 1.3 :
                    state.market.tier === 2 ? 1.15 : 1.0;
  // Ventas: precio * priceMult | Compras: precio / priceMult (mas barato)

En ui-render.js -- renderMarket():
  Mostrar tier actual del mercado y boton de mejora
  T2: requiere 2 rutas activas (tooltip si no se cumple)
  T3: requiere Ayto T3

PRUEBAS -- [NX-MERC2] -- CSV: test/test_NX-MERC2_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Mercado T2 ofrece mejores precios de venta;Mejorar a T2;Vender 10 grain;Mas gold que T1;-;Pendiente
  U02;Unit;Upgrade T2 bloqueado sin 2 rutas activas;1 ruta activa;Intentar mejorar;Toast requisito;-;Pendiente
  U03;Unit;Mercado T3 desbloquea nuevas opciones de compra;Market T3;Ver opciones compra;Nuevos items visibles;-;Pendiente
  R01;Regresion;Mercado T1 sigue funcionando tras actualizar;Market previo;Cargar save;Precios T1 sin cambio;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-MERC2_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-MERC2_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-J - [NX-RECLU] Atributos de reclutas escalables segun tier del Ayuntamiento

Riesgo: Bajo -- depende de [TEC-ARBOL]
Archivos: src/data/mechanics.csv, src/js/ui-render.js, src/js/gamestate.js

OBJETIVO: Los candidatos para contratar tienen mejores atributos base
          segun el tier del Ayto. A mas alto el tier, mejores reclutas disponibles.

En mechanics.csv -- Recruit:
  Recruit;ayto_t1_attr_min;Atributo minimo de recruta Ayto T1;1
  Recruit;ayto_t1_attr_max;Atributo maximo de recruta Ayto T1;5
  Recruit;ayto_t2_attr_min;Atributo minimo Ayto T2;2
  Recruit;ayto_t2_attr_max;Atributo maximo Ayto T2;7
  Recruit;ayto_t3_attr_min;Atributo minimo Ayto T3;4
  Recruit;ayto_t3_attr_max;Atributo maximo Ayto T3;9
  Recruit;headhunt_specialty_min;Atributo minimo especialidad headhunt;8

En gamestate.js -- generateRecruitCandidates():
  const tier = state.townHall.tier;
  const attrMin = CONFIG?.Recruit?.[`ayto_t${tier}_attr_min`]?.value ?? 1;
  const attrMax = CONFIG?.Recruit?.[`ayto_t${tier}_attr_max`]?.value ?? 5;
  // Generar atributos en rango [attrMin, attrMax]

En ui-render.js -- renderRecruits():
  Indicador del rango de atributos: "Reclutando en tier 2 (atributos 2-7)"

PRUEBAS -- [NX-RECLU] -- CSV: test/test_NX-RECLU_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Con Ayto T1: reclutas entre atributos 1-5;Ayto T1;Generar candidatos;Todos attrs 1-5;-;Pendiente
  U02;Unit;Con Ayto T3: reclutas entre 4-9;Ayto T3;Generar candidatos;Todos attrs 4-9;-;Pendiente
  U03;Unit;Indicador de rango visible en UI;Cualquier tier;Ver pestana reclutar;Rango visible;-;Pendiente
  R01;Regresion;headhunt sigue dando atributo >=8 en especialidad;headhunt activo;Completar;Especialidad >=8;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-RECLU_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-RECLU_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-K - [NX-RCOL] Atributo unico de recoleccion

Riesgo: Medio -- depende de [WORK-PRIO]
Archivos: src/data/mechanics.csv, src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js

OBJETIVO: Unificar los atributos de recoleccion de madera, piedra y frutos
          en un unico atributo "Recoleccion" que aplica a todos.
          El resto de atributos (woodcutting, mining, foraging) siguen existiendo
          como especializaciones con un pequeño bonus adicional.

En mechanics.csv -- Skills:
  Skills;gathering_base;Multiplicador base del atributo Recoleccion;1.0
  Skills;gathering_specialty_bonus;Bonus de especializacion en un tipo;0.1;+10% adicional

En gamestate.js -- colonists[i].attributes:
  Anadir: gathering: 1  // nuevo atributo base de recoleccion
  MIGRACION: if (!c.attributes.gathering) c.attributes.gathering = 1;

En gameloop.js -- produccion de recoleccion manual y automatica:
  const gatherMult = getAttributeMult(colonist, 'gathering') *
                     (1 + (getAttributeMult(colonist, specificAttr) - 1) * 0.1);

En ui-render.js:
  Mostrar "Recoleccion: X" en ficha del colono
  Tooltip: "Madera/Piedra/Frutos se ven afectados. Especialidades: bonus +10%"

PRUEBAS -- [NX-RCOL] -- CSV: test/test_NX-RCOL_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Atributo gathering visible en ficha colono;Cualquier colono;Ver ficha;Gathering en UI;-;Pendiente
  U02;Unit;Subir gathering mejora todas las recolecciones;Colono gathering=5;Ver produccion;Madera+Piedra+Frutos suben;-;Pendiente
  U03;Unit;Especializacion woodcutting da +10% sobre gathering;gathering=5 woodcutting=5;Comparar produccion madera;+10%;-;Pendiente
  R01;Regresion;WORK-PRIO sigue asignando correctamente;Sistema activo;Recoleccion con nuevo attr;Asignacion OK;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-RCOL_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-RCOL_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).

---

### PASO NX-L - [NX-PANEL] Panel de aldeanos mejorado

Riesgo: Bajo -- depende de [WORK-PRIO]
Archivos: src/js/ui-render.js, src/css/styles.css

OBJETIVO: Sustituir el panel de aldeanos actual por uno mas eficiente:
          Vista compacta: solo muestra homeless/starving/productividad media
          Vista expandida (clic en colono): detalle completo con prioridades
          Filtros: por estado (activo/idle/hambriento) y por tarea actual

En ui-render.js -- renderColonists():
  Modo compacto (defecto):
    Lista de chips de color por colono:
      Verde = trabajando | Amarillo = idle | Rojo = hambriento | Naranja = sin casa
    Resumen arriba: "X trabajando | Y idle | Z hambrientos | W sin casa"
    Clic en chip -> expandir detalle completo de ese colono

  Modo detalle (expandido para 1 colono):
    Igual que ahora (nombre, atributos, prioridades)
    Boton para volver a vista compacta

  Filtros:
    Dropdown "Mostrar: Todos | Solo idle | Solo hambrientos | Solo sin casa"

En CSS: chips de colono con transition de color suave

PRUEBAS -- [NX-PANEL] -- CSV: test/test_NX-PANEL_YYYYMMDD_HHMMSS.csv
Columnas: ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado
  U01;Unit;Vista compacta muestra 1 chip por colono;5 colonos;Ver Aldeanos;5 chips;-;Pendiente
  U02;Unit;Chip verde si trabajando;Colono con currentTask;Ver chip;Verde;-;Pendiente
  U03;Unit;Chip rojo si hambriento;Colono isStarving;Ver chip;Rojo;-;Pendiente
  U04;Unit;Clic en chip expande detalle;Chip de colono;Clic;Detalle visible;-;Pendiente
  U05;Unit;Filtro Solo idle oculta trabajadores;Mix activo+idle;Aplicar filtro;Solo idle visibles;-;Pendiente
  R01;Regresion;WORK-PRIO sigue funcionando con nuevo panel;WORK-PRIO activo;Ver prioridades en detalle;Prioridades editables;-;Pendiente


#### 🧪 Instrucciones para la Creación y Ejecución de Pruebas:
1. **Crear el archivo CSV**: Tras implementar esta mecánica, crea un archivo CSV en el directorio `test/` con el nombre exacto `test_NX-PANEL_{YYYYMMDD}_{HHMMSS}.csv` (por ejemplo: `test_NX-PANEL_20260629_120000.csv`).
2. **Copiar las pruebas**: Copia las filas de prueba listadas arriba en el nuevo archivo CSV con el formato: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`.
3. **Ejecutar y registrar**: Realiza las pruebas en el juego (puedes usar el Panel de Desarrollo Ctrl+Shift+D para acelerar o inyectar recursos). Completa la columna `Resultado_Real` con el comportamiento observado y marca la columna `Estado` como `PASS` o `FAIL`.
4. **Registrar en el índice**: Añade la nueva entrada del archivo CSV a la tabla de índice en [test/README.md](file:///C:/Users/EM2025007512/.gemini/antigravity/scratch/farm-colony-idle-game/test/README.md).