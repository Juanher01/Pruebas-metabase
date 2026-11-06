# Newman y Apache JMeter: requisitos, ejecución y reportes nativos

Herramientas de los casos de **Samuel**:

| Herramienta | Casos | Reportes nativos |
|---|---|---|
| Postman + **Newman** | TC-ERR-001 a 005, TC-CON-001 a 004, TC-REN-003 | `newman-results.json`, `newman-report.html` |
| **Apache JMeter** | TC-REN-001, TC-REN-004, TC-REN-005 | `resultados.jtl`, `reporte-html/index.html` |
| Navegador y herramientas de desarrollador | TC-REN-002 | Capturas y HAR en `evidencias/` |

Juan usa Newman en TC-FUN-009 y TC-FUN-010, con el mismo procedimiento.

> **Regla de seguridad:** los reportes nativos se suben a GitHub, y **Newman guarda en ellos el token de sesión y las variables del entorno**. Se comprobó el 2026-11-05 con valores falsos: `newman-results.json` incluía el token y la contraseña, y el HTML de htmlextra incluía el token. Por eso **todas las ejecuciones formales se hacen con [scripts/ejecutar-herramienta.ps1](../scripts/ejecutar-herramienta.ps1)**, que:
> - inicia la sesión fuera de la herramienta con la cuenta indicada (`-Cuenta admin` o `usuario-qa`, credenciales del `.env` local: ver [AUTENTICACION-QA.md](AUTENTICACION-QA.md)), de modo que la contraseña nunca llega a Newman ni a JMeter;
> - entrega las variables y el token en un archivo temporal, nunca en la línea de comandos;
> - cierra la sesión al terminar, con lo que el token deja de ser válido;
> - reemplaza el token por `<SESION-REDACTADA>` en todos los archivos generados;
> - en Newman, redacta además los correos de usuarios y las cookies `metabase.*` (por ejemplo `metabase.DEVICE`), también dentro de los cuerpos de respuesta que `newman-results.json` guarda como bytes (`"type":"Buffer","data":[…]`). Las respuestas de Metabase incluyen correos, por ejemplo en `last-edit-info.email`; se comprobó el 2026-11-05 en TC-FUN-009. `scripts/revisar-secretos.ps1` decodifica esos cuerpos y detecta los correos de las cuentas del `.env`.

---

## 1. Requisitos e instalación

Registre la versión de cada herramienta en `reportes-generales/evidencias-ambiente/` y en la sección 12 de cada `reporte.md`.

### 1.1 Node.js, Newman y el reportador HTML

| Componente | Requisito | Instalación (PowerShell) | Verificación |
|---|---|---|---|
| Node.js | Versión LTS (20 o superior) | `winget install -e --id OpenJS.NodeJS.LTS` (luego cierre y abra PowerShell) | `node --version` |
| Newman | 6.x | `npm install -g newman` | `newman --version` |
| Reportador HTML | `newman-reporter-htmlextra` | `npm install -g newman-reporter-htmlextra` | `npm ls -g --depth=0` lo muestra |
| Postman (aplicación) | Para diseñar y depurar colecciones | `winget install -e --id Postman.Postman` | Abrir la aplicación |

Versiones en el equipo de Juan el 2026-11-05, como referencia: Node.js v22.15.1, Newman 6.2.2 y newman-reporter-htmlextra 1.23.1. Use las mismas o versiones compatibles, y regístrelas.

Si `npm install -g` falla por permisos, abra PowerShell **como administrador** y repita, o use un gestor de versiones de Node.

### 1.2 Java y Apache JMeter

| Componente | Requisito | Instalación | Verificación |
|---|---|---|---|
| Java | JDK o JRE 8 o superior (se recomienda Java 17 LTS) | `winget install -e --id EclipseAdoptium.Temurin.17.JDK` | `java -version` |
| Apache JMeter | Versión estable vigente (5.6.x o posterior) | Descargar el **binario `.zip`** de <https://jmeter.apache.org/download_jmeter.cgi>, verificar su SHA-512 y descomprimir en `C:\herramientas\` (por ejemplo `C:\herramientas\apache-jmeter-5.6.3`) | `C:\herramientas\apache-jmeter-<versión>\bin\jmeter.bat --version` |

- No hace falta agregar JMeter al `PATH`: el script recibe la ruta con `-JMeter "C:\herramientas\apache-jmeter-<versión>\bin\jmeter.bat"`.
- Las pruebas formales se ejecutan **sin interfaz gráfica** (`-n`). La interfaz (`jmeter.bat` sin argumentos) solo se usa para diseñar el plan `.jmx`.

---

## 2. Cómo preparar los scripts de cada caso

Cada caso guarda su script en su carpeta ([pruebas/README.md](../pruebas/README.md)):

- Newman: `pruebas/<categoría>/<ID>/scripts/<ID>.postman_collection.json`
- JMeter: `pruebas/<categoría>/<ID>/scripts/<ID>.jmx`

### 2.1 Variables disponibles (nunca IDs fijos)

El script de ejecución lee `configuracion/recursos-locales.json`, generado con `scripts/obtener-ids-recursos.ps1 -Guardar`, y entrega estas variables. Los valores son **los de la instalación de quien ejecuta**:

| Variable | Origen en `recursos-locales.json` | Uso típico |
|---|---|---|
| `baseUrl` | `base_url` | Todas las solicitudes |
| `sessionId` | Sesión obtenida por el script | Cabecera `X-Metabase-Session` |
| `cardId` | `preguntas.pedidos_subtotal_mayor_100` (P1) | TC-CON-002 a 004, TC-REN, TC-FUN-010 |
| `cardIdConteo` | `preguntas.conteo_pedidos` (P2) | Comparaciones |
| `dashboardId` | `dashboard_principal_id` | TC-CON-001, TC-FUN-009 |
| `dashboardPrivadoId` | `recursos_restringidos.dashboard_privado_id` | TC-ERR-005 |
| `dashboardIdInexistente` | `ids_inexistentes_verificados.dashboard_id_inexistente` | TC-ERR-001 (debe completarse a mano tras verificarlo) |
| `collectionId`, `databaseId` | `coleccion_qa_id`, `sample_database_id` | Según el caso |

### 2.2 Colecciones de Postman / Newman

- Use `{{baseUrl}}`, `{{cardId}}` y demás variables. Por ejemplo: `POST {{baseUrl}}/api/card/{{cardId}}/query` con la cabecera `X-Metabase-Session: {{sessionId}}`.
- **No incluya una solicitud de inicio de sesión** (`POST /api/session`) dentro de las colecciones de los casos. La sesión la proporciona el script. Así la contraseña nunca queda en los reportes, y Newman no recibe la cookie de sesión de Metabase en su *cookie jar*.
- **TC-ERR-005** (sin autenticación): la solicitud **no** debe llevar la cabecera `X-Metabase-Session`. Ejecútelo con `-SinSesion`.
- Defina las variables en el **entorno**, no como variables de la colección: al exportar una colección desde Postman, sus variables se guardan con su valor actual. Antes de copiar una colección exportada al repositorio, busque en ella `sessionId` y `password` y compruebe que no tienen valores.
- Para depurar en la aplicación Postman, use su entorno local `recursos-compartidos/postman/metabase-local.postman_environment.json`, que está excluido de Git.
- **No use** las opciones `--export-environment` ni `--export-globals` de Newman: escriben los valores de las variables en archivos.

### 2.3 Planes de JMeter (`.jmx`)

- **Solicitud HTTP:** deje vacío el campo *Server Name* y escriba la URL completa en *Path*, por ejemplo `${__P(baseUrl)}/api/card/${__P(cardId)}/query`. Método `POST`, cuerpo `{"ignore_cache": <valor acordado en el piloto>}`.
- **HTTP Header Manager:** `X-Metabase-Session: ${__P(sessionId)}` y `Content-Type: application/json`.
- **Grupos de hilos** (según el plan):

| Caso | Usuarios | Iteraciones / duración | Notas |
|---|---|---|---|
| TC-REN-001 | 1 | 1 ejecución de preparación + 1 medición | El plan exige la ejecución de preparación antes de medir |
| TC-REN-004 | 5 | 10 iteraciones por usuario (50 solicitudes) | Ramp-up: **pendiente de definición** (el plan no lo indica); regístrelo |
| TC-REN-005 | 5 | 60 segundos (*Specify thread lifetime*) | Ejecutar primero la línea base y después la ejecución comparada |

- **Aserción de código HTTP:** pendiente de la decisión del piloto, porque el plan espera 200 y la fuente de v0.64.1 sugiere 202 ([CONFIGURACION-QA.md §7](CONFIGURACION-QA.md#observaciones-que-deben-confirmarse-en-la-ejecución-piloto)).
- **Antes de guardar el `.jmx`, quite o desactive** los *listeners* de la interfaz (*View Results Tree*, *Summary Report*...). No active el guardado de cabeceras ni de cuerpos (`jmeter.save.saveservice.requestHeaders`, `samplerData`, `responseData`): los JTL por defecto no los incluyen, y así deben quedarse.

---

## 3. Ejecución y reportes nativos

Desde la carpeta del repositorio, con Metabase en ejecución:

```powershell
# Newman (pide correo y contraseña; no los guarda)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-CON-002 -Herramienta newman -Integrante samuel

# TC-REN-003: 30 solicitudes secuenciales
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-003 -Herramienta newman -Integrante samuel -Iteraciones 30

# TC-ERR-005: sin autenticación
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-ERR-005 -Herramienta newman -Integrante samuel -SinSesion

# JMeter (modo sin interfaz + reporte HTML)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-004 -Herramienta jmeter -Integrante samuel -JMeter "C:\herramientas\apache-jmeter-5.6.3\bin\jmeter.bat"

# Ver el comando y las variables sin ejecutar nada
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-004 -Herramienta jmeter -Integrante samuel -SoloMostrar
```

Por defecto se usa la cuenta `admin`. Para la cuenta normal, agregue `-Cuenta usuario-qa`. El correo y la contraseña se leen del `.env` local (`QA_ADMIN_*` o `QA_USER_*`, ver [AUTENTICACION-QA.md §2](AUTENTICACION-QA.md#2-configurar-el-env-una-vez-por-equipo)).

### 3.1 Qué se genera

Cada ejecución crea `pruebas/<categoría>/<ID>/resultados/<AAAAMMDD>-<integrante>-<NN>/`. Si se repite el mismo día, se crea `-02`, `-03`, etc., y nunca se sobrescribe una ejecución anterior. También se crea la carpeta homónima en `evidencias/` para las capturas.

| Archivo | Herramienta | Contenido |
|---|---|---|
| `newman-results.json` | Newman (reportador `json`) | Resultado completo: solicitudes, códigos, tiempos y aserciones |
| `newman-report.html` | Newman (reportador `htmlextra`) | Reporte navegable. Se genera sin la cabecera de sesión ni la variable `sessionId` |
| `resultados.jtl` | JMeter (`-l`) | Una fila por muestra (CSV): tiempo, código, éxito |
| `reporte-html/index.html` | JMeter (`-e -o`) | Dashboard con APDEX, errores, throughput y percentiles 90/95/99 |
| `ejecucion.log` | JMeter (`-j`) | Registro de JMeter |
| `consola.log`, `consola-errores.log` | Ambas | Salida de la consola |
| `ejecucion-info.txt` | Script | Caso, integrante, inicio y fin, código de salida, versión de Metabase y comando (sin token) |

Comandos equivalentes que construye el script, como referencia (`<dir>` es la carpeta de ejecución):

```text
newman run <colección> -e %TEMP%\mbqa-<aleatorio>.json -n <iteraciones> --timeout-request 120000 -r cli,json,htmlextra
  --reporter-json-export <dir>\newman-results.json --reporter-htmlextra-export <dir>\newman-report.html
  --reporter-htmlextra-skipHeaders X-Metabase-Session --reporter-htmlextra-skipEnvironmentVars sessionId
  --reporter-htmlextra-skipSensitiveData

jmeter.bat -n -t <plan.jmx> -q %TEMP%\mbqa-<aleatorio>.properties -l <dir>\resultados.jtl -j <dir>\ejecucion.log -e -o <dir>\reporte-html

(El archivo temporal contiene baseUrl, cardId, ..., sessionId; se borra al terminar.)
```

No ejecute estos comandos a mano con un token real, salvo para depurar fuera del repositorio. Si lo hace, la redacción y el cierre de sesión quedan a su cargo.

### 3.2 Métricas de TC-REN-003 a partir de Newman

El plan exige el P95 y, como métricas descriptivas, la media, la mediana, el mínimo, el máximo y la desviación estándar:

```powershell
$f = "pruebas\rendimiento\TC-REN-003\resultados\<AAAAMMDD>-samuel-<NN>\newman-results.json"
$j = Get-Content $f -Raw -Encoding UTF8 | ConvertFrom-Json
$t = @($j.run.executions | ForEach-Object { [double]$_.response.responseTime }) | Sort-Object
$n = $t.Count; $media = ($t | Measure-Object -Average).Average
[pscustomobject]@{
  solicitudes = $n
  fallidas    = $j.run.stats.requests.failed
  p95_ms      = $t[[math]::Ceiling(0.95 * $n) - 1]          # método nearest-rank
  media_ms    = [math]::Round($media, 1)
  mediana_ms  = if ($n % 2) { $t[($n - 1) / 2] } else { ($t[$n / 2 - 1] + $t[$n / 2]) / 2 }
  min_ms      = $t[0]; max_ms = $t[-1]
  desv_ms     = [math]::Round([math]::Sqrt((($t | ForEach-Object { ($_ - $media) * ($_ - $media) }) | Measure-Object -Sum).Sum / $n), 1)
}
```

Registre en `reporte.md` el método de percentil utilizado (*nearest-rank*). JMeter calcula sus propios percentiles en `reporte-html`.

---

## 4. Antes de subir resultados a GitHub

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1
```

- Debe terminar con `[OK] No se encontraron tokens ni contrasenas.` Si muestra `[NO SUBIR]`, no suba los archivos listados: revíselos y vuelva a ejecutar el caso con el script.
- El script detecta tokens no redactados en el formato de Newman (clave y valor en líneas distintas), en la forma `sessionId=` de JMeter y en cabeceras, además de las **contraseñas exactas** de sus credenciales guardadas, que descifra en memoria sin mostrarlas. Ignora la cabecera aleatoria `Postman-Token`.
- No use búsquedas línea a línea con `Select-String`: no detectan el formato de varias líneas de Newman (comprobado el 2026-11-05).
- Si un token real llegó a GitHub, invalídelo de inmediato ([AUTENTICACION-QA.md §7](AUTENTICACION-QA.md#7-si-algo-falla)) y avise al equipo.
- Si un archivo supera unos 50 MB (por ejemplo un JTL de TC-REN-005), consúltelo antes de subirlo. GitHub rechaza archivos de más de 100 MB.
