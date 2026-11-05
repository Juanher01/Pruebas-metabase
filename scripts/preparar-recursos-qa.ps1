<#
.SYNOPSIS
  Crea (si no existen) los recursos de referencia "QA - ..." en la instalacion local
  de Metabase, segun docs/DATOS-Y-RECURSOS-PRUEBA.md secciones 3, 4 y 5.

.DESCRIPTION
  Equivale a hacer a mano los pasos de esas secciones, pero de forma repetible:
  - Colecciones: QA - Metabase (Todos los usuarios: Ver) y QA - Restringida (Sin acceso).
  - Preguntas P1..P5 creadas con consultas del editor grafico (MBQL), en QA - Metabase.
  - Dashboards: QA - Dashboard Principal (P3, P4, P5 + filtro "Categoria" vinculado)
    y QA - Dashboard Restringido (P2), en QA - Restringida.
  - Idempotente: si un recurso con el mismo nombre ya existe, lo omite (no duplica ni modifica).
  - Usa solo la cuenta 'admin' del .env (docs/AUTENTICACION-QA.md). No muestra ni guarda
    contrasena ni token, y cierra la sesion al terminar.
  - Solo modifica los permisos de las dos colecciones QA que crea (no toca los demas).
  - Con -SoloMostrar no crea nada: informa que faltaria crear.

  Despues de ejecutarlo: scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "<nombre>"

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\preparar-recursos-qa.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\preparar-recursos-qa.ps1 -SoloMostrar
#>
param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$SoloMostrar
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'sesion-metabase.ps1')

# Los nombres con tilde se arman con codigos Unicode para no depender de la codificacion de este archivo.
$i = [string][char]0xED   # i con tilde
$CAT = "categor${i}a"
$NombreCol1 = 'QA - Metabase'
$NombreCol2 = 'QA - Restringida'
$P = [ordered]@{
    P1 = 'QA - Pedidos con subtotal mayor a 100'
    P2 = 'QA - Conteo de pedidos'
    P3 = "QA - Productos por $CAT"
    P4 = "QA - Precio promedio por $CAT"
    P5 = 'QA - Detalle de productos'
}
$D1 = 'QA - Dashboard Principal'
$D2 = 'QA - Dashboard Restringido'

$token = Open-SesionMetabase $BaseUrl (Get-CredencialQA 'admin')
$h = @{ 'X-Metabase-Session' = $token }

function Get-Api([string]$ruta) { $r = Invoke-RestMethod -Uri "$BaseUrl$ruta" -Headers $h; return $r }
function Send-Api([string]$metodo, [string]$ruta, $cuerpo) {
    $json = $cuerpo | ConvertTo-Json -Depth 30 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $r = Invoke-RestMethod -Method $metodo -Uri "$BaseUrl$ruta" -Headers $h -ContentType 'application/json; charset=utf-8' -Body $bytes
    return $r
}
function Get-Lista($r) { if ($r -is [System.Array]) { return $r } elseif ($r.data) { return $r.data } else { return @($r) } }
function Info($t) { Write-Host "[INFO]  $t" }
function Hecho($t) { Write-Host "[CREADO] $t" -ForegroundColor Green }
function Existe($t) { Write-Host "[OK]    $t (ya existia)" }
function Falta($t) { Write-Host "[FALTA] $t (no se crea: -SoloMostrar)" -ForegroundColor Yellow }

try {
    $db = (Get-Lista (Get-Api '/api/database')) | Where-Object { $_.name -eq 'Sample Database' } | Select-Object -First 1
    if (-not $db) { throw "No se encontro 'Sample Database'." }
    $meta = Get-Api "/api/database/$($db.id)/metadata"
    function Get-Campo($tabla, $campo) {
        $t = $meta.tables | Where-Object { $_.name -eq $tabla } | Select-Object -First 1
        if (-not $t) { throw "No se encontro la tabla $tabla" }
        $f = $t.fields | Where-Object { $_.name -eq $campo } | Select-Object -First 1
        if (-not $f) { throw "No se encontro la columna $tabla.$campo" }
        return @{ tabla = [int]$t.id; campo = [int]$f.id }
    }
    $tOrders = ($meta.tables | Where-Object { $_.name -eq 'ORDERS' }).id
    $tProducts = ($meta.tables | Where-Object { $_.name -eq 'PRODUCTS' }).id
    $fSubtotal = (Get-Campo 'ORDERS' 'SUBTOTAL').campo
    $fCategory = (Get-Campo 'PRODUCTS' 'CATEGORY').campo
    $fPrice = (Get-Campo 'PRODUCTS' 'PRICE').campo
    Info "Sample Database id $($db.id); ORDERS=$tOrders PRODUCTS=$tProducts"

    # ---------------- Colecciones ----------------
    $colecciones = Get-Lista (Get-Api '/api/collection')
    function Obtener-Coleccion($nombre, $descripcion) {
        $c = $colecciones | Where-Object { $_.name -eq $nombre -and -not $_.archived } | Select-Object -First 1
        if ($c) { Existe "Coleccion '$nombre' id $($c.id)"; return $c.id }
        if ($SoloMostrar) { Falta "Coleccion '$nombre'"; return $null }
        $n = Send-Api 'POST' '/api/collection' @{ name = $nombre; description = $descripcion; parent_id = $null }
        Hecho "Coleccion '$nombre' id $($n.id)"
        return $n.id
    }
    $c1 = Obtener-Coleccion $NombreCol1 'Recursos de referencia del plan de pruebas. No modificar durante la ejecucion.'
    $c2 = Obtener-Coleccion $NombreCol2 'Recurso restringido para verificaciones de control de acceso.'

    # ---------------- Permisos (solo estas dos colecciones) ----------------
    if (-not $SoloMostrar) {
        $grafo = Get-Api '/api/collection/graph'
        $todos = ($grafo.groups.PSObject.Properties | Where-Object { $_.Name -eq '1' } | Select-Object -First 1)
        if (-not $todos) { throw "No se encontro el grupo 'Todos los usuarios' (id 1) en el grafo de permisos." }
        $cambios = $false
        foreach ($par in @(@($c1, 'read'), @($c2, 'none'))) {
            $id = [string]$par[0]; $nivel = $par[1]
            $actual = $todos.Value.PSObject.Properties | Where-Object { $_.Name -eq $id } | Select-Object -First 1
            if ($actual -and $actual.Value -eq $nivel) { Existe "Permiso de Todos los usuarios sobre coleccion $id = $nivel"; continue }
            if ($actual) { $actual.Value = $nivel } else { $todos.Value | Add-Member -NotePropertyName $id -NotePropertyValue $nivel }
            $cambios = $true
        }
        if ($cambios) {
            $null = Send-Api 'PUT' '/api/collection/graph' @{ revision = $grafo.revision; groups = $grafo.groups }
            Hecho "Permisos de Todos los usuarios: QA - Metabase = Ver (read), QA - Restringida = Sin acceso (none)"
        }
    }

    # ---------------- Preguntas ----------------
    $tarjetas = Get-Lista (Get-Api '/api/card')
    $consultas = @{
        P1 = @{ display = 'table'; q = @{ 'source-table' = $tOrders; filter = @('>', @('field', $fSubtotal, $null), 100) }
                desc = 'Recurso de preparacion P1. Filtro Subtotal > 100. No modificar.' }
        P2 = @{ display = 'scalar'; q = @{ 'source-table' = $tOrders; aggregation = @(, @('count')) }
                desc = 'Recurso de preparacion P2. Recuento de filas de Orders. No modificar.' }
        P3 = @{ display = 'bar'; q = @{ 'source-table' = $tProducts; aggregation = @(, @('count')); breakout = @(, @('field', $fCategory, $null)) }
                desc = 'Recurso de preparacion P3. Recuento de productos por Category. No modificar.' }
        P4 = @{ display = 'bar'; q = @{ 'source-table' = $tProducts; aggregation = @(, @('avg', @('field', $fPrice, $null))); breakout = @(, @('field', $fCategory, $null)) }
                desc = 'Recurso de preparacion P4. Promedio de Price por Category. No modificar.' }
        P5 = @{ display = 'table'; q = @{ 'source-table' = $tProducts }
                desc = 'Recurso de preparacion P5. Registros de Products. No modificar.' }
    }
    $idTarjeta = @{}
    foreach ($k in $P.Keys) {
        $nombre = $P[$k]
        $t = $tarjetas | Where-Object { $_.name -eq $nombre -and -not $_.archived } | Select-Object -First 1
        if ($t) { Existe "$k '$nombre' id $($t.id)"; $idTarjeta[$k] = $t.id; continue }
        if ($SoloMostrar -or -not $c1) { Falta "$k '$nombre'"; continue }
        $d = $consultas[$k]
        $cuerpo = @{
            name = $nombre; description = $d.desc; collection_id = $c1; display = $d.display
            visualization_settings = @{}
            dataset_query = @{ database = $db.id; type = 'query'; query = $d.q }
        }
        $n = Send-Api 'POST' '/api/card' $cuerpo
        Hecho "$k '$nombre' id $($n.id)"
        $idTarjeta[$k] = $n.id
    }

    # ---------------- Dashboards ----------------
    $dashboards = Get-Lista (Get-Api '/api/dashboard')
    function Obtener-Dashboard($nombre, $descripcion, $coleccion) {
        $d = $dashboards | Where-Object { $_.name -eq $nombre -and -not $_.archived } | Select-Object -First 1
        if ($d) { Existe "Dashboard '$nombre' id $($d.id)"; return $null }
        if ($SoloMostrar -or -not $coleccion) { Falta "Dashboard '$nombre'"; return $null }
        $n = Send-Api 'POST' '/api/dashboard' @{ name = $nombre; description = $descripcion; collection_id = $coleccion }
        return $n.id
    }
    $idD1 = Obtener-Dashboard $D1 'Dashboard de referencia (3 visualizaciones + filtro de categoria). No modificar.' $c1
    if ($idD1) {
        if (-not ($idTarjeta.P3 -and $idTarjeta.P4 -and $idTarjeta.P5)) { throw "Faltan las preguntas P3, P4 o P5 para armar $D1." }
        $objetivo = @('dimension', @('field', $fCategory, $null))
        $mk = { param($n, $card, $row, $col, $sx, $sy) @{
                id = -$n; card_id = $card; row = $row; col = $col; size_x = $sx; size_y = $sy
                parameter_mappings = @(, @{ parameter_id = 'categoria'; card_id = $card; target = $objetivo })
                visualization_settings = @{} } }
        $dashcards = @(
            (& $mk 1 $idTarjeta.P3 0 0 12 6),
            (& $mk 2 $idTarjeta.P4 0 12 12 6),
            (& $mk 3 $idTarjeta.P5 6 0 24 8)
        )
        $param = @{ id = 'categoria'; name = "Categor${i}a"; slug = 'categoria'; type = 'string/='; sectionId = 'string' }
        $null = Send-Api 'PUT' "/api/dashboard/$idD1" @{ parameters = @(, $param); dashcards = $dashcards }
        Hecho "Dashboard '$D1' id $idD1 (3 tarjetas + filtro Categoria)"
    }
    $idD2 = Obtener-Dashboard $D2 'Dashboard privado para verificaciones de acceso.' $c2
    if ($idD2) {
        if (-not $idTarjeta.P2) { throw "Falta la pregunta P2 para armar $D2." }
        $dc = @(, @{ id = -1; card_id = $idTarjeta.P2; row = 0; col = 0; size_x = 6; size_y = 4; parameter_mappings = @(); visualization_settings = @{} })
        $null = Send-Api 'PUT' "/api/dashboard/$idD2" @{ dashcards = $dc }
        Hecho "Dashboard '$D2' id $idD2 (1 tarjeta: P2)"
    }
    Write-Host ""
    Write-Host "Siguiente paso: .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante `"<nombre>`""
}
finally {
    if (Close-SesionMetabase $BaseUrl $token) { Write-Host "Sesion del script cerrada." }
}
