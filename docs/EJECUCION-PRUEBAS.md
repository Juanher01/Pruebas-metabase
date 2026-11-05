# Ejecución de las pruebas

Cómo iniciar la ejecución **formal** de los 29 casos del plan ([plan/PLAN DE PRUEBAS Metabase.pdf](../plan/PLAN%20DE%20PRUEBAS%20Metabase.pdf)) una vez preparado el ambiente. La especificación completa de cada caso (escenario, request, resultado esperado y código HTTP) está en el PDF y está resumida en [reportes-generales/matriz-trazabilidad.csv](../reportes-generales/matriz-trazabilidad.csv).

> Este documento **no contiene resultados**. Los resultados se registran solo después de ejecutar cada caso, con su evidencia.

---

## 1. Criterios de inicio (antes de la primera ejecución formal)

Según el plan, antes de iniciar debe cumplirse lo siguiente:

- [ ] Metabase v0.64.1 accesible (`scripts/verificar-ambiente.ps1` en `[OK]`) y versión registrada.
- [ ] Documentación de la API de la versión instalada revisada (`/api/docs`; ver [CONFIGURACION-QA.md §7](CONFIGURACION-QA.md#7-endpoints-de-la-api-verificados-para-v0641)).
- [ ] Recursos de preparación creados y verificados ([DATOS-Y-RECURSOS-PRUEBA.md](DATOS-Y-RECURSOS-PRUEBA.md)), con los IDs locales registrados.
- [ ] Usuarios y permisos configurados, con la restricción de `QA - Restringida` comprobada.
- [ ] Valores de referencia R01–R06 registrados.
- [ ] Postman, Newman, Cypress y Apache JMeter instalados, con sus versiones registradas en `reportes-generales/evidencias-ambiente/` (Newman y JMeter: [HERRAMIENTAS-NEWMAN-JMETER.md](HERRAMIENTAS-NEWMAN-JMETER.md)). Las ejecuciones formales de Newman y JMeter se hacen **siempre** con `scripts/ejecutar-herramienta.ps1`, que evita dejar tokens o contraseñas en los reportes.
- [ ] **Ejecución piloto** realizada, que debe incluir:
  - Confirmar el **código HTTP real** de `POST /api/card/{card-id}/query`. Según el código fuente de v0.64.1 probablemente es **202**, y el plan espera 200 (ver [CONFIGURACION-QA.md §7](CONFIGURACION-QA.md#observaciones-que-deben-confirmarse-en-la-ejecución-piloto)). Si se confirma, decidir y documentar el ajuste **antes** de la ejecución formal.
  - Ratificar los umbrales de rendimiento y definir la política de caché (`ignore_cache`).
  - Registrar los recursos asignados a Docker (CPU/RAM en Docker Desktop → Settings → Resources).

---

## 2. Secuencia de ejecución (según el cronograma del plan)

| Fecha (2026) | Casos | Responsable |
|---|---|---|
| Lun 9 nov | TC-FUN-001 a TC-FUN-004 | Juan |
| Mar 10 nov | TC-FUN-005 a TC-FUN-008 | Juan |
| Mié 11 nov | TC-FUN-009, TC-FUN-010, TC-VAL-001 a TC-VAL-005 | Juan |
| Jue 12 nov | TC-ERR-001 a TC-ERR-005 + verificaciones de seguridad funcional (autenticación y acceso) | Samuel (TC-ERR); ambos (verificaciones) |
| Vie 13 nov | Verificaciones de integración, revisión de resultados y evidencias | Juan y Samuel |
| Mar 17 nov | TC-CON-001 a TC-CON-004 | Samuel |
| Mié 18 nov | TC-REN-001 a TC-REN-003 | Samuel |
| Jue 19 nov | TC-REN-004 y TC-REN-005 | Samuel |
| Vie 20 nov | Análisis de métricas de rendimiento | Juan y Samuel |
| 23–26 nov | Reevaluación, consolidación, informe final y entrega (26 nov) | Juan y Samuel |

(No hay actividades formales los fines de semana ni el festivo del 16 de noviembre.)

> **Responsables:** las fechas son las del cronograma del plan. Los responsables corresponden a la asignación acordada por el equipo el 2026-11-05: Juan ejecuta TC-FUN y TC-VAL en su instalación, y Samuel ejecuta TC-ERR, TC-CON y TC-REN en la suya. El plan v1.0 asignaba TC-FUN, TC-VAL, TC-ERR y TC-CON a Samuel y TC-REN a Juan. Esta diferencia debe documentarse en el informe final.

### Pruebas funcionales: recursos que usa cada caso

| ID | Escenario | Recurso / dato a usar |
|---|---|---|
| TC-FUN-001 | Inicio de sesión con credenciales válidas | Usuario normal (`qa.usuario.<nombre>@example.com`) |
| TC-FUN-002 | Consulta mediante editor gráfico | Orders, filtro `Subtotal > 100`; comparar con R02 |
| TC-FUN-003 | Ejecución de consulta SQL | `SELECT COUNT(*) FROM PUBLIC.ORDERS`; comparar con R03 |
| TC-FUN-004 | Guardado y recuperación de pregunta | Crear `EJEC - TC-FUN-004 - Pregunta - <fecha>` |
| TC-FUN-005 | Visualización gráfica | Productos por categoría en barras; comparar con R04 |
| TC-FUN-006 | Creación de dashboard | Crear `EJEC - TC-FUN-006 - Dashboard - <fecha>` con P3 |
| TC-FUN-007 | Filtros en dashboard | Configurar el filtro de categoría en el dashboard de TC-FUN-006 |
| TC-FUN-008 | Creación y organización de colecciones | Crear `EJEC - TC-FUN-008 - Coleccion - <fecha>` y mover a ella la pregunta de TC-FUN-004 (cuenta administradora) |
| TC-FUN-009 | Dashboard mediante API REST | `GET /api/dashboard/{{dashboardId}}` (ID local de `QA - Dashboard Principal`) |
| TC-FUN-010 | Pregunta guardada mediante API REST | `POST /api/card/{{cardId}}/query` (ID local de P1); comparar con la UI |

Después: **TC-VAL** (validación), **TC-ERR** (errores), **TC-CON** (contrato) y **TC-REN** (rendimiento), con los requests exactos de la matriz y del PDF. Datos que el plan fija para algunos casos:

- TC-VAL-002 usa el valor `abc` en un filtro numérico (por ejemplo `Subtotal`).
- TC-VAL-004 usa el valor `QA_VALOR_INEXISTENTE_2026`. Precondición: R06 = 0.
- TC-VAL-005 usa el nombre `Análisis de ventas & costos (2026)`.
- TC-ERR-002 usa `GET /api/dashboard/abc`.
- TC-ERR-003 usa `GET /api/recurso-inexistente`.
- TC-ERR-004 usa `GET /api/session`.
- TC-ERR-005 usa `QA - Dashboard Restringido` **sin** cabecera de sesión.
- Para TC-ERR-001, use el ID inexistente verificado (§7 de DATOS-Y-RECURSOS-PRUEBA).
- TC-REN-001, TC-REN-003, TC-REN-004 y TC-REN-005 usan P1. TC-REN-002 usa `QA - Dashboard Principal`.

Las verificaciones de seguridad funcional e integración, que el plan describe sin identificador, se registran en [reportes-generales/verificaciones-complementarias/verificaciones-complementarias.csv](../reportes-generales/verificaciones-complementarias/verificaciones-complementarias.csv). Se identifican por su categoría y nombre, tal como aparecen en el plan, sin códigos adicionales. **No** forman parte de los 29 casos ni de la métrica de cobertura. Sus evidencias se guardan en `reportes-generales/verificaciones-complementarias/evidencias/`.

---

## 3. Cómo ejecutar y registrar un caso

1. `git pull` y verificación del ambiente (`scripts/verificar-ambiente.ps1`).
2. Lea la ficha `pruebas/<categoría>/<ID>/caso.md` y el PDF. Verifique sus precondiciones, en especial que no exista ya el recurso que el caso va a crear.
3. Defina el **identificador de ejecución**: `<AAAAMMDD>-<integrante>-<NN>`, por ejemplo `20261109-juan-01` (TC-FUN, Juan) o `20261112-samuel-01` (TC-ERR, Samuel). `NN` aumenta si el mismo integrante repite el caso el mismo día (§5).
4. Ejecute los pasos **exactamente** como están especificados.
5. Capture la evidencia **durante** la ejecución, en `evidencias/<id-ejecucion>/`, y deje los resultados nativos de la herramienta en `resultados/<id-ejecucion>/` (§5).
6. Cree o actualice `reporte.md` en la carpeta del caso a partir de [la plantilla](../recursos-compartidos/plantillas/plantilla-reporte.md), con los resultados **reales**.
7. Registre en la fila del caso, en `reportes-generales/matriz-trazabilidad.csv`:
   - `estado` (§4)
   - `ultima_ejecucion` (el identificador de ejecución)
   - `instalacion` (`Juan` o `Samuel`) y `fecha` (`AAAA-MM-DD`)
   - `resultado_obtenido`: lo observado, de forma objetiva (valores, mensajes, código HTTP)
   - `observaciones`: condiciones relevantes, desviaciones, ID de hallazgo
   - Las columnas `ruta_*` ya están completas y no deben cambiarse.
8. Si el resultado no coincide con lo esperado, regístrelo en [reportes-generales/registro-hallazgos.csv](../reportes-generales/registro-hallazgos.csv) y repita una vez para confirmar si es reproducible, como prevé el plan.
9. Ejecute `.\scripts\revisar-secretos.ps1`; debe mostrar `[OK]`. Luego `git add`, `git commit` y `git push` ([TRABAJO-COLABORATIVO.md](TRABAJO-COLABORATIVO.md)).

**No modifique** las columnas `resultado_esperado` ni `codigo_http_esperado`. Si el equipo acuerda un ajuste (por ejemplo, por el código 202), documéntelo en `observaciones` y en el informe, citando la fuente.

---

## 4. Estados

| Estado | Cuándo usarlo |
|---|---|
| **Aprobado** | Se ejecutó completo y el resultado obtenido coincide con el esperado. |
| **No aprobado** | Se ejecutó completo y el resultado difiere del esperado. Requiere un hallazgo registrado. |
| **Bloqueado** | No pudo ejecutarse por una condición externa al caso (ambiente caído, precondición imposible, defecto previo que impide avanzar). Indique la causa. |
| **No ejecutado** | Aún no se ha ejecutado, o se omitió con justificación. Es el valor inicial de los 29 casos. |

Métricas del plan:

- **Tasa de aprobación** = Aprobados / (Aprobados + No aprobados) × 100. Bloqueados y No ejecutados se reportan por separado.
- **Cobertura** = Ejecutados / 29 × 100. El objetivo es ≥ 28 casos (95 %), con el 100 % de TC-FUN y TC-ERR.

---

## 5. Evidencias

Cada caso guarda **sus propias** evidencias y resultados, separados por ejecución:

```
pruebas/funcionales/TC-FUN-009/
├── caso.md
├── scripts/TC-FUN-009.postman_collection.json
├── evidencias/20261111-juan-01/01-respuesta-postman.png
├── resultados/20261111-juan-01/newman-report.html
│                                newman-results.json
│                                ejecucion.log
└── reporte.md
```

| Qué | Dónde |
|---|---|
| Capturas y evidencias observables de un caso | `pruebas/<categoría>/<ID>/evidencias/<id-ejecucion>/` |
| Resultados nativos (Cypress, Newman, JMeter: JSON, HTML, JTL, logs) | `pruebas/<categoría>/<ID>/resultados/<id-ejecucion>/` |
| Reporte individual | `pruebas/<categoría>/<ID>/reporte.md` |
| Ambiente y preparación (no son casos) | `reportes-generales/evidencias-ambiente/` |
| Verificaciones complementarias de seguridad e integración | `reportes-generales/verificaciones-complementarias/evidencias/` |

**Nombres:**

- **Carpeta de ejecución:** `<AAAAMMDD>-<integrante>-<NN>` (`20261109-juan-01` para un TC-FUN, `20261119-samuel-02` para un TC-REN). Use el mismo nombre en `evidencias/` y en `resultados/`.
- **Archivos de evidencia:** `<nn>-<descripcion-corta>.<ext>` (`01-login-correcto.png`, `02-pagina-inicio.png`).
- **TC-REN-005:** la línea base y la ejecución comparada van en carpetas de ejecución distintas.

**No sobrescribir resultados históricos.** Cada ejecución crea una carpeta nueva y nunca se reutiliza ni se borra la de una ejecución anterior. `reporte.md` describe la ejecución vigente y conserva, en su tabla de historial, la lista de todas las ejecuciones con su carpeta.

Reglas:

- Capturas completas, con la URL y la hora visibles cuando sea posible.
- Para la API: guarde el request (método, URL, sin cabecera de sesión) y la respuesta (código y cuerpo) o el reporte de Newman.
- **No incluya** contraseñas, valores de `X-Metabase-Session`, cookies ni el contenido de `.env`. Tape o recorte esos datos antes de guardar.
- No edite las evidencias para cambiar su contenido. Si una evidencia es incorrecta, genere otra y explíquelo en `observaciones`.
- Los reportes de Newman (HTML/JSON) y de JMeter (JTL y reporte HTML) se guardan en `resultados/<id-ejecucion>/` del caso, generados con `scripts/ejecutar-herramienta.ps1`. Antes de subirlos, aplique el control de [HERRAMIENTAS-NEWMAN-JMETER.md §4](HERRAMIENTAS-NEWMAN-JMETER.md#4-antes-de-subir-resultados-a-github). Las pruebas de ensayo que no son ejecuciones formales van en `recursos-compartidos/jmeter/resultados-temporales/`, que no se versiona.
- Si un archivo de resultados supera unos 50 MB (por ejemplo, un JTL muy grande o un video), consúltelo con el equipo antes de subirlo: GitHub rechaza archivos de más de 100 MB.

---

## 6. Abrir la matriz CSV sin romperla

- Prefiera editarla en **VS Code** o en un editor de texto. Excel suele cambiar las comillas, la codificación y el separador al guardar, y eso produce conflictos en Git en todo el archivo.
- Para solo **ver** la matriz en Excel con la configuración regional de Colombia: **Datos → Desde texto/CSV**, con origen *65001: Unicode (UTF-8)* y delimitador *Coma*. No la guarde desde Excel.
- No reordene filas ni columnas.
