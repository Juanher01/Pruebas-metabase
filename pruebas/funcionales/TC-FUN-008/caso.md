# TC-FUN-008 — Creación y organización de colecciones

> Ficha descriptiva extraída de `plan/PLAN DE PRUEBAS Metabase.pdf` (v1.0, 29/10/2026). El **request**, el **resultado esperado** y el **código HTTP** se transcriben del plan; lo marcado como *definido por el equipo* proviene de la preparación del ambiente (`docs/DATOS-Y-RECURSOS-PRUEBA.md`) y no forma parte del plan.

| Campo | Valor |
|---|---|
| Código | `TC-FUN-008` |
| Escenario | Creación y organización de colecciones |
| Categoría | Pruebas funcionales |
| Herramienta principal (plan) | Navegador web |
| Responsable asignado | Juan (reasignado por el equipo el 2026-11-05; el plan v1.0 asignaba: Samuel) |
| Fecha programada (cronograma del plan) | 2026-11-10 |
| Código HTTP esperado (plan) | N/A |
| Estado | **Aprobado**: ejecución `20261105-juan-06`, colección creada ID 37 y pregunta trasladada ID 76, ver [reporte.md](reporte.md) |

## Objetivo

Comprobar que una cuenta con permisos suficientes puede crear una colección y trasladar a ella una pregunta guardada sin alterar su contenido.

*Propósito de la categoría según el plan:* Verificar que las operaciones principales de Metabase se ejecuten conforme al comportamiento esperado, considerando autenticación, construcción de consultas, visualización de resultados, administración de dashboards, organización de colecciones y utilización de la API REST.

## Precondiciones

**Según el plan:**

- Criterios de inicio del plan cumplidos (ver `docs/EJECUCION-PRUEBAS.md` §1).
- Cuenta con permisos suficientes.
- Pregunta guardada.

**Definidas por el equipo para este ambiente:**

- Metabase v0.64.1 disponible (`scripts/verificar-ambiente.ps1` sin fallos).
- Cuenta administradora.
- Pregunta a trasladar: la creada en TC-FUN-004 (no un recurso `QA - ...`).
- Nombre del recurso creado: `EJEC - TC-FUN-008 - Coleccion - <AAAAMMDD>`.

## Procedimiento / solicitud (plan)

Crear una colección y trasladar una pregunta guardada hacia ella mediante una cuenta con permisos suficientes.

## Resultado esperado (plan)

La colección se crea correctamente y la pregunta aparece en la ubicación de destino, conservando su contenido y configuración.

**Código HTTP esperado:** N/A

## Recursos necesarios

- Cuenta administradora
- Pregunta de TC-FUN-004

## Observaciones para la automatización

- No crear la colección de antemano: su creación es parte de lo que se observa.

## Ubicación de los artefactos

| Elemento | Ruta |
|---|---|
| Scripts del caso | `scripts/` (por ejemplo `scripts/TC-FUN-008.<extensión>`) |
| Evidencias observables | `evidencias/<AAAAMMDD>-<integrante>-<NN>/` |
| Resultados nativos (Cypress, Newman, JMeter) | `resultados/<AAAAMMDD>-<integrante>-<NN>/` |
| Reporte individual | `reporte.md` (se crea **solo** tras una ejecución real, a partir de [la plantilla](../../../recursos-compartidos/plantillas/plantilla-reporte.md)) |
| Seguimiento | [Matriz de trazabilidad](../../../reportes-generales/matriz-trazabilidad.csv) |
