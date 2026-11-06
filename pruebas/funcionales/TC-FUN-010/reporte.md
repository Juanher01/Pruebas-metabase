# Reporte de prueba: TC-FUN-010

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-010 |
| Escenario | Ejecución de pregunta guardada mediante API REST |
| Categoría | Pruebas funcionales |
| Responsable / ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Versión de Metabase | v0.64.1 |
| Herramienta principal | Postman + Newman 6.2.2, reportador `newman-reporter-htmlextra` 1.23.1, Node.js v22.15.1 |
| Herramienta complementaria | Cypress 16.2.1 (Electron 146), para comparar con la interfaz web |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial.** Está formada por dos ejecuciones consecutivas del mismo caso:

| Ejecución | Fecha y hora | Herramienta | Resultado | Carpeta |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 19:46:03 – 19:46:09 | **Newman** (ejecución principal) | **8/8 aserciones aprobadas**. Código de salida 0 | `resultados/20261105-juan-01/` |
| `20261105-juan-02` | 2026-11-05 19:46:10 – 19:46:46 | Cypress (comparación con la interfaz) | **4/4 pruebas aprobadas**: API = interfaz = fuente = 18.760 | `resultados/20261105-juan-02/` |

**Historial.**

1. **Primera ejecución formal**, con el criterio literal del plan (HTTP 200): Newman obtuvo 7 de 8 aserciones aprobadas. Falló solo la del código, porque se recibió **202**. El caso quedó *No aprobado* por discrepancia de contrato, con los datos correctos y coincidentes con la interfaz.
2. **Decisión del equipo.** El equipo aprobó, el 2026-11-05, la desviación documentada que se describe en §6.
3. **Repetición.** Se ajustó la aserción 2 y se repitieron las dos ejecuciones. Las de la primera evaluación se eliminaron para conservar una única ejecución oficial; los identificadores `-01` y `-02` se reutilizaron.
4. **Intentos fallidos de Cypress.** Antes de esto, dos intentos de la comprobación con Cypress fallaron por errores del script (§11) y también se eliminaron.

## 2. Objetivo de la prueba

Comprobar que una pregunta guardada se ejecuta por la API REST con una sesión autorizada y devuelve resultados coherentes con los que se presentan al ejecutarla desde la interfaz web.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `version_metabase=v0.64.1` en `ejecucion-info.txt` |
| Pregunta guardada existente | Sí | `preguntas.conteo_pedidos` de `configuracion/recursos-locales.json` (41 en esta instalación), entregado por el script como `cardIdConteo`. *QA - Conteo de pedidos* existe, es de tipo nativo (SQL) y se visualiza como número (`scalar`) |
| Sesión autorizada | Sí | Sesión de `usuario-qa` iniciada por `scripts/ejecutar-herramienta.ps1`, con el mecanismo compartido de `scripts/sesion-metabase.ps1` |
| Permiso de la cuenta para ejecutar la pregunta | Sí | Comprobación previa de solo lectura: Usuario QA la ejecuta con éxito. No fue necesaria la cuenta administradora ni modificar permisos |
| Newman y htmlextra disponibles | Sí | Newman 6.2.2 y htmlextra 1.23.1, ya instalados |

## 4. Solicitud evaluada

| Elemento | Valor |
|---|---|
| Pregunta | **`QA - Conteo de pedidos`**, **ID 41** (`SELECT COUNT(*) AS total_pedidos FROM orders;`) |
| Método HTTP | `POST` |
| Endpoint | `POST {{baseUrl}}/api/card/{{cardId}}/query` → `http://localhost:3000/api/card/41/query` |
| Cuerpo | `{}` (ejecución normal) |
| Cabeceras | `X-Metabase-Session: {{sessionId}}` (redactada en los reportes), `Content-Type` y `Accept: application/json` |
| Cuenta | `usuario-qa` (Usuario QA, grupo *All Users*). Credenciales no reveladas |

`{{cardId}}` no es un valor fijo. El script entrega como `cardIdConteo` el ID de la pregunta de conteo de la instalación local, y el script previo de la colección lo asigna a `cardId` solo dentro de esta colección. La variable global `cardId` del proyecto es otra pregunta (*QA - Pedidos con subtotal mayor a 100*).

## 5. Procedimiento ejecutado

### 5.1 Investigación previa del endpoint (solo lectura)

Antes de escribir las aserciones se inspeccionó la respuesta real de `POST /api/card/41/query` con Usuario QA:

- **Código.** HTTP **202 Accepted** en todos los casos: con `Accept: application/json` o `*/*` y con `{"ignore_cache": true}`. El cuerpo es JSON completo, con `status = completed`.
- **Datos.** El cuerpo trae `data.rows = [[18760]]` y `data.cols = [{name: total_pedidos, base_type: type/Integer}]`.
- **Pregunta inexistente.** Devuelve 404.

Esto coincide con el código fuente de v0.64.1 (`docs/CONFIGURACION-QA.md` §7). Las consultas se responden en *streaming*, y esa respuesta usa **202** por defecto (`(or status 202)` en `server/streaming_response.clj`).

### 5.2 Ejecución principal con Newman

Colección: [scripts/TC-FUN-010.postman_collection.json](scripts/TC-FUN-010.postman_collection.json). No contiene credenciales, tokens, inicio de sesión ni IDs fijos.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-010 -Herramienta newman -Integrante juan -Cuenta usuario-qa
```

Comando de Newman construido por el script (de `ejecucion-info.txt`):

```text
newman.cmd run <repo>\pruebas\funcionales\TC-FUN-010\scripts\TC-FUN-010.postman_collection.json -e <archivo-temporal>
  -n 1 --timeout-request 120000 -r cli,json,htmlextra
  --reporter-json-export <resultados>\newman-results.json --reporter-htmlextra-export <resultados>\newman-report.html
  --reporter-htmlextra-title TC-FUN-010 --reporter-htmlextra-skipHeaders X-Metabase-Session
  --reporter-htmlextra-skipEnvironmentVars sessionId --reporter-htmlextra-skipSensitiveData
```

Secuencia:

1. **Sesión.** El script inicia sesión con `usuario-qa`; la contraseña sale del `.env` y no llega a Newman.
2. **Entorno temporal.** Entrega `baseUrl`, `cardIdConteo` y `sessionId` en un entorno temporal privado, no en la línea de comandos.
3. **Ejecución.** Newman ejecuta la solicitud y las 8 aserciones.
4. **Limpieza.** El script:
   - borra el archivo temporal;
   - **cierra la sesión** (*"Sesion cerrada: el token ya no es valido"*);
   - redacta el token;
   - redacta correos y cookies, también dentro del cuerpo guardado como bytes.

### 5.3 Comparación con la interfaz web (Cypress, complementaria)

Especificación: [scripts/TC-FUN-010.cy.js](scripts/TC-FUN-010.cy.js), ejecutada justo después de Newman:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-010 -Herramienta cypress -Integrante juan -Cuenta usuario-qa
```

1. **Valor de la API.** Se lee el resultado de la API en `resultados/20261105-juan-01/newman-results.json`, en modo de solo lectura. Se comprueban el método, el endpoint, el estado `completed` y el valor.
2. **Valor de la interfaz.** Desde la interfaz: **Inicio → barra lateral → QA - Metabase → QA - Conteo de pedidos**. Se espera la consulta real de la página, observada sin modificarla, y se lee el valor que se presenta (`scalar-value`). Captura 01.
3. **Comparación.** Se compara el valor de la API con el que muestra la interfaz y con una referencia SQL de solo lectura: `SELECT COUNT(*) FROM ORDERS`.
4. **Pregunta intacta.** Se comprueba que la pregunta no se modificó (`updated_at` igual).
5. **Cierre.** La sesión se cierra y se verifica con una respuesta 401.

## 6. Resultado esperado

**Plan:** se obtiene una respuesta con los resultados de la pregunta, coherentes con los datos presentados al ejecutar la misma consulta desde la interfaz web bajo condiciones equivalentes.

**Código HTTP esperado (plan):** 200 OK.

**Desviación documentada, aprobada por el equipo el 2026-11-05** (`docs/CONFIGURACION-QA.md` §7):

- **Regla:** en los endpoints de consulta de Metabase v0.64.1 se acepta como éxito **HTTP 200 o HTTP 202, siempre que el cuerpo tenga `status = "completed"`**.
- **Motivo:** el producto responde estas consultas en *streaming* con 202 por defecto, y el resultado completo llega en el mismo cuerpo.
- **Fundamento en el plan:** su matriz de riesgos ("Diferencias entre los contratos de la API y la versión instalada").
- **Texto del plan:** no se modifica; la desviación se informa en el informe final.

## 7. Resultado obtenido

| Dato | Esperado | Obtenido |
|---|---|---|
| Solicitud | `POST /api/card/41/query` | `POST http://localhost:3000/api/card/41/query`, cuerpo `{}` |
| **Código HTTP** | 200 (plan) o 202 con `status = completed` (desviación aprobada) | **202 Accepted**, con `status = completed` |
| Cuerpo | JSON con resultados | `application/json;charset=utf-8`, JSON válido, `row_count = 1` |
| Columnas (`data.cols`) | Coherentes con la consulta | 1 columna: `total_pedidos`, `type/Integer` |
| Filas (`data.rows`) | Una fila con el recuento | `[[18760]]` |
| **Valor de la API** | Número entero válido | **18.760** |
| **Valor de la interfaz** | Igual al de la API | **18,760** presentado (18.760); la consulta de la interfaz también recibió HTTP 202 con 18.760 |
| Referencia SQL de la fuente | Igual | 18.760 |
| Histórico de la preparación | Referencia inicial | 18.760 (confirmado) |
| Tiempo de respuesta | Fuera del criterio | 969 ms |
| Cierre de sesión | Sesión cerrada | Newman: *"Sesion cerrada: el token ya no es valido"*. Cypress: 401 tras el cierre |

### Comparación API frente a interfaz

| Origen | Valor | Coincide |
|---|---|---|
| API REST (Newman, `20261105-juan-01`) | 18.760 | — |
| Interfaz web (pregunta abierta desde la colección, `20261105-juan-02`) | 18,760 → 18.760 | **Sí** |
| Respuesta que recibió la interfaz | 18.760 | **Sí** |
| Fuente (`SELECT COUNT(*) FROM ORDERS`) | 18.760 | **Sí** |

### Aserciones de Newman

| # | Aserción | Resultado |
|---|---|---|
| 1 | La solicitud se envía al endpoint correcto (`POST /api/card/{cardId}/query`) | Aprobada |
| 2 | Código HTTP de éxito: 200 OK (plan) o 202 Accepted con `status = completed` (desviación aprobada) | Aprobada (202, `completed`) |
| 3 | El cuerpo es JSON válido | Aprobada |
| 4 | La respuesta contiene resultados de consulta completados (`status = completed`, sin `error`, objeto `data`) | Aprobada |
| 5 | `data.rows` es un arreglo | Aprobada |
| 6 | `data.cols` es un arreglo | Aprobada |
| 7 | Resultado agregado esperado: 1 fila, 1 valor, `row_count = 1`, columna `total_pedidos` de tipo entero | Aprobada |
| 8 | El recuento es un valor numérico válido (entero positivo) | Aprobada |

**Totales de Newman:** 1 solicitud; **8 aserciones aprobadas y 0 fallidas**. Código de salida: **0**.

**Comprobación complementaria (aserción 9, "el resultado coincide con la interfaz"):** Cypress, **4 de 4** pruebas aprobadas. API = interfaz = fuente = 18.760. Código de salida: 0.

## 8. Reportes nativos y evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | [resultados/20261105-juan-01/newman-report.html](resultados/20261105-juan-01/newman-report.html) | Reporte HTML nativo (htmlextra) de la ejecución principal |
| 2 | [resultados/20261105-juan-01/newman-results.json](resultados/20261105-juan-01/newman-results.json) | Resultado nativo JSON de Newman; token, correos y cookies redactados |
| 3 | `resultados/20261105-juan-01/consola.log` | **Registro técnico** de Newman (reportador `cli`) |
| 4 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, herramienta, cuenta, horario, código de salida, versión, variables y comando, sin credenciales |
| 5 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores de Newman (vacía) |
| 6 | `evidencias/20261105-juan-02/01-pregunta-en-interfaz-resultado.png` | *QA - Conteo de pedidos* abierta en la interfaz, en *QA - Metabase*: valor **18,760**, *"Mostrando 1 fila"* |
| 7 | `resultados/20261105-juan-02/comparacion-api-interfaz.json` | Valores de la API, de la interfaz y de la fuente, y la comparación |
| 8 | `resultados/20261105-juan-02/cypress-junit.xml`, `consola.log`, `ejecucion-info.txt` | Reporte nativo JUnit (4/4) y registros de la comprobación complementaria |

**Sobre `ejecucion.log`.** Para Newman, el script compartido guarda el registro técnico como `consola.log`; solo genera `ejecucion.log` para JMeter. No se cambió el nombre, para no alterar la estructura de resultados compartida.

**Revisión de datos sensibles:**

- **Token:** redactado en `newman-results.json`.
- **Correos y cookies de sesión:** ninguno en los reportes, ni como texto ni en el cuerpo decodificado.
- **Revisión final:** `scripts/revisar-secretos.ps1` sobre todo el repositorio devolvió **[OK]**.

## 9. Estado de la prueba

**Aprobado**, con la desviación documentada del código HTTP (§6).

## 10. Justificación técnica

- **Ejecución por la API: cumplida.** `POST /api/card/41/query` ejecutó la pregunta guardada con la sesión autorizada de Usuario QA. Respondió **202 Accepted** con `status = completed`, éxito según la desviación aprobada (aserciones 1 y 2), y un **JSON válido** (aserción 3).
- **Resultados válidos: cumplida.** La respuesta contiene la consulta completada, con `data.rows` y `data.cols`, una fila y la columna `total_pedidos` de tipo entero con el valor **18.760** (aserciones 4 a 8).
- **Coherencia con la interfaz: cumplida.** El valor de la API coincide exactamente con el que presenta la interfaz web al abrir la misma pregunta (18,760), con la respuesta que recibe la propia interfaz y con la fuente (comprobación complementaria).

El código obtenido (202) se registra tal cual. La aprobación se apoya en la decisión del equipo, que reconoce ese código como la respuesta de éxito de esta versión del producto, y no en una modificación del texto del plan. La comparación no usa una constante fija: el valor de la interfaz se leyó en la propia ejecución, y el histórico de 18.760 se confirmó.

## 11. Hallazgos

1. **Discrepancia de contrato con el plan, resuelta.** El plan espera 200 OK y `POST /api/card/{card-id}/query` responde 202 Accepted en v0.64.1, de forma reproducible y también en la propia interfaz.
   - **Clasificación:** no es un defecto funcional.
   - **Decisión del equipo (2026-11-05):** aceptar 200 o 202 con `status = "completed"`, registrada en `docs/CONFIGURACION-QA.md` §7.
   - **Otros casos afectados:** TC-CON-004, TC-REN-001, TC-REN-003, TC-REN-004 y TC-REN-005.
2. **Comparación con la interfaz.** La API y la interfaz coinciden exactamente (18.760), y también la fuente y el valor histórico de la preparación.
3. **Errores del script en la comprobación con Cypress** (intentos eliminados; no son defectos de Metabase):
   - `cy.exec`, para localizar el reporte de Newman, **ya no existe en Cypress 16**. Para no modificar la configuración compartida de Cypress, la comprobación lee la ejecución de Newman inmediatamente anterior a la suya.
   - Al cargar la página de inicio, la barra lateral se evaluó antes de que aparecieran sus enlaces. Ahora se espera a que se carguen.
4. **Recursos sin cambios.** La pregunta 41 no se modificó (mismo `updated_at`). No se modificaron datos, usuarios ni permisos.

## 12. Conclusión

En Metabase OSS v0.64.1, `POST /api/card/{card-id}/query` ejecuta correctamente la pregunta guardada *QA - Conteo de pedidos* (ID 41) con la sesión de la cuenta normal Usuario QA. Responde HTTP 202 con la consulta completada y un JSON válido con el recuento **18.760**, idéntico al que presenta la interfaz web y al de la fuente. Con la desviación aprobada sobre el código HTTP, el caso TC-FUN-010 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Versión de Docker | 29.6.2 |
| Herramientas | Newman 6.2.2; newman-reporter-htmlextra 1.23.1; Node.js v22.15.1; Cypress 16.2.1 (Electron 146), complementaria |
| Comandos | Ver §5.2 y §5.3 |
| Configuración relevante | 1 iteración; cuerpo `{}` (sin `ignore_cache`); `--timeout-request 120000`; htmlextra sin la cabecera de sesión, sin `sessionId` y sin datos sensibles. Cypress: `cypress.config.js` compartido, sin cambios |
| Identificadores locales usados | Pregunta 41 (`preguntas.conteo_pedidos` → `cardIdConteo`) y Sample Database 1, de `configuracion/recursos-locales.json` |
