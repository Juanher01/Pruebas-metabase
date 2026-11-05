<#
.SYNOPSIS
  Comprueba que las cuentas QA definidas en .env permiten iniciar sesion en Metabase
  y que tienen el rol esperado. Solo lectura.

.DESCRIPTION
  Para cada cuenta (admin -> QA_ADMIN_*, usuario-qa -> QA_USER_*):
    1. Inicia sesion con POST /api/session.
    2. Consulta GET /api/user/current (solo lectura): nombre y si es administradora.
    3. Cierra la sesion y verifica que el token quedo invalido.
  No muestra contrasenas ni tokens. No modifica usuarios ni permisos (Metabase
  solo actualiza la fecha de ultimo acceso de la cuenta al iniciar sesion).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\probar-cuentas.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\probar-cuentas.ps1 -Cuenta usuario-qa
#>
param(
    [ValidateSet('admin', 'usuario-qa', 'ambas')][string]$Cuenta = 'ambas',
    [string]$BaseUrl = ""
)
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\sesion-metabase.ps1"

if (-not $BaseUrl) {
    $BaseUrl = "http://localhost:3000"
    $cfg = Join-Path (Get-RaizRepositorio) "configuracion\recursos-locales.json"
    if (Test-Path $cfg) { $b = (Get-Content $cfg -Raw -Encoding UTF8 | ConvertFrom-Json).base_url; if ($b) { $BaseUrl = $b } }
}
$cuentas = if ($Cuenta -eq 'ambas') { @('admin', 'usuario-qa') } else { @($Cuenta) }
$fallos = 0

foreach ($c in $cuentas) {
    $token = $null
    try {
        $token = Open-SesionMetabase $BaseUrl (Get-CredencialQA $c)
        $yo = Invoke-RestMethod -Uri "$BaseUrl/api/user/current" -Headers @{ "X-Metabase-Session" = $token }
        $esperado = ($c -eq 'admin')
        if ([bool]$yo.is_superuser -eq $esperado) {
            Write-Host ("[OK]    {0,-10} {1} {2} | administrador: {3}" -f $c, $yo.first_name, $yo.last_name, $yo.is_superuser) -ForegroundColor Green
        } else {
            Write-Host ("[AVISO] {0,-10} {1} {2} | administrador: {3} (se esperaba {4}). Revise las variables de .env." -f $c, $yo.first_name, $yo.last_name, $yo.is_superuser, $esperado) -ForegroundColor Yellow
            $fallos++
        }
    } catch {
        Write-Host ("[FALLO] {0,-10} {1}" -f $c, $_.Exception.Message) -ForegroundColor Red
        $fallos++
    } finally {
        if ($token) {
            if (Close-SesionMetabase $BaseUrl $token) { Write-Host "        sesion de prueba cerrada (token invalido)." }
            else { Write-Host "        AVISO: no se pudo confirmar el cierre de la sesion de prueba." -ForegroundColor Yellow; $fallos++ }
        }
        $token = $null
    }
}
if ($fallos -eq 0) { exit 0 } else { exit 1 }
