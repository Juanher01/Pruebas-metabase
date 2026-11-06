# Reporte de prueba: TC-FUN-009

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-FUN-009 |
| Escenario | Consulta de dashboard mediante API REST |
| Categoría | Pruebas funcionales |
| Responsable / ejecutado por | Juan (ejecución automatizada con Claude Code mediante `scripts/ejecutar-herramienta.ps1`) |
| Instalación | Equipo de Juan (`JUANHER01`), rama `qa/juan-funcionales-validacion` |
| Identificador de ejecución oficial | `20261105-juan-01` |
| Fecha y hora de ejecución | 2026-11-05 19:29:18 – 19:29:22 (hora local) |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman 6.2.2, reportador `newman-reporter-htmlextra` 1.23.1, Node.js v22.15.1 |
| Cuenta utilizada | `usuario-qa`: **Usuario QA**, cuenta normal |

**Ejecución oficial:**

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| `20261105-juan-01` | 2026-11-05 19:29 | Juan | **Aprobado (7/7 aserciones)** | `resultados/20261105-juan-01/` |

Hubo una ejecución anterior con el mismo resultado funcional (7/7). Se **eliminó** sin versionarla, porque su `newman-results.json` contenía el correo de la cuenta administradora (§11). El identificador `-01` se reutilizó porque la carpeta anterior ya no existía.

## 2. Objetivo de la prueba

Comprobar que el endpoint devuelve la información del dashboard solicitado con identificador y nombre correspondientes.

## 3. Precondiciones

| Precondición | Verificada | Cómo |
|---|---|---|
| Metabase v0.64.1 disponible | Sí | `version_metabase=v0.64.1` en `ejecucion-info.txt`; respuesta con cabecera `x-metabase-version` |
| Identificador de dashboard existente | Sí | `dashboardId` = `dashboard_principal_id` de `configuracion/recursos-locales.json` (2 en esta instalación), entregado por el script; **no está escrito en la colección** |
| Sesión autorizada | Sí | Sesión de `usuario-qa` iniciada por `scripts/ejecutar-herramienta.ps1` con `POST /api/session` (mecanismo compartido de `scripts/sesion-metabase.ps1`) |
| Permiso de la cuenta sobre el dashboard | Sí | El dashboard está en *QA - Metabase*, donde *All Users* tiene acceso (comprobación previa de solo lectura). No fue necesario usar la cuenta administradora ni modificar permisos |
| Newman disponible | Sí | `newman` 6.2.2 y `newman-reporter-htmlextra` 1.23.1, instalados globalmente; no se instaló nada nuevo |

## 4. Solicitud evaluada

| Elemento | Valor |
|---|---|
| Método HTTP | `GET` |
| Endpoint | `GET {{baseUrl}}/api/dashboard/{{dashboardId}}` → `http://localhost:3000/api/dashboard/2` |
| Cabeceras | `X-Metabase-Session: {{sessionId}}` (redactada en los reportes), `Accept: application/json` |
| Dashboard utilizado | `QA - Dashboard Principal` (ID local 2, colección *QA - Metabase*) |
| Cuenta o rol | `usuario-qa`: Usuario QA, no administradora, grupo *All Users*. Credenciales no reveladas |

## 5. Procedimiento ejecutado

Colección: [scripts/TC-FUN-009.postman_collection.json](scripts/TC-FUN-009.postman_collection.json). Tiene una sola solicitud y **no contiene** credenciales, tokens, inicio de sesión ni IDs fijos. Un script previo verifica que estén definidas las variables `baseUrl`, `dashboardId` y `sessionId`.

Comando ejecutado desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-009 -Herramienta newman -Integrante juan -Cuenta usuario-qa
```

Comando de Newman construido por el script (registrado en `ejecucion-info.txt`; el entorno es un archivo temporal):

```text
newman.cmd run <repo>\pruebas\funcionales\TC-FUN-009\scripts\TC-FUN-009.postman_collection.json -e <archivo-temporal>
  -n 1 --timeout-request 120000 -r cli,json,htmlextra
  --reporter-json-export <resultados>\newman-results.json --reporter-htmlextra-export <resultados>\newman-report.html
  --reporter-htmlextra-title TC-FUN-009 --reporter-htmlextra-skipHeaders X-Metabase-Session
  --reporter-htmlextra-skipEnvironmentVars sessionId --reporter-htmlextra-skipSensitiveData
```

Secuencia:

1. **Sesión.** El script lee `dashboardId` de la configuración local e inicia sesión con `usuario-qa`. La contraseña sale del `.env` y no llega a Newman.
2. **Entorno temporal.** Escribe `baseUrl`, `dashboardId` y `sessionId` en un entorno temporal privado en `%TEMP%`, y no en la línea de comandos.
3. **Ejecución.** Newman ejecuta la solicitud y las 7 aserciones.
4. **Limpieza.** Al terminar, el script:
   - borra el archivo temporal;
   - cierra la sesión (`DELETE /api/session`, *"Sesion cerrada: el token ya no es valido"*);
   - redacta el token en los resultados;
   - redacta los correos y las cookies `metabase.*`, también dentro del cuerpo de respuesta guardado como bytes (§11).
5. **Revisión de secretos.** Se ejecutó `scripts/revisar-secretos.ps1` sobre todo el repositorio.

## 6. Resultado esperado

Se obtiene una respuesta JSON con la información del dashboard solicitado, cuyo identificador y nombre corresponden con el recurso consultado.

**Código HTTP esperado:** 200 OK.

## 7. Resultado obtenido

| Dato | Esperado | Obtenido |
|---|---|---|
| Código HTTP | 200 OK | **200 OK** |
| Tipo de contenido | JSON | `application/json;charset=utf-8`, JSON válido |
| Identificador (`id`) | 2 (`dashboardId` solicitado) | **2** |
| Nombre (`name`) | `QA - Dashboard Principal` | **`QA - Dashboard Principal`** |
| Información del recurso | Dashboard, no un mensaje de error | Objeto de 41 campos, sin `message`, `errors` ni `error`; `collection_id = 6`; `archived = false`; 3 tarjetas (preguntas 42, 43 y 44) y 1 filtro (`Categoría`, `string/=`) |
| Tiempo de respuesta | No forma parte del criterio | 430 ms; 17.597 bytes |

### Aserciones y resultados

| # | Aserción (Newman) | Resultado |
|---|---|---|
| 1 | Código HTTP 200 OK | Aprobada |
| 2 | El cuerpo es JSON válido (`Content-Type` JSON y cuerpo interpretable como objeto) | Aprobada |
| 3 | La respuesta contiene el identificador del dashboard (`id` numérico) | Aprobada |
| 4 | El `id` devuelto coincide con el solicitado (`dashboardId`) | Aprobada |
| 5 | Existe el campo `name` (texto) | Aprobada |
| 6 | El nombre corresponde a `QA - Dashboard Principal` | Aprobada |
| 7 | Es el recurso dashboard solicitado y no un mensaje de error: sin `message`, `errors` ni `error`; `dashcards` y `parameters` presentes como listas | Aprobada |

**Totales de Newman:** 1 iteración, 1 solicitud, 1 script previo y 1 script de pruebas sin fallos. **7 aserciones ejecutadas, 7 aprobadas, 0 fallidas.** Código de salida de Newman: **0**. Salida de errores vacía.

## 8. Resultados nativos y evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-juan-01/newman-report.html` | Reporte HTML nativo (htmlextra), sin la cabecera de sesión, la variable `sessionId` ni el cuerpo de la respuesta |
| 2 | `resultados/20261105-juan-01/newman-results.json` | Resultado nativo JSON de Newman: solicitud, respuesta, tiempos y aserciones. Token, correo y cookie redactados |
| 3 | `resultados/20261105-juan-01/consola.log` | **Registro técnico de la ejecución**: salida del reportador `cli` de Newman, con el detalle de cada aserción y la tabla de totales |
| 4 | `resultados/20261105-juan-01/consola-errores.log` | Salida de errores (vacía) |
| 5 | `resultados/20261105-juan-01/ejecucion-info.txt` | Caso, herramienta, cuenta, inicio y fin, código de salida, versión de Metabase, equipo, variables locales y comando, sin credenciales |
| 6 | `resultados/20261105-juan-01/respuesta-resumen-sanitizada.json` | Resumen **sanitizado**, no nativo, de la solicitud y la respuesta: id, nombre, colección, tarjetas, filtros y aserciones |

**Sobre `ejecucion.log`.** Para Newman, el script compartido guarda el registro técnico como `consola.log`; solo para JMeter genera un archivo llamado `ejecucion.log`. No se cambió el nombre, para no alterar la estructura de resultados que también usa Samuel. `consola.log` cumple esa función.

La carpeta `evidencias/20261105-juan-01/` solo contiene `.gitkeep`, porque una prueba de API no genera capturas. Las evidencias son los reportes nativos.

**Revisión de datos sensibles:**

- **Token:** redactado (`<SESION-REDACTADA>`) en `newman-results.json`; ausente del HTML.
- **Cookies:** no hay cookie de sesión. `metabase.DEVICE` está redactada.
- **Correos:** ninguno, ni como texto ni dentro del cuerpo decodificado.
- **Revisión final:** `scripts/revisar-secretos.ps1` sobre todo el repositorio devolvió **[OK]**, comparando 2 contraseñas y 2 correos del `.env`.

## 9. Estado de la prueba

**Aprobado**

## 10. Justificación del resultado

El plan espera *"una respuesta JSON con la información del dashboard solicitado, cuyo identificador y nombre corresponden con el recurso consultado"*, con HTTP 200 OK.

- **Código y formato.** La API respondió **200 OK** con un **JSON válido** (aserciones 1 y 2).
- **Identidad del recurso.** El `id` devuelto (2) es el solicitado, tomado de la configuración local y no escrito en la colección. El `name` es exactamente `QA - Dashboard Principal` (aserciones 3 a 6).
- **Contenido válido.** El cuerpo es el recurso dashboard, con sus tarjetas y filtros, y no un mensaje de error (aserción 7).

La aprobación no se basa solo en el código 200: el identificador y el nombre se comprobaron de forma independiente.

## 11. Hallazgos

**Ningún defecto de Metabase.**

**Hallazgo de seguridad en la automatización (corregido): el correo de una cuenta en el reporte JSON de Newman.**

- **Qué pasó.** La respuesta de `GET /api/dashboard/{id}` incluye `last-edit-info.email`, el correo del último editor: la cuenta administradora, cuyo correo es `QA_ADMIN_EMAIL` del `.env`. Newman guarda el cuerpo de la respuesta en `newman-results.json` como lista de bytes (`"type":"Buffer","data":[…]`).
- **Por qué no se detectaba.** Ni la redacción de textos del script ni `revisar-secretos.ps1` lo cubrían. La respuesta incluía además la cookie `metabase.DEVICE`, un identificador de dispositivo y no de sesión.
- **Qué se hizo con la primera ejecución.** Se eliminó sin versionarla.
- **Corrección en archivos compartidos** (cambios indispensables por seguridad; afectan solo a la parte de Newman y a la revisión de secretos, sin cambiar parámetros ni la estructura de resultados):
  - **`scripts/ejecutar-herramienta.ps1`:** al terminar una ejecución de Newman, decodifica los cuerpos guardados como bytes, redacta correos (`<correo-redactado>`) y cookies `metabase.*` (`<cookie-redactada>`), y los vuelve a codificar. También redacta esos patrones si aparecen como texto. Se comprobó que el JSON resultante es válido y conserva `id` y `name`.
  - **`scripts/revisar-secretos.ps1`:** decodifica esos mismos cuerpos y detecta también los correos exactos de las cuentas del `.env`, sin mostrarlos. Se verificó que marcaba la primera ejecución como **[NO SUBIR]** antes de eliminarla.
  - **`docs/HERRAMIENTAS-NEWMAN-JMETER.md`:** documenta la nueva protección.
- **Efecto para Samuel.** Sus ejecuciones de Newman (TC-ERR, TC-CON, TC-REN-003) quedarán redactadas igual. Las aserciones se evalúan durante la ejecución, así que la redacción posterior no altera los resultados. JMeter y Cypress no cambian: se comprobó con `-SoloMostrar`.

## 12. Conclusión

En Metabase OSS v0.64.1, `GET /api/dashboard/{id}` con un identificador existente y una sesión autorizada de la cuenta normal Usuario QA devuelve **HTTP 200 OK** y un JSON válido del dashboard solicitado: `id` 2 y `name` *QA - Dashboard Principal*. Newman verificó las 7 aserciones sin fallos. Los reportes nativos se conservan sin credenciales, tokens, cookies ni correos. El caso TC-FUN-009 cumple el resultado esperado del plan.

## 13. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Versión de Docker | 29.6.2 |
| Herramienta | Newman 6.2.2; newman-reporter-htmlextra 1.23.1; Node.js v22.15.1 |
| Comando ejecutado | Ver §5 |
| Configuración relevante | 1 iteración; `--timeout-request 120000`; reportadores `cli,json,htmlextra`; htmlextra sin la cabecera `X-Metabase-Session`, sin `sessionId` y sin datos sensibles; entorno temporal borrado al terminar |
| Identificadores locales usados | `dashboardId` = 2 (`dashboard_principal_id` de `configuracion/recursos-locales.json`) |
