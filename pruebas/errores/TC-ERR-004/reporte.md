# Reporte de prueba: TC-ERR-004

## 1. Información general

| Campo | Valor |
|---|---|
| Código del caso | TC-ERR-004 |
| Escenario | Método HTTP no admitido |
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

Comprobar que una solicitud con un método no definido sobre `/api/session` es rechazada con 404 o 405.

## 3. Precondiciones

- Criterios de inicio: Metabase v0.64.1 disponible.
- Se envió sesión de la cuenta admin.

## 4. Procedimiento ejecutado

1. Se inició sesión con la cuenta admin mediante `scripts/ejecutar-herramienta.ps1` (el token no se guarda en los resultados).
2. Se ejecutó la colección `scripts/TC-ERR-004.postman_collection.json` con Newman: `GET /api/session`.
3. Se cerró la sesión y se redactó el token en los archivos generados.

Sin desviaciones respecto de `caso.md`.

## 5. Resultado esperado

El servicio rechaza la solicitud e informa que la operación no se encuentra disponible mediante el método utilizado.

**Código HTTP esperado:** 404 Not Found / 405 Method Not Allowed

## 6. Resultado obtenido

- Solicitud: `GET /api/session`
- Código HTTP: **404 Not Found**
- Cuerpo: "El endpoint de API no existe."
- Tiempo de respuesta: 53 ms
- Aserciones de Newman: 4/4 superadas (código esperado, sin error 5xx, respuesta < 5 s, sin trazas internas)

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

Se esperaba 404 o 405; se obtuvo 404. Coincide con el código fuente de v0.64.1, donde `/api/session` solo define POST y DELETE.

## 10. Hallazgos

Ninguno.

## 11. Conclusión

En esta ejecución, Metabase v0.64.1 respondió 404 Not Found a `GET /api/session`, dentro de lo esperado por el plan y sin error interno.

## 12. Información técnica de ejecución

| Campo | Valor |
|---|---|
| Sistema operativo | Windows 11 Home 10.0.26300 |
| Navegador y versión (si aplica) | No aplica |
| Versión de Docker | Engine 29.6.2 |
| Recursos asignados a Docker (CPU / RAM) | 12 CPU y 3,5 GiB de RAM (Docker Desktop); el contenedor `metabase-qa` no tiene límites propios |
| Versión de la herramienta (Newman) | 6.2.2 |
| Comando ejecutado | `scripts/ejecutar-herramienta.ps1 -Caso TC-ERR-004 -Herramienta newman -Integrante samuel` |
| Configuración relevante | 1 iteración; sesión de la cuenta admin; ejecutado el 2026-11-05, antes de la fecha programada en el plan (2026-11-12) |
| Identificadores locales usados | ninguna |
