# TC-FUN-002 — Ejecución de consulta mediante editor gráfico

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-002` |
| Escenario | Ejecución de consulta mediante editor gráfico |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-09 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-03`, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que una consulta construida con el editor gráfico y un filtro válido devuelve registros que cumplen el criterio y corresponden con los datos de origen.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Base de datos de ejemplo disponible.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Tabla y filtro: **pendiente de definición en el plan**. Propuesta del equipo: `Orders`, filtro `Subtotal > 100`, comparando con el valor de referencia R02 (`recursos-compartidos/datos/valores-referencia.csv`).

## Procedimiento / solicitud (plan)

Seleccionar una tabla de la base de datos de ejemplo, configurar un filtro válido y ejecutar la consulta.

## Resultado esperado (plan)

Se presentan registros que cumplen con los criterios de filtrado establecidos, conservando correspondencia con los datos de origen.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Sample Database (Orders)
- Valor de referencia R02

## Observaciones para la automatización

- La consulta no se guarda (no es objetivo del caso).

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-002.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
