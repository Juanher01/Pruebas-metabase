# Pruebas de contrato (TC-CON): contratos, ejecución y resultados

Guía de los cuatro casos de **contrato y consistencia** (TC-CON-001 a 004) que ejecuta Samuel con Postman + Newman. Describe el contrato que se valida en cada caso, cómo se define, cómo ejecutarlos y qué se encontró.

> Los resultados oficiales de cada ejecución están en `pruebas/contrato/<ID>/reporte.md`, en `resultados/` y en la [matriz de trazabilidad](../reportes-generales/matriz-trazabilidad.csv). Este documento es la guía, no el registro.

---

## 1. Qué es "el contrato" en estos casos

El plan pide validar las respuestas contra "el contrato documentado para la versión instalada", pero **no enumera** la información estructural esperada. Por eso el equipo la definió así, y debe constar en el informe final:

1. **Fuente:** la respuesta real de la v0.64.1 (ejecución piloto del 2026-11-05) contrastada con el código fuente de la etiqueta `v0.64.1` ([CONFIGURACION-QA.md §7](CONFIGURACION-QA.md#7-endpoints-de-la-api-verificados-para-v0641)).
2. **Alcance:** solo se exige lo que el plan nombra (`id`, `name`, `display`, `dataset_query`, `data.rows`, `data.cols`) y los campos **estables y propios del recurso** (identificadores, nombre, descripción, estado, fechas, relaciones). Se evitan campos que cambian con el uso (`view_count`, `last_viewed_at`, `last-edit-info`, etc.).
3. **Cómo se valida:** con un esquema JSON (AJV) dentro de la propia colección de Newman, más aserciones puntuales con los valores de referencia.

### 1.1 TC-CON-001: `GET /api/dashboard/{id}`

Esquema obligatorio (nombre: tipo):

| Campo | Tipo |
|---|---|
| `id`, `creator_id` | entero |
| `name`, `created_at`, `updated_at`, `entity_id` | cadena |
| `description`, `collection_id` | cadena / entero o `null` |
| `archived`, `auto_apply_filters`, `can_write` | booleano |
| `parameters`, `tabs`, `dashcards` | arreglo |
| `dashcards[]` | `id`, `dashboard_id`, `row`, `col`, `size_x`, `size_y` enteros; `card_id` entero o `null`; `parameter_mappings` arreglo; `visualization_settings` objeto; `card` objeto o `null` |

Valores de referencia: `id` = ID de `QA - Dashboard Principal`; `name` = `QA - Dashboard Principal`; 3 `dashcards` con `dashboard_id` = `id`; 1 filtro en `parameters`, vinculado a las 3 tarjetas.

### 1.2 TC-CON-002: `GET /api/card/{id}`

`id` entero; `name` cadena; `display` cadena; `dataset_query` objeto (no nulo ni arreglo). Valores de referencia: `id` = ID de P1; `name` = `QA - Pedidos con subtotal mayor a 100`; `dataset_query.database` = ID de Sample Database.

### 1.3 TC-CON-003: `GET /api/card` y `GET /api/card/{id}`

1. El listado es un arreglo y P1 aparece **una sola vez** (se selecciona por nombre, no por ID).
2. Se consulta el detalle con el ID obtenido del listado.
3. `id` y `name` son iguales, y **todos los campos comunes** también (en objetos anidados se comparan los subcampos presentes en ambos).

Observado: el listado y el detalle comparten 46 campos con valores iguales. Difieren solo en subcampos anidados (`creator` trae más datos en el listado; `collection` trae `is_personal` en el detalle). Es una diferencia de representación y no se considera inconsistencia.

### 1.4 TC-CON-004: `POST /api/card/{card-id}/query`

Cuerpo `{}`. Se valida:

- `status` = `completed`.
- `data.rows`: arreglo de registros (cada uno, un arreglo).
- `data.cols`: arreglo no vacío de metadatos con `name` y `base_type` de texto.
- Cada registro tiene tantos valores como columnas, y `row_count` = registros devueltos.
- Coherencia con la consulta de P1: existe la columna `SUBTOTAL` y todos los registros cumplen `SUBTOTAL > 100`.
- Una segunda solicitud de apoyo (`POST /api/dataset`) obtiene **R02**, y la cantidad de registros debe ser `min(R02, 2000)`; si R02 supera el límite, `rows_truncated` debe ser mayor que 0.
- Código HTTP **200**, que es el que el plan espera (ver §3).

---

## 2. Preparar y ejecutar

Requisitos: ambiente en `[OK]`, `.env` con la cuenta `admin` y los recursos QA creados. Si faltan los recursos, no hace falta crearlos a mano (§3 y §5 de la guía de datos): `preparar-recursos-qa.ps1` los crea sin duplicar.

```powershell
# 1. Crear (si faltan) colecciones, 5 preguntas y 2 dashboards de referencia
powershell -ExecutionPolicy Bypass -File .\scripts\preparar-recursos-qa.ps1
#    (con -SoloMostrar solo informa qué falta)

# 2. Registrar los IDs locales
powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "Samuel"

# 3. Ejecutar los casos
foreach ($c in 'TC-CON-001','TC-CON-002','TC-CON-003','TC-CON-004') {
  powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso $c -Herramienta newman -Integrante samuel
}

# 4. Antes de cualquier commit
powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1
```

Después de cada ejecución: revisar `resultados/<id-ejecucion>/newman-report.html`, completar el `reporte.md` y la fila de la matriz ([EJECUCION-PRUEBAS.md §3](EJECUCION-PRUEBAS.md#3-cómo-ejecutar-y-registrar-un-caso)). Si la ejecución es defectuosa por causa del script, **no se borra**: se corrige y se repite con `-02`, anotándolo en el historial del reporte (así se hizo en TC-CON-004).

---

## 3. Resultados del piloto del 2026-11-05 (Samuel)

| Caso | Estado | Resultado |
|---|---|---|
| TC-CON-001 | Aprobado | 200; esquema válido; 3 visualizaciones y 1 filtro |
| TC-CON-002 | Aprobado | 200; tipos correctos |
| TC-CON-003 | Aprobado | 200 y 200; 46 campos comunes equivalentes |
| TC-CON-004 | **No aprobado** | Estructura correcta, pero **HTTP 202 en vez de 200** (hallazgo H-001) |

### 3.1 Código HTTP 202 (hallazgo H-001)

El piloto **confirmó** lo previsto en [CONFIGURACION-QA.md §7](CONFIGURACION-QA.md#observaciones-que-deben-confirmarse-en-la-ejecución-piloto): `POST /api/card/{id}/query` y `POST /api/dataset` responden **202 Accepted** con `status = "completed"`. El plan espera 200. Como la colección exige el 200 del plan, TC-CON-004 resulta **No aprobado**.

**Decisión pendiente del equipo** (el resultado esperado del plan no se modificó): aceptar 202 como código de éxito de las consultas, validando además `status = "completed"`. Si se acepta, debe documentarse en el informe y en `observaciones` de TC-FUN-010, TC-CON-004, TC-REN-001, 003, 004 y 005, y se repite TC-CON-004 con la aserción ajustada.

### 3.2 La Sample Database de esta instalación es SQLite

Las consultas SQL de [valores-referencia.csv](../recursos-compartidos/datos/valores-referencia.csv) y de [DATOS-Y-RECURSOS-PRUEBA.md §1.3](DATOS-Y-RECURSOS-PRUEBA.md) usan `PUBLIC.ORDERS` (sintaxis H2). En la instalación de Samuel, `PUBLIC.ORDERS` falla con `no such table`; la tabla se llama `ORDERS`. Esto afecta también a **TC-FUN-003** y a la verificación R01 a R06 en cualquier instalación con SQLite. **Juan debe comprobar el motor de su Sample Database** y, si coincide, usar las consultas sin `PUBLIC.`.

### 3.3 Otras observaciones

- **R02 = 5244** en la instalación de Samuel; la interfaz y la API devuelven como máximo **2000 filas** (`rows_truncated`), lo cual no es un error ([DATOS-Y-RECURSOS-PRUEBA.md §4.4](DATOS-Y-RECURSOS-PRUEBA.md#44-límite-de-2000-filas-importante-para-p1)).
- La consulta de P1 tardó 2,7 s en una ejecución y 14,3 s en otra (misma pregunta, sin caché configurada). Conviene fijar la política de caché (`ignore_cache`) antes de TC-REN.
- Un error de consulta (400) devuelve en el cuerpo la traza interna de Java/Clojure, incluso para un usuario administrador. No es objeto de ningún caso, pero puede revisarse en las verificaciones de seguridad funcional.
