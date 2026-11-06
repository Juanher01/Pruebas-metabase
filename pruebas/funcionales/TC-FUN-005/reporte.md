# Reporte de prueba: TC-FUN-005

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-005 |
| Escenario | Visualización gráfica de resultados |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-12` |
| Fecha y hora de ejecución | 2026-11-05 11:51:18 – 11:51:46 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-12` | 2026-11-05 11:51 | Juan | **Aprobado (8/8)** | `resultados/20261105-juan-12/` |

Las once ejecuciones previas (`-01` a `-11`) se eliminaron, para conservar una única ejecución oficial. Ninguna guardó recursos en Metabase.

- **`-01` a `-03`:** exploraron los selectores y la estructura SVG del gráfico.
- **`-04` a `-10`:** ajustaron la automatización (§11).
- **`-11`:** aprobó 8/8, pero su captura del tooltip no lo mostraba; se repitió para obtener esa evidencia.

## 2. Objetivo de la prueba

Comprobar que los resultados de una consulta se representan en un gráfico de barras con valores y categorías coincidentes.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Cuenta autorizada | Sí | Sesión de Usuario QA (no administrador), con permiso de consulta sobre Sample Database |
| Datos compatibles con una visualización de barras | Sí | `Products.Category`: 4 categorías con un recuento cada una |
| Valor de referencia R04 | Sí, calculado en la ejecución | R04 no está registrado en `valores-referencia.csv`, y su consulta usa `PUBLIC.`, que no funciona con SQLite. Se calculó en la prueba 1 con un recuento SQL de solo lectura sobre la misma tabla, sin prefijo de esquema |

## 4. Datos de prueba

| Dato | Valor |
|---|---|
| Base de datos / tabla | Sample Database / Products |
| Operación | Resumir → **Recuento de filas** |
| Agrupación | **Category** |
| Visualización | **Barra** (gráfico de barras) |
| Referencia | `SELECT CATEGORY, COUNT(*) AS PRODUCTOS FROM PRODUCTS GROUP BY CATEGORY ORDER BY CATEGORY` (solo lectura) |

No se usaron cantidades fijas: la referencia se calculó durante la propia ejecución. La pregunta preparada `QA - Productos por categoría` (42) no se abrió ni se modificó, porque la consulta se construyó de nuevo en la interfaz.

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-005 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-005\scripts\TC-FUN-005.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-005\resultados\20261105-juan-12\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-005.cy.js](scripts/TC-FUN-005.cy.js):

1. **Sesión y referencia.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se comprueban la disponibilidad y el usuario, se localizan `PRODUCTS` y `CATEGORY` por nombre, y se calcula el recuento de referencia por categoría.
2. **Consulta.** En el editor gráfico: **Nuevo → Pregunta → Sample Database → Products**; en **Resumir**, *Elige una función o métrica* → **Recuento de filas**; *Elige una columna para agrupar por* → **Category**. Captura 01.
3. **Ejecución.** **Visualizar** (`POST /api/dataset`, observado sin modificarlo). Se comprueban la consulta enviada y el recuento por categoría que devuelve.
4. **Vista de tabla.** **Visualización → Tabla**. Se leen los valores de la tabla visible y se comparan con la consulta. Captura 02.
5. **Gráfico de barras.** **Visualización → Barra**. Se comprueba que *Barra* queda seleccionada y *Tabla* deja de estarlo, que la tabla desaparece y que el SVG contiene una barra por categoría. Captura 03.
6. **Categorías.** Se leen las etiquetas del eje X del SVG.
7. **Valores por geometría.** La escala del eje Y se obtiene de las marcas numéricas del propio gráfico (posición vertical de `0` y del máximo). La altura de cada barra se convierte a valor con esa escala, y cada barra se asocia a la etiqueta situada bajo su centro.
8. **Valores en el tooltip.** Se pasa el puntero sobre cada barra con eventos `mousemove` reales y se lee el tooltip de ECharts: categoría y recuento. Captura 04 (Gadget).
9. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

La pregunta **no se guardó**. No se modificó ningún recurso, usuario, permiso ni configuración.

## 6. Resultado esperado

El sistema representa los datos mediante un gráfico de barras cuyos valores y categorías coinciden con los resultados de la consulta.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Comparación de categorías y valores

Archivo `resultados/20261105-juan-12/comparacion-grafico.json`. Escala del eje Y: 8,4083 px por unidad.

| Categoría | Referencia SQL (R04) | Resultado de la consulta | Tabla de la interfaz | Altura de la barra | Valor de la barra (altura ÷ escala) | Tooltip | Coincide |
|---|---|---|---|---|---|---|---|
| Doohickey | 42 | 42 | 42 | 353,15 px | 42,000 | 42 | Sí |
| Gadget | 53 | 53 | 53 | 445,64 px | 53,000 | 53 | Sí |
| Gizmo | 51 | 51 | 51 | 428,83 px | 51,000 | 51 | Sí |
| Widget | 54 | 54 | 54 | 454,05 px | 54,000 | 54 | Sí |
| **Total** | **200** | **200** | **200** | | | | |

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión y referencia de origen | `/api/health` = `ok`; Usuario QA, no administrador; `PRODUCTS` y `CATEGORY` localizados; referencia SQL `completed`, con Doohickey, Gadget, Gizmo y Widget | Aprobada |
| 2 | Editor gráfico: Recuento de filas por Category | Paso Datos = Products; Resumir = *Recuento* por *Category* | Aprobada |
| 3 | Visualizar devuelve el recuento por categoría | `POST /api/dataset` 202, `completed`, sin error; tabla = PRODUCTS, agregación `count`, una agrupación por CATEGORY; categorías y recuentos = referencia | Aprobada |
| 4 | Vista de Tabla con los mismos recuentos | *Tabla* seleccionada; tabla visible = resultado de la consulta | Aprobada |
| 5 | Barra seleccionada y gráfico representado | *Barra* = seleccionada y *Tabla* = no seleccionada; tabla ausente; SVG con 4 barras (= número de categorías); sin errores; tamaño del gráfico estable | Aprobada |
| 6 | Categorías del eje X | Etiquetas = [Doohickey, Gadget, Gizmo, Widget] = categorías de la consulta, en el mismo orden, sin faltantes ni sobrantes | Aprobada |
| 7 | Altura de cada barra = recuento | 4 barras, cada una centrada bajo una etiqueta distinta y partiendo de la línea base; diferencia entre el valor por escala y el recuento < 0,5 en todas (diferencia real: 0,000) | Aprobada |
| 8 | Tooltip de cada barra | Para cada barra: cabecera = su categoría; el tooltip nombra la métrica *Recuento*; el número = recuento de la consulta | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 8 pruebas, 8 aprobadas, 0 fallidas. Duración: 16,2 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-12/01-editor-grafico-recuento-por-categoria.png` | Editor gráfico: Datos = *Products*; Resumir = *Recuento* por *Category* |
| 2 | `evidencias/20261105-juan-12/02-resultados-en-tabla.png` | Visualización **Tabla** seleccionada: Doohickey 42, Gadget 53, Gizmo 51, Widget 54 (*"Mostrando 4 filas"*) |
| 3 | `evidencias/20261105-juan-12/03-grafico-de-barras.png` | Visualización **Barra** seleccionada: cuatro barras con el eje X *Category* y el eje Y *Recuento* (0–60) |
| 4 | `evidencias/20261105-juan-12/04-hover-barra-gadget.png` | Puntero sobre la barra Gadget: tooltip **Gadget · Recuento 53** |
| 5 | `resultados/20261105-juan-12/cypress-junit.xml` | Reporte nativo JUnit de Cypress (8/8) |
| 6 | `resultados/20261105-juan-12/consola.log` | Salida completa de Cypress |
| 7 | `resultados/20261105-juan-12/consola-errores.log` | Salida de errores (vacía) |
| 8 | `resultados/20261105-juan-12/comparacion-grafico.json` | Comparación por categoría: referencia, consulta, tabla, altura y valor de la barra, tooltip |
| 9 | `resultados/20261105-juan-12/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

En la captura 04 el gráfico aparece desplazado verticalmente, porque la página se desplazó para colocar la barra a la vista antes del hover. Las capturas no muestran credenciales, y `scripts/revisar-secretos.ps1` devolvió `[OK]`.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

- **La consulta se ejecutó correctamente.** Es un recuento de filas agrupado por Category sobre Products (pruebas 2 y 3), y su resultado coincide con la referencia calculada sobre la misma fuente (prueba 3).
- **Se seleccionó el gráfico de barras desde la interfaz.** Primero se pasó a *Tabla* para ver los resultados (prueba 4), y después se eligió *Barra* (prueba 5).
- **Las categorías coinciden.** El eje X muestra exactamente las cuatro categorías de la consulta: ninguna falta y ninguna sobra (prueba 6).
- **Los valores coinciden, por dos vías independientes del propio gráfico:**
  - **Geometría:** la altura de cada barra, medida con la escala del eje Y del gráfico, equivale exactamente al recuento de su categoría (prueba 7).
  - **Tooltip:** el que muestra Metabase al pasar el puntero sobre cada barra indica la categoría y el recuento correctos (prueba 8).
- **Sin errores funcionales.** No se observó ninguno.

La aprobación no se basa en la existencia de un SVG ni en las capturas. Se basa en comparaciones numéricas automáticas: las cuatro barras coinciden con la consulta, la tabla y la fuente.

## 11. Hallazgos

**Ningún defecto de Metabase.**

Ajustes de la automatización (ejecuciones eliminadas; ninguno es atribuible a Metabase):

1. **Identificación de barras por su posición en el DOM.** Al resaltar una barra, ECharts reordena sus elementos SVG, así que buscar las barras por su orden en el DOM llevaba a pasar el puntero sobre la barra equivocada: el tooltip mostraba *Widget* al buscar *Gizmo*. **Corregido:** cada barra se identifica por su geometría, es decir, su centro bajo la etiqueta de su categoría.
2. **Desplazamiento horizontal de la página.** A 1366 px de ancho, la página tiene desplazamiento horizontal. Las coordenadas del hover se calculan después de desplazar la barra a la vista, sin que Cypress vuelva a desplazar la página en cada evento.
3. **Captura del tooltip.** Con las opciones predeterminadas de `cy.screenshot()`, el tooltip no aparecía en la imagen, aunque la aserción lo había leído. Se toma la captura tras confirmar que el tooltip es visible y sin desactivar las animaciones.
4. **Tiempo de espera de `cy.screenshot()`** (ejecución `-04`): una captura superó los 30 s por la lentitud momentánea del equipo. No se repitió en las siguientes.

Nota sobre R04: la referencia se calculó dentro de la ejecución. Los valores obtenidos (Doohickey 42, Gadget 53, Gizmo 51, Widget 54) pueden registrarse como R04 cuando se corrija el prefijo `PUBLIC.` de `valores-referencia.csv`.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede construir en el editor gráfico un recuento de Products agrupado por Category, cambiar entre las visualizaciones Tabla y Barra y obtener un gráfico de barras que coincide exactamente con la consulta y con la fuente de datos. Sus cuatro categorías y sus valores (42, 53, 51 y 54) se comprobaron por la altura de las barras y por el tooltip de cada una. El caso TC-FUN-005 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/dataset` observado sin simulación. Gráfico ECharts renderizado en SVG |
| Identificadores locales usados | Ninguno fijo: Sample Database, `PRODUCTS` y `CATEGORY` se resuelven por nombre |
