# Prompts de implementacion - Aetheria: Granja & Colonia
## Como usar estos prompts

1. Copia el prompt del paso que vas a implementar.
2. Abrelo en una nueva conversacion con Antigravity.
3. El agente leera el contexto del proyecto antes de empezar.
4. Al terminar, pide que genere el CSV de pruebas correspondiente.

PREAMBLE COMUN (incluido en todos los prompts -- el agente lo leera automaticamente via CONTEXT.md):
  - Juego: "Aetheria: Granja & Colonia" -- idle game construccion medieval
  - Stack: HTML/CSS/JS vanilla. Sin frameworks. Sin backend.
  - Archivos: index.html, src/js/, src/css/, src/data/ (CSV con parametros)
  - Estado: localStorage. Config global en window.CONFIG (cargada desde CSVs)
  - LEER SIEMPRE ANTES: .agents/CONTEXT.md y docs/backlog.md
  - grep_search antes de view_file en archivos grandes (ui-render.js ~170KB)
  - NO modificar archivos no listados en "Archivos a modificar"
  - Hacer backup ZIP antes de pasos de riesgo alto
  - **CERO HARDCODING:** No se permite hardcodear costes, ratios de producción, multiplicadores, duraciones o fórmulas en el código JS. Todo debe ser parametrizable y leerse de CONFIG.
  - **MODULARIDAD Y FUNCIONES COMPACTAS:** Si una función JS supera las 45 líneas, refactorízala extrayendo la lógica secundaria a subfunciones auxiliares dedicadas.

---

## BLOQUE 0 -- Quick Wins

=== PROMPT PASO A - [DEV] Panel de desarrollo ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar el panel de desarrollo (Ctrl+Shift+D) segun el PASO A - [DEV] del plan.
Archivos: src/js/ui-render.js, src/js/ui-events.js, src/css/styles.css
Al terminar: verificar los 6 casos de prueba del bloque PRUEBAS [DEV] del plan.
Cuando todo funcione: genera el CSV test/test_DEV_[YYYYMMDD]_[HHMMSS].csv con los resultados.

=== PROMPT PASO B - [UI-DIAS] Tasas en dias de juego ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO B - [UI-DIAS]: cambiar el display de tasas de produccion de /s a /dia.
Usa grep_search en src/js/ui-render.js buscando "/s" y "Rate" para encontrar los textos.
Archivos: src/js/ui-render.js, src/js/gameloop.js
IMPORTANTE: no cambiar la logica interna -- solo el texto de display.
Al terminar: verifica los casos de prueba [UI-DIAS] del plan y genera test/test_UI-DIAS_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO C - [UI-AYTO] Renombrar Ayuntamiento por tiers ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO C - [UI-AYTO]: T1="Casa del Jugador", T2="Centro Comunitario", T3="Ayuntamiento".
Usa grep_search buscando "Ayuntamiento" y "townhall" antes de editar.
Archivos: src/data/buildings.csv, src/js/ui-render.js, src/js/buildings.js, index.html
Al terminar: verifica los 5 casos de prueba [UI-AYTO] y genera test/test_UI-AYTO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO D - [COL-HAMBRE] Hambre reactiva ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO D - [COL-HAMBRE]: colonos hambrientos comen inmediatamente al anadirse comida.
Extrae la funcion tryFeedColonist() de la logica de feedColonists existente.
Archivos: src/js/gameloop.js
Al terminar: verifica los 4 casos de prueba y genera test/test_COL-HAMBRE_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 1 -- Infraestructura basica

=== PROMPT PASO E - [CON-OBRA] Jugador bloqueado construyendo ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO E - [CON-OBRA]: el jugador no puede recolectar mientras construye.
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js, src/js/ui-events.js
MIGRACION: anadir state.playerBuilding = null con migracion en loadGame().
Al terminar: verifica los 6 casos y genera test/test_CON-OBRA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO F - [INF-POZO] Pozo de agua ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO F - [INF-POZO]: pozo como infraestructura que genera agua diaria.
Sin pozo: las granjas no pueden regar. Los colonos consumen agua al amanecer.
Archivos: src/data/buildings.csv, src/data/timings.csv, src/data/mechanics.csv,
          src/js/gamestate.js, src/js/buildings.js, src/js/gameloop.js, src/js/ui-render.js, index.html
MIGRACION obligatoria: wells:[], waterToday:0, waterMax:0
Al terminar: verifica los 10 casos de prueba [INF-POZO] y genera test/test_INF-POZO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO G - [INF-ALMA] Almacenes y capacidad maxima ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO G - [INF-ALMA]: sistema de capacidad maxima de recursos.
Ayto T1=100, T2=200, T3=500 por tipo. Almacenes amplian la capacidad.
BACKUP antes de empezar (paso de riesgo alto).
Archivos: src/data/buildings.csv, src/data/timings.csv, src/data/mechanics.csv,
          src/js/gamestate.js, src/js/buildings.js, src/js/gameloop.js, src/js/ui-render.js, index.html
ADEMAS: renombrar "Edificios de Produccion" -> "Construcciones" (grep primero).
Al terminar: verifica los 9 casos [INF-ALMA] y genera test/test_INF-ALMA_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 2 -- Produccion y reputacion

=== PROMPT PASO H - [PROD-RAND] Aleatoriedad en produccion ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO H - [PROD-RAND]: cada produccion tiene un rango min-max.
Anadir columnas Output_Min y Output_Max a production.csv.
Archivos: src/data/production.csv, src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 5 casos de prueba y genera test/test_PROD-RAND_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO I - [REP-TABL] Tablon de pedidos ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO I - [REP-TABL]: sistema de pedidos diarios que generan reputacion.
3 pedidos al dia, la entrega da reputacion, la reputacion permite contratar mas colonos.
Archivos (leer plan para detalle completo).
Al terminar: verifica los 7 casos de prueba y genera test/test_REP-TABL_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO J - [REP-MISI] Sistema de misiones ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO J - [REP-MISI]: sistema completo de misiones con especialistas.
Es la mecanica de mayor alcance del bloque 2. Crear missiondata.csv.
Al terminar: verifica los 9 casos de prueba y genera test/test_REP-MISI_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 3 -- Arbol de tecnologia

=== PROMPT PASO K - [TEC-ARBOL] Arbol de tecnologia ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO K - [TEC-ARBOL]: arbol de tecnologia que bloquea construcciones.
BACKUP antes de empezar (riesgo alto).
Crear src/data/tech.csv con las 9 tecnologias del plan.
Archivos: src/data/tech.csv (nuevo), src/js/data-loader.js, src/js/gamestate.js,
          src/js/buildings.js, src/js/ui-render.js, src/js/ui-events.js, index.html
IMPORTANTE: basic_construction desbloqueada por defecto. Solo 1 investigacion activa.
Al terminar: verifica los 8 casos [TEC-ARBOL] y genera test/test_TEC-ARBOL_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 4 -- Herramientas y metal

=== PROMPT PASO L - [MET-TALL] Herramientas y Taller del Herrero ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO L - [MET-TALL]: sistema de herramientas con durabilidad.
Sin hacha: aserradero no produce. Sin pico: cantera no produce.
Herramientas se fabrican en el Taller con madera (T1) o hierro (T2).
Tienen durabilidad que baja con el uso.
Al terminar: verifica los 7 casos y genera test/test_MET-TALL_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO M - [MET-FORJA] Mineral de hierro y Forja ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO M - [MET-FORJA]: mineral de hierro producido en canteras con pico.
La Forja convierte 5 mineral en 1 lingote. Los lingotes fabrican herramientas T2.
Archivos: ver PASO M - [MET-FORJA] en docs/plan.md
Al terminar: verifica los 6 casos y genera test/test_MET-FORJA_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 5 -- Sistema de trabajo (RUPTURA)

=== PROMPT PASO N - [WORK-PRIO] Prioridades de colonos ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO N - [WORK-PRIO]: sistema de prioridades que reemplaza la asignacion directa.
BACKUP OBLIGATORIO antes de empezar. Este paso rompe el sistema de asignacion actual.
Cada colono tiene una lista ordenada de prioridades. Trabaja en la de mayor prioridad con slot libre.
Si no hay slot disponible en ninguna prioridad: colono idle.
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js, src/js/ui-events.js
MIGRACION: convertir job->priorities sin borrar datos de partidas existentes.
Al terminar: verifica los 9 casos (incluyendo 3 de regresion) y genera test/test_WORK-PRIO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO O - [WORK-EDIF] Prioridades de edificios ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO O - [WORK-EDIF]: fallback automatico de recetas en edificios.
Requiere [WORK-PRIO] ya implementado.
Si falta el ingrediente de la receta principal: el edificio pasa a la siguiente disponible.
Vuelve a la principal cuando hay stock.
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 6 casos y genera test/test_WORK-EDIF_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO P - [WORK-SLOT] Slots multiples por tier ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO P - [WORK-SLOT]: T2 permite 2 slots paralelos, T3 ademas tiene bonus de velocidad.
Requiere [WORK-PRIO] ya implementado.
MIGRACION: workerAssigned (int) -> workers (array) con compatibilidad con saves existentes.
Archivos: src/data/mechanics.csv, src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 8 casos y genera test/test_WORK-SLOT_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 6 -- Cadena alimentaria

=== PROMPT PASO Q - [FOOD-GRAN] Ganaderia y sub-productos ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO Q - [FOOD-GRAN]: gallinas (huevos), cerdos (fertilizante), vacas (pieles/leche).
Animales consumen comida diariamente. El fertilizante acelera el crecimiento de granjas.
Archivos: ver PASO Q - [FOOD-GRAN] en docs/plan.md
Al terminar: verifica los 7 casos y genera test/test_FOOD-GRAN_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO R - [FOOD-MOLI] Molino y cadena trigo-harina-pan ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO R - [FOOD-MOLI]: Molino convierte trigo en harina. Fogata T2 puede hacer pan.
El pan vale mas como comida que el trigo crudo.
Archivos: ver PASO R - [FOOD-MOLI] en docs/plan.md
Al terminar: verifica los 6 casos y genera test/test_FOOD-MOLI_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO S - [FOOD-GRANO] Migracion trigo -> grano + paja ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO S - [FOOD-GRANO]: MIGRACION CRITICA. Cosechar trigo produce grano + paja.
state.wheat se renombra a state.grain.
ATENCION: hacer grep de "state.wheat" en TODOS los archivos JS antes de empezar.
Archivos: src/data/production.csv, src/data/resources.csv, src/data/equivalences.csv,
          src/js/gamestate.js, src/js/gameloop.js (+ grep en todos los demas JS)
Al terminar: verifica los 9 casos (incluyendo 2 de regresion critica) y genera test/test_FOOD-GRANO_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 7 -- Combate y defensa

=== PROMPT PASO T - [COMB-ARME] Armeria y equipo para colonos ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO T - [COMB-ARME]: armeria que produce armaduras usando pieles de ganaderia.
Los colonos equipados tienen mas puntos de defensa en raids.
Archivos: ver PASO T - [COMB-ARME] en docs/plan.md
Al terminar: verifica los 6 casos y genera test/test_COMB-ARME_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO U - [COMB-RAID] Sistema de bandidos e incursiones ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO U - [COMB-RAID]: sistema completo de raids con aviso, resolucion y consecuencias.
Probabilidad crece con los dias. Aviso con cuenta atras visible. Victoria/derrota con consecuencias.
Archivos: ver PASO U - [COMB-RAID] en docs/plan.md
Al terminar: verifica los 8 casos y genera test/test_COMB-RAID_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO V - [COMB-ESCA] Escalado de raids y panel de defensa ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO V - [COMB-ESCA]: raids mas fuertes con el tiempo. Raid epico cada 10.
Historial de raids. Panel de defensa con metricas.
Archivos: src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 5 casos y genera test/test_COMB-ESCA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO W - [COMB-MURA] Murallas y Puestos de guardia ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO W - [COMB-MURA]: empalizadas que reducen probabilidad de raid.
Puestos de guardia con colonos asignados que suman defensa.
Requiere [COMB-RAID] ya implementado.
Archivos: ver PASO W - [COMB-MURA] en docs/plan.md
Al terminar: verifica los 6 casos y genera test/test_COMB-MURA_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 8 -- Medioambiente

=== PROMPT PASO X - [ENV-ESTA] Estaciones del anyo ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO X - [ENV-ESTA]: 4 estaciones de 30 dias. En invierno no hay cultivos ni frutos.
Cultivos en curso al inicio del invierno se pierden (con toast de aviso).
Archivos: src/data/mechanics.csv, src/js/gamestate.js, src/js/gameloop.js,
          src/js/ui-render.js, index.html
MIGRACION: currentSeason:'spring', yearDay:1
Al terminar: verifica los 10 casos (incluyendo 2 de regresion) y genera test/test_ENV-ESTA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO Y - [ENV-CALO] Quemador de madera y recurso Calor ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO Y - [ENV-CALO]: el Calor es un recurso global que producen los quemadores.
Sin calor: fogatas, forjas y talleres no pueden funcionar.
Requiere [MET-FORJA] ya implementado (la forja necesita calor).
BACKUP antes de empezar (afecta a fogatas y forjas existentes).
Archivos: ver PASO Y - [ENV-CALO] en docs/plan.md
Al terminar: verifica los 8 casos y genera test/test_ENV-CALO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO Z - [ENV-INVI] Calor en casas durante el invierno ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO Z - [ENV-INVI]: en invierno las casas consumen calor del stock global.
Sin calor suficiente: -30% eficiencia de colonos (coldPenaltyActive).
Requiere [ENV-ESTA] y [ENV-CALO] ya implementados.
Archivos: src/data/mechanics.csv, src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 7 casos y genera test/test_ENV-INVI_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 9 -- Materiales avanzados

=== PROMPT PASO AA - [MAT-BARRO] Recolector de barro ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AA - [MAT-BARRO]: nuevo edificio que produce barro usando una Pala.
La Pala se fabrica en el Taller. Sin Pala: produccion = 0.
Archivos: src/data/buildings.csv, src/data/timings.csv, src/data/production.csv,
          src/data/resources.csv, src/data/mechanics.csv,
          src/js/gamestate.js, src/js/buildings.js, src/js/gameloop.js,
          src/js/ui-render.js, index.html
Al terminar: verifica los 5 casos y genera test/test_MAT-BARRO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO AB - [MAT-ADOBE] Adobe y aislamiento de casas ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AB - [MAT-ADOBE]: el granero puede fabricar adobe (barro + paja).
El adobe se usa para aislar casas individualmente. Casas aisladas consumen -50% calor en invierno.
Requiere [MAT-BARRO], [FOOD-GRANO] y [ENV-INVI] ya implementados.
Archivos: ver PASO AB - [MAT-ADOBE] en docs/plan.md
Al terminar: verifica los 9 casos (incluyendo 3 de regresion) y genera test/test_MAT-ADOBE_[YYYYMMDD]_[HHMMSS].csv

---

## BLOQUE 10 -- Pulido final

=== PROMPT PASO AC - [POL-METR] Panel de metricas de economia ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AC - [POL-METR]: panel de metricas con ingreso diario de oro, consumo de comida
y eficiencia de colonia en porcentaje.
Archivos: src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 5 casos y genera test/test_POL-METR_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO AD - [POL-BALA] Balance pass de CSVs ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AD - [POL-BALA]: revisar y ajustar todos los parametros de los CSVs
para que el ritmo de progression sea correcto.
Usa el panel de metricas [POL-METR] para ver los valores reales antes de ajustar.
Al terminar: verifica los 5 casos de balance y genera test/test_POL-BALA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO AE - [POL-TUTO] Tutorial de primera partida ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AE - [POL-TUTO]: tutorial paso a paso para nuevos jugadores.
Aparece solo en partida nueva. Resalta botones. Avanza al cumplir objetivos.
Archivos: ver PASO AE - [POL-TUTO] en docs/plan.md
Al terminar: verifica los 6 casos y genera test/test_POL-TUTO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO AF - [POL-VISTA] Vista 2D del pueblo (opcional) ===
Lee .agents/CONTEXT.md y docs/plan.md para contexto.
TAREA: Implementar PASO AF - [POL-VISTA]: vista top-down 2D que muestra edificios y colonos moviendose.
Es puramente visual. Si la implementacion requiere mas de 200 lineas de logica nueva:
simplificar o mover a NX.
Al terminar: verifica los 4 casos y genera test/test_POL-VISTA_[YYYYMMDD]_[HHMMSS].csv

---

## BACKLOG NX -- Prompts de largo plazo

=== PROMPT PASO NX-A - [NX-BARRA] Barra de alimentacion continua ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-A - [NX-BARRA]: reemplazar el sistema de horario de comida por
una barra de hambre continua (0-1) que baja gradualmente.
BACKUP OBLIGATORIO. Cambia fundamentalmente como comen los colonos.
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js
Al terminar: verifica los 7 casos y genera test/test_NX-BARRA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-B - [NX-COMER] Comer consume tiempo del colono ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-B - [NX-COMER]: cuando un colono come, pausa su trabajo N dias de juego.
Requiere [NX-BARRA] ya implementado.
Archivos: src/js/gamestate.js, src/js/gameloop.js, src/js/ui-render.js
Al terminar: genera test/test_NX-COMER_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-C - [NX-COMID] Comida obligatoria para misiones ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-C - [NX-COMID]: enviar colonos en mision descuenta comida del inventario.
Sin comida suficiente: mision bloqueada.
Archivos: src/data/mechanics.csv, src/js/buildings.js, src/js/ui-render.js
Al terminar: genera test/test_NX-COMID_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-D - [NX-CIUDA] Ciudades y rutas comerciales ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-D - [NX-CIUDA]: sistema de ciudades con caravanas automaticas.
Crear src/data/cities.csv. Nueva pestana "Comercio" en la UI.
Al terminar: genera test/test_NX-CIUDA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-E - [NX-MINAS] Incursiones para descubrir minas ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-E - [NX-MINAS]: misiones de exploracion que descubren zonas de recursos especiales.
Al terminar: genera test/test_NX-MINAS_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-F - [NX-CARRO] Carros y caballos para caravanas ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-F - [NX-CARRO]: vehiculos que mejoran las caravanas (velocidad y capacidad).
Al terminar: genera test/test_NX-CARRO_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-G - [NX-ATACA] Ataques a caravanas ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-G - [NX-ATACA]: caravanas pueden ser atacadas. Asignar escolta para protegerlas.
Al terminar: genera test/test_NX-ATACA_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-H - [NX-DETER] Deterioro de alimentos ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-H - [NX-DETER]: los alimentos se deterioran con el tiempo. En verano mas rapido.
Al terminar: genera test/test_NX-DETER_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-I - [NX-MERC2] Mercado mejorable ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-I - [NX-MERC2]: el mercado tiene 3 tiers con mejores precios cada nivel.
Al terminar: genera test/test_NX-MERC2_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-J - [NX-RECLU] Reclutas escalables por tier del Ayto ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-J - [NX-RECLU]: mejores atributos de reclutas segun el tier del Ayuntamiento.
Al terminar: genera test/test_NX-RECLU_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-K - [NX-RCOL] Atributo unico de recoleccion ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-K - [NX-RCOL]: unificar woodcutting/mining/foraging en un atributo "Recoleccion".
Al terminar: genera test/test_NX-RCOL_[YYYYMMDD]_[HHMMSS].csv

=== PROMPT PASO NX-L - [NX-PANEL] Panel de aldeanos mejorado ===
Lee .agents/CONTEXT.md y docs/backlog_nx.md para contexto.
TAREA: Implementar PASO NX-L - [NX-PANEL]: vista compacta de colonos con chips de color.
Clic para expandir detalle. Filtros por estado.
Al terminar: genera test/test_NX-PANEL_[YYYYMMDD]_[HHMMSS].csv