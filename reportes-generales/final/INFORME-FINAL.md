# Informe final de evaluación de Metabase v0.64.1

**Resumen ejecutivo y recomendación de conformidad**

| Campo | Valor |
|---|---|
| Proyecto | Evaluación de calidad de Metabase Open Source |
| Versión evaluada | Metabase Open Source **v0.64.1** (imagen oficial `metabase/metabase:v0.64.1`) |
| Documento de referencia | [Plan de pruebas v1.0 (29/10/2026)](../../plan/PLAN%20DE%20PRUEBAS%20Metabase.pdf) |
| Equipo | Juan Esteban Hernández Lozano · Samuel Alexander Perdomo Fajardo |
| Periodo de ejecución | 5 de noviembre de 2026; reevaluación documental el 19 de noviembre de 2026 |
| Fecha del informe | 19 de noviembre de 2026 |
| Fecha de entrega del plan | 26 de noviembre de 2026 |

---

## 1. Resumen ejecutivo

Se ejecutaron los **29 casos de prueba** del plan sobre Metabase Open Source v0.64.1. Abarcan cinco categorías: funcionales, validación de entradas, manejo de errores, contrato de la API y rendimiento. Cada caso tiene automatización propia (Cypress, Postman/Newman, Apache JMeter o Chrome controlado por el Protocolo DevTools), evidencias y resultados nativos, y un reporte individual.

| Indicador | Resultado |
|---|---|
| Casos ejecutados | **29 de 29 (100 %)** |
| Aprobados | **28** |
| No aprobados | **1** (TC-REN-002) |
| Bloqueados / No ejecutados | 0 / 0 |
| Tasa de aprobación | **96,6 %** |
| Hallazgos confirmados | **2**, ambos de rendimiento (severidad Media y Baja); ninguno crítico ni alto |
| Defectos funcionales | **0** |

**Conclusiones principales:**

1. **Las funcionalidades principales cumplen lo esperado.** Todos los casos funcionales, de validación, de manejo de errores y de contrato están aprobados. Cubren el inicio de sesión, las consultas gráficas y SQL, las visualizaciones, los dashboards y sus filtros, las colecciones y la API REST. Los resultados coinciden con valores de referencia calculados de forma independiente sobre la fuente de datos.
2. **El rendimiento es adecuado en régimen estable, pero el arranque en frío es lento y las mediciones varían.** Cuatro de los cinco casos de rendimiento cumplen sus umbrales. El incumplimiento se concentra **al inicio de las series y en la variabilidad entre ejecuciones**: el dashboard de tres visualizaciones no cumple de forma consistente su umbral de 6000 ms (H-002), y la primera consulta individual superó una vez los 3000 ms (H-001).
3. **El plan esperaba un código HTTP que la versión evaluada no devuelve.** Para las consultas, el plan espera `200 OK`; Metabase v0.64.1 responde **`202 Accepted`** por diseño, porque envía los resultados en *streaming*, y la consulta se completa correctamente. El equipo lo trató como una diferencia del plan con la versión instalada y no como un defecto: se acepta 200 o 202 siempre que el cuerpo indique `status = "completed"` (§6.1).
4. **Queda pendiente un criterio de finalización:** las ocho verificaciones complementarias de seguridad funcional e integración que el plan describe sin identificador. Varios casos aportan evidencia parcial de ellas, pero no se ejecutaron ni registraron de forma independiente (§4 y §9).

**Recomendación: Go**, limitada al alcance, a las funcionalidades y al ambiente del plan, y **condicionada** a completar las verificaciones complementarias antes del cierre (§10).

---

## 2. Objetivo y alcance de la evaluación

El plan define el objetivo de *evaluar la funcionalidad, confiabilidad, consistencia de la información, control de acceso y eficiencia de desempeño de Metabase*. Se aplica sobre sus principales funcionalidades y servicios, con condiciones de operación válidas e inválidas, solicitudes repetitivas y cargas controladas.

**Dentro del alcance:** autenticación, consultas con el editor gráfico y SQL, visualización de datos, dashboards y sus filtros, colecciones, usuarios y permisos, API REST y conexión con la fuente de datos.

**Fuera del alcance (según el plan):**
- cobertura de código fuente: la evaluación es de caja negra;
- pruebas de penetración y auditorías especializadas de seguridad;
- validación de despliegues productivos: se usa una instalación controlada.

| Categoría | Casos | Herramientas | Qué evalúa |
|---|---|---|---|
| Funcionales | TC-FUN-001 a 010 | Cypress 16.2.1; Newman 6.2.2 | Operaciones principales por la interfaz web y la API |
| Validación de entradas | TC-VAL-001 a 005 | Cypress 16.2.1 | Datos válidos, inválidos, incompletos, inexistentes y con caracteres especiales |
| Manejo de errores | TC-ERR-001 a 005 | Postman + Newman | Recursos y endpoints inexistentes, formatos inválidos, métodos no admitidos, falta de autenticación |
| Contrato y consistencia | TC-CON-001 a 004 | Postman + Newman | Campos, tipos de datos, consistencia entre listado y detalle, estructura de resultados |
| Rendimiento | TC-REN-001 a 005 | Apache JMeter 5.6.3; Newman; Chrome (DevTools) | Latencia, percentiles, estabilidad, concurrencia y throughput |

---

## 3. Ambiente de pruebas

### 3.1 Instalaciones

Hay **dos instalaciones locales independientes**, una en el equipo de cada integrante, con la misma versión y la misma preparación. Cada caso se ejecutó en una de ellas. Los identificadores internos de Metabase (preguntas, dashboards, colecciones) son propios de cada instalación, por lo que los scripts los leen de un archivo de configuración local y nunca los fijan en el código.

| Elemento | Instalación A (casos TC-FUN y TC-VAL) | Instalación B (casos TC-ERR, TC-CON y TC-REN) |
|---|---|---|
| Sistema operativo | Windows 11 | Windows 11 |
| Procesador / memoria | Intel Core i5-11400H, 7,6 GB | AMD Ryzen 5 4600H (6 núcleos / 12 hilos), 7,4 GiB |
| Docker | Docker Desktop (WSL 2); 12 CPU y 3,7 GB asignados | Docker Desktop; 12 CPU y 3,5 GiB asignados |
| Metabase | v0.64.1, contenedor con volumen persistente y puerto publicado solo en `127.0.0.1` | v0.64.1, mismo procedimiento |
| Base de datos de la aplicación | H2 embebida, en el volumen | H2 embebida, en el volumen |
| Fuente de datos evaluada | Sample Database incluida en Metabase | Sample Database incluida en Metabase |
| Idioma de la interfaz | Español | Español |

La Sample Database contiene, entre otras tablas, 18.760 pedidos (`ORDERS`), 200 productos (`PRODUCTS`) en 4 categorías y personas (`PEOPLE`). En v0.64.1 funciona con el **controlador SQLite**: las tablas se consultan sin el prefijo `PUBLIC.` de versiones anteriores (§8).

El procedimiento de instalación, la configuración, los usuarios, los permisos y los recursos de referencia están en el [informe de preparación del ambiente](../../docs/INFORME-PREPARACION-AMBIENTE-QA.md).

### 3.2 Herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Cypress | 16.2.1 (Electron 146) | Escenarios de interfaz: TC-FUN-001 a 008, TC-FUN-010 (complementario) y TC-VAL |
| Node.js | 22.15.1 | Entorno de Cypress, Newman y del medidor de TC-REN-002 |
| Newman + htmlextra | 6.2.2 + 1.23.1 | Colecciones de Postman: TC-FUN-009 y 010, TC-ERR, TC-CON y TC-REN-003 |
| Apache JMeter | 5.6.3 (Java 21.0.9) | TC-REN-001, 004 y 005 |
| Chrome + puppeteer-core | 156.0.8078.80 + 23.11.1 | Medición de carga del dashboard (TC-REN-002) |

Todas las ejecuciones formales se lanzan con `scripts/ejecutar-herramienta.ps1`. El script:
- inicia la sesión de Metabase fuera de la herramienta, sin entregarle la contraseña cuando no la necesita;
- entrega los identificadores locales;
- cierra la sesión al terminar;
- redacta tokens, cookies y correos en los reportes generados.

Antes de versionar cualquier resultado se ejecuta `scripts/revisar-secretos.ps1`.

### 3.3 Cuentas utilizadas

- **Cuenta administradora:** preparación del ambiente, pruebas de manejo de errores (salvo TC-ERR-005, que se ejecuta sin sesión), contrato y rendimiento.
- **Cuenta normal (Usuario QA), sin privilegios de administración:** pruebas funcionales y de validación por la interfaz y la API, y consultas de TC-FUN-009 y 010.

---

## 4. Cumplimiento de los criterios del plan

### 4.1 Criterios de inicio

| Criterio | Estado | Evidencia |
|---|---|---|
| Plataforma instalada, configurada y accesible | Cumplido | `scripts/verificar-ambiente.ps1`: `/api/health` = 200 y `version.tag` = `v0.64.1` |
| Versión definida y constante | Cumplido | Imagen con etiqueta fija `v0.64.1` en ambas instalaciones |
| Documentación de la versión revisada | Cumplido | Endpoints contrastados con el código fuente de la etiqueta `v0.64.1` ([CONFIGURACION-QA.md §7](../../docs/CONFIGURACION-QA.md)) |
| Casos diseñados y revisados | Cumplido | `pruebas/<categoría>/<ID>/caso.md` para los 29 casos |
| Herramientas configuradas | Cumplido | Versiones de §3.2 |
| Datos de prueba disponibles | Cumplido | Colección `QA - Metabase`, cinco preguntas de referencia, dashboard principal con tres visualizaciones y un filtro, dashboard restringido |
| Usuarios y permisos configurados | Cumplido | Cuenta administradora y cuenta normal con permisos diferenciados |
| Conectividad y funcionamiento básico verificados | Cumplido | Verificación del ambiente y consultas de referencia sobre la Sample Database |
| Condiciones de rendimiento establecidas | Cumplido | Recursos de Docker registrados; piloto con decisiones sobre caché, sesión, *ramp-up* y percentiles ([RENDIMIENTO-V0.64.1.md §3](../../docs/RENDIMIENTO-V0.64.1.md)) |

### 4.2 Criterios de finalización

| Criterio del plan | Estado | Resultado |
|---|---|---|
| 100 % de TC-FUN y TC-ERR ejecutados | **Cumplido** | 10/10 TC-FUN y 5/5 TC-ERR ejecutados y aprobados |
| ≥ 95 % de los 29 casos ejecutados (mínimo 28) | **Cumplido** | 29/29 (100 %) |
| Resultados documentados con estado identificable | **Cumplido** | Cada caso tiene estado, reporte, evidencias y resultados nativos |
| Hallazgos registrados y clasificados | **Cumplido** | 2 hallazgos con descripción, severidad, condiciones de reproducción y evidencia |
| Funcionamiento de los procesos principales verificado | **Cumplido** | Autenticación, consultas, visualización, dashboards y colecciones conformes (§5.1) |
| Contrato de API evaluado (TC-CON-001 a 004) | **Cumplido** | 4/4 aprobados |
| Verificaciones de seguridad funcional e integración documentadas | **Pendiente** | Las 8 verificaciones complementarias figuran como *No ejecutado* en [verificaciones-complementarias.csv](../verificaciones-complementarias/verificaciones-complementarias.csv). Hay evidencia parcial en casos ya ejecutados (§9) |
| TC-REN-001: tiempo < 3000 ms | **Cumplido** | 1133 ms en la ejecución vigente; la primera ejecución en frío midió 3659 ms (H-001) |
| TC-REN-002: 10 cargas completas y ≥ 9 < 6000 ms | **No cumplido** | 10/10 completas, pero solo 8/10 < 6000 ms en la vigente; el umbral se cumplió en 1 de 3 ejecuciones (H-002) |
| TC-REN-003: 30 solicitudes exitosas y P95 < 4000 ms | **Cumplido** | 30/30; P95 = 1734 ms |
| TC-REN-004: 50 solicitudes, 5 usuarios, P95 < 6000 ms y 0 % de errores | **Cumplido** | 50/50; P95 = 2870 ms; 0 % de errores |
| TC-REN-005: throughput ≥ 90 % de la línea base y 0 % de errores | **Cumplido** | 106,4 % de la línea base; 0 % de errores |
| Informe final elaborado | **Cumplido** | Este documento |

---

## 5. Resultados por categoría

### 5.1 Pruebas funcionales (10/10 aprobadas)

Todos los casos se ejecutaron por la interfaz web con la cuenta normal, salvo TC-FUN-009 y 010, que se ejecutaron por la API. El resultado se comparó siempre con una referencia independiente: una consulta SQL sobre la fuente o la consulta original.

| Caso | Escenario | Resultado obtenido | Estado |
|---|---|---|---|
| [TC-FUN-001](../../pruebas/funcionales/TC-FUN-001/reporte.md) | Inicio de sesión con credenciales válidas | `POST /api/session` = 200 desde el formulario; acceso a la página autenticada con la sesión de Usuario QA (no administrador) | Aprobado |
| [TC-FUN-002](../../pruebas/funcionales/TC-FUN-002/reporte.md) | Consulta con el editor gráfico | Orders con `Subtotal > 100`: la consulta enviada es la construida; 2.000 filas mostradas (límite de la interfaz), ninguna ≤ 100. En la fuente cumplen 5.244 de 18.760 | Aprobado |
| [TC-FUN-003](../../pruebas/funcionales/TC-FUN-003/reporte.md) | Consulta SQL | `SELECT COUNT(*) AS total_pedidos FROM orders;` = **18.760**, igual a la referencia independiente | Aprobado |
| [TC-FUN-004](../../pruebas/funcionales/TC-FUN-004/reporte.md) | Guardado y recuperación de una pregunta | Pregunta (Products, `Category = Gadget`) guardada y reabierta desde la colección: conserva fuente, filtro y visualización, con los mismos **53** registros que la consulta original | Aprobado |
| [TC-FUN-005](../../pruebas/funcionales/TC-FUN-005/reporte.md) | Visualización gráfica | Barras por categoría con **42 / 53 / 51 / 54** (Doohickey, Gadget, Gizmo, Widget). Se verificaron la altura de cada barra con la escala del eje, los *tooltips*, la tabla y la referencia SQL | Aprobado |
| [TC-FUN-006](../../pruebas/funcionales/TC-FUN-006/reporte.md) | Creación de dashboard | Dashboard creado, con la pregunta de categorías incorporada; guardado y reabierto conserva nombre, tarjeta y datos (42 / 53 / 51 / 54) | Aprobado |
| [TC-FUN-007](../../pruebas/funcionales/TC-FUN-007/reporte.md) | Filtros en dashboard | Filtro *Categoría* vinculado a tres visualizaciones. Con *Gadget*: recuento 53, promedio 56,97 y 53 productos, iguales a la referencia SQL. Al quitarlo vuelve el estado inicial | Aprobado |
| [TC-FUN-008](../../pruebas/funcionales/TC-FUN-008/reporte.md) | Creación y organización de colecciones | Subcolección creada y pregunta **trasladada, no copiada**: mismo ID y fecha de creación, 200 registros antes y después, y ya no aparece en el origen | Aprobado |
| [TC-FUN-009](../../pruebas/funcionales/TC-FUN-009/reporte.md) | Dashboard por la API (`GET /api/dashboard/{id}`) | HTTP 200, JSON válido, ID y nombre correctos, 3 tarjetas y 1 filtro; 430 ms; 7/7 aserciones | Aprobado |
| [TC-FUN-010](../../pruebas/funcionales/TC-FUN-010/reporte.md) | Pregunta guardada por la API (`POST /api/card/{id}/query`) | HTTP 202 con `status = completed`; `total_pedidos` = **18.760**, igual en la interfaz y en la fuente; 8/8 aserciones en Newman y 4/4 en Cypress | Aprobado |

**Análisis.** Las operaciones principales son correctas y los datos coinciden entre la fuente, el motor de consultas, la API y la representación visual. En TC-FUN-005 y 007 no se aceptó la mera presencia de un gráfico: se extrajeron los valores representados (geometría de las barras, *tooltips*, tablas) y se compararon con la referencia. TC-FUN-004, 006 y 008 comprobaron que los recursos guardados conservan su definición al reabrirse. TC-FUN-008 comprobó además que mover un recurso no lo duplica.

### 5.2 Validación de entradas (5/5 aprobadas)

| Caso | Entrada | Comportamiento observado | Estado |
|---|---|---|---|
| [TC-VAL-001](../../pruebas/validacion/TC-VAL-001/reporte.md) | Valor válido: `Subtotal > 100` | Aceptado sin error; la consulta usa un valor numérico; ninguna fila incumple el filtro | Aprobado |
| [TC-VAL-002](../../pruebas/validacion/TC-VAL-002/reporte.md) | `abc` en un filtro numérico | El campo admite el texto, pero *Añadir filtro* sigue deshabilitado y Enter no aplica nada; no se envía ninguna consulta con `abc` ni hay errores | Aprobado |
| [TC-VAL-003](../../pruebas/validacion/TC-VAL-003/reporte.md) | Contraseña vacía en el inicio de sesión | Botón deshabilitado; al intentar enviar aparece *Obligatorio*. No se envía `POST /api/session`, no se crea sesión y los recursos protegidos responden 401 | Aprobado |
| [TC-VAL-004](../../pruebas/validacion/TC-VAL-004/reporte.md) | Valor inexistente `QA_VALOR_INEXISTENTE_2026` | Consulta completada sin error, con **0 filas** y el mensaje *Sin resultados*; se comprobó antes que el valor no existe en la fuente | Aprobado |
| [TC-VAL-005](../../pruebas/validacion/TC-VAL-005/reporte.md) | Nombre `Análisis de ventas & costos (2026)` | Nombre idéntico, carácter por carácter, en el formulario, la API, el título, la colección, la pestaña y al reabrir; sin `&amp;` ni truncamiento | Aprobado |

**Análisis.** Metabase rechaza los datos inválidos o incompletos antes de enviarlos al servidor, trata la ausencia de resultados como un estado normal y conserva los caracteres especiales sin alterarlos. Se registraron dos **observaciones de usabilidad** que no son defectos (§7.2).

### 5.3 Manejo de errores (5/5 aprobadas)

| Caso | Solicitud | Esperado (plan) | Obtenido | Estado |
|---|---|---|---|---|
| [TC-ERR-001](../../pruebas/errores/TC-ERR-001/reporte.md) | `GET /api/dashboard/100001` (ID inexistente) | 404 | 404, *No encontrado.* | Aprobado |
| [TC-ERR-002](../../pruebas/errores/TC-ERR-002/reporte.md) | `GET /api/dashboard/abc` | 400 o 404 | 404, *El endpoint de API no existe.* | Aprobado |
| [TC-ERR-003](../../pruebas/errores/TC-ERR-003/reporte.md) | `GET /api/recurso-inexistente` | 404 | 404, *El endpoint de API no existe.* | Aprobado |
| [TC-ERR-004](../../pruebas/errores/TC-ERR-004/reporte.md) | `GET /api/session` (método no admitido) | 404 o 405 | 404, *El endpoint de API no existe.* | Aprobado |
| [TC-ERR-005](../../pruebas/errores/TC-ERR-005/reporte.md) | `GET /api/dashboard/{id}` de un dashboard privado, sin sesión | 401 | 401, *Unauthenticated* | Aprobado |

**Análisis.** Los códigos son coherentes y no exponen información interna. Para un identificador con formato inválido y para un método no admitido, v0.64.1 responde 404 y no 400 o 405: la validación de rutas descarta la solicitud antes de llegar al controlador. El plan admite ambos códigos en esos dos casos.

### 5.4 Contrato y consistencia (4/4 aprobadas)

| Caso | Endpoint | Resultado obtenido | Estado |
|---|---|---|---|
| [TC-CON-001](../../pruebas/contrato/TC-CON-001/reporte.md) | `GET /api/dashboard/{id}` | 200; esquema válido; ID y nombre correctos; 3 tarjetas y 1 filtro; 10/10 aserciones | Aprobado |
| [TC-CON-002](../../pruebas/contrato/TC-CON-002/reporte.md) | `GET /api/card/{id}` | 200; `id` entero, `name` y `display` cadenas, `dataset_query` objeto; 12/12 aserciones | Aprobado |
| [TC-CON-003](../../pruebas/contrato/TC-CON-003/reporte.md) | `GET /api/card` y `GET /api/card/{id}` | 200 y 200; 46 campos comunes equivalentes entre listado y detalle; 14/14 aserciones | Aprobado |
| [TC-CON-004](../../pruebas/contrato/TC-CON-004/reporte.md) | `POST /api/card/{id}/query` | 202 con `status = completed`; `data.rows` y `data.cols` correctos; filas coherentes con la consulta (`SUBTOTAL > 100`) | Aprobado |

**Análisis.** Los endpoints seleccionados devuelven estructuras estables y tipos correctos. El listado y el detalle de una pregunta solo difieren en la representación de los subcampos `creator` y `collection`. El plan no enumera los campos exigidos, así que el equipo definió el contrato verificado a partir del código fuente de v0.64.1 ([CONTRATOS-API-V0.64.1.md](../../docs/CONTRATOS-API-V0.64.1.md)).

En TC-CON-004, la consulta de apoyo de la primera ejecución falló por un defecto del propio script, no de Metabase. Esa ejecución se conservó como no válida y la vigente es la segunda. En ella falla una sola aserción, la del código 200 del plan, que no determina el resultado (§6.1).

### 5.5 Rendimiento (4/5 aprobadas)

Todas las consultas se enviaron con `{"ignore_cache": true}`, de modo que cada solicitud mide la ejecución real de la consulta. Los percentiles se calcularon por el método *nearest-rank* con `scripts/calcular-metricas-rendimiento.ps1`. El generador de carga y Metabase comparten el mismo equipo.

| Caso | Perfil | Métricas (ejecución vigente) | Umbral | Estado |
|---|---|---|---|---|
| [TC-REN-001](../../pruebas/rendimiento/TC-REN-001/reporte.md) | 1 consulta (con preparación previa) | **1133 ms** (-03). Anteriores: 3659 ms (-01, en frío) y 2028 ms (-02) | < 3000 ms | Aprobado |
| [TC-REN-002](../../pruebas/rendimiento/TC-REN-002/reporte.md) | 10 cargas del dashboard (3 visualizaciones) | 10/10 completas; **8/10 < 6000 ms**; mediana 4031 ms; máximo 9948 ms | ≥ 9/10 < 6000 ms | **No aprobado** |
| [TC-REN-003](../../pruebas/rendimiento/TC-REN-003/reporte.md) | 30 solicitudes secuenciales | 30/30; **P95 1734 ms**; media 814,9; mediana 727; máximo 3580 | P95 < 4000 ms, 100 % exitosas | Aprobado |
| [TC-REN-004](../../pruebas/rendimiento/TC-REN-004/reporte.md) | 5 usuarios × 10 iteraciones | 50/50; **P95 2870 ms** (JMeter, interpolado: 2999,6); 0 % de errores; 3,44 req/s | P95 < 6000 ms, 0 % de errores | Aprobado |
| [TC-REN-005](../../pruebas/rendimiento/TC-REN-005/reporte.md) | 5 usuarios durante 60 s | Línea base 2,382 req/s; comparada **2,535 req/s (106,4 %)**; 0 % de errores | ≥ 90 % de la línea base, 0 % de errores | Aprobado |

**Detalle de TC-REN-002** (tiempos de carga en ms, en orden):

| Ejecución | Cargas 1 a 10 | < 6000 ms | Media | Mediana | Máximo |
|---|---|---|---|---|---|
| -01 | — | 6/10 | 5811,8 | 5016,5 | 9604 |
| -02 | — | 9/10 | 4412,3 | 4381,5 | 7067 |
| -03 (vigente) | 9948 · 6348 · 4095 · 4054 · 3976 · 3906 · 3755 · 3590 · 4008 · 4601 | 8/10 | 4828,1 | 4031 | 9948 |

**Análisis.**

- **Régimen estable.** La API procesa consultas de forma estable y sin errores. Bajo concurrencia moderada (5 usuarios), el P95 queda en menos de la mitad del umbral (2870 ms frente a 6000), y el throughput sostenido no se degrada respecto de la línea base.
- **Arranque en frío.** Todos los incumplimientos aparecen en las primeras solicitudes tras un periodo de inactividad:
  - en TC-REN-002, la carga más lenta de las ejecuciones 02 y 03 fue la primera (7.067 y 9.948 ms), y de la tercera carga en adelante todas quedaron por debajo de 6000 ms. En la ejecución 01 hubo cargas lentas a lo largo de toda la serie: cuatro superaron los 6000 ms (la 1, la 3, la 4 y la 8) y la más lenta fue la octava (9.604 ms);
  - en TC-REN-003, las primeras 7 solicitudes llegaron hasta 3580 ms, y después los tiempos se estabilizaron entre 197 y 619 ms;
  - en TC-REN-001, la primera ejecución del día midió 3659 ms.
- **Causa probable del arranque en frío.** El calentamiento de la máquina virtual de Java (JIT) y de las cachés de la base de datos de ejemplo. No explica por sí solo la ejecución 01 de TC-REN-002, con cargas lentas también a mitad de la serie: ahí influye además la carga del equipo, que comparte CPU y memoria con el navegador que mide (§9).
- **Tamaño de la consulta de referencia.** La consulta P1 devuelve 2.000 filas (unos 290 KB): es sencilla en lógica, pero no ligera. Si el umbral de 3000 ms se pensó para una consulta más pequeña, conviene revisarlo.
- **Estado de TC-REN-002.** El caso queda **No aprobado** con la ejecución vigente, porque el umbral solo se cumplió en una de tres ejecuciones (9/10 en la -02).

### 5.6 Métricas del plan

| Métrica | Fórmula del plan | Resultado |
|---|---|---|
| Cobertura de ejecución | Ejecutados / planificados × 100 | 29 / 29 = **100 %** (objetivo ≥ 95 %) |
| Tasa de aprobación | Aprobados / (Aprobados + No aprobados) × 100 | 28 / 29 = **96,6 %** |
| Degradación de throughput (TC-REN-005) | (Base − Actual) / Base × 100 | (2,382 − 2,535) / 2,382 = **−6,4 %**: no hay degradación (tolerancia 10 %) |
| Degradación de latencia P95 (TC-REN-005, condiciones equivalentes) | (P95 actual − P95 base) / P95 base × 100 | (3865 − 5652) / 5652 = **−31,6 %**: la ejecución comparada fue más rápida |

**Distribución de resultados por categoría:**

| Categoría | Casos | Aprobados | No aprobados | Bloqueados | No ejecutados | Tasa de aprobación |
|---|---|---|---|---|---|---|
| Funcionales | 10 | 10 | 0 | 0 | 0 | 100 % |
| Validación de entradas | 5 | 5 | 0 | 0 | 0 | 100 % |
| Manejo de errores | 5 | 5 | 0 | 0 | 0 | 100 % |
| Contrato y consistencia | 4 | 4 | 0 | 0 | 0 | 100 % |
| Rendimiento | 5 | 4 | 1 | 0 | 0 | 80 % |
| **Total** | **29** | **28** | **1** | **0** | **0** | **96,6 %** |

**Frecuencia de hallazgos por componente:**

| Componente | Casos ejecutados | Hallazgos confirmados | Hallazgos por caso |
|---|---|---|---|
| Autenticación | 3 (TC-FUN-001, TC-VAL-003, TC-ERR-005) | 0 | 0 |
| Consultas (editor gráfico, SQL y filtros) | 6 (TC-FUN-002, 003, 005; TC-VAL-001, 002, 004) | 0 | 0 |
| Dashboards | 4 (TC-FUN-006, 007; TC-REN-002; TC-CON-001) | 1 (H-002) | 0,25 |
| Colecciones y preguntas guardadas | 3 (TC-FUN-004, 008; TC-VAL-005) | 0 | 0 |
| Servicios REST | 13 (TC-FUN-009, 010; TC-ERR; TC-CON-002 a 004; TC-REN-001, 003 a 005) | 1 (H-001) | 0,08 |

Hallazgos detectados frente a confirmados: los dos hallazgos se reprodujeron en varias ejecuciones (tres en cada caso), así que se descartan problemas temporales del ambiente.

---

## 6. Diferencias con el plan y decisiones del equipo

### 6.1 Código HTTP de las consultas (error del plan, no hallazgo)

El plan espera `200 OK` en `POST /api/card/{id}/query`, en TC-FUN-010, TC-CON-004, TC-REN-001, 003, 004 y 005. Metabase v0.64.1 envía los resultados de las consultas en *streaming*, y la función genérica de streaming establece **`202 Accepted`** por defecto (`server/streaming_response.clj`). Así lo previó la revisión del código fuente y lo confirmaron:
- las dos instalaciones;
- todas las ejecuciones de esos casos;
- la propia interfaz web, que recibe 202 al mostrar cualquier pregunta.

La consulta se completa correctamente y el cuerpo indica `status = "completed"`.

El plan prevé este riesgo (*"Diferencias entre los contratos de la API y la versión instalada"*) e indica ajustar los casos cuando se identifiquen diferencias documentadas. El **5 de noviembre de 2026** el equipo decidió aceptar como éxito, en los endpoints de consulta, **HTTP 200 o 202 siempre que el cuerpo tenga `status = "completed"`** ([CONFIGURACION-QA.md §7](../../docs/CONFIGURACION-QA.md)).

- **TC-FUN-010** se ejecutó ya con este criterio.
- **TC-CON-004 y TC-REN-001, 003, 004 y 005** se habían ejecutado antes de la decisión y figuraban como *No aprobado* únicamente por el código. El 19 de noviembre se **reevaluaron como Aprobados** con la evidencia existente, sin repetir las ejecuciones ni modificar los resultados nativos.

Antes de la reevaluación se comprobó en los resultados nativos que la condición se cumple en todas las solicitudes:

| Caso | Evidencia comprobada |
|---|---|
| TC-REN-003 | 30/30 respuestas 202 con `status = completed` y `data.rows` |
| TC-REN-004 | 50/50, con las mismas aserciones superadas |
| TC-REN-005 | 298/298 entre la línea base y la comparada |
| TC-CON-004 | Solo falla la aserción del código 200 |

El texto del plan no se modificó.

### 6.2 Otras desviaciones documentadas

| Desviación | Motivo | Impacto en los resultados |
|---|---|---|
| **Asignación de casos.** El plan v1.0 asignaba TC-FUN, TC-VAL, TC-ERR y TC-CON a un integrante y TC-REN al otro; el 2026-11-05 el equipo acordó ejecutar TC-FUN y TC-VAL en la instalación A, y TC-ERR, TC-CON y TC-REN en la B | Reparto del trabajo entre dos instalaciones independientes | Ninguno: misma versión, mismos datos y misma preparación |
| **Fechas.** Todos los casos se ejecutaron el 2026-11-05, antes de las fechas del cronograma (9 a 19 de noviembre) | Ambiente y automatización disponibles antes de lo previsto | Deja margen para la consolidación y la reevaluación |
| **TC-VAL-004.** El valor inexistente se buscó en `People.Name` en lugar de `Products.Title` | En v0.64.1 todos los campos de texto de `Products` usan una lista cerrada de valores en el operador *Es*, que no permite escribir un valor libre | Ninguno: el escenario del plan (filtro con un valor inexistente que devuelve 0 filas sin error) se evaluó en un campo de texto equivalente. También se documentó el comportamiento en `Products.Title` |
| **TC-REN-002.** La medición se automatizó con Chrome *headless* por el Protocolo DevTools, en lugar de usar las herramientas de desarrollador manualmente | Repetibilidad y medición objetiva del fin de la carga | Mide desde el inicio de la navegación hasta que las 3 consultas terminan y las 3 visualizaciones se muestran |
| **TC-REN-001 y 002.** Se hicieron tres ejecuciones de cada uno | La primera incumplió el umbral; la repetición no coincidió y se hizo una tercera para desempatar | Se conservan las tres; vigente: la tercera |
| **TC-FUN-010.** Se añadió una ejecución complementaria con Cypress | Comparar el valor de la API con el que muestra la interfaz | Refuerza la verificación de integración entre interfaz y API |
| **TC-CON.** El contrato verificado lo definió el equipo | El plan no enumera los campos estructurales esperados | Contrato documentado en [CONTRATOS-API-V0.64.1.md](../../docs/CONTRATOS-API-V0.64.1.md) |

---

## 7. Hallazgos

### 7.1 Hallazgos confirmados

Registro completo en [registro-hallazgos.csv](../registro-hallazgos.csv).

| ID | Caso | Componente | Descripción | Severidad | Reproducción | Estado |
|---|---|---|---|---|---|---|
| **H-001** | TC-REN-001 | Rendimiento: `POST /api/card/{id}/query` | El tiempo de una consulta sencilla varía mucho entre ejecuciones. La primera tras un periodo de inactividad midió **3659 ms** y superó el umbral de 3000 ms; las siguientes, 2028 y 1133 ms. Las solicitudes de preparación midieron 8567, 5306 y 886 ms | **Baja** | 3 ejecuciones el mismo día, 1 usuario, `ignore_cache = true` | Abierto |
| **H-002** | TC-REN-002 | Rendimiento: carga de dashboard | El umbral de carga del dashboard con tres visualizaciones (≥ 9 de 10 cargas < 6000 ms) **no se cumple de forma consistente**: 6/10, 9/10 y 8/10 en tres ejecuciones. En las ejecuciones 02 y 03 la carga más lenta fue la primera; en la 01 hubo cargas lentas en toda la serie (máximo 9604 ms, en la octava). Máximo global: 9948 ms | **Media** | 3 ejecuciones de 10 cargas secuenciales, Chrome con caché vacía en cada carga | Abierto |

**Clasificación por severidad:** crítica 0 · alta 0 · media 1 · baja 1.

La causa probable de ambos es el calentamiento del servicio tras un periodo de inactividad, sumado a la variabilidad de un ambiente donde el generador de carga y Metabase comparten el equipo. Afectan a la experiencia de las primeras solicitudes, no a la corrección de los resultados: todas las cargas y consultas terminaron correctamente y con los datos esperados.

### 7.2 Observaciones que no son defectos

| Caso | Observación |
|---|---|
| TC-VAL-002 | Al escribir `abc` en un filtro numérico no se muestra ningún mensaje de validación ni se marca el campo como inválido; la única señal es que el botón *Añadir filtro* queda deshabilitado. Es una oportunidad de mejora de usabilidad, no un fallo: el valor inválido nunca se envía |
| TC-VAL-004 | La píldora del filtro muestra el operador sin traducir (*Name is …*) aunque la interfaz está en español |
| TC-VAL-004 | Los campos de texto de `Products` solo admiten valores de una lista cerrada en el operador *Es*. Es un comportamiento de diseño de la versión |
| TC-ERR-002 y 004 | Un identificador con formato inválido y un método no admitido responden 404 en lugar de 400 o 405. El plan admite ambos códigos |

---

## 8. Riesgos materializados

| Riesgo del plan | ¿Se materializó? | Consecuencia | Medida adoptada |
|---|---|---|---|
| Diferencias entre los contratos de la API y la versión instalada | **Sí** | Código 202 en lugar del 200 esperado por el plan | Decisión documentada del equipo (§6.1); reevaluación de los casos afectados |
| Variaciones de rendimiento por recursos del ambiente o caché | **Sí** | Tiempos dispersos en las primeras solicitudes (H-001 y H-002) | Caché de consultas desactivada (`ignore_cache`), comprobación de reposo antes de medir, repetición de mediciones y registro de todas |
| Falsos resultados negativos por errores en los scripts o datos | **Sí** | Varias ejecuciones de ensayo fallaron por el script, no por Metabase (por ejemplo, la consulta de apoyo de TC-CON-004 -01) | Las ejecuciones no válidas se distinguieron de los defectos; se conserva una ejecución oficial por caso y, si hay varias, se indica la vigente |
| Fallos de conexión con la fuente de datos | Parcialmente | Las consultas de referencia de la documentación usaban el prefijo `PUBLIC.` (motor H2) y fallaban con `no such table`, porque la Sample Database de v0.64.1 usa SQLite | Consultas sin prefijo; la documentación de referencia debe actualizarse (§9) |
| Pérdida o inconsistencia de evidencias | Riesgo controlado | Los reportes nativos de Newman guardaban en bytes datos sensibles de las respuestas (correos de usuarios y cookies de dispositivo) | Redacción automática en `ejecutar-herramienta.ps1`; detección en `revisar-secretos.ps1`; sanitización documentada de tres reportes previos, con respaldo y verificación de integridad |
| Configuración incorrecta de usuarios y permisos | No | — | Cuentas con permisos diferenciados verificadas antes de ejecutar |
| Indisponibilidad de Metabase | No | — | Verificación del ambiente antes de cada sesión |
| Defectos críticos en las últimas fases | No | — | — |

---

## 9. Limitaciones de la evaluación

1. **Verificaciones complementarias pendientes.** Las ocho verificaciones de seguridad funcional (autenticación, control de acceso, acceso sin autorización, finalización de sesión) e integración (interfaz y API, Metabase y fuente de datos, consultas y dashboards, filtros y visualizaciones) no se ejecutaron ni registraron de forma independiente. Los casos ya ejecutados aportan evidencia parcial:
   - **Acceso sin autorización:** TC-ERR-005 y TC-VAL-003 (401 sin sesión).
   - **Interfaz y API:** TC-FUN-010, donde la API y la interfaz dan el mismo valor.
   - **Metabase y fuente de datos:** TC-FUN-002, 003 y 005, contra la referencia SQL.
   - **Consultas y dashboards:** TC-FUN-006.
   - **Filtros y visualizaciones:** TC-FUN-007.

   **Sin evidencia** quedan dos verificaciones: el **control de acceso por permisos** (que la cuenta normal no acceda a la colección restringida) y la **finalización de sesión** (que un token cerrado deje de ser válido).
2. **Escenarios del alcance sin caso en el plan.** El alcance menciona credenciales inválidas, consultas inválidas y el cierre de sesión, pero ninguno de los 29 casos los evalúa directamente.
3. **Generador de carga en el mismo equipo.** En las pruebas de rendimiento, JMeter, Newman y Chrome compiten por CPU y memoria con Metabase. Las cifras valen para este ambiente y no deben extrapolarse a un servidor dedicado.
4. **Ambiente de un solo nodo con H2.** Metabase usa su base de datos embebida H2, recomendada solo para evaluación. No se evaluó una base de aplicación PostgreSQL o MySQL ni un despliegue productivo (fuera de alcance según el plan).
5. **Dos instalaciones.** Cada caso se ejecutó en una de las dos instalaciones equivalentes, no en ambas. Las mediciones de rendimiento corresponden a un único equipo.
6. **Límite de 2.000 filas en la interfaz.** Las consultas con más resultados (por ejemplo, 5.244 pedidos con `Subtotal > 100`) se verificaron sobre las filas mostradas y contra el recuento de la fuente. Se aceptó el límite de visualización de Metabase.
7. **Reevaluación documental.** Cinco casos se reevaluaron con la evidencia existente tras la decisión sobre el código 202, sin repetir la ejecución.

**Pendientes documentales y operativos (no afectan a los resultados):**
- registrar los valores de referencia de 18.760 pedidos y 42 / 53 / 51 / 54 productos por categoría;
- corregir el prefijo `PUBLIC.` en `recursos-compartidos/datos/valores-referencia.csv` y en la guía de datos;
- enviar a la papelera los recursos sobrantes de ejecuciones de ensayo de la instalación A:
  - preguntas 72, 73 y 75;
  - dashboards 34 y 36;
  - colección 36.

---

## 10. Conclusiones y recomendación

**Funcionalidad.** Metabase v0.64.1 cumple los comportamientos esperados en todas las operaciones evaluadas: autenticación, consultas gráficas y SQL, visualización, dashboards, filtros, colecciones y API REST. No se encontraron defectos funcionales. Los resultados son coherentes entre la fuente de datos, el motor de consultas, la API y la representación visual.

**Validación y manejo de errores.** Las entradas inválidas o incompletas se bloquean antes de enviarse. Los valores inexistentes se tratan como resultados vacíos sin error, los caracteres especiales se conservan íntegros y los errores de la API devuelven códigos coherentes sin exponer información interna. Solo se observaron mejoras menores de usabilidad.

**Contrato.** Los endpoints evaluados devuelven estructuras y tipos estables y consistentes entre sí. La única diferencia con el plan, el código 202, es de la especificación y no del sistema.

**Rendimiento.** El servicio es estable y no se degrada bajo concurrencia moderada ni carga sostenida. La debilidad está en el **arranque en frío** y en la **variabilidad** de las mediciones: las primeras solicitudes tras la inactividad son lentas, y la carga del dashboard no cumple de forma consistente el umbral de 6000 ms (H-002, severidad media).

### Recomendación: **Go**

La recomendación se limita a las funcionalidades, las condiciones y el ambiente del plan. Se sustenta en que las funcionalidades principales cumplen sus resultados esperados y en que **no hay defectos críticos ni altos pendientes**. Los dos hallazgos abiertos son de rendimiento (arranque en frío y variabilidad) y no comprometen la operación ni la corrección de los datos.

Antes del cierre (26 de noviembre de 2026) deben cumplirse estas **condiciones**:

1. **Ejecutar y registrar las ocho verificaciones complementarias**, en especial el control de acceso por permisos y la finalización de sesión, que no tienen evidencia (§9). Es el único criterio de finalización pendiente. Si alguna revelara un fallo de control de acceso, la recomendación debería revisarse.

Además, se proponen estas **recomendaciones**:

2. **Mitigar o ratificar el umbral de carga de dashboards (H-002):**
   - incorporar un calentamiento del servicio tras reinicios o inactividad;
   - o bien ratificar el umbral de 6000 ms para la primera carga con los datos de este informe;
   - repetir TC-REN-002 en condiciones calientes si se adopta un protocolo de calentamiento.
3. **Revisar el umbral de TC-REN-001 (H-001)** considerando que la consulta de referencia devuelve 2.000 filas.
4. **Actualizar el plan** en una versión futura:
   - aceptar 202 con `status = completed` como éxito de las consultas;
   - eliminar el prefijo `PUBLIC.` de las consultas de referencia;
   - añadir casos para credenciales inválidas, consultas inválidas y cierre de sesión.

---

## Anexo A. Trazabilidad de los 29 casos

Estado, ejecución vigente y rutas de cada caso en la [matriz de trazabilidad](../matriz-trazabilidad.csv). Las evidencias de cada caso están en `pruebas/<categoría>/<ID>/evidencias/<ejecución>/` y los resultados nativos en `pruebas/<categoría>/<ID>/resultados/<ejecución>/`.

| Caso | Herramienta | Ejecución vigente | Instalación | Estado |
|---|---|---|---|---|
| TC-FUN-001 | Cypress | 20261105-juan-03 | A | Aprobado |
| TC-FUN-002 | Cypress | 20261105-juan-03 | A | Aprobado |
| TC-FUN-003 | Cypress | 20261105-juan-04 | A | Aprobado |
| TC-FUN-004 | Cypress | 20261105-juan-11 | A | Aprobado |
| TC-FUN-005 | Cypress | 20261105-juan-12 | A | Aprobado |
| TC-FUN-006 | Cypress | 20261105-juan-04 | A | Aprobado |
| TC-FUN-007 | Cypress | 20261105-juan-07 | A | Aprobado |
| TC-FUN-008 | Cypress | 20261105-juan-06 | A | Aprobado |
| TC-FUN-009 | Newman | 20261105-juan-01 | A | Aprobado |
| TC-FUN-010 | Newman + Cypress | 20261105-juan-01 + 20261105-juan-02 | A | Aprobado |
| TC-VAL-001 | Cypress | 20261105-juan-01 | A | Aprobado |
| TC-VAL-002 | Cypress | 20261105-juan-01 | A | Aprobado |
| TC-VAL-003 | Cypress | 20261105-juan-01 | A | Aprobado |
| TC-VAL-004 | Cypress | 20261105-juan-01 | A | Aprobado |
| TC-VAL-005 | Cypress | 20261105-juan-01 | A | Aprobado |
| TC-ERR-001 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-ERR-002 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-ERR-003 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-ERR-004 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-ERR-005 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-CON-001 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-CON-002 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-CON-003 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-CON-004 | Newman | 20261105-samuel-02 | B | Aprobado |
| TC-REN-001 | JMeter | 20261105-samuel-03 | B | Aprobado |
| TC-REN-002 | Chrome (DevTools) | 20261105-samuel-03 | B | No aprobado (H-002) |
| TC-REN-003 | Newman | 20261105-samuel-01 | B | Aprobado |
| TC-REN-004 | JMeter | 20261105-samuel-01 | B | Aprobado |
| TC-REN-005 | JMeter | 20261105-samuel-02 (línea base: -01) | B | Aprobado |

## Anexo B. Documentos de soporte

| Documento | Contenido |
|---|---|
| [Plan de pruebas](../../plan/PLAN%20DE%20PRUEBAS%20Metabase.pdf) | Casos, criterios, métricas y cronograma |
| [Informe de preparación del ambiente](../../docs/INFORME-PREPARACION-AMBIENTE-QA.md) | Instalación, configuración, usuarios, permisos y recursos de prueba |
| [CONFIGURACION-QA.md](../../docs/CONFIGURACION-QA.md) | Endpoints verificados para v0.64.1 y decisión sobre el código 202 (§7) |
| [CONTRATOS-API-V0.64.1.md](../../docs/CONTRATOS-API-V0.64.1.md) | Contratos verificados en TC-CON |
| [RENDIMIENTO-V0.64.1.md](../../docs/RENDIMIENTO-V0.64.1.md) | Herramientas, decisiones del piloto y resultados de TC-REN |
| [HERRAMIENTAS-NEWMAN-JMETER.md](../../docs/HERRAMIENTAS-NEWMAN-JMETER.md) | Ejecución segura de Newman y JMeter y control de datos sensibles |
| [matriz-trazabilidad.csv](../matriz-trazabilidad.csv) | Estado y rutas de los 29 casos |
| [registro-hallazgos.csv](../registro-hallazgos.csv) | Hallazgos confirmados |
| [verificaciones-complementarias.csv](../verificaciones-complementarias/verificaciones-complementarias.csv) | Verificaciones de seguridad funcional e integración |
