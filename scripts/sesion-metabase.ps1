<#
.SYNOPSIS
  Biblioteca compartida de autenticacion QA para Metabase v0.64.1.
  Se carga con:  . "$PSScriptRoot\sesion-metabase.ps1"
  Usada por ejecutar-herramienta.ps1 (Newman, JMeter y, en el futuro, Cypress),
  obtener-ids-recursos.ps1, probar-cuentas.ps1 y revisar-secretos.ps1.

.DESCRIPTION
  Cuentas soportadas (alias) y variables del archivo .env de la raiz (no versionado):
    admin       -> QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD  (cuenta administradora)
    usuario-qa  -> QA_USER_EMAIL  / QA_USER_PASSWORD   (cuenta normal "Usuario QA")

  Reglas de lectura del .env (compatibles con Docker Compose):
    - Lineas vacias y lineas que empiezan por # se ignoran.
    - Valor entre comillas simples '...': literal (recomendado si la contrasena
      tiene espacios, $ o la secuencia " #").
    - Valor entre comillas dobles "...": se toma el contenido.
    - Valor sin comillas: se corta en " #" (espacio + #) y se quitan los espacios
      de los extremos. Un # sin espacio delante forma parte del valor.

  Mecanismo de sesion (verificado en el codigo fuente de v0.64.1):
    POST   /api/session  {username,password} -> {"id": "<uuid>"}
    Cabecera X-Metabase-Session: <uuid>
    DELETE /api/session  -> invalida el token
#>

$script:CuentasQA = [ordered]@{
    'admin'      = @{ correo = 'QA_ADMIN_EMAIL'; clave = 'QA_ADMIN_PASSWORD' }
    'usuario-qa' = @{ correo = 'QA_USER_EMAIL';  clave = 'QA_USER_PASSWORD' }
}

function Get-RaizRepositorio { Split-Path -Parent $PSScriptRoot }

function Get-RutaEnvLocal { Join-Path (Get-RaizRepositorio) ".env" }

function Read-EnvLocal {
    <# Devuelve un hashtable con las variables del .env de la raiz (vacio si no existe). #>
    $vars = @{}
    $ruta = Get-RutaEnvLocal
    if (-not (Test-Path $ruta)) { return $vars }
    foreach ($linea in [System.IO.File]::ReadAllLines($ruta)) {
        $l = $linea.Trim()
        if ($l -eq '' -or $l.StartsWith('#')) { continue }
        if ($l -match '^export\s+') { $l = $l -replace '^export\s+', '' }
        $i = $l.IndexOf('=')
        if ($i -lt 1) { continue }
        $k = $l.Substring(0, $i).Trim()
        $v = $l.Substring($i + 1).TrimStart()
        if ($v.StartsWith("'")) {
            $f = $v.IndexOf("'", 1); if ($f -gt 0) { $v = $v.Substring(1, $f - 1) } else { $v = $v.Substring(1) }
        } elseif ($v.StartsWith('"')) {
            $f = $v.IndexOf('"', 1); if ($f -gt 0) { $v = $v.Substring(1, $f - 1) } else { $v = $v.Substring(1) }
        } else {
            $m = [regex]::Match($v, '\s+#'); if ($m.Success) { $v = $v.Substring(0, $m.Index) }
            $v = $v.TrimEnd()
        }
        $vars[$k] = $v
    }
    return $vars
}

function Test-CuentaConfigurada([string]$Cuenta) {
    if (-not $script:CuentasQA.Contains($Cuenta)) { return $false }
    $e = Read-EnvLocal; $m = $script:CuentasQA[$Cuenta]
    return ([bool]$e[$m.correo] -and [bool]$e[$m.clave])
}

function Get-SecretosEnvQA {
    <# Contrasenas QA definidas en .env (para revisar-secretos.ps1). Nunca se muestran. #>
    $e = Read-EnvLocal
    return @($script:CuentasQA.Values | ForEach-Object { $e[$_.clave] } | Where-Object { $_ })
}

function Test-ExcluidoDeGit([string]$Ruta) {
    # Si el repositorio ya tiene Git, confirma que el archivo esta ignorado.
    $raiz = Get-RaizRepositorio
    if (-not (Test-Path (Join-Path $raiz ".git"))) { return $true }
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) { return $true }
    & git -C $raiz check-ignore -q -- $Ruta
    return ($LASTEXITCODE -eq 0)
}

function Get-CredencialQA([string]$Cuenta) {
    <# Devuelve un PSCredential con el correo y la contrasena de la cuenta, leidos del .env local. #>
    if (-not $script:CuentasQA.Contains($Cuenta)) { throw "Cuenta '$Cuenta' no valida. Use: $($script:CuentasQA.Keys -join ', ')" }
    $ruta = Get-RutaEnvLocal
    if (-not (Test-Path $ruta)) { throw "No existe $ruta. Copie .env.example como .env y complete las variables QA_* (ver docs\AUTENTICACION-QA.md)." }
    if (-not (Test-ExcluidoDeGit $ruta)) { throw "SEGURIDAD: .env no esta excluido de Git. Revise .gitignore antes de continuar." }
    $m = $script:CuentasQA[$Cuenta]
    $e = Read-EnvLocal
    $faltan = @(@($m.correo, $m.clave) | Where-Object { -not $e[$_] })
    if ($faltan.Count -gt 0) { throw "Complete en .env: $($faltan -join ', ') (cuenta '$Cuenta')." }
    $correo = $e[$m.correo]
    $segura = ConvertTo-SecureString $e[$m.clave] -AsPlainText -Force
    $e = $null
    return New-Object System.Management.Automation.PSCredential($correo, $segura)
}

function Open-SesionMetabase([string]$BaseUrl, [System.Management.Automation.PSCredential]$Credencial) {
    <# Devuelve el token (uuid). Nunca lo escribe en pantalla ni en disco. #>
    $plano = $Credencial.GetNetworkCredential().Password
    $cuerpo = @{ username = $Credencial.UserName; password = $plano } | ConvertTo-Json -Compress
    $plano = $null
    try {
        $r = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/session" -ContentType "application/json" -Body $cuerpo
    } catch {
        $codigo = $null
        try { $codigo = [int]$_.Exception.Response.StatusCode } catch { }
        $cuerpo = $null
        if ($codigo -eq 401 -or $codigo -eq 400) { throw "Inicio de sesion rechazado (HTTP $codigo) para '$($Credencial.UserName)'. Revise QA_ADMIN_* / QA_USER_* en .env. Varios intentos fallidos activan el bloqueo temporal de Metabase." }
        throw "No se pudo iniciar sesion en $BaseUrl (HTTP $codigo): $($_.Exception.Message)"
    }
    $cuerpo = $null
    if ($r.mfa_required) { throw "La cuenta '$($Credencial.UserName)' exige verificacion en dos pasos (MFA); la automatizacion no la admite. Use una cuenta sin MFA." }
    if (-not $r.id) { throw "La respuesta de POST /api/session no incluyo 'id'." }
    return [string]$r.id
}

function Close-SesionMetabase([string]$BaseUrl, [string]$Token) {
    <# Invalida el token y lo comprueba: tras DELETE /api/session, GET /api/user/current
       con el mismo token debe responder 401. Devuelve $true solo si ambas cosas se cumplen. #>
    if (-not $Token) { return $true }
    $h = @{ "X-Metabase-Session" = $Token }
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/api/session" -Headers $h | Out-Null } catch { return $false }
    try { Invoke-RestMethod -Uri "$BaseUrl/api/user/current" -Headers $h | Out-Null; return $false }
    catch {
        $codigo = $null
        try { $codigo = [int]$_.Exception.Response.StatusCode } catch { }
        return ($codigo -eq 401)
    }
}

function Protect-CarpetaResultados([string]$Carpeta, [string[]]$Secretos) {
    <# Reemplaza cada secreto por <SESION-REDACTADA> en todos los archivos de la carpeta.
       Devuelve @{ redactados = n; pendientes = n }. #>
    $vals = @($Secretos | Where-Object { $_ -and $_.Length -ge 6 })
    $red = 0; $pend = 0
    if ($vals.Count -eq 0 -or -not (Test-Path $Carpeta)) { return @{ redactados = 0; pendientes = 0 } }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    Get-ChildItem -Path $Carpeta -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
        $texto = [System.IO.File]::ReadAllText($_.FullName)
        $nuevo = $texto
        foreach ($s in $vals) { $nuevo = $nuevo.Replace($s, '<SESION-REDACTADA>') }
        if ($nuevo -ne $texto) { [System.IO.File]::WriteAllText($_.FullName, $nuevo, $utf8); $red++ }
        $quedan = $false
        $final = [System.IO.File]::ReadAllText($_.FullName)
        foreach ($s in $vals) { if ($final.Contains($s)) { $quedan = $true } }
        if ($quedan) { $pend++ }
    }
    return @{ redactados = $red; pendientes = $pend }
}

function New-ArchivoTemporalPrivado([string]$Extension, [string]$Contenido) {
    <# Escribe un archivo en %TEMP% del usuario (fuera del repositorio) y devuelve su ruta. #>
    $ruta = Join-Path $env:TEMP ("mbqa-{0}{1}" -f ([guid]::NewGuid().ToString('N')), $Extension)
    [System.IO.File]::WriteAllText($ruta, $Contenido, (New-Object System.Text.UTF8Encoding($false)))
    return $ruta
}
