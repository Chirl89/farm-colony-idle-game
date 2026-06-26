# Prompts para nuevas conversaciones — Aetheria: Granja & Colonia

## 📌 Instrucciones de uso

1. Abre una **nueva conversación** en Antigravity
2. Establece el workspace activo: `C:\Users\EM2025007512\.gemini\antigravity\scratch\farm-colony-idle-game`
3. Copia y pega el prompt correspondiente al inicio del chat
4. El agente leerá `.agents/AGENTS.md` y `.agents/CONTEXT.md` automáticamente

---

## 🟢 PROMPT A — Implementar el siguiente paso del plan

```
Estoy trabajando en el juego idle "Aetheria: Granja & Colonia".

Antes de hacer cualquier cosa:
1. Lee `.agents/CONTEXT.md` para entender el estado actual del juego
2. Lee el plan en `docs/plan.md`
   para ver el próximo paso pendiente (el primero con ⬜ en la tabla)

Luego implementa ese paso siguiendo estas reglas:
- Solo lee los ficheros que vas a modificar (usa grep_search para localizar funciones concretas)
- No ejecutes el código, solo modifícalo
- Cada fichero JS tiene < 600 líneas excepto ui-render.js (170 KB — usa grep antes de leer)
- Al terminar, dime exactamente qué ficheros modificaste y qué cambió
```

---

## 🟡 PROMPT B — Implementar un paso específico

```
Estoy trabajando en el juego idle "Aetheria: Granja & Colonia".

Antes de hacer cualquier cosa:
1. Lee `.agents/CONTEXT.md` para entender el estado actual del juego
2. Lee el plan en `docs/plan.md`
   y busca el PASO [LETRA] — [NOMBRE DEL PASO]

Implementa ese paso siguiendo estas reglas:
- Solo lee los ficheros que vas a modificar (usa grep_search primero)
- No ejecutes el código, solo modifícalo
- ui-render.js tiene 170 KB — usa grep para localizar la función antes de leer
- Al terminar, lista exactamente qué ficheros cambiaste
```

*(Sustituye [LETRA] y [NOMBRE DEL PASO] por el que corresponda, ej: "PASO A — Tablón de pedidos")*

---

## 🔵 PROMPT C — Marcar paso completado y avanzar

```
El PASO [LETRA] — [NOMBRE] está completado.

1. Actualiza la tabla del plan en `docs/plan.md`: cambia ⦾ por ✅ en ese paso
2. Añade una entrada en `docs/backlog.md` con: paso, descripción y fecha de hoy
3. Dime cuál es el siguiente paso pendiente y su descripción breve
```

---

## 🔴 PROMPT D — Depurar un problema

```
Tengo un bug en el juego "Aetheria: Granja & Colonia".

El problema es: [DESCRIPCIÓN DEL BUG]
Lo que debería pasar: [COMPORTAMIENTO ESPERADO]
Lo que pasa: [COMPORTAMIENTO ACTUAL]

Antes de proponer solución:
1. Lee `.agents/CONTEXT.md` para entender la arquitectura
2. Usa grep_search para localizar la función relevante (NO leas ficheros completos)
3. Lee solo el fragmento de código afectado

Ficheros relevantes según el tipo de bug:
- Bug de producción/timers → `src/js/gameloop.js`
- Bug de UI/render → `src/js/ui-render.js` (usa grep primero)
- Bug al construir edificio → `src/js/buildings.js`
- Bug de save/load → `src/js/gamestate.js`
- Bug de eventos/clicks → `src/js/ui-events.js`
- Bug de valores en CSV → `src/data/[nombre].csv`
```

---

## 📋 PROMPT E — Modificar un CSV de balance

```
Quiero cambiar el balance del juego "Aetheria: Granja & Colonia".

Ajuste solicitado: [DESCRIPCIÓN DEL CAMBIO]
Ejemplo: "Reducir el tiempo de cultivo de trigo de 30 a 20 días"

1. Lee el CSV correspondiente de `src/data/`
2. Aplica el cambio
3. Dime el impacto aproximado en el juego

Mapa de CSVs:
- Costes de construcción → `buildings.csv`
- Precios compra/venta → `prices.csv`
- Tiempos (construcción, cosecha, etc.) → `timings.csv`
- Producción (yield, consumo) → `production.csv`
- Equivalencia de comida → `equivalences.csv`
- XP por nivel → `levelling.csv`
- Misiones → `missiondata.csv` (cuando exista)
```

---

## 💡 Tips de eficiencia de tokens

| Situación | Qué hacer |
|-----------|-----------|
| Quieres modificar `renderFarms()` | `grep_search "function renderFarms"` → view_file con rango de ±30 líneas |
| Quieres saber si X está implementado | Leer `CONTEXT.md` (NO el código) |
| Quieres el siguiente paso | Leer la tabla de `plan_v2_aetheria.md` (solo la tabla, no los pasos completos) |
| Quieres ver el DEFAULT_STATE | `grep_search "DEFAULT_STATE"` en gamestate.js → view lines 1-130 |
| Quieres ver cómo funciona gameTick | view_file gameloop.js lines 1-50 para la estructura, luego grep la función específica |
