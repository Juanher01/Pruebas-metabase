<#
.SYNOPSIS
  Ejecuta el script Newman o JMeter de UN caso de prueba guardando los resultados
  nativos en pruebas/<categoria>/<ID>/resultados/<AAAAMMDD>-<integrante>-<NN>/
  sin exponer credenciales ni tokens.

.DESCRIPTION
  1. Localiza el script del caso:
       newman -> pruebas/<cat>/<ID>/scripts/<ID>.postman_collection.json
       jmeter -> pruebas/<cat>/<ID>/scripts/<ID>.jmx
  2. Lee los IDs LOCALES de configuracion/recursos-locales.json (nunca IDs fijos).
  3. Si no se indica -SinSesion: lee el correo y la contrasena de la cuenta (-Cuenta)
     del archivo .env local (QA_ADMIN_* o QA_USER_*) e inicia sesion con
     POST /api/session. La contrasena nunca llega a Newman ni a JMeter.
  4. Crea una carpeta de ejecucion nueva (nunca reutiliza ni sobrescribe otra).
  5. Entrega las variables y el token mediante un ARCHIVO TEMPORAL en %TEMP%
     (Newman: -e entorno.json / JMeter: -q propiedades), nunca en la linea de comandos.
  6. Al terminar (tambien si hay error): borra el archivo temporal, cierra la sesion
     (DELETE /api/session, el token deja de ser valido) y reemplaza el token por
     <SESION-REDACTADA> en todos los archivos generados.

  Variables: baseUrl, cardId, cardIdConteo, dashboardId, dashboardPrivadoId,
  collectionId, databaseId, dashboardIdInexistente y, si hay sesion, sessionId.
  Autenticacion compartida: scripts\sesion-metabase.ps1.

.EXAMPLE
  .\scripts\ejecutar-herramienta.ps1 -Caso TC-CON-002 -Herramienta newman -Integrante samuel
  .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-003 -Herramienta newman -Integrante samuel -Iteraciones 30
  .\scripts\ejecutar-herramienta.ps1 -Caso TC-ERR-005 -Herramienta newman -Integrante samuel -SinSesion
  .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-004 -Herramienta jmeter -Integrante samuel -JMeter "C:\herramientas\apache-jmeter-5.6.3\bin\jmeter.bat"
  .\scripts\ejecutar-herramienta.ps1 -Caso TC-FUN-009 -Herramienta newman -Integrante juan -Cuenta admin -SoloMostrar
#>
param(
    [Parameter(Mandatory = $true)][ValidatePattern('^TC-(FUN|VAL|ERR|CON|REN)-\d{3}$')][string]$Caso,
    [Parameter(Mandatory = $true)][ValidateSet('newman', 'jmeter', 'navegador')][string]$Herramienta,
    [Parameter(Mandatory = $true)][ValidateSet('juan', 'samuel')][string]$Integrante,
    [ValidateSet('admin', 'usuario-qa')][string]$Cuenta = 'admin',
    [int]$Iteraciones = 1,
    [switch]$SinSesion,
    [switch]$SinCuerpos,
    [string]$JMeter = "jmeter.bat",
    [string]$Config = "",
    [switch]$SoloMostrar
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\sesion-metabase.ps1"
$raiz = Get-RaizRepositorio
$categorias = @{ FUN = "funcionales"; VAL = "validacion"; ERR = "errores"; CON = "contrato"; REN = "rendimiento" }
$dirCaso = Join-Path $raiz ("pruebas\{0}\{1}" -f $categorias[$Caso.Split('-')[1]], $Caso)
if (-not (Test-Path $dirCaso)) { throw "No existe la carpeta del caso: $dirCaso" }

if ($Herramienta -eq 'newman') { $script = Join-Path $dirCaso "scripts\$Caso.postman_collection.json" }
elseif ($Herramienta -eq 'navegador') { $script = Join-Path $dirCaso "scripts\$Caso.navegador.js" }
else { $script = Join-Path $dirCaso "scripts\$Caso.jmx" }
if (-not (Test-Path $script)) {
    if ($SoloMostrar) { Write-Host "[AVISO] Todavia no existe el script: $script" -ForegroundColor Yellow }
    else { throw "No existe el script del caso: $script" }
}

# ---------- Configuracion local (IDs de ESTA instalacion) ----------
if (-not $Config) { $Config = Join-Path $raiz "configuracion\recursos-locales.json" }
$vars = [ordered]@{ baseUrl = "http://localhost:3000" }
if (Test-Path $Config) {
    $c = Get-Content $Config -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($c.base_url) { $vars.baseUrl = $c.base_url }
    $vars.cardId                 = $c.preguntas.pedidos_subtotal_mayor_100
    $vars.cardIdConteo           = $c.preguntas.conteo_pedidos
    $vars.dashboardId            = $c.dashboard_principal_id
    $vars.dashboardPrivadoId     = $c.recursos_restringidos.dashboard_privado_id
    $vars.collectionId           = $c.coleccion_qa_id
    $vars.databaseId             = $c.sample_database_id
    $vars.dashboardIdInexistente = $c.ids_inexistentes_verificados.dashboard_id_inexistente
} elseif ($SoloMostrar) {
    Write-Host "[AVISO] No existe $Config. Generelo con scripts\obtener-ids-recursos.ps1 -Guardar" -ForegroundColor Yellow
} else {
    throw "No existe $Config. Generelo primero con: .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante <nombre>"
}
$varsPresentes = [ordered]@{}
foreach ($k in $vars.Keys) { if ($null -ne $vars[$k] -and "$($vars[$k])" -ne "") { $varsPresentes[$k] = "$($vars[$k])" } }

# ---------- Carpeta de ejecucion nueva (se crea despues del inicio de sesion) ----------
$fecha = Get-Date -Format "yyyyMMdd"
$n = 1
do {
    $idEjec = "{0}-{1}-{2:D2}" -f $fecha, $Integrante, $n
    $dirRes = Join-Path $dirCaso "resultados\$idEjec"
    $dirEvi = Join-Path $dirCaso "evidencias\$idEjec"
    $n++
} while ((Test-Path $dirRes) -or (Test-Path $dirEvi))

function Comillas([string]$a) { if ($a -match '[\s"]') { '"' + ($a -replace '"', '\"') + '"' } else { $a } }

function Construir-Argumentos([string]$archivoVariables) {
    # Ningun valor de variable ni token va en la linea de comandos: solo la ruta del archivo temporal.
    $lista = New-Object System.Collections.Generic.List[string]
    if ($Herramienta -eq 'newman') {
        $lista.AddRange([string[]]@('run', $script, '-e', $archivoVariables, '-n', "$Iteraciones", '--timeout-request', '120000',
            '-r', 'cli,json,htmlextra',
            '--reporter-json-export', (Join-Path $dirRes 'newman-results.json'),
            '--reporter-htmlextra-export', (Join-Path $dirRes 'newman-report.html'),
            '--reporter-htmlextra-title', $Caso,
            '--reporter-htmlextra-skipHeaders', 'X-Metabase-Session',
            '--reporter-htmlextra-skipEnvironmentVars', 'sessionId',
            '--reporter-htmlextra-skipSensitiveData'))
    } elseif ($Herramienta -eq 'navegador') {
        # Script de Node: <script> <archivo de variables> <carpeta de resultados> <carpeta de evidencias>
        $lista.AddRange([string[]]@($script, $archivoVariables, $dirRes, $dirEvi))
    } else {
        $lista.AddRange([string[]]@('-n', '-t', $script, '-q', $archivoVariables,
            '-l', (Join-Path $dirRes 'resultados.jtl'),
            '-j', (Join-Path $dirRes 'ejecucion.log'),
            '-e', '-o', (Join-Path $dirRes 'reporte-html')))
    }
    return ,$lista
}

function Contenido-Variables([string]$token) {
    $todas = [ordered]@{}
    foreach ($k in $varsPresentes.Keys) { $todas[$k] = $varsPresentes[$k] }
    if ($token) { $todas['sessionId'] = $token }
    if ($Herramienta -eq 'newman') {
        $valores = @($todas.Keys | ForEach-Object { [ordered]@{ key = $_; value = $todas[$_]; type = 'default'; enabled = $true } })
        return ([ordered]@{ name = "mbqa-temporal"; values = $valores; _postman_variable_scope = "environment" } | ConvertTo-Json -Depth 5)
    }
    if ($Herramienta -eq 'navegador') { return ($todas | ConvertTo-Json -Depth 3) }
    # Propiedades de JMeter (formato .properties: escapar \ y :)
    return (($todas.Keys | ForEach-Object { "{0}={1}" -f $_, ($todas[$_] -replace '\\', '\\' -replace ':', '\:') }) -join "`r`n")
}

$extTemporal = if ($Herramienta -in @('newman', 'navegador')) { '.json' } else { '.properties' }

if ($SoloMostrar) {
    $args0 = Construir-Argumentos "%TEMP%\mbqa-<aleatorio>$extTemporal"
    Write-Host "Caso:                 $Caso ($Herramienta)"
    Write-Host "Cuenta:               $(if ($SinSesion) { 'ninguna (-SinSesion)' } else { "$Cuenta (variables en .env completas: $(Test-CuentaConfigurada $Cuenta))" })"
    Write-Host "Carpeta de ejecucion: $idEjec (no se crea en modo -SoloMostrar)"
    Write-Host "Variables locales:    $(($varsPresentes.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ')$(if (-not $SinSesion) { ', sessionId=<token>' })"
    Write-Host "Archivo temporal:     variables y token en %TEMP% (se borra al terminar)"
    Write-Host "Comando:              $(if ($Herramienta -eq 'newman') { 'newman' } else { $JMeter }) $(($args0 | ForEach-Object { Comillas $_ }) -join ' ')"
    exit 0
}

# ---------- Ejecutable ----------
if ($Herramienta -eq 'newman') {
    $exe = (Get-Command newman.cmd -ErrorAction SilentlyContinue).Source
    if (-not $exe) { throw "No se encontro newman. Instale con: npm install -g newman newman-reporter-htmlextra" }
} elseif ($Herramienta -eq 'navegador') {
    $exe = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
    if (-not $exe) { throw "No se encontro node. Instale Node.js LTS (ver docs/HERRAMIENTAS-NEWMAN-JMETER.md)." }
    if (-not (Test-Path (Join-Path $raiz 'recursos-compartidos\navegador\node_modules\puppeteer-core'))) {
        throw "Faltan las dependencias del navegador. Ejecute: cd recursos-compartidos\navegador; npm install"
    }
} else {
    $cmd = Get-Command $JMeter -ErrorAction SilentlyContinue
    if (-not $cmd) { throw "No se encontro JMeter ('$JMeter'). Indique la ruta con -JMeter C:\...\bin\jmeter.bat" }
    $exe = $cmd.Source
}

$token = $null
$temporal = $null
$codigo = 1
try {
    if (-not $SinSesion) {
        $cred = Get-CredencialQA $Cuenta
        $token = Open-SesionMetabase $vars.baseUrl $cred
        $cred = $null
        Write-Host "Sesion iniciada con la cuenta '$Cuenta' (el token no se muestra)."
    }

    New-Item -ItemType Directory -Path $dirRes -Force | Out-Null
    New-Item -ItemType Directory -Path $dirEvi -Force | Out-Null
    New-Item -ItemType File -Path (Join-Path $dirEvi ".gitkeep") -Force | Out-Null

    $temporal = New-ArchivoTemporalPrivado $extTemporal (Contenido-Variables $token)
    $argumentos = Construir-Argumentos $temporal
    $linea = ($argumentos | ForEach-Object { Comillas $_ }) -join ' '
    $inicio = Get-Date
    $p = Start-Process -FilePath $exe -ArgumentList $linea -NoNewWindow -Wait -PassThru `
        -RedirectStandardOutput (Join-Path $dirRes 'consola.log') -RedirectStandardError (Join-Path $dirRes 'consola-errores.log')
    $codigo = $p.ExitCode
    $fin = Get-Date

    # Newman guarda el cuerpo completo de cada respuesta: con respuestas grandes el JSON supera el limite de GitHub.
    $notaCuerpos = $null
    if ($SinCuerpos -and $Herramienta -eq 'newman') {
        $salidaRecorte = & node (Join-Path $PSScriptRoot 'recortar-cuerpos-newman.js') (Join-Path $dirRes 'newman-results.json')
        Write-Host $salidaRecorte
        $notaCuerpos = "cuerpos_respuesta=omitidos en newman-results.json (-SinCuerpos): $salidaRecorte"
    }

    $version = "desconocida"
    try { $version = (Invoke-RestMethod -Uri "$($vars.baseUrl)/api/session/properties").version.tag } catch { }
    @(
        "caso=$Caso", "herramienta=$Herramienta", "integrante=$Integrante", "ejecucion=$idEjec",
        "cuenta=$(if ($SinSesion) { 'ninguna (-SinSesion)' } else { $Cuenta })",
        "inicio=$($inicio.ToString('yyyy-MM-dd HH:mm:ss'))", "fin=$($fin.ToString('yyyy-MM-dd HH:mm:ss'))",
        "codigo_salida=$codigo", "version_metabase=$version", "equipo=$env:COMPUTERNAME",
        "variables=$(($varsPresentes.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', ')",
        "comando=$(Split-Path $exe -Leaf) $($linea.Replace($temporal, '<archivo-temporal>'))"
    ) | Out-File -FilePath (Join-Path $dirRes 'ejecucion-info.txt') -Encoding utf8
    if ($notaCuerpos) { Add-Content -Path (Join-Path $dirRes 'ejecucion-info.txt') -Value $notaCuerpos -Encoding utf8 }
}
finally {
    if ($temporal -and (Test-Path $temporal)) { Remove-Item $temporal -Force -ErrorAction SilentlyContinue }
    if ($token) {
        if (Close-SesionMetabase $vars.baseUrl $token) { Write-Host "Sesion cerrada: el token ya no es valido." }
        else { Write-Host "AVISO: no se pudo cerrar la sesion. Ver docs\AUTENTICACION-QA.md (seccion 'Si algo falla')." -ForegroundColor Yellow }
        $r = Protect-CarpetaResultados $dirRes @($token)
        Write-Host ("Token redactado en {0} archivo(s); archivos que aun lo contienen: {1}" -f $r.redactados, $r.pendientes)
        $token = $null
    }
}

Write-Host ("Resultados en: {0}" -f $dirRes)
Write-Host ("Evidencias (capturas) en: {0}" -f $dirEvi)
Write-Host ("Codigo de salida de {0}: {1}" -f $Herramienta, $codigo)
exit $codigo
