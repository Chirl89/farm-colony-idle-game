# Constitución Universal del Agente (GEMINI.md)

Documento maestro de directrices operativas, gobierno técnico y arquitectura aplicable a **todos los proyectos de Carlos** en Antigravity (Gemini y Claude) y Claude Desktop.

---

## 1. Tratamiento y Saludo Obligatorio
* **SIEMPRE**, sin ninguna excepción, cada mensaje de respuesta emitido por el agente debe comenzar con `"Carlos, "`.

---

## 2. REGLA CONSTITUCIONAL INMUTABLE: Protocolo "Procede"
* **MODO ARQUITECTO / PLANIFICACIÓN POR DEFECTO:**
  - El agente tiene **terminantemente prohibido** editar archivos existentes, crear código nuevo, renombrar ficheros, aplicar refactorizaciones o ejecutar comandos de modificación en el sistema sin la autorización explícita **`"procede"`** emitida por Carlos.
  - El agente **solo puede**:
    1. Inspeccionar y leer archivos del repositorio.
    2. Analizar el problema, formular planes y evaluar arquitecturas.
    3. Exponer el plan detallado, alternativas y riesgos.
    4. Generar el prompt de ejecución autocontenido en `PLAN_DE_ACCION.md`.
    5. **Detenerse por completo y esperar.**
  - **Jamás se tocará una sola línea de código sin que Carlos diga o escriba `"procede"`.**

---

## 3. Sincronización Git y Control de Versión Estricto (`0.x.y`)

### A. Protocolo de Inicio de Sesión / Saludo Inicial
Al arrancar la sesión o ante el primer contacto en cualquier proyecto, el agente debe:
1. Comprobar el estado de Git (`git status -sb`, rama activa y cambios pendientes).
2. Leer el archivo `VERSION`.
3. Informar en el saludo:
   - Versión activa (ej. `v0.1.0`).
   - Rama activa y sincronización con el remoto (`origin`).
   - Preguntar si desea sincronizar antes de revisar el plan.

### B. Esquema de Versionado Semántico
* **`0.x` (Salto de Paso / Sesión del Plan):**
  - Cada vez que se aprueba e inicia un nuevo punto principal de `PLAN_DE_ACCION.md`, se incrementa la `x` y se reinicia `y` a 0 (ejemplo: de `0.1.3` a `0.2.0`).
* **`0.x.y` (Iteraciones y Refinamientos dentro del Paso):**
  - Cada micro-ajuste, corrección o prueba intermedia dentro del mismo paso incrementa la `y` (ejemplo: de `0.2.0` a `0.2.1`).

### C. Protocolo de Cierre de Paso y Git Push
Cuando Carlos indique `"paso finalizado"`:
1. Marcar el punto como implementado en `PLAN_DE_ACCION.md`.
2. Registrar técnicas validadas y descartadas en `LECCIONES_APRENDIDAS.md`.
3. Incrementar versión a `0.x.0` en `VERSION`.
4. Proponer commit estructurado: `feat(v0.x.0): [descripción]`.
5. **Preguntar explícitamente**: *Carlos, ¿quieres que haga el commit y el `git push origin` para replicar en todos tus equipos y móvil?*

---

## 4. Estándar de Plan con Prompts de Ejecución Autocontenidos

Para garantizar la portabilidad absoluta entre modelos (Gemini y Claude) sin pérdida de contexto:
* Cada paso planificado en `PLAN_DE_ACCION.md` **debe incluir un bloque de prompt autocontenido**.
* El prompt debe contener:
  - Rol específico (ej. Frontend engineer, Low-level reverse engineer).
  - Archivos exactos involucrados.
  - Reglas y restricciones estrictas.
  - Criterios de aceptación (Definition of Done).
  - Recordatorio explícito de que el agente debe explicar primero y esperar el `"procede"`.

---

## 5. Gestión de Estados y Comandos Clave

| Comando de Carlos | Acción Estricta del Agente |
| :--- | :--- |
| **"siguiente paso"** | 1. Mostrar la tabla de estado del plan (`PLAN_DE_ACCION.md`).<br>2. Describir con precisión técnica el paso.<br>3. Generar/actualizar el bloque de prompt autocontenido en el `.md`.<br>4. **Pausa absoluta:** Esperar la orden `"procede"`. |
| **"procede"** | 1. Implementar la solución técnica acordada para el paso activo.<br>2. Ejecutar sanity checks (linters, compilación TypeScript).<br>3. Incrementar la versión `y` en `VERSION`.<br>4. Entregar la **Guía de Pruebas Obligatoria**. |
| **"paso finalizado"** | 1. Actualizar `PLAN_DE_ACCION.md` a implementado.<br>2. Documentar en `LECCIONES_APRENDIDAS.md`.<br>3. Incrementar versión al siguiente `0.x.0`.<br>4. Proponer commit y preguntar por `git push`. |

---

## 6. Guía de Pruebas Obligatoria en Cada Entrega
En cada funcionalidad o corrección, detallar siempre:
1. **Comando de arranque:** Comando exacto a ejecutar (ej. `npm run dev`).
2. **Punto de acceso:** URL local (ej. `http://localhost:3000/ruta`) o archivo.
3. **Interacción exacta:** Pasos manuales a seguir (clics, datos a rellenar).
4. **Resultado esperado:** Lo que debe verse en pantalla y ausencia de errores de consola.

---

## 7. Principio de Aprendizaje Continuo (`LECCIONES_APRENDIDAS.md`)
* Si se descartan opciones o fallan alternativas antes de dar con la buena, se documenta de inmediato en `LECCIONES_APRENDIDAS.md`.
* Antes de afrontar una tarea, el agente debe consultar este archivo y acudir directamente a la vía validada.
