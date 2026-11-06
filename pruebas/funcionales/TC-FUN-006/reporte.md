# Reporte de prueba: TC-FUN-006

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-006 |
| Escenario | Creación de dashboard |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-04` |
| Fecha y hora de ejecución | 2026-11-05 12:09:59 – 12:10:24 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-04` | 2026-11-05 12:10 | Juan | **Aprobado (10/10)** | `resultados/20261105-juan-04/` |

Las tres ejecuciones previas se eliminaron, para conservar una única ejecución oficial:

- **`-01` y `-02`:** exploraron el diálogo de creación y el panel *Añadir preguntas* sin crear ni guardar nada. Todas las escrituras de dashboards se bloquearon, y la edición de prueba se hizo sobre un dashboard de la colección `Examples` y se descartó.
- **`-03`:** creó un dashboard y se detuvo por un error del script (§11, hallazgo 1).

## 2. Objetivo de la prueba

Comprobar que puede crearse y guardarse un dashboard con una pregunta previamente guardada y su visualización.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Pregunta previamente guardada | Sí | ID leído de `configuracion/recursos-locales.json` (`preguntas.productos_por_categoria` = 42). `GET /api/card/42`: nombre `QA - Productos por categoría`, `display = bar`, activa |
| Colección autorizada | Sí | ID leído de la configuración local (`coleccion_qa_id` = 6). Nombre `QA - Metabase`, con escritura para Usuario QA |
| Nombre sin duplicados | Sí, con ajuste | El nombre base ya existía (dashboard 34, del intento `-03`). Por la regla de la solicitud se usó el sufijo del ID de ejecución, y se comprobó que ese nombre no existía |

**Desviación respecto de `caso.md`:** la ficha proponía el nombre `EJEC - TC-FUN-006 - Dashboard - <AAAAMMDD>`. Se usó el nombre indicado en la solicitud de ejecución.

## 4. Datos de prueba

| Dato | Valor |
|---|---|
| Colección de destino | QA - Metabase (ID 6) |
| Nombre establecido | `QA - TC-FUN-006 - Dashboard de prueba` |
| **Nombre definitivo** | **`QA - TC-FUN-006 - Dashboard de prueba - 20261105-juan-04`** |
| **ID del dashboard creado** | **35** (`/dashboard/35`, `entity_id O6ZndgSSmOE1pP2W7SrLb`) |
| Pregunta incorporada | `QA - Productos por categoría` (ID 42), tarjeta ID 69, tamaño 12 × 6 |
| Visualización esperada | Gráfico de barras (`display = bar`) |
| Resultados de la pregunta original | Doohickey 42, Gadget 53, Gizmo 51, Widget 54 |

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-006 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-006\scripts\TC-FUN-006.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-006\resultados\20261105-juan-04\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-006.cy.js](scripts/TC-FUN-006.cy.js). La creación, la incorporación, el guardado y la reapertura se hicieron en la interfaz; la API solo se usó para lecturas.

1. **Sesión y recursos.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se leen los IDs de la configuración local y se comprueban la colección y la pregunta. Se obtienen los resultados de referencia de la pregunta 42 ejecutándola en modo de solo lectura. Se registra el estado del dashboard principal.
2. **Nombre libre.** Se comprueba que el nombre no esté ocupado; como el base sí lo estaba, se aplicó el sufijo `- 20261105-juan-04`.
3. **Diálogo de creación.** **Nuevo → Dashboard**: se escribe el nombre, se abre *¿En qué colección debería ir esto?*, se elige **QA - Metabase** y se confirma con **Selecciona**. Captura 01.
4. **Creación.** **Crear** (`POST /api/dashboard`, observado sin modificarlo). El dashboard nuevo se abre en modo edición. Captura 02.
5. **Incorporación de la pregunta.** **Añadir preguntas** (icono +) → búsqueda *QA - Productos por categoría* → se elige el resultado. Se espera la consulta real de la tarjeta y se comprueba el gráfico de barras. Captura 03.
6. **Guardado.** **Guardar** (`PUT /api/dashboard/35`, observado) y salida del modo edición. Captura 04.
7. **Salida y búsqueda.** Barra lateral → **Inicio** → **QA - Metabase**, y se localiza el dashboard por su nombre. Captura 05.
8. **Reapertura.** Se abre desde su enlace en la colección (consulta real de la tarjeta). Se comprueban el nombre, la pregunta, el gráfico y los datos. Captura 06.
9. **Coherencia del gráfico.** Las categorías del eje X y el valor de cada barra (altura dividida por la escala del eje Y) se comparan con la pregunta original.
10. **Persistencia y recursos protegidos.** `GET /api/dashboard/35`, `GET /api/card/42` y `GET /api/dashboard/2`, en modo de solo lectura.
11. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401. El dashboard **se conserva**.

## 6. Resultado esperado

El dashboard queda registrado y presenta la pregunta incorporada con su visualización correspondiente.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión y recursos | `/api/health` = `ok`; Usuario QA, no administrador; IDs de la configuración local; colección `QA - Metabase` con escritura; pregunta 42 = `QA - Productos por categoría`, `bar`; resultados de referencia `completed` | Aprobada |
| 2 | Nombre sin duplicados | El nombre definitivo no existía en la colección | Aprobada |
| 3 | Diálogo *Nuevo dashboard* | Nombre escrito y verificado; selector de colección = *QA - Metabase* | Aprobada |
| 4 | Creación | `POST /api/dashboard` 200; ID nuevo (35); nombre y `collection_id = 6` registrados; URL `/dashboard/35-…`; modo edición activo | Aprobada |
| 5 | Incorporación de la pregunta | Consulta de la tarjeta (`POST /api/card/42/query`) 202, `completed`; una tarjeta titulada *QA - Productos por categoría*; SVG con 4 barras | Aprobada |
| 6 | Guardado | `PUT /api/dashboard/35` 200; 1 tarjeta guardada con `card_id = 42`; modo edición cerrado | Aprobada |
| 7 | Navegación y localización | Inicio (`/`) → *QA - Metabase* (`/collection/6-…`); fila con el nombre exacto, cuyo enlace apunta a `/dashboard/35-…` | Aprobada |
| 8 | Reapertura | Consulta de la tarjeta 202, `completed`, sobre la pregunta 42; datos = resultados de la pregunta original; nombre del dashboard conservado; una tarjeta *QA - Productos por categoría* con gráfico; sin errores | Aprobada |
| 9 | Coherencia del gráfico | Eje X = [Doohickey, Gadget, Gizmo, Widget]; barras = 42, 53, 51, 54, con diferencia < 0,5 frente a la pregunta original | Aprobada |
| 10 | Persistencia y recursos protegidos | Dashboard 35: nombre, colección 6, activo, 1 tarjeta, `card_id = 42`, `display = bar`. Pregunta 42 y dashboard principal (2): mismo `updated_at` que antes de la prueba; el principal conserva sus 3 tarjetas | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 10 pruebas, 10 aprobadas, 0 fallidas. Duración: 13,8 s. Código de salida de Cypress: 0. Salida de errores vacía.

### Comparación del gráfico reabierto con la pregunta original

| Categoría | Pregunta original (42) | Datos de la tarjeta del dashboard | Valor de la barra en el dashboard reabierto |
|---|---|---|---|
| Doohickey | 42 | 42 | 42 |
| Gadget | 53 | 53 | 53 |
| Gizmo | 51 | 51 | 51 |
| Widget | 54 | 54 | 54 |

Detalle en `resultados/20261105-juan-04/dashboard-creado.json`.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-04/01-dialogo-nuevo-dashboard.png` | Diálogo *Nuevo dashboard* con el nombre definitivo y la colección **QA - Metabase** |
| 2 | `evidencias/20261105-juan-04/02-dashboard-creado-en-edicion.png` | Dashboard recién creado, vacío, en modo edición (*"Estás editando este dashboard"*) |
| 3 | `evidencias/20261105-juan-04/03-pregunta-incorporada-en-edicion.png` | Panel *Añadir preguntas* con la búsqueda y la tarjeta **QA - Productos por categoría** con su gráfico de barras |
| 4 | `evidencias/20261105-juan-04/04-dashboard-guardado.png` | Dashboard guardado, fuera del modo edición |
| 5 | `evidencias/20261105-juan-04/05-dashboard-en-coleccion.png` | Colección *QA - Metabase* abierta desde la barra lateral (ver nota) |
| 6 | `evidencias/20261105-juan-04/06-dashboard-reabierto.png` | Dashboard reabierto: nombre y tarjeta con las barras Doohickey, Gadget, Gizmo y Widget |
| 7 | `resultados/20261105-juan-04/cypress-junit.xml` | Reporte nativo JUnit de Cypress (10/10) |
| 8 | `resultados/20261105-juan-04/consola.log` | Salida completa de Cypress |
| 9 | `resultados/20261105-juan-04/consola-errores.log` | Salida de errores (vacía) |
| 10 | `resultados/20261105-juan-04/dashboard-creado.json` | ID, nombre, colección, tarjeta, códigos HTTP y comparación de datos |
| 11 | `resultados/20261105-juan-04/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

**Nota sobre la captura 05.** La fila del dashboard queda debajo del área visible, porque la colección contiene además las preguntas de las pruebas anteriores. Su presencia la acredita la prueba 7: localizó la fila por su nombre exacto y comprobó que su enlace apunta a `/dashboard/35-…`. No se repitió la ejecución solo para mejorar la captura, porque eso habría creado otro dashboard.

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

- **"El dashboard queda registrado".** Se creó desde la interfaz: `POST /api/dashboard` 200, ID 35, con el nombre asignado y en la colección *QA - Metabase* (pruebas 3 y 4). Los cambios se guardaron con `PUT /api/dashboard/35` 200 (prueba 6). Después de salir, el dashboard sigue en la colección (prueba 7), y la lectura por API confirma nombre, colección y tarjeta (prueba 10).
- **"Presenta la pregunta incorporada".** La pregunta *QA - Productos por categoría* se buscó e incorporó desde el panel *Añadir preguntas* (prueba 5). Al reabrir el dashboard, contiene exactamente esa pregunta (`card_id = 42`) en una tarjeta (pruebas 8 y 10).
- **"Con su visualización correspondiente".** La tarjeta muestra un gráfico de barras, igual que la pregunta original (`display = bar`). Sus datos y las barras dibujadas coinciden con los resultados de la pregunta original, categoría por categoría (pruebas 8 y 9).

La aprobación no se basa en ninguna notificación. Se basa en la persistencia comprobada tras salir y volver a abrir el dashboard, y en la comparación de los datos.

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **Dashboard 34, vacío, creado por un error del script en el intento `-03`.**
   - **Causa:** la prueba 5 esperaba que la tarjeta de un dashboard en edición consultara `/api/dashboard/:id/dashcard/…/query`. En v0.64.1, una tarjeta aún no guardada consulta directamente `POST /api/card/:id/query`. La pregunta sí se había incorporado y el gráfico se mostraba; fue un error de la espera del script.
   - **Consecuencia:** como el script se detiene en la primera falla, no guardó nada más. El dashboard 34 quedó con el nombre base y sin tarjetas.
   - **Estado:** la espera ya está corregida. El dashboard 34 **no se eliminó** por las reglas de protección de recursos, y se recomienda enviarlo a la papelera con autorización.
2. **El dashboard 35 se conserva como evidencia.** Según `caso.md`, es el dashboard que debe usar TC-FUN-007, en lugar de `QA - Dashboard Principal`.
3. **Recursos protegidos.** La pregunta 42 y el dashboard principal (2) mantienen su `updated_at` y su contenido. En las exploraciones se abrió en modo edición el dashboard *E-commerce Insights* de la colección `Examples` y se descartaron los cambios. Las escrituras estaban bloqueadas, y la exploración registró que no se intentó ninguna.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede crear desde la interfaz un dashboard con nombre propio en la colección *QA - Metabase*, incorporarle una pregunta guardada y guardar los cambios. Al salir y volver a abrirlo, el dashboard conserva su nombre y la pregunta incorporada, y muestra su gráfico de barras con los mismos datos que la pregunta original. El caso TC-FUN-006 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/dashboard`, `PUT /api/dashboard/:id` y las consultas de las tarjetas observados sin simulación |
| Identificadores locales usados | Colección 6, pregunta 42 y dashboard principal 2 (de `configuracion/recursos-locales.json`). Dashboard creado: 35 |
