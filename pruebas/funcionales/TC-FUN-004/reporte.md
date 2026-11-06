# Reporte de prueba: TC-FUN-004

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-004 |
| Escenario | Guardado y recuperación de una pregunta |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-11` |
| Fecha y hora de ejecución | 2026-11-05 10:56:09 – 10:56:54 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-11` | 2026-11-05 10:56 | Juan | **Aprobado (11/11)** | `resultados/20261105-juan-11/` |

Las diez ejecuciones previas (`-01` a `-10`) se eliminaron, para conservar una única ejecución oficial. El identificador conserva el sufijo `-11` porque así figura en los archivos nativos y en el nombre de la pregunta creada.

Las ejecuciones previas fueron de dos tipos:

- **Exploración** (`-01` a `-04`, `-06` a `-08` y `-10`): identificaron los selectores reales sin guardar nada. Las de `-06` en adelante abrieron preguntas existentes en modo de solo lectura.
- **Intentos fallidos por la automatización:** `-05` y `-09`, que dejaron dos preguntas en Metabase (ver §11, hallazgos 1 y 2).

## 2. Objetivo de la prueba

Comprobar que una pregunta puede guardarse en una colección autorizada y recuperarse conservando su configuración y resultados.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Colección autorizada para el usuario que ejecuta | Sí | ID leído de `configuracion/recursos-locales.json` (`coleccion_qa_id`). `GET /api/collection/{id}`: nombre `QA - Metabase`, activa, `can_write = true` para Usuario QA |
| Sample Database con `PRODUCTS` y `CATEGORY` | Sí | Localizados por nombre (solo lectura) |
| No existe un recurso con el nombre a usar | Sí, con ajuste | El nombre base ya existía (pregunta 72, creada por el intento `-05`). Por la regla de la solicitud se usó el nombre con sufijo del ID de ejecución, y se comprobó que ese nombre no existía |

**Desviación respecto de `caso.md`:** la ficha proponía el nombre `EJEC - TC-FUN-004 - Pregunta - <AAAAMMDD>` en una colección de ejecución de la jornada. Se usaron el nombre y la colección indicados en la solicitud de ejecución: `QA - TC-FUN-004 - Productos Gadget` en `QA - Metabase`.

## 4. Datos de prueba

| Dato | Valor |
|---|---|
| Base de datos / tabla | Sample Database / Products |
| Filtro | Category **Es** Gadget |
| Visualización | Tabla |
| Colección de destino | QA - Metabase (ID 6 en esta instalación, leído de la configuración local) |
| Nombre establecido | `QA - TC-FUN-004 - Productos Gadget` |
| **Nombre definitivo** | **`QA - TC-FUN-004 - Productos Gadget - 20261105-juan-11`** |
| **ID de la pregunta creada** | **74** (`/question/74`, `entity_id mJB9QFspt-3Jmj1mSotet`) |

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-004 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-004\scripts\TC-FUN-004.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-004\resultados\20261105-juan-11\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-004.cy.js](scripts/TC-FUN-004.cy.js). Todas las acciones de creación, guardado y reapertura se hicieron en la interfaz; la API solo se usó para lecturas de comprobación.

1. **Sesión y precondiciones.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se comprueban la disponibilidad, el usuario, la colección configurada y los metadatos de `PRODUCTS` y `CATEGORY`.
2. **Nombre libre.** Se listan las preguntas de la colección, en modo de solo lectura. Como el nombre base ya existía, se usó el sufijo `- 20261105-juan-11`.
3. **Nueva pregunta.** **Nuevo → Pregunta → Sample Database → Products**.
4. **Filtro.** Paso **Filtro** → **Category** → operador **Es** → casilla **Gadget**, la única marcada → **Añadir filtro**.
5. **Ejecución.** **Visualizar** ejecuta la consulta (`POST /api/dataset`, observado sin modificarlo). Se comprueban los registros y su categoría. Captura 01.
6. **Diálogo de guardado.** **Guardar** abre el diálogo *Guardar nueva pregunta*. Se escribe el nombre. En **¿Dónde quieres guardar esto?** se elige *Nuestros análisis → QA - Metabase*, y se confirma con **Seleccionar esta colección**, para guardar en la colección y no dentro del dashboard que contiene. Captura 02.
7. **Guardado.** **Guardar** (`POST /api/card`, observado). Se comprueban la respuesta, el cambio de URL a `/question/74-…`, el nombre en el encabezado y el aviso *"Guardado"*. Captura 03.
8. **Salida.** Se abre la barra lateral y se pulsa **Inicio**, para abandonar la pregunta.
9. **Acceso a la colección.** En la barra lateral se pulsa **QA - Metabase**, y se llega a `/collection/6-…`.
10. **Localización.** La pregunta se localiza por su nombre en la lista de la colección. Captura 04.
11. **Reapertura.** Se abre desde su enlace en la colección (`POST /api/card/74/query`, observado). Se comprueban el título, la fuente *Products*, la tabla y el filtro, mostrado al desplegar *Filtro 1*. Captura 05.
12. **Configuración almacenada.** Se lee la configuración almacenada con `GET /api/card/74` y se revisa el editor de la pregunta reabierta, sin modificarla. Captura 06.
13. **Comparación de resultados.** Se comparan los resultados recuperados con la consulta original: mismos registros, por ID, y valores visibles de *Category*. Se hace además un recuento SQL de solo lectura sobre la misma fuente.
14. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401. La pregunta **se conserva** como evidencia.

## 6. Resultado esperado

La pregunta queda almacenada y puede recuperarse conservando su configuración y los resultados correspondientes a la consulta.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Metabase disponible, sesión y colección autorizada | `/api/health` = `ok`; Usuario QA, no administrador; colección de la configuración local = `QA - Metabase`, activa y con escritura; `PRODUCTS` y `CATEGORY` localizados | Aprobada |
| 2 | Nombre sin duplicados | El nombre definitivo no existía en la colección (el nombre base sí existía: se aplicó el sufijo) | Aprobada |
| 3 | Products con el filtro Category Es Gadget | Paso Datos = Products; operador *Es*; solo la casilla *Gadget* marcada; el paso Filtro muestra Category y Gadget | Aprobada |
| 4 | Visualizar: registros de Gadget en tabla | `POST /api/dataset` 202, `completed`, sin error; consulta = PRODUCTS, `=`, CATEGORY, `"Gadget"`; 53 registros, 0 de otra categoría; tabla y píldora del filtro visibles | Aprobada |
| 5 | Diálogo de guardado | Nombre escrito y verificado; destino = colección QA - Metabase, con el botón *Seleccionar esta colección* | Aprobada |
| 6 | Guardado correcto | `POST /api/card` 200; ID nuevo (74), no reutilizado; nombre, `collection_id = 6`, sin `dashboard_id`, `display = table`; URL `/question/74-…`; nombre en el encabezado | Aprobada |
| 7 | Navegar fuera y llegar a la colección | Inicio (`/`) → barra lateral → *QA - Metabase* → `/collection/6-…`, encabezado *QA - Metabase* | Aprobada |
| 8 | Localización por nombre | Fila con el nombre exacto; su enlace apunta a `/question/74-…` | Aprobada |
| 9 | Reapertura sin errores | `POST /api/card/74/query` 202, `completed`, sin error; título = nombre guardado; fuente *Products*; tabla visible; una píldora *Category is Gadget* | Aprobada |
| 10 | Conserva tabla, filtro y visualización | Almacenada: nombre, colección 6, `display = table`, activa, tipo `question`, consulta PRODUCTS + CATEGORY = Gadget. En la interfaz: Datos = Products, Filtro = Category is Gadget | Aprobada |
| 11 | Resultados recuperados = consulta original | 53 registros, 0 de otra categoría; **los mismos 53 ID** que antes de guardar; 19 valores visibles de *Category* = Gadget; recuento SQL de origen = 53 | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 11 pruebas, 11 aprobadas, 0 fallidas. Duración: 30,0 s. Código de salida de Cypress: 0. Salida de errores vacía.

### Valores obtenidos

Archivo `resultados/20261105-juan-11/pregunta-creada.json`:

| Métrica | Valor |
|---|---|
| Pregunta creada (ID / nombre) | 74 / `QA - TC-FUN-004 - Productos Gadget - 20261105-juan-11` |
| Colección | QA - Metabase (ID 6) |
| Código HTTP del guardado / de la recuperación | 200 / 202 |
| Registros antes de guardar / al recuperar | 53 / 53 (mismos ID) |
| Recuento de origen (`SELECT COUNT(*) FROM PRODUCTS WHERE CATEGORY = 'Gadget'`) | 53 |
| Valores de *Category* visibles comprobados | 19 |
| Contador de la interfaz | *"Mostrando 53 filas"* |

**Verificación posterior de los recursos protegidos** (solo lectura, tras la ejecución):

- Las preguntas de referencia 40 a 44 conservan su `updated_at` de la preparación (2026-11-05 05:25–05:43 UTC), y siguen en la colección 6 sin archivar.
- El dashboard 2 conserva su `updated_at` (05:49 UTC) y sus 3 tarjetas.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-11/01-consulta-antes-de-guardar.png` | *Sample Database / Products* con la píldora *Category is Gadget*, tabla de registros Gadget y *"Mostrando 53 filas"*, antes de guardar |
| 2 | `evidencias/20261105-juan-11/02-dialogo-guardar.png` | Diálogo *Guardar nueva pregunta* con el nombre definitivo y destino **QA - Metabase** |
| 3 | `evidencias/20261105-juan-11/03-confirmacion-guardado.png` | Pregunta guardada: título con el nombre, ubicación *QA - Metabase* en la cabecera y aviso **"Guardado"** |
| 4 | `evidencias/20261105-juan-11/04-pregunta-en-coleccion.png` | Colección *QA - Metabase* abierta desde la barra lateral, con la pregunta en la lista junto a las preguntas de referencia |
| 5 | `evidencias/20261105-juan-11/05-pregunta-recuperada-resultados.png` | Pregunta reabierta desde la colección: título, *Sample Database / Products*, filtro *Category is Gadget*, tabla con 53 filas |
| 6 | `evidencias/20261105-juan-11/06-configuracion-recuperada.png` | Editor de la pregunta reabierta: **Datos = Products**, **Filtro = Category is Gadget** |
| 7 | `resultados/20261105-juan-11/cypress-junit.xml` | Reporte nativo JUnit de Cypress (11/11) |
| 8 | `resultados/20261105-juan-11/consola.log` | Salida completa de Cypress |
| 9 | `resultados/20261105-juan-11/consola-errores.log` | Salida de errores (vacía) |
| 10 | `resultados/20261105-juan-11/pregunta-creada.json` | ID, nombre, colección y comparación de resultados |
| 11 | `resultados/20261105-juan-11/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

Las capturas 03 y 05 se parecen porque muestran la misma pregunta. La 03 es la pantalla inmediata tras guardar; la 05 se tomó después de salir a Inicio, entrar en la colección y reabrir la pregunta. El aviso *"Guardado"* sigue visible en la 05 porque Metabase lo mantiene en pantalla unos segundos. Las pruebas 7 a 9 y sus códigos HTTP acreditan la navegación entre ambas.

`scripts/revisar-secretos.ps1` sobre todo el repositorio devolvió `[OK]`. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

- **"La pregunta queda almacenada".** La interfaz la guardó con el nombre asignado: `POST /api/card` 200 y nuevo ID 74 (prueba 6). Quedó dentro de la colección autorizada *QA - Metabase*, no en un dashboard ni en otra colección (pruebas 6 y 10).
- **"Puede recuperarse".** Tras abandonarla, se llegó a la colección por la barra lateral y se localizó por su nombre (pruebas 7 y 8). Se reabrió desde allí y se ejecutó sin errores (prueba 9).
- **"Conservando su configuración".** La pregunta reabierta mantiene la tabla de origen *Products*, el filtro *Category = Gadget* y la visualización de tabla. Así se ve en la interfaz y en la configuración almacenada (pruebas 9 y 10).
- **"Y los resultados correspondientes a la consulta".** Los resultados recuperados son exactamente los mismos 53 registros, por ID, que la consulta original. Todos son de la categoría Gadget, y su número coincide con el recuento de la fuente (prueba 11).

La aprobación no se basa en el aviso de guardado. La recuperación se probó navegando por la interfaz real, y la configuración y los resultados se compararon de forma explícita.

## 11. Hallazgos

**Ningún defecto de Metabase.**

Hallazgos de la automatización y recursos que requieren decisión:

1. **Pregunta 72, incompleta y sin filtro, creada por un error del script en el intento `-05`.**
   - **Causa:** la prueba 3 falló porque el script buscaba la casilla *dentro* de la etiqueta, cuando en v0.64.1 es un elemento hermano (`label[for]`). Cypress continuó con las pruebas siguientes y guardó la pregunta sin filtro. Se llama `QA - TC-FUN-004 - Productos Gadget` y está en *QA - Metabase*.
   - **Corrección en el script:** la casilla se localiza por `label[for]`. Además, la ejecución se detiene en la primera falla (`Cypress.stop()`), para no volver a guardar nunca una pregunta incompleta.
2. **Pregunta 73, correcta, creada en el intento `-09`.** Se llama `QA - TC-FUN-004 - Productos Gadget - 20261105-juan-09` y tiene el filtro correcto. El intento se detuvo en la prueba 9, porque en una pregunta guardada los filtros aparecen contraídos (*Filtro 1*). El script ahora los despliega.
3. **Limpieza posterior pendiente de autorización.** Se recomienda mover a la papelera las preguntas **72** (configuración errónea, con el nombre base, lo que crea ambigüedad) y **73** (duplicado de un intento parcial). No se eliminaron, porque la solicitud pide no borrar recursos automáticamente. La pregunta **74** es la evidencia oficial y debe conservarse; según `caso.md`, es la que se traslada en TC-FUN-008.
4. **Consejo de primera visita.** La primera vez que Usuario QA abrió una pregunta guardada, Metabase mostró el consejo *"Está bien trastear con las preguntas guardadas"*, que se cerró con *Empezar a explorar*. Ocurrió durante la exploración `-07`/`-08`. Metabase registra ese reconocimiento como preferencia de interfaz del usuario: no cambia permisos ni recursos, pero el consejo ya no vuelve a aparecer para esa cuenta. El script lo cierra solo si aparece.
5. **Exploraciones de solo lectura sobre recursos existentes.** Para validar la navegación sin crear más preguntas, se abrieron en modo de visualización la pregunta de referencia 44 y las preguntas 72 y 73. Ninguna se modificó: 40 a 44 conservan su `updated_at`.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede guardar en la colección autorizada *QA - Metabase* una pregunta del editor gráfico (Products, Category = Gadget, tabla), localizarla después en la colección y reabrirla. Al reabrirla conserva su nombre, tabla de origen, filtro y visualización, y devuelve los mismos 53 registros que la consulta original. El caso TC-FUN-004 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/dataset`, `POST /api/card` y `POST /api/card/:id/query` observados sin simulación. ID de la colección leído de `configuracion/recursos-locales.json` |
| Identificadores locales usados | Colección 6 (de la configuración local). Sample Database, `PRODUCTS` y `CATEGORY` resueltos por nombre. Pregunta creada: 74 |
