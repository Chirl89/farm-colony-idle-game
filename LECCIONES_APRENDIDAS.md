# Base de Conocimiento y Lecciones Aprendidas

Este documento registra los hallazgos técnicos, arquitecturas validadas, patrones funcionales y soluciones exitosas del proyecto.

> **Principio Fundamental de Aprendizaje:**
> Si para una tarea se intentan múltiples soluciones (por ejemplo, fallan 3 y la 4ª tiene éxito), esa solución comprobada se documenta aquí como la referencia definitiva. Ante cualquier tarea posterior similar, el agente debe consultar este registro y acudir **directamente a la solución probada**, evitando iteraciones o caminos fallidos previos.

---

## 1. Configuración de Entorno y Comandos Validados
* **Comandos de ejecución comprobados:**
  - Visor oficial de la colonia: `test/test_viewer_colony.html`
  - Servidor de pruebas local ligero: `npx serve .`
  - Comprobación de sintaxis de scripts: `node --check <fichero>`

---

## 2. Técnicas y Arquitecturas Validadas

* **Composición y Renderizado del Colono Humano:**
  - *Contexto:* Los spritesheets modulares de paquetes como Sunnyside o generadores LPC contienen archivos de capas despiezadas (ej. `b_walk_s8` solo contiene 50 píxeles de silueta tenue sin ropa ni pelo dentro de una caja transparente de 96x64), lo que provocaba que el colono pareciera invisible o un punto diminuto de 5 píxeles en pantalla.
  - *Solución Comprobada Definitiva:*
    1. Se componen las capas completas (cuerpo, pantalones, botas, camisa y pelo) en un único spritesheet sólido y unificado (`src/assets/colony/colonist.png` - 512x256 px).
    2. Dimensiones: 8 fotogramas fluidos de 64x64 px por fila (Fila 0: Arriba, Fila 1: Izquierda, Fila 2: Abajo, Fila 3: Derecha).
    3. El personaje ocupa 28x45 px reales con anatomía humana visible, ropa de trabajo y sombra elíptica bajo los pies.

* **Renderizado de Suelo y Caminos Orgánicos:**
  - *Solución Comprobada:* Base de pradera homogénea (`#55822b`) con briznas sutiles fijas (sin cortes de cuadrícula repetitiva) y senderos de tierra batida redondeados con `roundRect`.

* **Edificios Asentados y Estáticos:**
  - *Solución Comprobada:* Molino, Granero y Vivienda se renderizan 100% estáticos con elipses de sombra en la base para eliminar parpadeos molestos de aspas.

---

## 3. Histórico de Intentos Fallidos vs. Soluciones Exitosas

* **Intento 1: Procedurales y cajas planas:** Rechazado ("lo odio, es de lo más cutre que he visto").
* **Intento 2: Sprout Lands modular:** Rechazado (sensación infantil, casa despiezada, gallina con parpadeo).
* **Intento 3: Stardew Valley extraído directo:** Rechazado con razón (plagio 1:1 sin identidad propia).
* **Intento 4: Colono con capa base `b_walk` de 11px:** Fallo (colono invisible en pantalla).
* **Intento 5: Spritesheets 2D fragmentados:** Fatiga visual y desalineaciones de escala/frames.
* **Vía Exitosa Definitiva: Diorama 3D Isométrico Real con Three.js (Validado en Paso 2.0):**
  - **Cámara Ortográfica Isométrica:** Perspectiva fija diorama (`camera.position.set(20, 20, 20)`, `lookAt(0,0,0)`).
  - **Z-Buffer Real por Hardware:** Oclusión perfecta sin bugs de capas. Los personajes quedan físicamente tapados detrás de edificios y muros.
  - **Trazado Urbano y Footprints:** Los edificios se asientan en parcelas dedicadas sin invadir el sendero. Los caminos conectan las entradas limpiamente.
  - **Iluminación Diurna Cálida:** Luz solar direccional suave (`#fff7ed`) con sombras arrojadas en tiempo real. Luz hemisférica cálida (`#fffbeb` cenital y `#276749` en rebote) para mantener la pradera en verde natural (`#529e31`) sin aberraciones azules ni cian.
  - **Personaje Estilizado Cápsula/Píldora:** Geometría suave, 100% visible, con orientación hacia la marcha y balanceo orgánico. Cero dependencias de spritesheets 2D rotos.
