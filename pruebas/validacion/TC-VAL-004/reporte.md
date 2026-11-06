# Reporte de prueba: TC-VAL-004

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-VAL-004 |
| Escenario | Parámetro inexistente en consulta |
| Categoría | Pruebas de validación de entradas |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 20:31:50 – 20:32:36 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 20:32 | Juan | **Aprobado (6/6)** | `resultados/20261105-juan-01/` |

Antes se hicieron dos exploraciones de solo lectura, que no guardaron nada. Sirvieron para identificar el control del filtro de Products → Title y de People → Name. Se eliminaron, y el identificador `-01` se reutilizó porque su carpeta ya no existía.

## 2. Objetivo de la prueba

Comprobar que una consulta con un valor de texto inexistente se procesa sin errores y presenta un resultado vacío.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Valor `QA_VALOR_INEXISTENTE_2026` previamente verificado como ausente en la columna seleccionada | Sí | Comprobación SQL de solo lectura en la prueba 1, antes de la ejecución formal (§5) |
| Columna de texto en la que pueda introducirse el valor | Sí, con desviación | La columna propuesta, `Products.Title`, no admite el valor desde el filtro *Es*. Se usó `People.Name` (§4) |
| Cuenta autorizada | Sí | Usuario QA, no administradora |

## 4. Datos de prueba y desviación justificada

| Elemento | Propuesta de la solicitud | Utilizado en la ejecución formal |
|---|---|---|
| Base de datos | Sample Database | Sample Database |
| Tabla / campo | Products / **Title** | **People / Name** |
| Tipo de campo | Texto | Texto (`type/Text`) |
| Operador | Es (igual a) | **Es** (`=`) |
| Valor | `QA_VALOR_INEXISTENTE_2026` | **`QA_VALOR_INEXISTENTE_2026`**, el mismo |
| Visualización | Tabla | Tabla |

**Por qué se cambió de campo.** En v0.64.1, `Products.Title` está configurado con `has_field_values = list`, igual que los demás campos de texto de Products (EAN, Category y Vendor). Para estos campos, el filtro *Es* muestra una **lista cerrada de los valores existentes**, con un buscador *"Buscar en la lista"*. Lo que se escribe solo filtra la lista: no se puede añadir un valor que no esté en los datos.

La prueba 2 dejó registrado lo que ocurre con Title. Al escribir `QA_VALOR_INEXISTENTE_2026`, Metabase muestra *"No se encontró nada"*, no ofrece ninguna casilla, y **Añadir filtro** permanece deshabilitado, también al pulsar Enter (captura 01). Con Title no se puede aplicar el filtro ni, por tanto, evaluar el resultado del plan.

La solicitud prevé usar *"otro campo de texto compatible"* cuando el campo propuesto no sirva. Se eligió **`People.Name`** (`has_field_values = search`): su filtro *Es* admite **valores escritos libremente**, y así se mantienen el operador y el valor indicados. El plan no fija la columna y solo pide *"un filtro de texto"*, así que la desviación no afecta al criterio de aceptación.

## 5. Comprobación previa de inexistencia del valor

Consulta SQL de solo lectura sobre Sample Database, ejecutada en la prueba 1 antes de la ejecución formal:

| Comprobación | Resultado |
|---|---|
| `SELECT COUNT(*) FROM PRODUCTS WHERE TITLE = 'QA_VALOR_INEXISTENTE_2026'` (referencia R06) | **0** |
| `SELECT COUNT(*) FROM PEOPLE WHERE NAME = 'QA_VALOR_INEXISTENTE_2026'` | **0** |
| `SELECT COUNT(*) FROM PEOPLE` (la tabla tiene datos) | 2.500 |

Una comprobación de solo lectura previa a la ejecución confirmó además que no hay ningún valor parecido (`LIKE '%QA_VALOR%'`) en Title ni en Vendor (0). La base de datos no se modificó.

## 6. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-VAL-004 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\validacion\TC-VAL-004\scripts\TC-VAL-004.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\validacion\TC-VAL-004\resultados\20261105-juan-01\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-VAL-004.cy.js](scripts/TC-VAL-004.cy.js). Todo se hace en el editor gráfico, y la consulta **no se guarda**.

1. **Sesión y comprobación previa.** Inicio de sesión por API con `usuario-qa`; la contraseña sale del `.env` y no se registra. Se comprueban los tipos de los campos y la inexistencia del valor (§5).
2. **Registro del campo propuesto.** **Nuevo → Pregunta → Sample Database → Products** → filtro **Title**, operador **Es** → se escribe el valor, y después Enter. Se registran el tipo de control, el mensaje y el estado del botón. Captura 01. No se añade ningún filtro.
3. **Escenario formal.** **Nuevo → Pregunta → Sample Database → People** → paso Filtro → **Name** → operador **Es**. Se escribe `QA_VALOR_INEXISTENTE_2026` en el cuadro combinado *Valor del filtro* (captura 02) y se pulsa **Enter**, que convierte el texto en el valor del filtro (una etiqueta con el botón *Eliminar*). Se comprueban:
   - el valor;
   - que el campo no está marcado como inválido;
   - que no hay mensajes de error;
   - que **Añadir filtro** está habilitado.
4. **Confirmación.** **Añadir filtro**: el paso Filtro muestra *Name is QA_VALOR_INEXISTENTE_2026*. Captura 03.
5. **Ejecución.** **Visualizar** (`POST /api/dataset`, observado sin modificarlo). Se comprueban el estado de la consulta, la definición enviada (tabla, operador, campo y valor) y los registros devueltos.
6. **Estado vacío.** Se comprueban el mensaje de la interfaz, el contador de filas, la píldora del filtro, la ausencia de celdas y la ausencia de errores. Captura 04.
7. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

## 7. Resultado esperado

La consulta se procesa sin errores inesperados y presenta un resultado vacío, indicando que no existen registros que cumplan con el criterio especificado.

**Código HTTP esperado (plan):** N/A.

## 8. Resultado obtenido

Archivo `resultados/20261105-juan-01/resultado-valor-inexistente.json`.

| Dato | Valor |
|---|---|
| Campo y operador | People.**Name** (`type/Text`), **Es** |
| Valor introducido | `QA_VALOR_INEXISTENTE_2026`, aceptado como etiqueta de valor; *Añadir filtro* habilitado; sin `aria-invalid` ni mensajes de error |
| Filtro mostrado | Paso y píldora: *Name is QA_VALOR_INEXISTENTE_2026* |
| Definición enviada por la interfaz | tabla PEOPLE; `["=", campo NAME (48), "QA_VALOR_INEXISTENTE_2026"]` |
| Respuesta de la consulta | HTTP 202 Accepted (respuesta en *streaming* de v0.64.1), **`status = completed`**, sin error |
| **Registros devueltos** | **0** (`data.rows = []`, `row_count = 0`); la respuesta incluye las 13 columnas de People, lo que indica que la consulta se procesó por completo |
| **Estado vacío en la interfaz** | Ilustración y título **"Sin resultados"**, con el texto *"Puede que esta sea la respuesta que buscas. Si no, prueba a quitar o cambiar los filtros para que sean menos específicos."* y el botón *"Volver a los resultados anteriores"*; contador **"Mostrando 0 filas"**; ninguna celda de tabla |
| Errores | Ninguno: sin mensajes de error en la visualización y sin excepciones no controladas de la aplicación |

### Distinción del comportamiento observado

| Tipo | ¿Ocurrió? | Evidencia |
|---|---|---|
| **Resultado vacío válido** | **Sí** | La consulta termina en `completed`, sin `error` y con la estructura de columnas, y no devuelve ningún registro; la interfaz lo comunica con *"Sin resultados"* |
| Error de consulta | No | No hay campo `error` ni estado `failed`, y no se mostraron mensajes de error |
| Error de automatización | No | Las 6 pruebas pasaron y las capturas coinciden con lo registrado |

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Disponibilidad, sesión, campos y comprobación previa | `/api/health` = `ok`; Usuario QA, no administrador; Title y Name de tipo `type/Text`; R06 (Title) = 0; Name = 0; People = 2.500 | Aprobada |
| 2 | Registro con Products.Title | Lista con buscador, *"No se encontró nada"*, 0 casillas, *Añadir filtro* deshabilitado antes y después de Enter (solo se registra) | Aprobada |
| 3 | Valor introducido y aceptado en People.Name | Operador *Es*; cuadro combinado con el valor exacto; tras Enter, etiqueta del valor, botón *Eliminar* y valor confirmado; sin `aria-invalid` ni errores; *Añadir filtro* habilitado | Aprobada |
| 4 | Filtro confirmado | El selector se cierra; el paso Filtro contiene *Name* y el valor | Aprobada |
| 5 | Consulta procesada con 0 registros | 202, `completed`, sin error; tabla PEOPLE; operador `=`; campo NAME; valor exacto; columnas > 0; `rows = []`; `row_count = 0` | Aprobada |
| 6 | Estado vacío sin errores | *"Sin resultados"*; sin textos de error; *"Mostrando 0 filas"*; 1 píldora con el valor; ninguna celda; 0 excepciones | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 6 pruebas, 6 aprobadas, 0 fallidas. Duración: 29,7 s. Código de salida de Cypress: 0. Salida de errores vacía.

## 9. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-01/01-products-title-lista-sin-coincidencias.png` | Campo propuesto, Products → Title con *Es*: lista con buscador, *"No se encontró nada"* y *Añadir filtro* deshabilitado |
| 2 | `evidencias/20261105-juan-01/02-valor-inexistente-introducido.png` | People → Name con *Es*: valor `QA_VALOR_INEXISTENTE_2026` escrito y *Añadir filtro* habilitado |
| 3 | `evidencias/20261105-juan-01/03-filtro-configurado.png` | Paso Filtro con *Name is QA_VALOR_INEXISTENTE_2026* |
| 4 | `evidencias/20261105-juan-01/04-resultado-vacio.png` | Consulta ejecutada: píldora del filtro, **"Sin resultados"** y *"Mostrando 0 filas"* |
| 5 | `resultados/20261105-juan-01/cypress-junit.xml` | Reporte nativo JUnit de Cypress (6/6) |
| 6 | `resultados/20261105-juan-01/consola.log` | Salida completa de Cypress |
| 7 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 8 | `resultados/20261105-juan-01/resultado-valor-inexistente.json` | Comprobación previa, comportamiento de Title, campo utilizado, filtro, respuesta y estado vacío |
| 9 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` devolvió `[OK]`. Las capturas no muestran credenciales.

## 10. Estado de la prueba

**Aprobado** (con la desviación de campo justificada en §4).

## 11. Justificación técnica

- **El valor se verificó como ausente antes de ejecutar.** Hay 0 registros con ese valor en Products.Title y en People.Name (§5).
- **Metabase acepta el valor textual.** En People.Name, el filtro *Es* admite `QA_VALOR_INEXISTENTE_2026` como valor válido: no lo marca como inválido, no muestra errores y permite añadir el filtro. La consulta lo envía exactamente como `Name = "QA_VALOR_INEXISTENTE_2026"` (pruebas 3 a 5).
- **"La consulta se procesa sin errores inesperados": cumplido.** La respuesta real termina en `completed`, sin error y con la estructura de columnas completa. No hubo excepciones ni mensajes de error en la interfaz (pruebas 5 y 6). El código HTTP 202 corresponde a la respuesta en *streaming* de esta versión, aceptada por la decisión del equipo del 2026-11-05 (`docs/CONFIGURACION-QA.md` §7). Este caso no evalúa códigos HTTP (N/A).
- **"Presenta un resultado vacío, indicando que no existen registros": cumplido.** Se devolvieron 0 registros (`rows = []`, `row_count = 0`), y la interfaz lo comunica con el estado *"Sin resultados"*, su texto explicativo y *"Mostrando 0 filas"* (pruebas 5 y 6).

La aprobación no se basa en que la tabla esté vacía: se comprobó que la consulta **terminó correctamente** y que el vacío corresponde a la inexistencia real del valor.

## 12. Hallazgos

**Ningún defecto de Metabase.**

1. **Los campos con lista de valores no admiten valores inexistentes en el filtro *Es*.** Afecta a `Products.Title` y a los demás campos de texto de Products. El selector solo permite elegir valores existentes y responde *"No se encontró nada"* con el botón deshabilitado. Es una forma de validación preventiva, no un defecto, pero impide ejecutar el escenario con la columna propuesta. Por eso se usó `People.Name` (§4).
2. **Traducción incompleta.** La píldora y el paso del filtro muestran *"Name **is** QA_VALOR_INEXISTENTE_2026"*, con el operador en inglés dentro de la interfaz en español. En TC-VAL-001, el filtro numérico sí aparecía traducido (*"es mayor que"*). Es una observación menor de localización, no funcional.
3. **Ficha del caso.** `caso.md` proponía `Products.Title`. La ficha conserva esa propuesta, y esta ejecución documenta la columna efectivamente utilizada.

## 13. Conclusión

En Metabase OSS v0.64.1, un filtro de texto *Es* con el valor `QA_VALOR_INEXISTENTE_2026`, verificado como ausente en los datos, se acepta en una columna que admite valores libres (People.Name). La consulta termina correctamente sin errores y devuelve 0 registros, y la interfaz lo comunica con el estado *"Sin resultados"* y *"Mostrando 0 filas"*. En la columna propuesta, Products.Title, Metabase no permite introducir el valor, por su lista cerrada de valores. El caso TC-VAL-004 cumple el resultado esperado del plan.

## 14. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §6 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios. `testIsolation: false` y detención en la primera falla. `POST /api/dataset` observado sin simulación. Excepciones no controladas registradas. Consulta no guardada |
| Identificadores locales usados | Sample Database 1 (de `configuracion/recursos-locales.json`); PEOPLE, NAME y TITLE resueltos por nombre |
