# TC-FUN-006 — Creación de dashboard

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-006` |
| Escenario | Creación de dashboard |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web / Cypress |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-10 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-04`, dashboard creado ID 35 en `QA - Metabase`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que puede crearse y guardarse un dashboard con una pregunta previamente guardada y su visualización.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Pregunta previamente guardada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Pregunta a incorporar: `QA - Productos por categoría` (recurso de preparación).
- Nombre del recurso creado: `EJEC - TC-FUN-006 - Dashboard - <AAAAMMDD>`.

## Procedimiento / solicitud (plan)

Crear un dashboard, asignarle un nombre, incorporar una pregunta previamente guardada y guardar los cambios.

## Resultado esperado (plan)

El dashboard queda registrado y presenta la pregunta incorporada con su visualización correspondiente.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Pregunta `QA - Productos por categoría`
- Colección de ejecución

## Observaciones para la automatización

- El dashboard creado aquí se usa en TC-FUN-007, no `QA - Dashboard Principal`.
- Credenciales: cuenta `usuario-qa` o `admin` del `.env` local (`QA_USER_*` / `QA_ADMIN_*`), entregadas a Cypress solo como variables del proceso; escribir la contraseña con `{ log: false }` y no crear `cypress.env.json` con valores (ver `docs/AUTENTICACION-QA.md` §5).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-006.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
