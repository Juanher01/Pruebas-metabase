<#
.SYNOPSIS
  Revisa (solo lectura) que los archivos que se van a subir a GitHub no contengan
  tokens de sesion de Metabase ni las contrasenas de las cuentas QA.

.DESCRIPTION
  Busca en el repositorio (por defecto, todo; o las rutas indicadas en -Ruta):
    1. Valores de sesion NO redactados asociados a las claves X-Metabase-Session,
       sessionId o password dentro de un mismo objeto JSON (formato de Newman, en
       cualquier orden y en varias lineas).
    2. Las formas "sessionId=<uuid>", "-JsessionId=<uuid>" y "X-Metabase-Session: <uuid>".
    3. Las contrasenas EXACTAS definidas en .env (QA_ADMIN_PASSWORD, QA_USER_PASSWORD);
       se leen en memoria y nunca se muestran.
  Ignora la cabecera Postman-Token (identificador aleatorio de Newman, no es secreto).
  Revisa todo el repositorio excepto .env, .git, node_modules y respaldos.

  Codigo de salida: 0 = sin hallazgos; 1 = hay archivos que NO deben subirse.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1 -Ruta pruebas\contrato\TC-CON-002
#>
param([string[]]$Ruta = @('.'))

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\sesion-metabase.ps1"
$raiz = Get-RaizRepositorio

$uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
$claves = '(?:X-Metabase-Session|sessionId|password)'
$reglas = @(
    @{ n = 'clave de sesion/contrasena con valor (JSON, clave antes del valor)'; r = '"key"\s*:\s*"' + $claves + '"[^{}]*?"value"\s*:\s*"(?!<SESION-REDACTADA>)(?!\{\{)[^"]{6,}"' },
    @{ n = 'clave de sesion/contrasena con valor (JSON, valor antes de la clave)'; r = '"value"\s*:\s*"(?!<SESION-REDACTADA>)(?!\{\{)[^"]{6,}"[^{}]*?"key"\s*:\s*"' + $claves + '"' },
    @{ n = 'token en forma clave=valor o cabecera'; r = '(?:X-Metabase-Session|sessionId)"?\s*[:=]\s*"?' + $uuid },
    @{ n = 'cookie de sesion metabase.SESSION (p. ej. en mensajes de error de Cypress)'; r = 'metabase\.SESSION=' + $uuid },
    @{ n = 'campo password con valor'; r = '"password"\s*:\s*"(?!\.\.\.")(?!<)[^"]+"' }
)
$opciones = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline

# Contrasenas QA definidas en .env (solo en memoria)
$contrasenas = @(Get-SecretosEnvQA)
$numContrasenas = $contrasenas.Count
# Correos de las cuentas QA definidos en .env (solo en memoria; nunca se muestran)
$envLocal = Read-EnvLocal
$correos = @('QA_ADMIN_EMAIL', 'QA_USER_EMAIL' | ForEach-Object { $envLocal[$_] } | Where-Object { $_ })
$envLocal = $null
$utf8 = New-Object System.Text.UTF8Encoding($false)
# Los cuerpos que Newman guarda como Buffer ("data":[bytes]) se decodifican para revisarlos tambien
function Get-TextoDecodificado([string]$texto) {
    $partes = foreach ($m in [regex]::Matches($texto, '"type"\s*:\s*"Buffer"\s*,\s*"data"\s*:\s*\[([\d,\s]*)\]')) {
        $nums = @($m.Groups[1].Value -split '[,\s]+' | Where-Object { $_ -ne '' })
        if ($nums.Count) { $utf8.GetString([byte[]]@($nums | ForEach-Object { [byte]$_ })) }
    }
    return ($partes -join "`n")
}

$hallazgos = New-Object System.Collections.Generic.List[string]
$revisados = 0
foreach ($r in $Ruta) {
    $base = Join-Path $raiz $r
    if (-not (Test-Path $base)) { continue }
    Get-ChildItem $base -Recurse | Where-Object { -not $_.PSIsContainer -and $_.Length -lt 200MB } | ForEach-Object {
        $f = $_.FullName
        if ($_.Name -eq '.env' -or $f -match '\\(\.git|node_modules|respaldos)\\') { return }
        $revisados++
        $texto = [System.IO.File]::ReadAllText($f)
        if ($_.Extension -eq '.json' -and $texto.Contains('"Buffer"')) { $texto = $texto + "`n" + (Get-TextoDecodificado $texto) }
        $rel = $f.Substring($raiz.Length + 1)
        foreach ($c in $correos) { if ($texto.Contains($c)) { $hallazgos.Add("$rel -> contiene el correo de una cuenta QA definida en .env"); break } }
        foreach ($regla in $reglas) {
            if ([regex]::IsMatch($texto, $regla.r, $opciones)) { $hallazgos.Add("$rel -> $($regla.n)"); break }
        }
        foreach ($p in $contrasenas) { if ($texto.Contains($p)) { $hallazgos.Add("$rel -> contiene una contrasena QA definida en .env"); break } }
    }
}
$contrasenas = $null
$numCorreos = $correos.Count
$correos = $null

Write-Host ("Archivos revisados: {0} | contrasenas de .env comparadas: {1} | correos de .env comparados: {2}" -f $revisados, $numContrasenas, $numCorreos)
if ($hallazgos.Count -eq 0) { Write-Host "[OK] No se encontraron tokens ni contrasenas." -ForegroundColor Green; exit 0 }
Write-Host "[NO SUBIR] Archivos con posibles secretos:" -ForegroundColor Red
$hallazgos | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
Write-Host "Revise cada archivo. Si contiene un token real, ejecute de nuevo el caso con scripts\ejecutar-herramienta.ps1 y elimine la carpeta de ejecucion afectada (no subida)."
exit 1
