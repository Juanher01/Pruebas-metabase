# Reporte de prueba: TC-FUN-008

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-008 |
| Escenario | Creación y organización de colecciones |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-06` |
| Fecha y hora de ejecución | 2026-11-05 19:10:54 – 19:11:50 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-06` | 2026-11-05 19:11 | Juan | **Aprobado (11/11)** | `resultados/20261105-juan-06/` |

Las cinco ejecuciones previas se eliminaron, para conservar una única ejecución oficial:

- **`-01` y `-02`:** exploración sin escrituras, con la creación de colecciones y preguntas y la modificación de preguntas bloqueadas. Se abrieron el diálogo *Nueva colección* y el diálogo *Mover* sin confirmar.
- **`-03`:** completó la creación y el traslado y se detuvo por un error del script en el paso 9 (§11).
- **`-04`:** validó los pasos 9 a 11, que solo leen, sobre los recursos de `-03`.
- **`-05`:** se detuvo en el paso 2, sin crear nada, por la elección del nombre (§11).

## 2. Objetivo de la prueba

Comprobar que una cuenta con permisos suficientes puede crear una colección y trasladar a ella una pregunta guardada sin alterar su contenido.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Cuenta con permisos suficientes | Sí | Usuario QA (no administradora). `GET /api/collection/6` → `can_write = true`: puede crear subcolecciones y mover elementos dentro de *QA - Metabase* |
| Pregunta guardada | Sí | Se creó y guardó en la propia ejecución (prueba 3) |
| IDs desde la configuración local | Sí | `configuracion/recursos-locales.json`: colección 6, Sample Database 1, dashboard principal 2 y preguntas de referencia. `PRODUCTS` se resolvió por nombre |

**Desviaciones respecto de `caso.md`, por indicación de la solicitud de ejecución:**

- Se trasladó una **pregunta temporal propia del caso**, en lugar de la pregunta de TC-FUN-004 (74), que se conserva como evidencia de ese caso.
- Se usó la cuenta **Usuario QA**, después de comprobar que tiene permisos suficientes, en lugar de la cuenta administradora.
- Se usaron los nombres `QA - TC-FUN-008 - …` indicados en la solicitud, en lugar de `EJEC - TC-FUN-008 - …`.

## 4. Usuario y permisos

| Elemento | Valor |
|---|---|
| Cuenta | `usuario-qa` (Usuario QA), `is_superuser = false`, grupo *All Users* |
| Permiso sobre *QA - Metabase* | Escritura (`can_write = true`, permiso *Administrar* de *All Users*, heredado de la colección raíz) |
| Por qué esta cuenta | La solicitud pide comprobar primero si la cuenta normal puede hacer la operación. Como puede, **no fue necesario usar la administradora ni modificar permisos** |

## 5. Recursos

| Recurso | Valor |
|---|---|
| **Colección de origen** | *QA - Metabase*, **ID 6** (ubicación `/`) |
| **Colección creada (destino)** | **`QA - TC-FUN-008 - Colección de prueba - 20261105-juan-06`**, **ID 37**, ubicación `/6/` (dentro de *QA - Metabase*), `entity_id Ip9kiEUBxK7JmBD36XkcS` |
| **Pregunta trasladada** | **`QA - TC-FUN-008 - Detalle de productos - 20261105-juan-06`**, **ID 76**, `entity_id UOLZgON7Pc9g9HsbhZUmO`, creada el 2026-11-06 00:11:25 UTC |
| Configuración de la pregunta | Sample Database → Products; sin filtros, resumen ni agrupación; visualización *Tabla* |
| Nombres establecidos | `QA - TC-FUN-008 - Detalle de productos` y `QA - TC-FUN-008 - Colección de prueba`. Ambos ya existían (pregunta 75 y colección 36, del intento `-03`), así que se aplicó el sufijo del ID de ejecución |

## 6. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-008 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-008\scripts\TC-FUN-008.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-008\resultados\20261105-juan-06\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-008.cy.js](scripts/TC-FUN-008.cy.js). La creación de la pregunta, la creación de la colección, el traslado y la reapertura se hicieron en la interfaz; la API solo se usó para lecturas.

1. **Sesión, permisos y referencia.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` local y no se registra. Se comprueba el permiso de escritura sobre *QA - Metabase*, se calcula `SELECT COUNT(*) FROM PRODUCTS` en modo de solo lectura (200) y se registra el estado de los recursos protegidos.
2. **Nombres libres.** Se comprueban en la colección de origen y, para la pregunta, en toda la instancia.
3. **Preparación de la pregunta.** **Nuevo → Pregunta → Sample Database → Products → Visualizar**: 200 registros, tabla, sin filtros. **Guardar** con el nombre definitivo en *QA - Metabase* (`POST /api/card` 200, ID 76). Se registra su configuración inicial.
4. **Pregunta en el origen.** Se localiza en *QA - Metabase* (captura 01) y se abre: la consulta devuelve 200 registros y la ruta de navegación indica *QA - Metabase*.
5. **Creación de la colección.** En *QA - Metabase*, botón **Crear una nueva colección**: nombre definitivo, *Colección en la que se guarda: QA - Metabase* (captura 02) → **Crear** (`POST /api/collection` 200, ID 37, ubicación `/6/`).
6. **Ubicación de la colección.** La colección aparece en la lista de *QA - Metabase* y en la barra lateral, anidada bajo ella.
7. **Traslado.** En la fila de la pregunta, **Acciones → Mover**. En el diálogo *¿Mover "…"?* se elige *QA - Metabase → la colección nueva*, y el botón indica **Mover** (captura 03). Se confirma (`PUT /api/card/76` 200, `collection_id = 37`).
8. **Destino.** Se abre la colección nueva: contiene la pregunta, con un enlace a `/question/76-…` (captura 04).
9. **Reapertura.** Se abre la pregunta desde su nueva ubicación: 200 registros, tabla, fuente *Products*, sin filtros, y la ruta de navegación indica *QA - Metabase / la colección nueva* (captura 05). Editor: Datos = *Products* (captura 06).
10. **Origen.** *QA - Metabase* ya no contiene la pregunta como elemento directo (captura 07).
11. **Traslado frente a copia.** Comparación por API, en modo de solo lectura, del recurso antes y después, búsqueda de duplicados y estado de los recursos protegidos.
12. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401. La pregunta y la colección **se conservan**.

## 7. Resultado esperado

La colección se crea correctamente y la pregunta aparece en la ubicación de destino, conservando su contenido y configuración.

**Código HTTP esperado (plan):** N/A.

## 8. Resultado obtenido

### Comprobaciones de persistencia: la pregunta antes y después del traslado

Archivo `resultados/20261105-juan-06/traslado-coleccion.json`.

| Atributo | Antes del traslado | Después del traslado | ¿Se conserva? |
|---|---|---|---|
| ID | 76 | 76 | Sí: es el mismo recurso |
| `entity_id` | `UOLZgON7Pc9g9HsbhZUmO` | `UOLZgON7Pc9g9HsbhZUmO` | Sí |
| Fecha de creación | 2026-11-06T00:11:25.425306Z | 2026-11-06T00:11:25.425306Z | Sí |
| Nombre | `QA - TC-FUN-008 - Detalle de productos - 20261105-juan-06` | igual | Sí |
| Visualización | `table` | `table` | Sí |
| Definición | Sample Database (1), tabla PRODUCTS (3), 0 filtros, 0 agregaciones, 0 agrupaciones | igual | Sí |
| Registros al ejecutarla | 200 (desde el origen) | 200 (desde el destino) | Sí; fuente SQL = 200 |
| Colección | 6 (*QA - Metabase*) | **37** (colección nueva) | Cambia, como se esperaba |

**Traslado, no copia:**

- la pregunta conserva su ID, su `entity_id` y su fecha de creación;
- la colección 37 contiene exactamente esa pregunta;
- la colección 6 ya no la contiene;
- la búsqueda devuelve **una sola** pregunta con ese nombre, la 76.

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, cuenta, permisos y referencia | `/api/health` = `ok`; Usuario QA, no administradora; IDs locales; `can_write = true` en *QA - Metabase*; productos en la fuente = 200 | Aprobada |
| 2 | Nombres libres | Pregunta y colección con nombres inexistentes (con sufijo, porque los nombres base ya existían) | Aprobada |
| 3 | Preparación de la pregunta | Consulta `completed` con 200 registros; tabla sin filtros; `POST /api/card` 200; colección 6; `display = table`; definición Products sin filtros ni resumen | Aprobada |
| 4 | Pregunta en el origen y apertura | Fila con el nombre exacto y enlace a `/question/76-…`; consulta `completed` con 200 registros; título y ruta *QA - Metabase* | Aprobada |
| 5 | Creación de la colección | Diálogo con el nombre y la colección superior *QA - Metabase*; `POST /api/collection` 200; nombre; `location = /6/` | Aprobada |
| 6 | Ubicación de la colección | Fila de la colección en *QA - Metabase*, con enlace a `/collection/37-…`; colección activa con ubicación `/6/` | Aprobada |
| 7 | Traslado | Diálogo *Mover* con el nombre de la pregunta; destino = colección nueva; `PUT /api/card/76` 200; mismo ID; `collection_id = 37`; sin `dashboard_id` | Aprobada |
| 8 | Pregunta en el destino | Colección 37 abierta; un único elemento, la pregunta, con enlace a `/question/76-…` | Aprobada |
| 9 | Reapertura desde el destino | Consulta 202 `completed`; 200 registros = origen; título; ruta de navegación con la colección nueva; fuente *Products*; tabla; sin filtros; *"Mostrando 200 filas"*; Datos = *Products* en el editor | Aprobada |
| 10 | Ausencia en el origen | Ningún elemento de *QA - Metabase* con el nombre de la pregunta; la colección nueva sí aparece | Aprobada |
| 11 | Traslado y no copia; recursos protegidos | ID, `entity_id`, fecha de creación, nombre, visualización y definición iguales; colección = 37; no está en la 6; la 37 contiene solo la 76; una sola pregunta con ese nombre; preguntas de referencia y dashboard principal con el mismo `updated_at` | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 11 pruebas, 11 aprobadas, 0 fallidas. Duración: 39,0 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 9. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-06/01-pregunta-en-coleccion-origen.png` | *QA - Metabase* con la pregunta temporal en su lista (última fila) y el aviso *"Guardado"* |
| 2 | `evidencias/20261105-juan-06/02-creacion-de-coleccion.png` | Diálogo *Nueva colección*: nombre definitivo y *Colección en la que se guarda: QA - Metabase* |
| 3 | `evidencias/20261105-juan-06/03-seleccion-de-destino.png` | Momento de la selección del destino (ver nota) |
| 4 | `evidencias/20261105-juan-06/04-pregunta-en-coleccion-destino.png` | Colección nueva, anidada bajo *QA - Metabase* en la barra lateral, con la pregunta trasladada y el aviso *"Movido pregunta"* |
| 5 | `evidencias/20261105-juan-06/05-pregunta-abierta-tras-traslado.png` | Pregunta abierta desde la nueva ubicación: ruta *QA - Metabase / colección nueva*, *Sample Database / Products*, tabla con *"Mostrando 200 filas"* |
| 6 | `evidencias/20261105-juan-06/06-configuracion-conservada.png` | Editor de la pregunta trasladada: Datos = *Products*, sin filtros |
| 7 | `evidencias/20261105-juan-06/07-origen-sin-la-pregunta.png` | *QA - Metabase* tras el traslado |
| 8 | `resultados/20261105-juan-06/cypress-junit.xml` | Reporte nativo JUnit de Cypress (11/11) |
| 9 | `resultados/20261105-juan-06/consola.log` | Salida completa de Cypress |
| 10 | `resultados/20261105-juan-06/consola-errores.log` | Salida de errores (vacía) |
| 11 | `resultados/20261105-juan-06/traslado-coleccion.json` | Colecciones de origen y destino, y la pregunta antes y después del traslado |
| 12 | `resultados/20261105-juan-06/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

**Notas sobre las capturas:**

- **Captura 03.** Muestra la colección de origen, pero **no el diálogo *Mover***, que en ese instante estaba abierto: la prueba 7 acababa de comprobar que contenía el nombre de la pregunta y el botón *Mover* habilitado, y el traslado se confirmó pulsando ese botón. La causa más probable es que, por defecto, `cy.screenshot()` congela las animaciones y el diálogo se capturó antes de terminar de aparecer; ya ocurrió con el tooltip de TC-FUN-005. La selección del destino queda acreditada por la prueba 7 y por la respuesta del traslado. No se repitió la ejecución porque eso habría creado otra pregunta y otra colección.
- **Captura 07.** Muestra la parte superior de la lista. La ausencia de la pregunta en toda la colección la acreditan las pruebas 10 y 11.

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 10. Estado de la prueba

**Aprobado**

## 11. Justificación del resultado

- **"La colección se crea correctamente".** Se creó desde la interfaz, con el nombre asignado, dentro de *QA - Metabase*: `POST /api/collection` 200, ID 37, ubicación `/6/` (prueba 5). Aparece en esa ubicación, en la lista de la colección y en la barra lateral (prueba 6).
- **"La pregunta aparece en la ubicación de destino".** Tras **Acciones → Mover**, la colección nueva contiene la pregunta (pruebas 7 y 8), y ya no figura en la colección de origen (prueba 10).
- **"Conservando su contenido y configuración".** Abierta desde el destino, mantiene su nombre, su fuente *Products*, la ausencia de filtros, la visualización de tabla y sus 200 registros, iguales a los del origen y a la fuente (prueba 9). La lectura por API confirma que la definición no cambió (prueba 11).
- **Es un traslado y no una copia.** La pregunta conserva su ID, su `entity_id` y su fecha de creación, y no existe otra pregunta con el mismo nombre (prueba 11).

La aprobación no se basa en los avisos *"Guardado"* ni *"Movido pregunta"*. Se basa en la comprobación del estado real antes y después del traslado.

## 12. Hallazgos

**Ningún defecto de Metabase.**

1. **Recursos del intento `-03`:** pregunta **75** `QA - TC-FUN-008 - Detalle de productos`, dentro de la colección **36** `QA - TC-FUN-008 - Colección de prueba`, en *QA - Metabase*.
   - **Qué hizo ese intento:** creó la pregunta y la colección, y trasladó la pregunta correctamente.
   - **Por qué se detuvo:** en el paso 9, por un error del script. El número de filas esperado se leía antes de que llegara la respuesta.
   - **Corrección:** la comparación se hace después de recibir la respuesta. Con esos recursos se validaron los pasos 9 a 11, que solo leen (ejecución `-04`).
   - **Estado:** **no se eliminaron**. Se recomienda enviarlos a la papelera con autorización.
2. **Elección del nombre (ejecución `-05`).** El script buscaba nombres repetidos de preguntas solo en *QA - Metabase*, pero la pregunta de `-03` ya estaba en otra colección. La comprobación global detuvo la ejecución en el paso 2, sin crear nada. Corregido: el nombre se elige considerando toda la instancia.
3. **Destinos posibles en el diálogo *Mover*.** El diálogo permite mover la pregunta a colecciones y también a **dashboards**. La prueba verificó que el destino guardado fuera la colección (`dashboard_id` vacío).
4. **Recursos protegidos.** Las cinco preguntas de referencia, el dashboard principal y los recursos de otros casos no se modificaron. La exploración solo abrió, sin confirmar, el diálogo *Mover* de la pregunta sobrante 72, con las escrituras bloqueadas.

## 13. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA, con permiso de escritura sobre *QA - Metabase*, puede crear desde la interfaz una colección dentro de ella y trasladar a esa colección una pregunta guardada. La pregunta conserva su identidad (mismo ID y `entity_id`), su nombre, su definición, su visualización y sus resultados, y deja de figurar en la colección de origen. El caso TC-FUN-008 cumple el resultado esperado del plan.

## 14. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §6 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/card`, `POST /api/collection`, `PUT /api/card/:id` y las consultas se observaron sin simulación |
| Identificadores locales usados | Colección de origen 6, Sample Database 1, dashboard principal 2 y preguntas de referencia (de `configuracion/recursos-locales.json`). Creados: colección 37 y pregunta 76 |
