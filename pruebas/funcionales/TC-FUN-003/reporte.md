# Reporte de prueba: TC-FUN-003

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-003 |
| Escenario | Ejecución de consulta SQL |
| Categoría | Pruebas funcionales |
| Ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-04` |
| Fecha y hora de ejecución | 2026-11-05 10:31:14 – 10:31:53 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Cypress 16.2.1, navegador Electron 146 (sin interfaz gráfica) |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |
| Base de datos / tabla | Sample Database (driver `sqlite`) / `ORDERS` |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-04` | 2026-11-05 10:31 | Juan | **Aprobado (8/8)** | `resultados/20261105-juan-04/` |

Se eliminaron tres ejecuciones previas, para conservar una única ejecución oficial:

- **`-01` y `-02`:** exploraron los selectores del editor SQL y la forma en que se presenta el resultado.
- **`-03`:** falló en la prueba 2 por un **error del script**, no de Metabase. La aserción esperaba un editor sin texto, pero CodeMirror muestra un texto de ayuda (`.cm-placeholder`). Las otras 7 pruebas de esa ejecución pasaron con los mismos valores (18.760).

El identificador conserva el sufijo `-04` porque así figura en los archivos nativos de la ejecución.

## 2. Objetivo de la prueba

Comprobar que una consulta SQL de lectura con agregación se ejecuta y que su resultado coincide con el valor de referencia calculado sobre la misma fuente.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `GET /api/health` → `ok`; `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Cuenta autorizada con permiso SQL | Sí | Sesión de Usuario QA (no administrador). `native_permissions = write` sobre Sample Database, comprobado sin modificar permisos |
| Base de datos de ejemplo con la tabla Orders | Sí | Sample Database y `ORDERS` localizadas por nombre (solo lectura) |
| Operación de agregación previamente definida | Sí | `COUNT(*)` sobre `orders`, definida en la solicitud de ejecución y en `caso.md` |
| Resultado de referencia sobre la misma fuente | Sí | Valor histórico de preparación (18.760), **vuelto a calcular** en la ejecución con un mecanismo independiente (prueba 8) |

**Desviación respecto de la propuesta de `caso.md`:** la ficha proponía `SELECT COUNT(*) AS TOTAL_PEDIDOS FROM PUBLIC.ORDERS;`. Esa consulta **no funciona** en esta instalación, porque Sample Database usa SQLite y no admite el prefijo `PUBLIC.` (hallazgo documentado en TC-FUN-002). Se ejecutó la consulta definida para el caso, sin esquema y con el alias en minúsculas.

## 4. Consulta SQL ejecutada

```sql
SELECT COUNT(*) AS total_pedidos
FROM orders;
```

## 5. Procedimiento ejecutado

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-003 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

Comando de Cypress construido por el script (registrado en `ejecucion-info.txt`, sin credenciales):

```text
cypress.cmd run --project <repo> --config-file <repo>\recursos-compartidos\cypress\cypress.config.js
  --spec <repo>\pruebas\funcionales\TC-FUN-003\scripts\TC-FUN-003.cy.js --browser electron
  --reporter junit --reporter-options mochaFile=<repo>\pruebas\funcionales\TC-FUN-003\resultados\20261105-juan-04\cypress-junit.xml
```

Pasos automatizados en [scripts/TC-FUN-003.cy.js](scripts/TC-FUN-003.cy.js):

1. **Inicio de sesión y precondiciones.** Se inicia sesión por API (`POST /api/session`) con `usuario-qa`, ya que la autenticación no es objeto de este caso. La contraseña sale del `.env` local y no se registra. Después se comprueban la disponibilidad, el usuario de la sesión y el permiso SQL. Sample Database y `ORDERS` se resuelven por nombre.
2. **Nueva consulta SQL.** En la barra principal, **Nuevo → Consulta SQL** abre el editor SQL. Metabase preselecciona **Sample Database**, por ser la única base de datos disponible para la cuenta. El script la elegiría en el selector si no lo estuviera. Se comprueba que el editor está vacío. Captura 01.
3. **Escritura de la consulta.** Se escribe la consulta en el editor (CodeMirror) tecleándola, sin inyectar texto, y se comprueba que el texto del editor es exactamente la consulta. Captura 02.
4. **Ejecución.** Se pulsa el botón **Obtener respuesta** (`run-button`). Se espera la respuesta real de `POST /api/dataset`, observada sin modificarla. Se comprueba que el SQL y la base de datos enviados por la interfaz son los definidos. Metabase presenta el resultado de 1×1 como número (vista predeterminada). Captura 03.
5. **Vista de tabla.** Con el conmutador de la barra inferior (`query-display-tabular-toggle`) se pasa a la vista de **tabla**, y se comprueban la columna y su tipo. Captura 04.
6. **Fila única.** Se comprueba que se devuelve una única fila con el recuento, en la respuesta y en la tabla visible, y el contador *"Mostrando 1 fila"*.
7. **Valor presentado.** Se extrae el valor de la tabla y de la vista numérica, y se compara con el devuelto por la consulta.
8. **Referencia.** Se calcula la referencia por un **mecanismo distinto** del SQL: una consulta del editor gráfico (MBQL, agregación `count`) sobre la misma tabla `ORDERS`, ejecutada por API de solo lectura y sin guardar. También se compara con el valor histórico 18.760.
9. **Limpieza** (fuera de la evaluación). `DELETE /api/session` y comprobación de que la sesión devuelve 401.

La consulta **no se guardó** y no se modificó ningún usuario, permiso, recurso ni configuración de Metabase.

## 6. Resultado esperado

Se presenta el resultado de la consulta y el valor obtenido coincide con el resultado de referencia calculado sobre la misma fuente de datos.

**Código HTTP esperado (plan):** N/A.

## 7. Resultado obtenido

### Aserciones y resultados

| # | Prueba (JUnit) | Aserciones principales | Resultado |
|---|---|---|---|
| 1 | Metabase disponible, sesión de Usuario QA y permiso SQL | `/api/health` = `ok`; sesión = Usuario QA, no administrador; Sample Database con `native_permissions = write`; `ORDERS` localizada | Aprobada |
| 2 | Nuevo > Consulta SQL abre el editor SQL con Sample Database | Editor SQL visible; base seleccionada = `Sample Database`; editor sin consulta previa | Aprobada |
| 3 | El editor SQL acepta la consulta | Texto del editor = `SELECT COUNT(*) AS total_pedidos` / `FROM orders;` | Aprobada |
| 4 | Obtener respuesta ejecuta la consulta sin errores | `POST /api/dataset` con código 202; `status = completed`; sin error; base = Sample Database; SQL enviado = consulta definida; valor numérico visible | Aprobada |
| 5 | Tabla de resultados con la columna `total_pedidos` | Tabla visible; columnas visibles = `[total_pedidos]`; columnas del resultado = `[total_pedidos]`; tipo `type/Integer` | Aprobada |
| 6 | Única fila con el recuento agregado | 1 fila con 1 valor; `row_count = 1`; valor entero; 1 celda en la tabla visible; contador *"Mostrando 1 fila"* | Aprobada |
| 7 | El valor presentado coincide con el devuelto | Tabla = 18.760; vista numérica = 18.760; respuesta = 18.760; > 0 | Aprobada |
| 8 | Coincidencia con la referencia de la misma fuente | Referencia MBQL `count` sobre `ORDERS` = 18.760 = recuento SQL de la interfaz | Aprobada |

**Totales del reporte nativo** (`cypress-junit.xml`): 8 pruebas, 8 aprobadas, 0 fallidas. Duración: 24,5 s. Código de salida de Cypress: 0. Salida de errores vacía.

### Valores obtenidos

Archivo `resultados/20261105-juan-04/metricas-consulta.json`:

| Métrica | Valor |
|---|---|
| Motor de Sample Database | `sqlite` |
| Código HTTP / estado de la consulta | 202 / `completed` |
| Columnas del resultado | `total_pedidos` (`type/Integer`) |
| Filas devueltas / `row_count` | 1 / 1 |
| Valor devuelto por la consulta | **18.760** |
| Valor en la tabla de la interfaz | 18.760 (mostrado como `18,760`) |
| Valor en la vista numérica de la interfaz | 18.760 (mostrado como `18,760`) |
| Referencia independiente (MBQL `count` sobre `ORDERS`) | 18.760 |
| Valor histórico de preparación | 18.760 (coincide) |
| Tiempo de consulta mostrado por la interfaz | 132 ms (captura 03) |

### Valor de referencia y cómo se comprobó

- **Valor histórico.** El valor 18.760 se observó durante la preparación del ambiente. R03 no tiene valor registrado en `recursos-compartidos/datos/valores-referencia.csv`, y la consulta de esa fila usa `PUBLIC.ORDERS`, que no funciona en esta instalación. Por eso no se usó el histórico como única referencia.
- **Referencia vigente.** Se calculó en la misma ejecución con el **motor de consultas del editor gráfico** (MBQL, `aggregation: [["count"]]` sobre la tabla `ORDERS`), por un camino distinto del SQL evaluado. Así se evita una comparación circular, que es la recomendación de `caso.md`. La consulta es de solo lectura y no se guardó.
- **Comparación.** Recuento SQL desde la interfaz = 18.760; referencia MBQL = 18.760; histórico = 18.760. Las tres coinciden, así que **no hubo cambio en los datos de origen** desde la preparación.

## 8. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `evidencias/20261105-juan-04/01-editor-sql-sample-database.png` | Editor SQL recién abierto (*Nueva pregunta*), con **Sample Database** seleccionada, vacío y la lista de 8 tablas |
| 2 | `evidencias/20261105-juan-04/02-consulta-sql-escrita.png` | Consulta `SELECT COUNT(*) AS total_pedidos FROM orders;` escrita en el editor, antes de ejecutarla |
| 3 | `evidencias/20261105-juan-04/03-resultado-agregado.png` | Resultado en la vista numérica predeterminada: **18,760**, *"Mostrando 1 fila"*, 132 ms |
| 4 | `evidencias/20261105-juan-04/04-resultado-tabla.png` | Resultado en vista de tabla: columna **total_pedidos**, una fila con **18,760** |
| 5 | `resultados/20261105-juan-04/cypress-junit.xml` | Reporte nativo JUnit de Cypress (8/8) |
| 6 | `resultados/20261105-juan-04/consola.log` | Salida completa de Cypress |
| 7 | `resultados/20261105-juan-04/consola-errores.log` | Salida de errores (vacía) |
| 8 | `resultados/20261105-juan-04/metricas-consulta.json` | Consulta, columnas, filas, valores en interfaz y respuesta, referencia e histórico |
| 9 | `resultados/20261105-juan-04/ejecucion-info.txt` | Caso, cuenta, inicio y fin, código de salida, versión y comando (sin credenciales) |

`scripts/revisar-secretos.ps1` sobre todo el repositorio devolvió `[OK]`: sin tokens, cookies de sesión ni contraseñas. El script de ejecución informó 0 contraseñas y 0 cookies que redactar. Las capturas no muestran credenciales.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

El resultado esperado del plan tiene dos partes, y ambas quedaron comprobadas con datos reales:

- **"Se presenta el resultado de la consulta".** La consulta se escribió en el editor SQL de la interfaz, que la aceptó tal cual (pruebas 2 y 3). Se ejecutó con **Obtener respuesta** sin errores (prueba 4), y el resultado agregado se presentó como número y como tabla. La columna `total_pedidos` es entera y hay una sola fila (pruebas 5 y 6; capturas 03 y 04).
- **"El valor obtenido coincide con el resultado de referencia calculado sobre la misma fuente de datos".** El valor presentado en la interfaz (18.760) es el mismo que devolvió la consulta (prueba 7). Además, coincide con la referencia calculada en la misma ejecución sobre la misma tabla `ORDERS`, mediante un motor de consulta distinto (MBQL `count`, prueba 8), y con el valor histórico de preparación.

La prueba no se aprobó por obtener un número positivo, sino por la **igualdad exacta** con una referencia independiente vigente.

## 11. Hallazgos

**Ningún defecto de Metabase.**

Hallazgos de la documentación y la automatización del proyecto:

1. **La consulta propuesta en `caso.md` y la de R03 usan `PUBLIC.ORDERS`.** Este es el hallazgo ya documentado en TC-FUN-002: la Sample Database de v0.64.1 es SQLite y no admite el esquema `PUBLIC.`.
   - **En esta ficha:** se ejecutó la consulta sin esquema y la ficha se actualizó para reflejarlo.
   - **Pendiente de autorización** (no modificados, por ser documentos compartidos): `recursos-compartidos/datos/valores-referencia.csv` (R01–R06) y `docs/DATOS-Y-RECURSOS-PRUEBA.md` §1.3.
2. **R03 sin valor registrado.** El valor comprobado (18.760, fecha 2026-11-05) puede registrarse como `valor_juan` de R03.
3. **La vista predeterminada de un resultado 1×1 es un número, no una tabla.** No es un defecto, sino el comportamiento normal de Metabase. Para comprobar la tabla de resultados, la automatización cambia a la vista de tabla con el conmutador de la interfaz.
4. **Error de automatización, ya corregido** (ejecución `-03`, eliminada). La primera versión de la aserción de editor vacío no consideraba el texto de ayuda de CodeMirror. No se clasificó como defecto de Metabase.

## 12. Conclusión

En Metabase OSS v0.64.1, la cuenta normal Usuario QA puede escribir y ejecutar en el editor SQL la consulta de agregación `SELECT COUNT(*) AS total_pedidos FROM orders;` sobre Sample Database. La interfaz presenta un único valor entero en la columna `total_pedidos`: 18.760, igual a la referencia independiente calculada sobre la misma fuente. El caso TC-FUN-003 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Navegador y versión | Electron 146, sin interfaz gráfica (incluido en Cypress 16.2.1) |
| Versión de Docker | 29.6.2 |
| Herramienta | Cypress 16.2.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | `cypress.config.js` compartido, sin cambios; `testIsolation: false` dentro del caso; `POST /api/dataset` observado sin simulación; consulta no guardada |
| Identificadores locales usados | Ninguno fijo: Sample Database y `ORDERS` se resuelven por nombre en cada ejecución |
