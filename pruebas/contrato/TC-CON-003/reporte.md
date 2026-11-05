# Reporte de prueba: TC-CON-003

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-CON-003 |
| Escenario | Consistencia entre listado y detalle |
| Categoría | Pruebas de contrato y consistencia |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 12:11 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | Aprobado | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Comprobar que los campos comunes de una pregunta son equivalentes entre el listado y el detalle.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible.
- Solicitud autenticada; ambas solicitudes usan la misma sesión (cuenta admin) dentro de una misma ejecución de Newman.
- La pregunta se selecciona del listado por nombre (`QA - Pedidos con subtotal mayor a 100`), no por ID fijo; aparece una sola vez.

## 4. Procedimiento ejecutado

1. Se ejecutó la colección `scripts/TC-CON-003.postman_collection.json` con Newman.
   1) `GET /api/card`: se localiza P1 por nombre y se conserva su registro.
   2) `GET /api/card/{id}` con el ID obtenido del listado, y se comparan los campos comunes.

## 5. Resultado esperado

Una pregunta obtenida mediante el listado puede consultarse individualmente utilizando su identificador. Los campos comunes, como id y name, conservan valores equivalentes entre ambas respuestas, bajo las mismas condiciones de acceso.

**Código HTTP esperado:** 200 OK

## 6. Resultado obtenido

- `GET /api/card` -> **200 OK** (44 preguntas; P1 una sola vez, ID 40).
- `GET /api/card/40` -> **200 OK**.
- `id` y `name` equivalentes. Los 46 campos comunes son equivalentes. En los objetos anidados `creator` y `collection` el listado y el detalle incluyen subcampos distintos (por ejemplo, el listado trae `date_joined` y el detalle trae `is_personal`); los subcampos presentes en ambos coinciden.
- Aserciones de Newman: 14/14 aserciones superadas (todas superadas).

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-01/newman-report.html` | Reporte navegable de Newman |
| 2 | `resultados/20261105-samuel-01/newman-results.json` | Resultado completo (solicitudes, respuestas, aserciones) |
| 3 | `resultados/20261105-samuel-01/consola.log` | Salida de consola |
| 4 | `resultados/20261105-samuel-01/ejecucion-info.txt` | Datos de la ejecución |

## 8. Estado de la prueba

**Aprobado**

## 9. Justificación del resultado

Se esperaba que la pregunta del listado fuera consultable por su ID y que `id`, `name` y los demás campos comunes fueran equivalentes; así ocurrió.

## 10. Hallazgos

Ninguno.

## 11. Conclusión

Listado y detalle de `QA - Pedidos con subtotal mayor a 100` son consistentes en esta ejecución. La diferencia de subcampos anidados es de representación, no de valores.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-CON-003 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan |
| Identificadores locales usados | cardId=40 (obtenido del listado por nombre) |
