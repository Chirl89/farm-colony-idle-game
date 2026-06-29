# 📁 test/ — Sistema de Pruebas — Aetheria: Granja & Colonia

## Propósito
Cada CSV de pruebas se genera cuando **toca probar** esa mecánica tras su implementación, no antes.
El formato de nombre de archivo es: `test_[MECANICA]_[YYYYMMDD]_[HHMMSS].csv` (por ejemplo: `test_DEV_20260629_153022.csv`).

## Tipos de test

| Tipo | Cuándo se genera | Qué cubre |
|------|-----------------|-----------|
| **Unit** | Al completar cada paso individual | Una función, interfaz o cálculo específico |
| **Integration** | Al terminar una mecánica completa | Interacción y comunicación entre sistemas del juego |
| **Regression** | Al terminar una mecánica que afecte sistemas previos | Garantía de que la lógica preexistente no se ha roto |

## Índice de Mecánicas y Archivos de Test

Aquí se listan todas las mecánicas en su orden de prioridad de implementación, sus correspondientes pasos de pruebas y los nombres esperados de sus archivos CSV de test:

| # | Mecánica | Paso | Archivo CSV esperado |
|---|----------|------|----------------------|
| 1 | Panel de desarrollo | **PASO A** - `[DEV]` | `test_DEV_YYYYMMDD_HHMMSS.csv` |
| 2 | Tasas en días de juego | **PASO B** - `[UI-DIAS]` | `test_UI-DIAS_YYYYMMDD_HHMMSS.csv` |
| 3 | Ayuntamiento renombrado | **PASO C** - `[UI-AYTO]` | `test_UI-AYTO_YYYYMMDD_HHMMSS.csv` |
| 4 | Hambre reactiva | **PASO D** - `[COL-HAMBRE]` | `test_COL-HAMBRE_YYYYMMDD_HHMMSS.csv` |
| 5 | Jugador bloqueado en obra | **PASO E** - `[CON-OBRA]` | `test_CON-OBRA_YYYYMMDD_HHMMSS.csv` |
| 6 | Pozo de agua | **PASO F** - `[INF-POZO]` | `test_INF-POZO_YYYYMMDD_HHMMSS.csv` |
| 7 | Almacenes y capacidad | **PASO G** - `[INF-ALMA]` | `test_INF-ALMA_YYYYMMDD_HHMMSS.csv` |
| 8 | Aleatoriedad en producción | **PASO H** - `[PROD-RAND]` | `test_PROD-RAND_YYYYMMDD_HHMMSS.csv` |
| 9 | Tablón de pedidos | **PASO I** - `[REP-TABL]` | `test_REP-TABL_YYYYMMDD_HHMMSS.csv` |
| 10 | Sistema de misiones | **PASO J** - `[REP-MISI]` | `test_REP-MISI_YYYYMMDD_HHMMSS.csv` |
| 11 | Árbol de tecnología | **PASO K** - `[TEC-ARBOL]` | `test_TEC-ARBOL_YYYYMMDD_HHMMSS.csv` |
| 12 | Herramientas + Herrero | **PASO L** - `[MET-TALL]` | `test_MET-TALL_YYYYMMDD_HHMMSS.csv` |
| 13 | Mineral de hierro + Forja | **PASO M** - `[MET-FORJA]` | `test_MET-FORJA_YYYYMMDD_HHMMSS.csv` |
| 14 | Prioridades de colonos | **PASO N** - `[WORK-PRIO]` | `test_WORK-PRIO_YYYYMMDD_HHMMSS.csv` |
| 15 | Fallback de recetas | **PASO O** - `[WORK-EDIF]` | `test_WORK-EDIF_YYYYMMDD_HHMMSS.csv` |
| 16 | Slots múltiples por tier | **PASO P** - `[WORK-SLOT]` | `test_WORK-SLOT_YYYYMMDD_HHMMSS.csv` |
| 17 | Ganadería y sub-productos | **PASO Q** - `[FOOD-GRAN]` | `test_FOOD-GRAN_YYYYMMDD_HHMMSS.csv` |
| 18 | Molino + harina -> pan | **PASO R** - `[FOOD-MOLI]` | `test_FOOD-MOLI_YYYYMMDD_HHMMSS.csv` |
| 19 | Trigo -> grano + paja | **PASO S** - `[FOOD-GRANO]` | `test_FOOD-GRANO_YYYYMMDD_HHMMSS.csv` |
| 20 | Armería y equipo | **PASO T** - `[COMB-ARME]` | `test_COMB-ARME_YYYYMMDD_HHMMSS.csv` |
| 21 | Bandidos e incursiones | **PASO U** - `[COMB-RAID]` | `test_COMB-RAID_YYYYMMDD_HHMMSS.csv` |
| 22 | Escalado de raids | **PASO V** - `[COMB-ESCA]` | `test_COMB-ESCA_YYYYMMDD_HHMMSS.csv` |
| 23 | Murallas + Puestos de guardia | **PASO W** - `[COMB-MURA]` | `test_COMB-MURA_YYYYMMDD_HHMMSS.csv` |
| 24 | Estaciones del año | **PASO X** - `[ENV-ESTA]` | `test_ENV-ESTA_YYYYMMDD_HHMMSS.csv` |
| 25 | Quemador + Calor global | **PASO Y** - `[ENV-CALO]` | `test_ENV-CALO_YYYYMMDD_HHMMSS.csv` |
| 26 | Calor en invierno (casas) | **PASO Z** - `[ENV-INVI]` | `test_ENV-INVI_YYYYMMDD_HHMMSS.csv` |
| 27 | Recolector de barro | **PASO AA** - `[MAT-BARRO]` | `test_MAT-BARRO_YYYYMMDD_HHMMSS.csv` |
| 28 | Adobe + aislamiento | **PASO AB** - `[MAT-ADOBE]` | `test_MAT-ADOBE_YYYYMMDD_HHMMSS.csv` |
| 29 | Métrica de economía | **PASO AC** - `[POL-METR]` | `test_POL-METR_YYYYMMDD_HHMMSS.csv` |
| 30 | Balance pass de CSVs | **PASO AD** - `[POL-BALA]` | `test_POL-BALA_YYYYMMDD_HHMMSS.csv` |
| 31 | Tutorial de primera partida | **PASO AE** - `[POL-TUTO]` | `test_POL-TUTO_YYYYMMDD_HHMMSS.csv` |
| 32 | Vista 2D del pueblo | **PASO AF** - `[POL-VISTA]` | `test_POL-VISTA_YYYYMMDD_HHMMSS.csv` |
| 33 | Barra de alimentación continua | **PASO NX-A** - `[NX-BARRA]` | `test_NX-BARRA_YYYYMMDD_HHMMSS.csv` |
| 34 | Comer consume tiempo | **PASO NX-B** - `[NX-COMER]` | `test_NX-COMER_YYYYMMDD_HHMMSS.csv` |
| 35 | Comida caravanas/misiones | **PASO NX-C** - `[NX-COMID]` | `test_NX-COMID_YYYYMMDD_HHMMSS.csv` |
| 36 | Rutas comerciales | **PASO NX-D** - `[NX-CIUDA]` | `test_NX-CIUDA_YYYYMMDD_HHMMSS.csv` |
| 37 | Descubrir minas | **PASO NX-E** - `[NX-MINAS]` | `test_NX-MINAS_YYYYMMDD_HHMMSS.csv` |
| 38 | Carros y caballos | **PASO NX-F** - `[NX-CARRO]` | `test_NX-CARRO_YYYYMMDD_HHMMSS.csv` |
| 39 | Ataques a caravanas | **PASO NX-G** - `[NX-ATACA]` | `test_NX-ATACA_YYYYMMDD_HHMMSS.csv` |
| 40 | Deterioro de alimentos | **PASO NX-H** - `[NX-DETER]` | `test_NX-DETER_YYYYMMDD_HHMMSS.csv` |
| 41 | Mercado mejorable | **PASO NX-I** - `[NX-MERC2]` | `test_NX-MERC2_YYYYMMDD_HHMMSS.csv` |
| 42 | Reclutas escalables | **PASO NX-J** - `[NX-RECLU]` | `test_NX-RECLU_YYYYMMDD_HHMMSS.csv` |
| 43 | Atributo único recolección | **PASO NX-K** - `[NX-RCOL]` | `test_NX-RCOL_YYYYMMDD_HHMMSS.csv` |
| 44 | Panel de aldeanos mejorado | **PASO NX-L** - `[NX-PANEL]` | `test_NX-PANEL_YYYYMMDD_HHMMSS.csv` |

## Formato CSV de tests
Las columnas del archivo CSV deben ser exactamente:
`ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`

Los estados posibles para cada prueba son: `PASS` | `FAIL` | `SKIP` | `PENDING`.

## Historial de Archivos de Test Generados

| Archivo | Mecánica | Fecha de Generación | Estado Global |
|---------|----------|---------------------|---------------|
| *(se irán registrando aquí tras completarse las pruebas de cada paso)* | | | |
