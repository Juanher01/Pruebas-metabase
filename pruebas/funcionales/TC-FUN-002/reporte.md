# Reporte de prueba: TC-FUN-002

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-002 |
| Escenario | Ejecución de consulta mediante editor gráfico |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-03` |
| Fecha y hora de ejecución | 2026-11-05 09:56:22 – 09:56:56 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-03` | 2026-11-05 09:56 | Juan | **Aprobado (8/8)** | `resultados/20261105-juan-03/` |

Las ejecuciones previas de exploración y ajuste de la automatización (`-01` y `-02`) se eliminaron, para conservar una única ejecución oficial. El identificador conserva el sufijo `-03` porque así figura en los archivos nativos de la ejecución.

## 2. Objetivo de la prueba

Comprobar que una consulta construida con el editor gráfico y un filtro válido devuelve registros que cumplen el criterio y corresponden con los datos de origen.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Base de datos de ejemplo disponible | Sí | Prueba 1: Sample Database localizada por nombre, con la tabla `ORDERS` y el campo `SUBTOTAL` (solo lectura) |
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Cuenta autorizada | Sí | Usuario QA (cuenta normal) con sesión activa y permiso de consulta sobre Sample Database |
| Tabla y filtro | Sí | El plan no los especifica. Se usó la propuesta del equipo registrada en `caso.md`: `Orders`, `Subtotal > 100` |
| Valor de referencia R02 | Sustituido | R02 no está registrado en `valores-referencia.csv`. La correspondencia con el origen se comprobó con un recuento SQL de solo lectura dentro de la propia ejecución (prueba 8) |

## 4. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-002 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-002\scripts\TC-FUN-002.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-002\resultados\20261105-juan-03\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-002.cy.js](scripts/TC-FUN-002.cy.js):

1. **Inicio de sesión.** Se inicia sesión por API (`POST /api/session`) con la cuenta `usuario-qa`, ya que la autenticación no es objeto de este caso. Las credenciales salen del `.env` local y la contraseña no se registra. Después se comprueban la disponibilidad y la sesión, y se leen por nombre los metadatos de Sample Database, `ORDERS` y `SUBTOTAL`.
2. **Nueva pregunta.** En la barra principal, **Nuevo → Pregunta** abre el editor gráfico (`/question/notebook`). En el selector de datos se elige **Sample Database → Orders**. Captura 01.
3. **Filtro.** En el paso **Filtro**, *Añade filtros para acotar tu respuesta* → columna **Subtotal** → operador **Mayor que** → valor **100**. Captura 02. Después, **Añadir filtro**. Captura 03.
4. **Ejecución.** **Visualizar** ejecuta la consulta. Se espera a la respuesta real de `POST /api/dataset`, observada sin modificarla, y a que se rendericen la tabla y el contador de filas. Captura 04.
5. **Consulta enviada.** Se comprueba la consulta que envió la interfaz: base de datos, tabla, campo, operador y valor.
6. **Registros devueltos.** Se comprueba que todos los registros devueltos cumplen `Subtotal > 100`.
7. **Tabla de la interfaz.** Se comprueban los valores de **Subtotal** visibles en la tabla.
8. **Recuento de referencia.** Se hacen dos recuentos SQL de solo lectura sobre la misma fuente: `Subtotal > 100` y `Subtotal <= 100`. Se comparan con lo devuelto por la interfaz, teniendo en cuenta su límite de filas.
9. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

La consulta **no se guardó**, porque no es objetivo del caso, y no se modificó ningún recurso.

## 5. Resultado esperado

Se presentan registros que cumplen con los criterios de filtrado establecidos, conservando correspondencia con los datos de origen.

**Código HTTP esperado (plan):** N/A.

## 6. Resultado obtenido

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Metabase disponible y sesión de Usuario QA activa | `/api/health` = `ok`; sesión = Usuario QA, no administrador; Sample Database, `ORDERS` y `SUBTOTAL` localizados por nombre | Aprobada |
| 2 | Nuevo > Pregunta abre el editor gráfico y permite elegir Sample Database > Orders | Ruta `/question/notebook`; paso Datos = `Orders`; encabezado *Sample Database / Orders* | Aprobada |
| 3 | Se configura el filtro Subtotal "Mayor que" 100 | Operador mostrado = *Mayor que*; valor = `100`; el paso Filtro muestra `Subtotal` y `100` | Aprobada |
| 4 | Visualizar ejecuta la consulta | `POST /api/dataset` con código 200 o 202; `status = completed`; sin error; tabla y contador de filas visibles | Aprobada |
| 5 | La consulta corresponde al escenario | Base de datos = Sample Database; tabla de origen = `ORDERS`; un filtro; operador `>`; campo `SUBTOTAL`; valor `100` | Aprobada |
| 6 | Se muestran registros que cumplen el filtro | Registros devueltos > 0; **0 de 2.000** con `Subtotal <= 100` | Aprobada |
| 7 | Los valores visibles en la tabla cumplen la condición | **0 de 18** valores visibles de *Subtotal* con valor `<= 100` | Aprobada |
| 8 | Correspondencia con los datos de origen | Origen con `Subtotal > 100`: 5.244 (> 0). Origen excluido: 13.516 (> 0). Filas devueltas = `row_count` = min(5.244; 2.000) = 2.000. El contador indica *Mostrando las primeras…* | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 8 pruebas, 8 aprobadas, 0 fallidas. Duración: 18 s. Código de salida de Cypress: 0. Salida de errores vacía.

### Métricas registradas

Archivo `resultados/20261105-juan-03/metricas-consulta.json`:

| Métrica | Valor |
|---|---|
| Registros de origen con `Subtotal > 100` (SQL) | 5.244 |
| Registros de origen con `Subtotal <= 100` (SQL) | 13.516 |
| Total de Orders (suma) | 18.760 |
| Filas devueltas a la interfaz / `row_count` | 2.000 / 2.000 |
| Límite de filas sin agregación de la interfaz | 2.000 |
| Subtotal mínimo entre las filas devueltas | 101,0169… (> 100) |
| Valores de *Subtotal* visibles comprobados en la tabla | 18 |

### Interpretación del límite de filas

La consulta tiene 5.244 registros que cumplen el filtro, pero la interfaz devolvió 2.000 e indica *"Mostrando las primeras 2,000 filas"*. Esto se debe al límite predeterminado de Metabase v0.64.1 para consultas sin agregación (`default-unaggregated-query-row-limit 2000`) y **no constituye una falla funcional**. La coincidencia exacta `row_count = min(total de origen; 2.000)` confirma que la interfaz aplicó ese límite, y no una pérdida o alteración de datos.

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-03/01-seleccion-tabla-orders.png` | Editor gráfico con *Sample Database / Orders* seleccionado en el paso Datos |
| 2 | `evidencias/20261105-juan-03/02-configuracion-filtro.png` | Selector de filtro: **Subtotal**, operador **Mayor que**, valor **100**, antes de añadir |
| 3 | `evidencias/20261105-juan-03/03-filtro-aplicado.png` | Paso Filtro con la condición añadida |
| 4 | `evidencias/20261105-juan-03/04-resultados-consulta.png` | Resultados en tabla con la etiqueta *"Subtotal es mayor que 100"*, valores de Subtotal superiores a 100 y contador *"Mostrando las primeras 2,000 filas"* |
| 5 | `resultados/20261105-juan-03/cypress-junit.xml` | Reporte nativo JUnit de Cypress (8/8) |
| 6 | `resultados/20261105-juan-03/consola.log` | Salida completa de Cypress |
| 7 | `resultados/20261105-juan-03/consola-errores.log` | Salida de errores (vacía) |
| 8 | `resultados/20261105-juan-03/metricas-consulta.json` | Métricas de la consulta y de la comparación con el origen |
| 9 | `resultados/20261105-juan-03/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

En `ejecucion-info.txt`, la línea `cuenta=` indica *"inicio de sesion por la interfaz"*. Ese texto genérico del script correspondía a TC-FUN-001. En este caso el inicio de sesión se hizo por API dentro de la especificación. El texto del script ya se corrigió para ejecuciones futuras; el registro de esta ejecución se conserva sin modificar.

`scripts/revisar-secretos.ps1` sobre todo el repositorio devolvió `[OK]`: sin tokens, cookies de sesión ni contraseñas. Las capturas no muestran credenciales.

## 8. Estado de la prueba

**Aprobado**

## 9. Justificación del resultado

El resultado esperado del plan tiene dos partes, y ambas quedaron comprobadas con datos reales:

- **"Se presentan registros que cumplen con los criterios de filtrado establecidos".** La consulta se construyó en el editor gráfico con el filtro `Subtotal > 100` (pruebas 2, 3 y 5) y se ejecutó con éxito (prueba 4). Los 2.000 registros devueltos cumplen la condición (prueba 6), igual que los 18 valores visibles en la tabla (prueba 7, captura 04).
- **"Conservando correspondencia con los datos de origen".** La consulta enviada por la interfaz usa exactamente Sample Database, `ORDERS` y `SUBTOTAL`, resueltos por nombre (prueba 5). Además, la cantidad de filas devueltas coincide con el recuento obtenido por SQL sobre la misma fuente, una vez aplicado el límite documentado de 2.000 filas (prueba 8). El recuento de registros excluidos (13.516) muestra que el filtro descartó efectivamente los registros que no cumplen la condición.

## 10. Hallazgos

**Ningún defecto de Metabase.**

Hallazgos de la documentación y la automatización del proyecto:

1. **Sample Database usa SQLite en v0.64.1, no H2.** Una consulta SQL de solo lectura sobre `PUBLIC.ORDERS` falló con `no such table: PUBLIC.ORDERS` (driver `sqlite`). Las tablas se nombran sin esquema (`ORDERS`).
   - **Impacto:** las consultas de referencia R01–R06 de `docs/DATOS-Y-RECURSOS-PRUEBA.md` §1.3 y de `recursos-compartidos/datos/valores-referencia.csv`, y la consulta propuesta en la ficha de TC-FUN-003, usan el prefijo `PUBLIC.` y **fallarán**.
   - **Recomendación:** corregirlas antes de TC-FUN-003. No se modificaron en esta tarea, para mantener los cambios dentro de TC-FUN-002.
2. **Exposición de la cookie de sesión en los reportes de Cypress.** Durante el ajuste, una solicitud `cy.request` fallida incluyó en `cypress-junit.xml` la cabecera de la solicitud con la cookie `metabase.SESSION=<token>`. Ese token ya estaba invalidado al cierre de la ejecución, y la carpeta de esa ejecución se eliminó. Corregido así:
   - **En la especificación:** todas las solicitudes comprueban su código explícitamente (`failOnStatusCode: false`).
   - **En `scripts/ejecutar-herramienta.ps1`** (rama Cypress): los resultados se redactan también para la cookie `metabase.SESSION`.
   - **En `scripts/revisar-secretos.ps1`:** se detecta ese formato.
3. **Valor de referencia R02 no registrado.** La correspondencia con el origen se comprobó con un recuento SQL dentro de la ejecución. El valor obtenido (5.244) puede registrarse como R02 de la instalación de Juan.

## 11. Conclusión

En Metabase OSS v0.64.1, el editor gráfico permite a la cuenta normal Usuario QA construir y ejecutar una consulta sobre Sample Database → Orders con el filtro `Subtotal > 100`. Todos los registros presentados cumplen el criterio, y el resultado corresponde con los datos de origen dentro del límite de filas documentado de la interfaz. El caso TC-FUN-002 cumple el resultado esperado del plan.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §4 |
| Configuración relevante | `cypress.config.js` compartido; `testIsolation: false` dentro del caso; `POST /api/dataset` observado sin simulación; límite de filas de la interfaz: 2.000 |
| Identificadores locales usados | Ninguno fijo: Sample Database, `ORDERS` y `SUBTOTAL` se resuelven por nombre en cada ejecución |
