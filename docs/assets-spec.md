# Especificación Visual 2D: Sprout Lands (Base Funcional)

## 1. Fundamentos Técnicos del Renderizado

* **Estilo Visual:** Pixel Art Top-Down 16x16 profesional (*Sprout Lands* por Cup Nooble).
* **Resolución Nativa de Tile:** 16x16 píxeles.
* **Escala en Pantalla (Viewport):** 3x (48x48 píxeles por tile) o 4x (64x64 píxeles por tile).
* **Tratamiento Gráfico:** `image-rendering: pixelated;` en CSS y `ctx.imageSmoothingEnabled = false;` en Canvas 2D nativo para conservar los bordes retro 100% nítidos sin borrosidad.
* **Licencia:** Sprout Lands Free Basic Pack (Cup Nooble) - Libre para proyectos no comerciales.

---

## 2. Catálogo y Mapa de Sprites en `src/assets/sprout_lands/`

### A. Tilesets de Terreno (`src/assets/sprout_lands/tilesets/`)
* **`Grass.png` (160x128 px - Cuadrícula de 10x8 tiles de 16x16):**
  - Tile `(1, 1)` `(16, 16, 16, 16)`: Césped plano verde exuberante.
  - Tiles perimetrales: Bordes orgánicos con relieve y sombras para transiciones naturales.
  - Variaciones decorativas: Mechones de hierba alta y pequeñas margaritas.
* **`Tilled_Dirt.png` (128x128 px - Cuadrícula de 8x8 tiles de 16x16):**
  - Tile `(1, 1)` `(16, 16, 16, 16)`: Parcela de tierra arada interior con surcos oscuros húmedos.
  - Autotiling de 47 transiciones: Bordes redondeados, esquinas cóncavas y convexas para huertos orgánicos.
* **`Wooden_House.png` (112x80 px):**
  - Cabaña completa de labranza con muros de tablones, tejado a dos aguas de madera noble, chimenea de piedra y ventana.
* **`Fences.png` y `Hills.png`:**
  - Vallas de madera con postes verticales y travesaños; desniveles y riscos para modular alturas del mapa.

---

### B. Cultivos y Naturaleza (`src/assets/sprout_lands/objects/` y `crops/`)
* **`Basic_Plants.png` (112x32 px - 7x2 tiles de 16x16):**
  - **Fila 0 (Trigo/Cereal):**
    - Fase 0 `(0, 0, 16, 16)`: Semilla enterrada en montículo de tierra.
    - Fase 1 `(16, 0, 16, 16)`: Primer brote tierno verde.
    - Fase 2 `(32, 0, 16, 16)`: Planta en crecimiento con hojas dobles.
    - Fase 3 `(48, 0, 16, 16)`: Espiga madurando con espigas incipientes.
    - Fase 4 `(64, 0, 16, 16)`: Cereal maduro dorado con volumen y grano denso.
  - **Fila 1 (Tomates/Hortalizas):**
    - Ciclo paralelo de 5 fases con frutos coloreados listos para cosechar.
* **Vegetación con Profundidad:**
  - `tree_medium.png` (96x124 px): Roble frondoso con sombreado de tres niveles en copa y tronco leñoso.
  - `tree_small.png` (56x116 px): Árbol joven esbelto.
  - `bush.png` (64x60 px): Arbusto silvestre redondeado.
  - `sunflower.png`: Girasol alto de cultivo.
  - `Basic_Grass_Biom_things.png`: Rocas con musgo, setas rojas silvestres y leños caídos.

---

### C. Colonos y Criaturas (`src/assets/sprout_lands/character/`)
* **`Basic Charakter Spritesheet.png` (192x192 px - 4x4 frames de 48x48 px):**
  - Personaje centrado con diseño estilizado (ojos grandes, cabello castaño sombreado, mono de trabajo azul campesino).
  - **Fila 0 (`sy = 0`):** Caminar Abajo (Frontal) - 4 frames de paso fluido.
  - **Fila 1 (`sy = 48`):** Caminar Arriba (Espalda) - 4 frames.
  - **Fila 2 (`sy = 96`):** Caminar Izquierda (Perfil) - 4 frames.
  - **Fila 3 (`sy = 144`):** Caminar Derecha (Perfil) - 4 frames.
* **`Free Chicken Sprites.png` (64x32 px - 4x2 frames de 16x16):**
  - Gallina blanca de granja con cresta roja, animación de picoteo en suelo y aleteo.
* **Acciones con Herramientas:**
  - Sprites específicos para arar la tierra con azada (`hoe_0.png`, `hoe_1.png`), regar cultivos (`water_0.png`, `water_1.png`) y talar (`axe_0.png`, `axe_1.png`).
