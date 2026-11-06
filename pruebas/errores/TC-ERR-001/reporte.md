# Reporte de prueba: TC-ERR-001

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-ERR-001 |
| Escenario | Recurso inexistente (dashboard no registrado) |
| Categoría | Pruebas de manejo de errores |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 12:00 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | Aprobado | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Comprobar que la solicitud de un dashboard inexistente devuelve 404 sin datos de otro recurso.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible (`verificar-ambiente.ps1` en [OK]). El resto de criterios del plan (recursos QA, piloto) no se completaron; este caso no los usa.
- ID inexistente: 100001, sugerido por `obtener-ids-recursos.ps1` (mayor ID de dashboard visible: 1). La propia ejecución lo confirma: devolvió 404.
- Sesión autorizada: cuenta admin, obtenida por `ejecutar-herramienta.ps1`.

## 4. Procedimiento ejecutado

1. Se inició sesión con la cuenta admin mediante `scripts/ejecutar-herramienta.ps1` (el token no se guarda en los resultados).
2. Se ejecutó la colección `scripts/TC-ERR-001.postman_collection.json` con Newman: `GET /api/dashboard/100001`.
3. Se cerró la sesión y se redactó el token en los archivos generados.

Sin desviaciones respecto de `caso.md`.

## 5. Resultado esperado

El servicio informa que el recurso solicitado no existe y no retorna información correspondiente a otro dashboard.

**Código HTTP esperado:** 404 Not Found

## 6. Resultado obtenido

- Solicitud: `GET /api/dashboard/100001`
- Código HTTP: **404 Not Found**
- Cuerpo: No encontrado.
- Tiempo de respuesta: 1332 ms
- Aserciones de Newman: 6/6 superadas (código esperado, sin error 5xx, respuesta < 5 s, sin trazas internas, sin datos de otro dashboard)

## 7. Evidencias

| # | Archivo | Descripción |
|---|---|---|
| 1 | `resultados/20261105-samuel-01/newman-report.html` | Reporte navegable de Newman |
| 2 | `resultados/20261105-samuel-01/newman-results.json` | Resultado completo (solicitud, respuesta, aserciones) |
| 3 | `resultados/20261105-samuel-01/consola.log` | Salida de consola |
| 4 | `resultados/20261105-samuel-01/ejecucion-info.txt` | Datos de la ejecución |

## 8. Estado de la prueba

**Aprobado**

## 9. Justificación del resultado

Se esperaba 404 sin datos de otro dashboard; se obtuvo 404 con el texto "No encontrado." y sin campos de dashboard (`dashcards`, `ordered_cards`).

## 10. Hallazgos

Ninguno.

## 11. Conclusión

En esta ejecución, Metabase v0.64.1 respondió 404 Not Found a `GET /api/dashboard/100001`, dentro de lo esperado por el plan y sin error interno.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-ERR-001 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan (2026-11-12) |
| Identificadores locales usados | dashboardIdInexistente=100001 |
