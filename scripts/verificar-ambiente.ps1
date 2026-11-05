<#
.SYNOPSIS
  Verifica (solo lectura) que Docker y Metabase esten disponibles para las pruebas.

.DESCRIPTION
  No crea, inicia, detiene ni modifica contenedores o volumenes.
  Comprueba:
    1. Docker CLI y Docker Engine responden.
    2. El contenedor existe, esta en ejecucion y usa la imagen esperada.
    3. El volumen persistente esta montado en /metabase-data.
    4. GET /api/health responde HTTP 200 con {"status":"ok"}.
    5. La version informada por GET /api/session/properties (sin autenticacion).

.PARAMETER Contenedor
  Nombre del contenedor. Por defecto: metabase-qa

.PARAMETER BaseUrl
  URL base de Metabase. Por defecto: http://localhost:3000

.PARAMETER GuardarEvidencia
  Si se indica, guarda la salida en reportes-generales/evidencias-ambiente/verificacion-ambiente-<fecha>.txt

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1 -GuardarEvidencia
#>
param(
    [string]$Contenedor = "metabase-qa",
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ImagenEsperada = "metabase/metabase:v0.64.1",
    [switch]$GuardarEvidencia
)

$ErrorActionPreference = "Continue"
$lineas = New-Object System.Collections.Generic.List[string]
$fallos = 0

function Escribir([string]$estado, [string]$mensaje) {
    $texto = "[{0}] {1}" -f $estado, $mensaje
    $lineas.Add($texto)
    switch ($estado) {
        "OK"    { Write-Host $texto -ForegroundColor Green }
        "FALLO" { Write-Host $texto -ForegroundColor Red }
        "AVISO" { Write-Host $texto -ForegroundColor Yellow }
        default { Write-Host $texto }
    }
}

Escribir "INFO" ("Verificacion de ambiente - {0} - equipo {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $env:COMPUTERNAME)

# 1. Docker
$cli = Get-Command docker -ErrorAction SilentlyContinue
if (-not $cli) {
    Escribir "FALLO" "No se encontro el comando 'docker'. Instale o abra Docker Desktop."
    $fallos++
} else {
    $server = (docker version --format "{{.Server.Version}}" 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $server) {
        Escribir "FALLO" "Docker Engine no responde. Abra Docker Desktop y espere a que indique 'Engine running'."
        $fallos++
    } else {
        Escribir "OK" ("Docker Engine responde (version del servidor {0})" -f $server)
    }
}

# 2 y 3. Contenedor y volumen
if ($fallos -eq 0) {
    $formato = "{{.State.Status}}|{{.Config.Image}}|{{.RestartCount}}|{{.State.OOMKilled}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}sin-healthcheck{{end}}"
    $info = (docker inspect --format $formato $Contenedor 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $info) {
        Escribir "FALLO" ("No existe el contenedor '{0}'. Revise docs/INSTALACION-SAMUEL.md." -f $Contenedor)
        $fallos++
    } else {
        $p = $info.Split("|")
        if ($p[0] -eq "running") { Escribir "OK" "Contenedor en ejecucion" }
        else { Escribir "FALLO" ("Contenedor en estado '{0}'. Inicielo (ver docs/CONFIGURACION-QA.md)." -f $p[0]); $fallos++ }

        if ($p[1] -eq $ImagenEsperada) { Escribir "OK" ("Imagen {0}" -f $p[1]) }
        else { Escribir "FALLO" ("Imagen '{0}' distinta de la esperada '{1}'" -f $p[1], $ImagenEsperada); $fallos++ }

        Escribir "INFO" ("Reinicios: {0} | OOMKilled: {1} | Salud Docker: {2}" -f $p[2], $p[3], $p[4])
        if ($p[3] -eq "true") { Escribir "AVISO" "El contenedor fue terminado por falta de memoria en algun momento." }

        $montajes = (docker inspect --format "{{range .Mounts}}{{.Type}}:{{.Name}}->{{.Destination}};{{end}}" $Contenedor 2>$null)
        if ($montajes -match "->/metabase-data;") { Escribir "OK" ("Persistencia montada: {0}" -f $montajes.TrimEnd(';')) }
        else { Escribir "FALLO" ("No se encontro un volumen montado en /metabase-data ({0})" -f $montajes); $fallos++ }

        $envs = (docker inspect --format "{{range .Config.Env}}{{println .}}{{end}}" $Contenedor 2>$null) | Where-Object { $_ -like "MB_DB_FILE=*" }
        if ($envs) { Escribir "OK" $envs } else { Escribir "AVISO" "MB_DB_FILE no esta definido en el contenedor." }
    }
}

# 4. /api/health
try {
    $r = Invoke-WebRequest -Uri ("{0}/api/health" -f $BaseUrl) -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -eq 200 -and $r.Content -match '"status"\s*:\s*"ok"') {
        Escribir "OK" ("GET /api/health -> HTTP {0} {1}" -f $r.StatusCode, $r.Content)
    } else {
        Escribir "FALLO" ("GET /api/health -> HTTP {0} {1}" -f $r.StatusCode, $r.Content); $fallos++
    }
} catch {
    Escribir "FALLO" ("GET /api/health no respondio: {0}. Si acaba de iniciar, espere 1-3 minutos." -f $_.Exception.Message)
    $fallos++
}

# 5. Version (endpoint publico)
try {
    $props = Invoke-RestMethod -Uri ("{0}/api/session/properties" -f $BaseUrl) -TimeoutSec 15
    if ($props.version -and $props.version.tag) { Escribir "OK" ("Version informada por Metabase: {0}" -f $props.version.tag) }
    else { Escribir "AVISO" "No se pudo leer version.tag de /api/session/properties" }
} catch {
    Escribir "AVISO" ("No se pudo consultar /api/session/properties: {0}" -f $_.Exception.Message)
}

if ($fallos -eq 0) { Escribir "OK" "RESULTADO: ambiente disponible." }
else { Escribir "FALLO" ("RESULTADO: {0} comprobacion(es) fallida(s). Consulte docs/SOLUCION-PROBLEMAS.md" -f $fallos) }

if ($GuardarEvidencia) {
    $raiz = Split-Path -Parent $PSScriptRoot
    $dir = Join-Path $raiz "reportes-generales\evidencias-ambiente"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    $archivo = Join-Path $dir ("verificacion-ambiente-{0}-{1}.txt" -f $env:COMPUTERNAME, (Get-Date -Format "yyyyMMdd-HHmmss"))
    $lineas | Out-File -FilePath $archivo -Encoding utf8
    Write-Host ("Evidencia guardada en {0}" -f $archivo)
}

if ($fallos -eq 0) { exit 0 } else { exit 1 }
