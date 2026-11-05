# Pruebas de rendimiento (TC-REN): herramientas, decisiones del piloto y resultados

Guía de los cinco casos de **rendimiento** (TC-REN-001 a 005) que ejecuta Samuel. Explica cómo se prepara el ambiente, qué se decidió en el piloto (el plan lo deja abierto), cómo se ejecuta cada caso y qué se encontró.

> Los resultados oficiales están en `pruebas/rendimiento/<ID>/reporte.md`, en `resultados/` y en la [matriz de trazabilidad](../reportes-generales/matriz-trazabilidad.csv). Este documento es la guía, no el registro.

---

## 1. Herramientas

| Caso | Herramienta | Script del caso | Cómo se ejecuta |
|---|---|---|---|
| TC-REN-001 | Apache JMeter | `scripts/TC-REN-001.jmx` | `-Herramienta jmeter` |
| TC-REN-002 | Navegador (Chrome) | `scripts/TC-REN-002.navegador.js` | `-Herramienta navegador` |
| TC-REN-003 | Postman + Newman | `scripts/TC-REN-003.postman_collection.json` | `-Herramienta newman -Iteraciones 30 -SinCuerpos` |
| TC-REN-004 | Apache JMeter | `scripts/TC-REN-004.jmx` | `-Herramienta jmeter` |
| TC-REN-005 | Apache JMeter | `scripts/TC-REN-005.jmx` | `-Herramienta jmeter` (dos veces: línea base y comparada) |

Instalación usada el 2026-11-05 (regístrela en `reportes-generales/evidencias-ambiente/` si la repite):

| Componente | Versión | Cómo |
|---|---|---|
| Java | 21.0.9 (ya instalado) | `java -version` |
| Apache JMeter | 5.6.3 | Zip oficial de `archive.apache.org`, con el SHA-512 verificado, descomprimido en una carpeta propia: `C:\herramientas\jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat` |
| Newman | 6.2.2 | Ver [HERRAMIENTAS-NEWMAN-JMETER.md](HERRAMIENTAS-NEWMAN-JMETER.md) |
| Chrome | 156.0.8078.80 | Instalado en el equipo |
| puppeteer-core | 23.11.1 | `cd recursos-compartidos\navegador; npm install` (`node_modules` no se versiona) |

El **navegador** se controla con puppeteer-core, sin descargar otro Chrome: `ejecutar-herramienta.ps1 -Herramienta navegador` inicia la sesión como los demás modos, pasa el token a Node por un archivo temporal y lo borra al terminar.

---

## 2. Ejecutar

```powershell
$JM = "C:\herramientas\jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"

# Recursos de referencia y sus IDs (si faltan)
powershell -ExecutionPolicy Bypass -File .\scripts\preparar-recursos-qa.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "Samuel"

# TC-REN-001 (1 preparación + 1 medición)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-001 -Herramienta jmeter -Integrante samuel -JMeter $JM
# TC-REN-002 (10 cargas del dashboard en Chrome)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-002 -Herramienta navegador -Integrante samuel
# TC-REN-003 (30 solicitudes secuenciales)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-003 -Herramienta newman -Integrante samuel -Iteraciones 30 -SinCuerpos
# TC-REN-004 (5 usuarios x 10 iteraciones)
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-004 -Herramienta jmeter -Integrante samuel -JMeter $JM
# TC-REN-005: primero la línea base y después, en otra ejecución, la comparada
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-005 -Herramienta jmeter -Integrante samuel -JMeter $JM
powershell -ExecutionPolicy Bypass -File .\scripts\ejecutar-herramienta.ps1 -Caso TC-REN-005 -Herramienta jmeter -Integrante samuel -JMeter $JM

# Métricas de cada ejecución (guarda metricas.json en su carpeta de resultados)
powershell -ExecutionPolicy Bypass -File .\scripts\calcular-metricas-rendimiento.ps1 -Caso TC-REN-004 -Ejecucion <AAAAMMDD>-samuel-01

# Antes de cualquier commit
powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1
```

**Condiciones para una medición válida** (el plan exige condiciones controladas): cierre otras aplicaciones pesadas, compruebe con `docker stats --no-stream metabase-qa` que Metabase está en reposo (pocos % de CPU) antes de empezar, y no haga nada más en el equipo durante la prueba. El generador de carga y Metabase comparten el mismo equipo, y eso debe constar en el reporte.

---

## 3. Decisiones del piloto

El plan deja abiertas estas decisiones y manda registrarlas. Se tomaron el 2026-11-05 y deben mantenerse en todas las ejecuciones comparables. **El equipo debe ratificarlas**; Juan debería adoptar las mismas si repite alguna medición.

| Tema | Decisión | Motivo |
|---|---|---|
| Caché de consultas (`ignore_cache`) | Todas las consultas se envían con `{"ignore_cache": true}` | Cada solicitud mide la ejecución real de la consulta; la caché de Metabase está desactivada por defecto, así que el valor solo lo hace explícito |
| Sesión de los usuarios virtuales (TC-REN-004 y 005) | Una sesión compartida por los 5 usuarios | Simple y sin autenticaciones dentro de la medición |
| Ramp-up (TC-REN-004 y 005) | 5 s | El plan no lo indica; igual en línea base y comparada |
| Código HTTP de las consultas | Se mantiene el 200 del plan como criterio, y se registra el 202 real | La decisión de aceptar 202 es del equipo (hallazgo H-001) |
| Umbrales (SLO) | Sin cambios | Los resultados abajo sirven para ratificarlos |
| Percentil | *nearest-rank*; además se cita el de JMeter (interpolado) | Ver [HERRAMIENTAS-NEWMAN-JMETER.md §3.2](HERRAMIENTAS-NEWMAN-JMETER.md#32-métricas-de-tc-ren-003-a-partir-de-newman) |
| Medición del dashboard (TC-REN-002) | Desde el inicio de la navegación hasta que las 3 consultas terminan, las 3 tarjetas muestran su visualización y el título de la pestaña deja de decir "n/3 cargado" | Es objetivo y repetible; el plan pide "visualizaciones completamente cargadas" |
| Navegador (TC-REN-002) | Chrome *headless* controlado por el Protocolo DevTools, contexto nuevo por carga (caché vacía) | Repetible; el plan menciona las herramientas de desarrollador manuales |
| Ejecuciones repetidas | Si un resultado incumple, se repite; si la repetición difiere, se hace una tercera para desempatar y se registran todas | La guía pide confirmar reproducibilidad (EJECUCION-PRUEBAS.md §3, paso 8) |

---

## 4. Resultados del piloto del 2026-11-05 (Samuel)

Equipo: AMD Ryzen 5 4600H (6 núcleos / 12 hilos, 7,4 GiB de RAM); Docker Desktop con 12 CPU y 3,5 GiB; Metabase v0.64.1 usando ~1,6 GiB en reposo.

| Caso | Estado | Criterio de rendimiento | Código HTTP |
|---|---|---|---|
| TC-REN-001 | No aprobado | Medición: 3659 / 2028 / **1133 ms** (3 ejecuciones; SLO 3000 ms cumplido en 2 de 3) | 202 (esperado 200) |
| TC-REN-002 | No aprobado | Cargas < 6000 ms: 6/10, 9/10 y **8/10** (SLO ≥ 9/10 cumplido en 1 de 3) | N/A |
| TC-REN-003 | No aprobado | **P95 = 1734 ms** (SLO < 4000), 30/30 completadas | 202 (esperado 200) |
| TC-REN-004 | No aprobado | **P95 = 2870 ms** (SLO < 6000), 0 % de errores | 202 (esperado 200) |
| TC-REN-005 | No aprobado | Base 2,38 req/s; comparada 2,53 req/s; degradación **−6,4 %** (tolerancia 10 %), 0 % de errores | 202 (esperado 200) |

### Lectura de los resultados

1. **TC-REN-003, 004 y 005 cumplen su criterio de rendimiento**; quedan No aprobados solo por el código HTTP 202 (hallazgo H-001). Si el equipo acepta 202 como éxito, pasan a Aprobado sin repetir la medición.
2. **TC-REN-002 no cumple su SLO de forma consistente** (hallazgo H-003): el dashboard carga en 3,2 a 5,2 s en régimen estable, pero las dos primeras cargas de cada serie tardan más (hasta 9,9 s). **TC-REN-001** mostró el mismo efecto: la primera ejecución, tras un periodo de inactividad, midió 3659 ms (hallazgo H-002).
3. Los tiempos mejoran con las ejecuciones sucesivas (calentamiento de la JVM y de la caché de la base de datos de ejemplo). Para decidir los SLO conviene fijar un protocolo de calentamiento: por ejemplo, descartar las primeras cargas o ejecutar una de preparación en cada caso, como ya exige el plan para TC-REN-001.
4. La consulta de P1 devuelve 2000 filas y unos 290 KB; es "sencilla" en lógica, pero no ligera. Si el SLO de 3000 ms se pensó para una consulta más pequeña, debe revisarse.

### Limitaciones

- Una sola instalación, un solo día y un único equipo que ejecuta a la vez Metabase y la carga.
- TC-REN-002 se midió con Chrome automatizado, no a mano.
- La medición de TC-REN-001 es de una sola solicitud, como pide el plan, por lo que es muy sensible al estado del servicio.

---

## 5. Archivos grandes

Newman guarda el cuerpo completo de cada respuesta en `newman-results.json`. En TC-REN-003 son 30 respuestas de unos 290 KB, y el archivo llegó a 151 MB, por encima del límite de GitHub (100 MB). Use la opción **`-SinCuerpos`** de `ejecutar-herramienta.ps1`: conserva códigos, tiempos, tamaños y aserciones, y reemplaza el cuerpo por su tamaño. Si olvida la opción, ejecute `node scripts\recortar-cuerpos-newman.js <newman-results.json>` y anótelo en `ejecucion-info.txt`, como se hizo el 2026-11-05. Un reporte de JMeter completo ocupa entre 3 y 9 MB.
