# Reporte de prueba: TC-FUN-007

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-007 |
| Escenario | Aplicación de filtros en dashboard |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-07` |
| Fecha y hora de ejecución | 2026-11-05 18:48:55 – 18:49:32 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-07` | 2026-11-05 18:49 | Juan | **Aprobado (11/11)** | `resultados/20261105-juan-07/` |

Las seis ejecuciones previas se eliminaron, para conservar una única ejecución oficial:

- **`-01` a `-04`:** exploración sin escrituras. Las escrituras de dashboards estaban bloqueadas, la edición de prueba sobre el dashboard *E-commerce Insights* de `Examples` se descartó, y los filtros de ese dashboard solo se usaron en modo visualización.
- **`-05`:** creó y configuró un dashboard y se detuvo por un error del script (§11).
- **`-06`:** validó los pasos de filtrado en modo visualización sobre el dashboard de `-05`, sin modificarlo.

## 2. Objetivo de la prueba

Comprobar que un filtro de categoría configurado en un dashboard actualiza las visualizaciones vinculadas según el valor seleccionado.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Dashboard con preguntas filtrables por categoría | Sí | Dashboard creado en la propia ejecución, con las preguntas 42, 43 y 44, que comparten `Products.Category` |
| Valor de categoría existente | Sí | `Gadget` está entre las categorías de la fuente (SQL de solo lectura) y entre las opciones del selector |
| IDs desde la configuración local | Sí | `configuracion/recursos-locales.json`: colección 6, preguntas 42/43/44, dashboard principal 2, Sample Database 1. El campo `CATEGORY` se resolvió por nombre |

**Desviaciones respecto de `caso.md`:**

- La ficha indicaba usar el dashboard creado en TC-FUN-006. Por indicación de la solicitud de ejecución se usó un dashboard **independiente** (`QA - TC-FUN-007 - Filtro de categoría`) con tres preguntas, para no alterar el dashboard 35, que es la evidencia de TC-FUN-006.
- La ficha mencionaba una sola pregunta vinculada. Se vincularon las tres indicadas en la solicitud.

## 4. Dashboard, preguntas y filtro

| Elemento | Valor |
|---|---|
| **Dashboard utilizado** | **ID 37**, `QA - TC-FUN-007 - Filtro de categoría - 20261105-juan-07`, en `QA - Metabase` (ID 6) |
| Nombre establecido | `QA - TC-FUN-007 - Filtro de categoría`. El nombre base ya existía (dashboard 36, del intento `-05`), así que se aplicó el sufijo del ID de ejecución |
| Preguntas incorporadas | 42 `QA - Productos por categoría` (barras, recuento); 43 `QA - Precio promedio por categoría` (barras, promedio de Price); 44 `QA - Detalle de productos` (tabla) |
| Filtro | Etiqueta **Categoría**; tipo **Texto o categoría** (`string/=`, sección `string`); operador **Es**; selector **Lista desplegable**; varios valores; sin valor predeterminado; ID `8d7b53e` |
| Vinculación | Las tres tarjetas → **Products.Category** (destino `dimension`, campo CATEGORY), configurada a mano en cada tarjeta. No se usó la conexión automática que ofrece Metabase |
| Valor probado | `Gadget` |

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-007 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-007\scripts\TC-FUN-007.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-007\resultados\20261105-juan-07\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-007.cy.js](scripts/TC-FUN-007.cy.js). Todas las acciones sobre el dashboard se hicieron en la interfaz; la API solo se usó para lecturas.

1. **Sesión y referencia.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se leen los IDs locales y se registra el estado de las preguntas 42 a 44 y del dashboard principal. Se calcula la **referencia independiente** con SQL de solo lectura: `SELECT CATEGORY, COUNT(*), AVG(PRICE) FROM PRODUCTS GROUP BY CATEGORY`.
2. **Nombre libre.** Se comprueba que el nombre no esté ocupado; como el base sí lo estaba, se aplicó el sufijo.
3. **Creación del dashboard.** **Nuevo → Dashboard**, con el nombre y la colección **QA - Metabase** → **Crear** (`POST /api/dashboard` 200).
4. **Preguntas.** **Añadir preguntas**: se busca e incorpora cada una de las tres preguntas, esperando la consulta real de cada tarjeta. Captura 01.
5. **Filtro.** **Añadir un filtro o parámetro → Texto o categoría**. Se escribe la etiqueta *Categoría* y se comprueban el operador *Es* y la *Lista desplegable*. En cada tarjeta, **Selecciona… → Category** (columna de PRODUCTS), y cada una muestra *Products.Category*. Captura 02.
6. **Guardado.** **Listo** → **Guardar** (`PUT /api/dashboard/37` 200, con el filtro y las tres vinculaciones).
7. **Estado inicial.** Se recarga el dashboard y se comparan las tres consultas reales y sus visualizaciones con la referencia. Captura 03.
8. **Selector.** Se abre **Categoría**: la lista muestra las cuatro categorías existentes. Se marca **Gadget**. Captura 04.
9. **Aplicación.** **Añadir filtro**. Se esperan las tres consultas nuevas, con el valor `["Gadget"]`, y se comprueban datos y visualizaciones. Captura 05.
10. **Eliminación del filtro.** Se abre el selector, se desmarca Gadget y se confirma. Se esperan las tres consultas sin valor y se comprueba que todo vuelve al estado inicial. Captura 06.
11. **Persistencia y recursos protegidos.** Lecturas de solo lectura por API.
12. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401. El dashboard **se conserva**.

## 6. Resultado esperado

Las visualizaciones vinculadas se actualizan y muestran únicamente los resultados correspondientes al criterio seleccionado.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Comparación antes, durante y después del filtro

Archivo `resultados/20261105-juan-07/filtro-dashboard.json`. Todos los valores proceden de las consultas reales de las tarjetas y coinciden con la referencia SQL.

| Visualización | Sin filtro | Categoría = Gadget | Tras eliminar el filtro |
|---|---|---|---|
| **Productos por categoría** (recuento) | Doohickey 42 · Gadget 53 · Gizmo 51 · Widget 54 | **Gadget 53** (1 barra) | Doohickey 42 · Gadget 53 · Gizmo 51 · Widget 54 |
| **Precio promedio por categoría** | Doohickey 52,04 · Gadget 56,97 · Gizmo 55,59 · Widget 57,58 | **Gadget 56,97** (1 barra) | Doohickey 52,04 · Gadget 56,97 · Gizmo 55,59 · Widget 57,58 |
| **Detalle de productos** (tabla) | 200 productos de 4 categorías | **53 productos, todos Gadget** | 200 productos de 4 categorías |
| Valor enviado por la interfaz | ninguno | `["Gadget"]` | ninguno |

**Referencia SQL** (solo lectura): Doohickey 42 / 52,0443; Gadget **53 / 56,9658**; Gizmo 51 / 55,5866; Widget 54 / 57,5799; total 200. El recuento de 53 productos Gadget observado durante la preparación se comprobó de nuevo y coincide.

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión, recursos y referencia | `/api/health` = `ok`; Usuario QA, no administrador; IDs locales; colección con escritura; nombres de las preguntas 42 a 44; referencia SQL `completed`, con Gadget | Aprobada |
| 2 | Nombre sin duplicados | El nombre definitivo no existía | Aprobada |
| 3 | Creación del dashboard | `POST /api/dashboard` 200; ID nuevo (37); nombre y colección 6; modo edición | Aprobada |
| 4 | Incorporación de las tres preguntas | Una consulta `completed` por pregunta; 3 tarjetas con sus títulos | Aprobada |
| 5 | Configuración y vinculación del filtro | Etiqueta *Categoría*; *Texto o categoría*; operador *Es*; *Lista desplegable* marcada; las 3 tarjetas muestran *Products.Category* | Aprobada |
| 6 | Guardado | `PUT /api/dashboard/37` 200; 1 filtro `Categoría`/`string/=`; tarjetas = 42, 43 y 44; cada una vinculada al filtro con destino `dimension` → campo CATEGORY | Aprobada |
| 7 | Estado sin filtro | 3 consultas sin valor de filtro; recuentos, promedios y 200 productos = fuente; gráficos con las 4 categorías y valores por altura de barra = fuente; tabla con varias categorías | Aprobada |
| 8 | Selector y elección de Gadget | Opciones de la lista = las 4 categorías existentes; casilla Gadget marcada | Aprobada |
| 9 | Aplicación de Gadget | 3 consultas nuevas con el valor `["Gadget"]`; URL y widget con *Gadget*. Recuento = [Gadget 53]; promedio = [Gadget 56,97]; detalle = 53 productos, solo Gadget. Ambos gráficos con la única categoría Gadget y su valor correcto; la tabla visible solo muestra Gadget | Aprobada |
| 10 | Eliminación del filtro | 3 consultas sin valor; URL sin *Gadget*; datos y visualizaciones = estado inicial | Aprobada |
| 11 | Persistencia y recursos protegidos | Dashboard 37: nombre, colección, 1 filtro sin valor predeterminado, 3 tarjetas con 1 vinculación cada una. Preguntas 42 a 44 y dashboard principal con el mismo `updated_at` que antes; el principal conserva sus 3 tarjetas | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 11 pruebas, 11 aprobadas, 0 fallidas. Duración: 26,2 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-07/01-preguntas-incorporadas.png` | Dashboard en edición con las tres preguntas incorporadas |
| 2 | `evidencias/20261105-juan-07/02-filtro-configurado-y-vinculado.png` | Panel *Configuración del filtro*: etiqueta *Categoría*, *Texto o categoría*, *Es*, *Lista desplegable*; tarjetas vinculadas a *Products.Category* (las dos superiores quedan parcialmente fuera de la vista; su vinculación consta en las pruebas 5 y 6) |
| 3 | `evidencias/20261105-juan-07/03-dashboard-sin-filtro.png` | Dashboard guardado sin filtro: dos gráficos con 4 categorías y tabla con productos de varias categorías |
| 4 | `evidencias/20261105-juan-07/04-seleccion-gadget.png` | Lista desplegable *Categoría* con las 4 categorías y **Gadget** marcada |
| 5 | `evidencias/20261105-juan-07/05-dashboard-filtrado-gadget.png` | Filtro *Categoría: Gadget*: una barra Gadget en cada gráfico y tabla solo con Gadget |
| 6 | `evidencias/20261105-juan-07/06-filtro-eliminado-restaurado.png` | Filtro eliminado: las 4 categorías de nuevo en ambos gráficos y en la tabla |
| 7 | `resultados/20261105-juan-07/cypress-junit.xml` | Reporte nativo JUnit de Cypress (11/11) |
| 8 | `resultados/20261105-juan-07/consola.log` | Salida completa de Cypress |
| 9 | `resultados/20261105-juan-07/consola-errores.log` | Salida de errores (vacía) |
| 10 | `resultados/20261105-juan-07/filtro-dashboard.json` | Dashboard, filtro, vinculaciones, referencia SQL y datos de los tres estados |
| 11 | `resultados/20261105-juan-07/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

- **El filtro se configuró y se vinculó desde la interfaz.** Es de tipo *Texto o categoría*, con operador *Es* y lista desplegable, y está vinculado a `Products.Category` en las tres preguntas (prueba 5). El guardado lo registra así (prueba 6) y la configuración persiste (prueba 11).
- **"Las visualizaciones vinculadas se actualizan".** Al seleccionar Gadget, las tres tarjetas emitieron consultas nuevas con el valor `["Gadget"]` y sus resultados cambiaron respecto del estado inicial (pruebas 7 y 9):
  - el recuento pasó de 4 categorías a 1;
  - el promedio pasó de 4 categorías a 1;
  - el detalle pasó de 200 productos a 53.
- **"Muestran únicamente los resultados correspondientes al criterio seleccionado".** Tras el filtro, solo aparecen datos de Gadget, con los valores de la fuente (prueba 9):
  - el recuento es 53;
  - el precio promedio es 56,97;
  - los 53 productos del detalle son todos Gadget, y la tabla visible no muestra otras categorías;
  - ambos gráficos tienen una única barra Gadget, con altura acorde a su valor.
- **El efecto es reversible.** Al eliminar el filtro, las tres visualizaciones vuelven exactamente al estado inicial (prueba 10).

La aprobación no se basa en que el selector muestre *Gadget*. Se basa en la comparación automática de los datos reales de las tres tarjetas, y de sus gráficos y tabla, con una referencia SQL independiente, antes, durante y después del filtro.

## 11. Hallazgos

**Ningún defecto de Metabase.**

1. **Dashboard 36 (`QA - TC-FUN-007 - Filtro de categoría`), creado en el intento `-05`.**
   - **Qué quedó:** ese intento creó, configuró y guardó correctamente el dashboard: 3 tarjetas, el filtro y sus vinculaciones.
   - **Por qué se detuvo:** al verificar el estado inicial, el script tomó por error el título del eje X (*Category*) como una categoría más. Leyó 5 etiquetas en lugar de 4, por un error de lectura del script.
   - **Corrección:** solo se toman las etiquetas de la fila más próxima al eje.
   - **Validación posterior:** se validaron los pasos de filtrado sobre ese dashboard en modo visualización (ejecución `-06`). Aplicar y quitar el valor no modifica la definición del dashboard.
   - **Estado:** **no se eliminó**. Se recomienda enviarlo a la papelera con autorización.
2. **Eliminación del valor del filtro.** El widget muestra *Categoría: Gadget ×*, pero el aspa no es un botón independiente localizable. El valor se eliminó desde el propio selector: se desmarcó Gadget y se confirmó.
3. **Exploración sobre `Examples`.** En el dashboard *E-commerce Insights* se usó el filtro *Product Category* en modo visualización. Metabase puede recordar para la cuenta el último valor usado, que es una preferencia del usuario y no un cambio del dashboard. No se usó ningún recurso de prueba para la exploración.
4. **Recursos protegidos.** Las preguntas 42, 43 y 44, el dashboard principal (2) y el dashboard 35 de TC-FUN-006 no se modificaron.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede crear desde la interfaz un dashboard con tres preguntas y configurar un filtro *Categoría* (*Texto o categoría*, *Es*, lista desplegable) vinculado a `Products.Category` en todas ellas. Al seleccionar *Gadget*, las tres visualizaciones se actualizan y muestran únicamente datos de Gadget: 53 productos, recuento 53 y precio promedio 56,97, coincidentes con la fuente. Al eliminar el filtro, regresan al estado inicial. El caso TC-FUN-007 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. Las consultas de las tarjetas, `POST /api/dashboard` y `PUT /api/dashboard/:id` se observaron sin simulación. Aplicación automática de filtros: activada (predeterminado) |
| Identificadores locales usados | Colección 6, preguntas 42/43/44, dashboard principal 2 y Sample Database 1 (de `configuracion/recursos-locales.json`). Campo CATEGORY resuelto por nombre. Dashboard creado: 37 |
