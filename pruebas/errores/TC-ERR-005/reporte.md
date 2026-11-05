# Reporte de prueba: TC-ERR-005

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-ERR-005 |
| Escenario | Solicitud sin autenticación |
| Categoría | Pruebas de manejo de errores |
| Ejecutado por | Samuel |
| Instalación | Equipo de Samuel |
| Identificador de ejecución vigente | 20261105-samuel-01 |
| Fecha y hora de ejecución | 2026-11-05 12:14 |
| Versión de Metabase | v0.64.1 |
| Herramienta utilizada | Postman + Newman |

**Historial de ejecuciones** (no borrar filas anteriores):

| Ejecución | Fecha | Integrante | Estado | Carpeta de resultados |
|---|---|---|---|---|
| 20261105-samuel-01 | 2026-11-05 | Samuel | Aprobado | `resultados/20261105-samuel-01/` |

## 2. Objetivo de la prueba

Comprobar que un dashboard privado no puede consultarse sin autenticación.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible (`verificar-ambiente.ps1` en [OK]).
- Dashboard privado existente: `QA - Dashboard Restringido` (ID local 3), en la colección `QA - Restringida` (ID 7), creados con `scripts/preparar-recursos-qa.ps1`. El grupo *Todos los usuarios* quedó con permiso *Sin acceso* sobre esa colección. No se verificó con el usuario normal (§5.3 de la guía de datos); no es necesario para este caso, que no envía sesión.

## 4. Procedimiento ejecutado

1. Se verificó que el dashboard privado existe (creado por el script de preparación, con la cuenta admin).
2. Se ejecutó la colección `scripts/TC-ERR-005.postman_collection.json` con Newman y `-SinSesion`: `GET /api/dashboard/3` sin cabecera `X-Metabase-Session` ni cookies (la colección no incluye inicio de sesión).

## 5. Resultado esperado

El servicio deniega el acceso al recurso protegido y no proporciona los datos del dashboard solicitado.

**Código HTTP esperado:** 401 Unauthorized

## 6. Resultado obtenido

- Solicitud: `GET /api/dashboard/3` (sin sesión)
- Código HTTP: **401 Unauthorized**
- Cuerpo: `Unauthenticated`
- Sin datos del dashboard (`dashcards`) ni de su nombre en la respuesta.
- Aserciones de Newman: 7/7 aserciones superadas (todas superadas).

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

Se esperaba 401 y que no se entregaran datos del dashboard; se obtuvo 401 con el texto `Unauthenticated`, sin ningún dato del recurso protegido.

## 10. Hallazgos

Ninguno.

## 11. Conclusión

En esta ejecución, Metabase v0.64.1 denegó con 401 el acceso sin credenciales a un dashboard privado y no entregó sus datos.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-ERR-005 -Herramienta newman -Integrante samuel -SinSesion` |
| Configuración relevante | 1 iteración; sin sesion (-SinSesion); ejecutado el 2026-11-05, antes de la fecha programada en el plan |
| Identificadores locales usados | dashboardPrivadoId=3 |
