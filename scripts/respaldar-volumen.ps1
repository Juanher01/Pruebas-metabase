<#
.SYNOPSIS
  Crea una copia de seguridad (tar.gz) del volumen de datos de Metabase, sin modificarlo.

.DESCRIPTION
  - Monta el volumen en modo SOLO LECTURA (:ro) dentro de un contenedor temporal
    (--rm) de la misma imagen de Metabase (no descarga imagenes adicionales).
  - El contenedor temporal no publica puertos ni usa red.
  - Por coherencia del archivo H2, el contenedor de Metabase debe estar DETENIDO.
    El script NO lo detiene: si esta en ejecucion, se cancela e indica como hacerlo.
  - El respaldo queda en la carpeta respaldos/ del repositorio (excluida de Git).

.EXAMPLE
  docker stop metabase-qa          (o: docker compose stop)
  powershell -ExecutionPolicy Bypass -File .\scripts\respaldar-volumen.ps1
  docker start metabase-qa         (o: docker compose start)
#>
param(
    [string]$Contenedor = "metabase-qa",
    [string]$Volumen = "metabase-qa-data",
    [string]$Imagen = "metabase/metabase:v0.64.1"
)

$estado = (docker inspect --format "{{.State.Status}}" $Contenedor 2>$null)
if ($LASTEXITCODE -eq 0 -and $estado -eq "running") {
    Write-Host ("El contenedor '{0}' esta en ejecucion. Detengalo primero con:  docker stop {0}" -f $Contenedor) -ForegroundColor Yellow
    Write-Host "Luego ejecute de nuevo este script y, al terminar:  docker start $Contenedor"
    exit 1
}

docker volume inspect $Volumen *> $null
if ($LASTEXITCODE -ne 0) { Write-Host ("No existe el volumen '{0}'." -f $Volumen) -ForegroundColor Red; exit 1 }

$raiz = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $raiz "respaldos"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$nombre = "{0}-{1}.tar.gz" -f $Volumen, (Get-Date -Format "yyyyMMdd-HHmmss")

docker run --rm --network none --entrypoint tar `
    -v "${Volumen}:/origen:ro" `
    -v "${dir}:/respaldo" `
    $Imagen czf "/respaldo/$nombre" -C /origen .

if ($LASTEXITCODE -eq 0) {
    $ruta = Join-Path $dir $nombre
    Write-Host ("Respaldo creado: {0} ({1:N1} MB)" -f $ruta, ((Get-Item $ruta).Length / 1MB)) -ForegroundColor Green
    Write-Host "Copie este archivo a una ubicacion segura fuera del repositorio. No lo suba a GitHub."
} else {
    Write-Host "No se pudo crear el respaldo." -ForegroundColor Red
    exit 1
}
