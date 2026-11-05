<#
.SYNOPSIS
  Consulta (solo lectura) los recursos de referencia "QA - ..." de la instalacion
  local de Metabase y muestra sus IDs. Opcionalmente los guarda en
  configuracion/recursos-locales.json (archivo NO versionado).

.DESCRIPTION
  - Usa la cuenta 'admin' definida en .env (QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD).
    No guarda ni muestra la contrasena ni el token.
  - Muestra la instancia, la version y el usuario conectados (GET /api/user/current).
  - Usa solo endpoints verificados en v0.64.1:
      POST   /api/session            (iniciar sesion)
      GET    /api/user/current
      GET    /api/database?include=tables
      GET    /api/collection
      GET    /api/card
      GET    /api/dashboard           (marcado como deprecated en v0.64.1, pero disponible)
      DELETE /api/session            (cerrar la sesion creada por el script)
  - No crea, modifica, mueve ni elimina recursos de Metabase.
  - No da por aprobado ningun caso de prueba.
  - Recursos OBLIGATORIOS: Sample Database, QA - Metabase, QA - Dashboard Principal
    y las 5 preguntas. Recursos OPCIONALES (preparacion de Samuel): QA - Restringida
    y QA - Dashboard Restringido; si faltan solo se informa.
  - Con -Guardar, el archivo se escribe SOLO si todos los obligatorios se encontraron
    una sola vez. Si no, se conserva intacta la configuracion existente. Se mantiene
    el valor verificado a mano de ids_inexistentes_verificados y se deja una copia
    del archivo anterior en recursos-locales.json.bak.

  Nota PowerShell 5.1: Invoke-RestMethod emite un arreglo JSON como UN solo objeto;
  por eso las listas se asignan a una variable antes de enumerarlas (Get-ListaApi).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "Samuel"
#>
param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Integrante = "",
    [switch]$Guardar
)

$ErrorActionPreference = "Stop"

# Nombres de recursos de preparacion (deben coincidir con docs/DATOS-Y-RECURSOS-PRUEBA.md).
# Las tildes se escriben con [char] para que el archivo siga siendo ASCII.
$nombreColeccion        = "QA - Metabase"
$nombreColeccionRestr   = "QA - Restringida"
$nombreDashboard        = "QA - Dashboard Principal"
$nombreDashboardRestr   = "QA - Dashboard Restringido"
$preguntas = [ordered]@{
    "pedidos_subtotal_mayor_100"    = "QA - Pedidos con subtotal mayor a 100"
    "conteo_pedidos"                = "QA - Conteo de pedidos"
    "productos_por_categoria"       = ("QA - Productos por categor" + [char]0x00ED + "a")
    "precio_promedio_por_categoria" = ("QA - Precio promedio por categor" + [char]0x00ED + "a")
    "detalle_productos"             = "QA - Detalle de productos"
}

$script:problemasObligatorios = 0

function Get-ListaApi([string]$Ruta) {
    # Asignar primero: en PS 5.1 @(Invoke-RestMethod ...) produce una lista con UN elemento (el arreglo completo).
    $r = Invoke-RestMethod -Uri "$BaseUrl$Ruta" -Headers $headers
    if ($null -eq $r) { return ,@() }
    if (-not ($r -is [array]) -and $r.PSObject.Properties['data']) { $r = $r.data }
    return ,@($r)
}

function Buscar($lista, [string]$nombre, [string]$tipo, [switch]$Opcional) {
    $coinc = @($lista | Where-Object { $_.name -ceq $nombre -and $_.archived -ne $true })
    if ($coinc.Count -eq 1) {
        Write-Host ("[OK]        {0} '{1}' -> id {2}" -f $tipo, $nombre, $coinc[0].id) -ForegroundColor Green
        return $coinc[0].id
    }
    if ($coinc.Count -gt 1) {
        Write-Host ("[DUPLICADO] {0} '{1}' aparece {2} veces: IDs {3}. Deje solo uno (envie el sobrante a la papelera)." -f $tipo, $nombre, $coinc.Count, (($coinc | ForEach-Object { $_.id }) -join ", ")) -ForegroundColor Red
        if (-not $Opcional) { $script:problemasObligatorios++ }
        return $null
    }
    if ($Opcional) {
        Write-Host ("[OPCIONAL]  {0} '{1}' no existe en esta instalacion (recurso de la preparacion de Samuel; no es un error)." -f $tipo, $nombre) -ForegroundColor DarkGray
    } else {
        Write-Host ("[FALTA]     {0} '{1}' no existe (o no es visible para este usuario)" -f $tipo, $nombre) -ForegroundColor Yellow
        $script:problemasObligatorios++
    }
    return $null
}

# Autenticacion compartida: cuenta 'admin' del archivo .env (QA_ADMIN_EMAIL / QA_ADMIN_PASSWORD).
. "$PSScriptRoot\sesion-metabase.ps1"

$headers = $null
$token = $null
$codigoSalida = 0
try {
    $token = Open-SesionMetabase $BaseUrl (Get-CredencialQA 'admin')
    $headers = @{ "X-Metabase-Session" = $token }

    # Instancia y usuario conectados
    $version = $null
    try { $version = (Invoke-RestMethod -Uri "$BaseUrl/api/session/properties").version.tag } catch { }
    $yo = Invoke-RestMethod -Uri "$BaseUrl/api/user/current" -Headers $headers
    Write-Host ("[INFO]      Instancia {0} | version {1} | usuario {2} {3} | administrador: {4}" -f $BaseUrl, $version, $yo.first_name, $yo.last_name, $yo.is_superuser)
    if (-not $yo.is_superuser) { Write-Host "[AVISO]     La cuenta de QA_ADMIN_* no es administradora: puede no ver todos los recursos." -ForegroundColor Yellow }

    # Base de datos de ejemplo y tablas
    $dbs = Get-ListaApi "/api/database?include=tables"
    $sample = @($dbs | Where-Object { $_.is_sample -eq $true -or $_.name -eq "Sample Database" }) | Select-Object -First 1
    $sampleId = $null
    if ($sample) {
        $sampleId = $sample.id
        Write-Host ("[OK]        Base de datos '{0}' -> id {1}" -f $sample.name, $sample.id) -ForegroundColor Green
        $tablas = @($sample.tables | Where-Object { $_.visibility_type -eq $null } | ForEach-Object { $_.name }) | Sort-Object
        Write-Host ("            Tablas visibles: {0}" -f ($tablas -join ", "))
        foreach ($t in @("ORDERS", "PRODUCTS", "PEOPLE", "REVIEWS")) {
            if ($tablas -notcontains $t) { Write-Host ("[FALTA]     Tabla {0} no aparece en Sample Database" -f $t) -ForegroundColor Yellow; $script:problemasObligatorios++ }
        }
    } else {
        Write-Host "[FALTA]     Sample Database no aparece. Ver docs/SOLUCION-PROBLEMAS.md" -ForegroundColor Yellow
        $script:problemasObligatorios++
    }

    $colecciones = Get-ListaApi "/api/collection"
    $cards       = Get-ListaApi "/api/card"
    $dashboards  = Get-ListaApi "/api/dashboard"
    Write-Host ("[INFO]      Elementos visibles: {0} colecciones, {1} preguntas, {2} dashboards" -f $colecciones.Count, $cards.Count, $dashboards.Count)

    $idColeccion      = Buscar $colecciones $nombreColeccion "Coleccion"
    $idColeccionRestr = Buscar $colecciones $nombreColeccionRestr "Coleccion" -Opcional
    $idDashboard      = Buscar $dashboards $nombreDashboard "Dashboard"
    $idDashboardRestr = Buscar $dashboards $nombreDashboardRestr "Dashboard" -Opcional
    $idsPreguntas = [ordered]@{}
    foreach ($k in $preguntas.Keys) { $idsPreguntas[$k] = Buscar $cards $preguntas[$k] "Pregunta" }

    # Sugerencia de ID inexistente para TC-ERR-001 (no se consulta: solo se calcula)
    $maxDash = 0
    foreach ($d in $dashboards) { if ($d.id -is [int] -or $d.id -is [long]) { if ([long]$d.id -gt $maxDash) { $maxDash = [long]$d.id } } }
    Write-Host ("[INFO]      ID de dashboard mayor visible: {0}. ID sugerido como inexistente para TC-ERR-001: {1} (verifiquelo antes de usarlo)." -f $maxDash, ($maxDash + 100000))

    if ($Guardar) {
        $raiz = Split-Path -Parent $PSScriptRoot
        $destino = Join-Path $raiz "configuracion\recursos-locales.json"
        if ($script:problemasObligatorios -gt 0) {
            Write-Host ("[NO GUARDADO] Hay {0} recurso(s) obligatorio(s) sin encontrar o duplicados. Se conserva sin cambios {1}." -f $script:problemasObligatorios, $(if (Test-Path $destino) { $destino } else { "(no existia configuracion previa)" })) -ForegroundColor Red
            $codigoSalida = 1
        } else {
            # Conservar valores que no provienen de esta busqueda
            $anterior = $null
            if (Test-Path $destino) { try { $anterior = Get-Content $destino -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $anterior = $null } }
            $inexistente = $null
            if ($anterior -and $anterior.ids_inexistentes_verificados) { $inexistente = $anterior.ids_inexistentes_verificados.dashboard_id_inexistente }
            if (-not $Integrante -and $anterior) { $Integrante = $anterior.integrante }

            $obj = [ordered]@{
                integrante             = $Integrante
                fecha_registro         = (Get-Date -Format "yyyy-MM-dd")
                base_url               = $BaseUrl
                version_metabase       = $version
                sample_database_id     = $sampleId
                coleccion_qa_id        = $idColeccion
                dashboard_principal_id = $idDashboard
                preguntas              = $idsPreguntas
                recursos_restringidos  = [ordered]@{ coleccion_restringida_id = $idColeccionRestr; dashboard_privado_id = $idDashboardRestr }
                ids_inexistentes_verificados = [ordered]@{ dashboard_id_inexistente = $inexistente }
            }
            $json = $obj | ConvertTo-Json -Depth 5
            $temporal = "$destino.tmp"
            [System.IO.File]::WriteAllText($temporal, $json, (New-Object System.Text.UTF8Encoding($false)))
            $null = Get-Content $temporal -Raw -Encoding UTF8 | ConvertFrom-Json   # valida el JSON antes de reemplazar
            if (Test-Path $destino) { Copy-Item $destino "$destino.bak" -Force }
            Move-Item $temporal $destino -Force
            Write-Host ("Configuracion local guardada en {0} (excluida de Git). Copia anterior: {1}" -f $destino, $(if (Test-Path "$destino.bak") { "recursos-locales.json.bak" } else { "ninguna" }))
        }
    } elseif ($script:problemasObligatorios -gt 0) {
        $codigoSalida = 1
    }
}
catch {
    Write-Host ("[ERROR] {0}" -f $_.Exception.Message) -ForegroundColor Red
    Write-Host "No se modifico la configuracion local. Revise que Metabase este en ejecucion y las variables QA_ADMIN_* de .env."
    $codigoSalida = 1
}
finally {
    if ($token) {
        if (Close-SesionMetabase $BaseUrl $token) { Write-Host "Sesion del script cerrada." }
        else { Write-Host "Aviso: no se pudo cerrar la sesion del script." -ForegroundColor Yellow }
        $token = $null
    }
}
exit $codigoSalida
