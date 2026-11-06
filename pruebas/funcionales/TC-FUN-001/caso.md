# TC-FUN-001 — Inicio de sesión con credenciales válidas

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-001` |
| Escenario | Inicio de sesión con credenciales válidas |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-09 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-03`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que un usuario registrado y activo puede autenticarse en la interfaz web con credenciales válidas y acceder a las funcionalidades de su cuenta.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Usuario registrado y activo.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Usuario normal `qa.usuario.<nombre>@example.com` creado y verificado (`docs/DATOS-Y-RECURSOS-PRUEBA.md` §2).

## Procedimiento / solicitud (plan)

Ingresar mediante la interfaz web utilizando el correo electrónico y la contraseña de un usuario registrado y activo.

## Resultado esperado (plan)

El sistema autentica al usuario y permite acceder a las funcionalidades correspondientes a su cuenta.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Interfaz web `http://localhost:3000`
- Usuario normal de prueba

## Observaciones para la automatización

- Credenciales: cuenta `usuario-qa` o `admin` del `.env` local (`QA_USER_*` / `QA_ADMIN_*`), entregadas a Cypress solo como variables del proceso; escribir la contraseña con `{ log: false }` y no crear `cypress.env.json` con valores (ver `docs/AUTENTICACION-QA.md` §5).
- El plan incluye el cierre de sesión dentro de la funcionalidad de autenticación, pero este caso evalúa solo el inicio de sesión; la finalización de sesión se trata en las verificaciones complementarias de seguridad funcional.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-001.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
