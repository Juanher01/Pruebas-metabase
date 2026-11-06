# Metabase-Pruebas

Proyecto académico de pruebas de software sobre **Metabase Open Source v0.64.1**. Se evalúan **29 casos de prueba** (funcionales, validación de entradas, manejo de errores, contrato y rendimiento), además de verificaciones complementarias de seguridad funcional e integración, según el plan [plan/PLAN DE PRUEBAS Metabase.pdf](plan/PLAN%20DE%20PRUEBAS%20Metabase.pdf).

**Integrantes y casos asignados** (acordados por el equipo el 2026-11-05; el plan v1.0 los distribuía de otra forma):

- **Juan Esteban Hernández Lozano:** coordinación QA, hallazgos, métricas e informe final; ejecuta los casos **funcionales (TC-FUN)** y de **validación de entradas (TC-VAL)** en su instalación.
- **Samuel Alexander Perdomo Fajardo:** ejecuta los casos de **manejo de errores (TC-ERR)**, **contrato (TC-CON)** y **rendimiento (TC-REN)** en su instalación, con Postman, Newman y JMeter.
- Ambos realizan las verificaciones complementarias de seguridad funcional e integración y la revisión cruzada de evidencias.

**Fecha límite:** 26 de noviembre de 2026.

## Arquitectura de trabajo

Hay **un repositorio GitHub compartido** y **dos instalaciones locales independientes** de Metabase, una en el equipo de cada integrante. Ambas usan la misma versión, Sample Database y recursos de referencia equivalentes. GitHub comparte documentación, scripts, pruebas, evidencias y reportes. **No** comparte los datos internos de Metabase: cada instalación tiene los suyos, con sus propios IDs ([docs/TRABAJO-COLABORATIVO.md](docs/TRABAJO-COLABORATIVO.md)).

## Inicio rápido

| Situación | Qué hacer |
|---|---|
| Equipo **sin** Metabase (Samuel) | Seguir [docs/INSTALACION-SAMUEL.md](docs/INSTALACION-SAMUEL.md) |
| Equipo de **Juan** (contenedor existente creado con `docker run`) | `docker start metabase-qa`. **No** ejecutar `docker compose up` ([docs/CONFIGURACION-QA.md](docs/CONFIGURACION-QA.md)) |
| Verificar el ambiente | `powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1` |
| Preparar usuarios, colecciones, preguntas y dashboards | [docs/DATOS-Y-RECURSOS-PRUEBA.md](docs/DATOS-Y-RECURSOS-PRUEBA.md) |
| Crear de una vez colecciones, preguntas y dashboards QA | `.\scripts\preparar-recursos-qa.ps1` (idempotente; ver [docs/DATOS-Y-RECURSOS-PRUEBA.md](docs/DATOS-Y-RECURSOS-PRUEBA.md)) |
| Informe formal de la preparación del ambiente (evidencia para el informe final) | [docs/INFORME-PREPARACION-AMBIENTE-QA.md](docs/INFORME-PREPARACION-AMBIENTE-QA.md) |
| Ejecutar y registrar un caso | [docs/EJECUCION-PRUEBAS.md](docs/EJECUCION-PRUEBAS.md) |
| Pruebas de contrato (TC-CON): contratos y resultados | [docs/CONTRATOS-API-V0.64.1.md](docs/CONTRATOS-API-V0.64.1.md) |
| Pruebas de rendimiento (TC-REN): herramientas, decisiones y resultados | [docs/RENDIMIENTO-V0.64.1.md](docs/RENDIMIENTO-V0.64.1.md) |
| Instalar y ejecutar Newman / JMeter (reportes nativos) | [docs/HERRAMIENTAS-NEWMAN-JMETER.md](docs/HERRAMIENTAS-NEWMAN-JMETER.md) |
| Configurar las cuentas QA en `.env` y comprobarlas | [docs/AUTENTICACION-QA.md](docs/AUTENTICACION-QA.md) · `.\scripts\probar-cuentas.ps1` |
| Revisar que no haya secretos antes de un commit | `powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1` |
| Algo falla | [docs/SOLUCION-PROBLEMAS.md](docs/SOLUCION-PROBLEMAS.md) |

## Estructura

```
Metabase-Pruebas/
├── README.md
├── compose.yaml                  # Servicio Metabase v0.64.1 (instalaciones nuevas)
├── .env.example                  # Plantilla de variables (copiar a .env, que no se versiona)
├── .gitignore
├── plan/                         # Plan de pruebas original (PDF)
├── docs/                         # Guías: instalación, configuración, datos, ejecución, Git, problemas
├── configuracion/                # Plantilla de IDs locales (la copia local no se versiona)
├── recursos-compartidos/
│   ├── postman/                  # Plantilla de entorno y recursos comunes de Postman/Newman
│   ├── cypress/                  # Configuración y comandos comunes de Cypress (por desarrollar)
│   ├── jmeter/                   # Componentes comunes de JMeter (por desarrollar)
│   ├── datos/                    # Valores de referencia de Sample Database
│   └── plantillas/               # Plantilla del reporte individual
├── pruebas/                      # Una carpeta por caso (29)
│   ├── funcionales/   TC-FUN-001 … TC-FUN-010
│   ├── validacion/    TC-VAL-001 … TC-VAL-005
│   ├── errores/       TC-ERR-001 … TC-ERR-005
│   ├── contrato/      TC-CON-001 … TC-CON-004
│   └── rendimiento/   TC-REN-001 … TC-REN-005
├── scripts/                      # Ambiente (verificar, obtener IDs, respaldar) y ejecución de Newman/JMeter
└── reportes-generales/
    ├── matriz-trazabilidad.csv   # Estado y rutas de los 29 casos
    ├── registro-hallazgos.csv    # Hallazgos de todo el proyecto
    ├── verificaciones-complementarias/   # Seguridad funcional e integración (+ evidencias)
    ├── evidencias-ambiente/      # Evidencias de preparación del ambiente (no son casos)
    └── diarios/  semanales/  final/      # Reportes del plan (bitácora, análisis, informe final)
```

### Finalidad de cada carpeta principal

| Carpeta | Finalidad |
|---|---|
| `plan/` | Documento fuente. Los casos, criterios y umbrales salen de aquí. |
| `docs/` | Cómo instalar, preparar, ejecutar, colaborar y resolver problemas. |
| `configuracion/` | Plantillas de configuración local (URL base e IDs de cada instalación). |
| `recursos-compartidos/` | Todo lo reutilizable entre casos: configuración de herramientas, funciones y comandos comunes, datos de referencia y plantillas. |
| `pruebas/` | Los 29 casos, cada uno con su ficha, scripts, evidencias, resultados y reporte. |
| `scripts/` | Utilidades: verificación del ambiente, consulta de IDs, respaldo, `ejecutar-herramienta.ps1` (ejecución segura de Newman/JMeter), autenticación compartida desde `.env` (`sesion-metabase.ps1`, `probar-cuentas.ps1`) y `revisar-secretos.ps1`. |
| `reportes-generales/` | Seguimiento y métricas consolidadas del proyecto. |

## Organización de los 29 casos

Cada caso tiene la misma estructura ([pruebas/README.md](pruebas/README.md)):

```
pruebas/<categoria>/<ID>/
├── caso.md       Ficha del caso extraída del plan
├── scripts/      Automatización del caso: <ID>.cy.js, <ID>.postman_collection.json o <ID>.jmx
├── evidencias/   <AAAAMMDD>-<integrante>-<NN>/   Capturas y evidencias observables
├── resultados/   <AAAAMMDD>-<integrante>-<NN>/   Salidas nativas: JSON, HTML, JTL, logs
└── reporte.md    Informe individual (solo tras una ejecución real)
```

| Pregunta | Respuesta |
|---|---|
| ¿Dónde van los scripts? | En `scripts/` del caso. Lo común a varios casos va en `recursos-compartidos/<herramienta>/`. |
| ¿Dónde se generan los resultados nativos? | En `resultados/<id-ejecucion>/` del caso: reportes de Newman, JTL y HTML de JMeter o resultados de Cypress. Para Newman y JMeter se generan con `scripts/ejecutar-herramienta.ps1` ([docs/HERRAMIENTAS-NEWMAN-JMETER.md](docs/HERRAMIENTAS-NEWMAN-JMETER.md)). |
| ¿Dónde se guardan las capturas? | En `evidencias/<id-ejecucion>/` del caso. |
| ¿Dónde se genera `reporte.md`? | En la carpeta del caso, a partir de [recursos-compartidos/plantillas/plantilla-reporte.md](recursos-compartidos/plantillas/plantilla-reporte.md), solo después de ejecutar. |
| ¿Cómo se relacionan los casos con la matriz? | Cada fila de [reportes-generales/matriz-trazabilidad.csv](reportes-generales/matriz-trazabilidad.csv) es un caso: incluye su estado, la última ejecución y las rutas de su ficha, scripts, evidencias, resultados y reporte. |
| ¿Cómo se agregan resultados sin afectar los anteriores? | Cada ejecución crea una carpeta nueva `<AAAAMMDD>-<integrante>-<NN>`, y nunca se reutiliza ni se borra una anterior. `reporte.md` conserva una tabla de historial de ejecuciones. |

Todos los casos están en estado **No ejecutado**. La preparación de usuarios, preguntas, colecciones y dashboards **no** cuenta como ejecución de ningún caso.

## Reglas del proyecto

- Versión fija `metabase/metabase:v0.64.1`; no cambiarla sin acuerdo.
- No subir `.env` (contiene la clave de sesión y las credenciales `QA_*`), contraseñas, tokens, cookies, IDs locales, volúmenes ni archivos `.mv.db`. Ejecutar `scripts/revisar-secretos.ps1` antes de cada commit.
- Nunca usar `docker compose down -v` ni eliminar el volumen `metabase-qa-data`.
- Recursos de preparación con el prefijo `QA - `; recursos creados durante las pruebas con el prefijo `EJEC - <ID> - … - <AAAAMMDD>`.
- Los scripts y las pruebas usan variables para los IDs, nunca valores fijos.
- No se registran resultados sin ejecución real ni evidencia.
