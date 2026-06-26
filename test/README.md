# 📁 test/ — Sistema de Pruebas — Aetheria: Granja & Colonia

## Propósito
Cada CSV de tests se genera cuando **toca probar** esa mecánica, no antes.
El naming es: `test_[mecanica]_[YYYYMMDD]_[HHMMSS].csv`

## Tipos de test

| Tipo | Cuándo se genera | Qué cubre |
|------|-----------------|-----------|
| **Unit** | Al completar cada paso individual | Una función/cálculo específico |
| **Integration** | Al terminar una mecánica completa (N pasos) | Interacción entre sistemas |
| **Regression** | Al terminar una mecánica que afecte sistemas previos | Que nada anterior se rompió |

## Mecánicas y cuándo se generan sus tests

| Mecánica | Pasos | Test generado tras... |
|----------|-------|----------------------|
| UI/Producciones | M1 | M1 completado |
| Ayuntamiento renombrado | M2 | M2 completado |
| Pozo de agua | M3 | M3 completado |
| Hambre reactiva | M4 | M4 completado |
| Jugador bloqueado construyendo | M5 | M5 completado |
| Almacenes + capacidad | M6 | M6 completado |
| Prioridades de colonos | M7 | M7 completado |
| Prioridades de edificios | M8 | M8 completado + regresión M7 |
| Árbol de tecnología | M9 | M9 completado |
| Vista 2D | M10 | M10 completado (opcional) |
| Aleatoriedad en producción | M11 | M11 completado |
| Estaciones | M12 | M12 + regresión granjas, frutos |
| Quemador + Calor | M13a | M13a completado |
| Calor en invierno (casas) | M13b | M13b + regresión M12 |
| Murallas y puestos de guardia | M14 | M14 completado |
| Slots múltiples por tier | M15 | M15 + regresión edificios |
| Recolector de barro | M16 | M16 completado |
| Trigo → grano + paja | M17 | M17 + regresión graneros |
| Adobe + aislamiento | M18 | M18 + regresión M13b |
| Barra de alimentación 1-24h | NX1 | NX1 completado |
| Comer tarda tiempo | NX2 | NX2 + regresión colonos |
| Comida caravanas/misiones | NX3 | NX3 + regresión misiones |

## Formato CSV de tests

Columnas: `ID;Tipo;Descripcion;Precondicion;Accion;Resultado_Esperado;Resultado_Real;Estado;Notas`

Estados: PASS | FAIL | SKIP | PENDING

## Índice de CSVs generados

| Archivo | Mecánica | Fecha | Estado |
|---------|----------|-------|--------|
| *(se irán añadiendo aquí)* | | | |
