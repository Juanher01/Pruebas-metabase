# TC-FUN-004 — Guardado y recuperación de una pregunta

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-004` |
| Escenario | Guardado y recuperación de una pregunta |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-09 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-11`, pregunta creada ID 74 en `QA - Metabase`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que una pregunta puede guardarse en una colección autorizada y recuperarse conservando su configuración y resultados.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Colección autorizada para el usuario que ejecuta.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Nombre del recurso creado: `EJEC - TC-FUN-004 - Pregunta - <AAAAMMDD>`, en la colección de ejecución de la jornada (`docs/DATOS-Y-RECURSOS-PRUEBA.md` §6).
- Comprobar antes que no exista un recurso con ese nombre.

## Procedimiento / solicitud (plan)

Crear una consulta válida, guardarla con un nombre en una colección autorizada y abrirla nuevamente.

## Resultado esperado (plan)

La pregunta queda almacenada y puede recuperarse conservando su configuración y los resultados correspondientes a la consulta.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database
- Colección de ejecución autorizada

## Observaciones para la automatización

- La pregunta creada aquí es la que se traslada en TC-FUN-008: ejecutar TC-FUN-004 antes.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-004.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
