<#
.SYNOPSIS
  Calcula las metricas de rendimiento de una ejecucion de TC-REN y las guarda en
  resultados\<ejecucion>\metricas.json.

.DESCRIPTION
  - TC-REN-001 / 004 / 005 (JMeter): lee resultados.jtl.
  - TC-REN-003 (Newman): lee newman-results.json.
  - TC-REN-002 (navegador): lee mediciones.json.
  Metricas: solicitudes, fallidas, minimo, maximo, media, mediana, desviacion estandar (poblacional),
  P90/P95/P99 (metodo nearest-rank), duracion, throughput (req/s = solicitudes / (fin - inicio),
  igual que JMeter) y la distribucion de codigos HTTP. Solo lee; no usa credenciales ni sesion.

.PARAMETER Etiqueta
  Para TC-REN-001: etiqueta de la solicitud que se mide (por defecto 'Medicion').

.EXAMPLE
  .\scripts\calcular-metricas-rendimiento.ps1 -Caso TC-REN-004 -Ejecucion 20261105-samuel-01
#>
param(
    [Parameter(Mandatory = $true)][ValidatePattern('^TC-REN-00[1-5]$')][string]$Caso,
    [Parameter(Mandatory = $true)][string]$Ejecucion,
    [string]$Etiqueta = ''
)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $raiz "pruebas\rendimiento\$Caso\resultados\$Ejecucion"
if (-not (Test-Path $dir)) { throw "No existe $dir" }

function Percentil([double[]]$ordenado, [double]$p) { $n = $ordenado.Count; return $ordenado[[math]::Ceiling($p * $n) - 1] }

$tiempos = @(); $codigos = @{}; $fallidas = 0; $inicioMs = $null; $finMs = $null; $fuente = ''
if (Test-Path (Join-Path $dir 'resultados.jtl')) {
    $fuente = 'resultados.jtl (JMeter)'
    $filas = Import-Csv (Join-Path $dir 'resultados.jtl')
    if ($Caso -eq 'TC-REN-001') { if (-not $Etiqueta) { $Etiqueta = 'Medicion' }; $filas = @($filas | Where-Object { $_.label -eq $Etiqueta }) }
    foreach ($f in $filas) {
        $tiempos += [double]$f.elapsed
        if ($f.success -ne 'true') { $fallidas++ }
        $codigos[$f.responseCode] = 1 + [int]$codigos[$f.responseCode]
        $ini = [double]$f.timeStamp; $fin = $ini + [double]$f.elapsed
        if ($null -eq $inicioMs -or $ini -lt $inicioMs) { $inicioMs = $ini }
        if ($null -eq $finMs -or $fin -gt $finMs) { $finMs = $fin }
    }
} elseif (Test-Path (Join-Path $dir 'newman-results.json')) {
    $fuente = 'newman-results.json (Newman)'
    $j = Get-Content (Join-Path $dir 'newman-results.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($e in $j.run.executions) {
        $tiempos += [double]$e.response.responseTime
        $c = [string]$e.response.code; $codigos[$c] = 1 + [int]$codigos[$c]
        if ($e.response.code -lt 200 -or $e.response.code -gt 299) { $fallidas++ }
    }
    $fallidas += [int]$j.run.stats.requests.failed
    $inicioMs = [double]$j.run.timings.started; $finMs = [double]$j.run.timings.completed
} elseif (Test-Path (Join-Path $dir 'mediciones.json')) {
    $fuente = 'mediciones.json (navegador)'
    $m = Get-Content (Join-Path $dir 'mediciones.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($c in $m.cargas) { $tiempos += [double]$c.tiempo_ms; if (-not $c.completa) { $fallidas++ } }
} else { throw "No se encontro resultados.jtl, newman-results.json ni mediciones.json en $dir" }

if ($tiempos.Count -eq 0) { throw "No hay muestras para calcular." }
$orden = [double[]]($tiempos | Sort-Object)
$n = $orden.Count
$media = ($orden | Measure-Object -Average).Average
$varianza = (($orden | ForEach-Object { ($_ - $media) * ($_ - $media) }) | Measure-Object -Sum).Sum / $n
$mediana = if ($n % 2) { $orden[($n - 1) / 2] } else { ($orden[$n / 2 - 1] + $orden[$n / 2]) / 2 }
$dur = if ($null -ne $inicioMs -and $finMs -gt $inicioMs) { ($finMs - $inicioMs) / 1000 } else { $null }
$res = [ordered]@{
    caso = $Caso; ejecucion = $Ejecucion; fuente = $fuente; metodo_percentil = 'nearest-rank'
    solicitudes = $n; fallidas = $fallidas; tasa_error_pct = [math]::Round(100.0 * $fallidas / $n, 2)
    min_ms = $orden[0]; max_ms = $orden[-1]; media_ms = [math]::Round($media, 1); mediana_ms = $mediana
    desv_estandar_ms = [math]::Round([math]::Sqrt($varianza), 1)
    p90_ms = (Percentil $orden 0.90); p95_ms = (Percentil $orden 0.95); p99_ms = (Percentil $orden 0.99)
    duracion_s = if ($dur) { [math]::Round($dur, 2) } else { $null }
    throughput_req_s = if ($dur) { [math]::Round($n / $dur, 3) } else { $null }
    codigos_http = $codigos
}
$json = $res | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText((Join-Path $dir 'metricas.json'), $json, (New-Object System.Text.UTF8Encoding($false)))
$json
