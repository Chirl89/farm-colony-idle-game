# Plan de Acción: Aetheria - De Idle a Colonia Viva 2D / 3D Isométrica

* **Versión Activa:** `0.2.0`
* **Rama de Trabajo:** `main` (ahead 1)
* **Repositorio Origen:** `https://github.com/Chirl89/farm-colony-idle-game.git`
* **Última Actualización:** `2026-10-26`

---

## 1. Tabla de Estado

| número de punto | punto | breve descripción | estado (implementado, en curso, pendiente) |
| :---: | :--- | :--- | :--- |
| 1.0 | Sincronización del Repositorio y Suite Maestra | Migración del código existente de `farm-colony-idle-game` a este workspace, configuración de reglas y validación inicial de ejecución | implementado |
| 2.0 | Estética Isométrica 3D Minimalista (Diorama Three.js) | Base visual 3D minimalista: hierba verde, suelo arado, colono píldora, edificios limpios con oclusión física real y senderos despejados | implementado |
| 3.0 | Capa Espacial: Coordenadas y Cuadrícula Isométrica | Definir matriz espacial (Grid 3D/Iso) y asignar coordenadas `(x, y, z)` a parcelas, edificios y recursos | pendiente |
| 4.0 | Visor Integrado: Renderizado del Terreno y Edificios de la Colonia | Conexión del bucle de simulación con el renderizador isométrico (crecimiento en tiempo real, ciclos día/noche) | pendiente |
| 5.0 | Colonos Autónomos: Movimiento e IA | Máquina de estados (`Idle`, `Walking`, `Working`, `Delivering`) con pathfinding en cuadrícula (A* ligero) y animaciones de cápsula | pendiente |
| 6.0 | HUD Minimalista y Rebalanceo de CSVs | Sustitución de listas DOM por HUD limpio (barra superior + panel inspector al hacer clic) y ajuste de tiempos en CSVs | pendiente |

---

## 2. Prompts de Ejecución Autocontenidos

> **Instrucción para el Agente:**
> Cada paso contiene un bloque autocontenido listo para ser ejecutado por cualquier modelo (Gemini o Claude) sin pérdida de contexto. No modificar código sin la orden explícita `"procede"`.

### >>> PROMPT DE EJECUCIÓN: PASO 3.0 (Capa Espacial: Coordenadas y Cuadrícula Isométrica)
```text
Carlos, actúa como arquitecto de software de videojuegos y motor de simulación para 'Aetheria'.
Contexto: La base visual isométrica 3D ha quedado validada con Three.js en el Paso 2.0. Ahora debemos estructurar el sistema de coordenadas espaciales que gobernará la lógica de la colonia.
Objetivo:
1. Crear el módulo espacial 'src/js/spatial-grid.js':
   - Matriz espacial discreta (ej. 16x16 o 20x20 casillas).
   - Tipos de casilla: VACIO, HIERBA, SENDERO, SUELO_ARADO, EDIFICIO, AGUA.
   - Definición de huellas espaciales (footprints) con colisión para edificios: Casa Principal (3x3), Granero (3x3), Huerto (4x3), Pozo (1x1).
   - Asignación de puntos de entrada transitables (doors/waypoints) por donde los colonos acceden a cada estructura.
2. Integrar la matriz espacial en 'src/js/gamestate.js' y DEFAULT_STATE con migración limpia en loadGame().
3. Conectar la matriz al visor interactivo para validar la cuadrícula.
4. Incrementar versión en VERSION y entregar la Guía de Pruebas Obligatoria.
Reglas:
- No modificar lógica de producción existente en 'gameloop.js' sin autorización previa.
- Código limpio, modular y documentado.
- Esperar la orden explícita 'procede' de Carlos antes de aplicar cambios.
```

---

## 3. Bitácora de Siguientes Pasos
* **Paso 1.0 completado:** Sincronización e infraestructura del proyecto.
* **Paso 2.0 completado:** Validación de la estética isométrica 3D minimalista con Three.js (Z-buffer real, pradera verde cálida y trazado despejado).
* **Paso 3.0 siguiente:** Implementación de la Capa Espacial (Matriz de cuadrícula, footprints de edificios y puntos de acceso).
