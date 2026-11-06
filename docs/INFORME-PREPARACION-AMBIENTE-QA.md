# Informe de preparación del ambiente QA de Metabase

| Campo | Valor |
|---|---|
| Proyecto | Evaluación de calidad de Metabase Open Source |
| Documento de referencia | `plan/PLAN DE PRUEBAS Metabase.pdf` (versión 1.0, 29/10/2026) |
| Sistema bajo prueba | Metabase Open Source **v0.64.1** |
| Equipo de pruebas | Juan Esteban Hernández Lozano y Samuel Alexander Perdomo Fajardo |
| Fecha de preparación | 4 y 5 de noviembre de 2026 |
| Fecha de corte de la información | 2026-11-05 |

> Los datos técnicos de este informe se obtuvieron el 2026-11-05 directamente del ambiente en ejecución, en modo de solo lectura:
> - la configuración del contenedor (`docker inspect`);
> - los ajustes de la instancia y la definición de los recursos (API de Metabase).
>
> Las horas se expresan en hora local (UTC−5).

---

## 1. Propósito

Este informe describe cómo se instaló y configuró el ambiente en que se ejecutan los 29 casos del plan de pruebas, y por qué se tomó cada decisión.

El plan exige, como criterio de inicio:

- una instancia instalada y accesible;
- una versión identificada y constante;
- datos de prueba conocidos;
- usuarios con permisos diferenciados;
- una verificación inicial de conectividad.

Estas condiciones no son accesorias: permiten afirmar que un resultado observado se debe al comportamiento de Metabase, y no a la configuración, a los datos o a los permisos del ambiente.

## 2. Resumen del ambiente

| Componente | Valor | Motivo principal |
|---|---|---|
| Producto | Metabase Open Source v0.64.1 (imagen oficial `metabase/metabase:v0.64.1`) | Versión fija: la API y la interfaz de Metabase cambian entre versiones |
| Ejecución | Contenedor Docker `metabase-qa` | Instancia aislada, reproducible e independiente de sistemas productivos |
| Acceso | `http://localhost:3000`, publicado solo en `127.0.0.1` | La instancia no es accesible desde la red |
| Persistencia | Volumen Docker `metabase-qa-data`, montado en `/metabase-data` | La configuración sobrevive a reinicios y recreaciones del contenedor |
| Base de datos de aplicación | H2, archivo `/metabase-data/metabase.db` | No requiere un servidor de base de datos adicional |
| Fuente de datos de las pruebas | Sample Database (incluida en Metabase; motor SQLite) | Datos conocidos e idénticos en cualquier instalación de la misma versión |
| Idioma de la interfaz | Español | Selectores, capturas y textos comparables entre ejecuciones |
| Cuentas | Una administradora y una normal (*Usuario QA*) | Probar tanto la administración como la experiencia y los límites de un usuario normal |
| Recursos de prueba | Colección `QA - Metabase`, cinco preguntas y un dashboard con filtro por categoría | Precondiciones comunes de los casos funcionales, de API y de rendimiento |

## 3. Instalación de Metabase

### 3.1 Plataforma anfitriona

| Componente | Valor |
|---|---|
| Sistema operativo | Microsoft Windows 11 Home Single Language 10.0.26300 |
| Procesador y memoria | Intel Core i5-11400H, 7,6 GB de RAM |
| Docker | Docker Desktop con WSL 2, motor 29.6.2 |
| Recursos de la máquina virtual de Docker | 12 CPU y 3,7 GB de RAM |

Metabase es una aplicación Java que necesita entre 1 y 2 GB de memoria. La asignación de Docker es suficiente para una instancia de pruebas con un único usuario activo a la vez.

**Por qué es relevante:** las mediciones de rendimiento (TC-REN) dependen del hardware. Por eso estas características deben citarse junto a cualquier tiempo de respuesta.

### 3.2 Por qué Docker

El plan establece que la plataforma se ejecutará mediante Docker. Además:

- **Se usa la imagen oficial publicada por Metabase.** Contiene la aplicación, el entorno Java y la base de datos de ejemplo ya integrados. No hay que instalar Java, configurar un servidor web ni cargar datos manualmente.
- **El comportamiento no depende del equipo anfitrión.** Dos contenedores creados con la misma imagen ejecutan exactamente el mismo software, lo que permite reproducir el ambiente en otro computador.
- **La aplicación queda aislada del sistema.** Detenerla, eliminar el contenedor o reinstalarla no afecta al resto del equipo ni a ningún sistema productivo.

### 3.3 Procedimiento de instalación

La instalación se realizó el **4 de noviembre de 2026** (volumen creado a las 20:57; contenedor a las 20:57; primer arranque completado a las 21:00, cuando Metabase registró Sample Database). Los pasos fueron los siguientes; los parámetros del paso 3 se reconstruyeron a partir de la configuración real del contenedor (`docker inspect`).

**Paso 1. Descargar la imagen con versión exacta.**

```powershell
docker pull metabase/metabase:v0.64.1
```

**Paso 2. Crear el volumen persistente.**

```powershell
docker volume create metabase-qa-data
```

**Paso 3. Crear e iniciar el contenedor.**

```powershell
docker run -d --name metabase-qa `
  -p 127.0.0.1:3000:3000 `
  -v metabase-qa-data:/metabase-data `
  -e MB_DB_FILE=/metabase-data/metabase.db `
  metabase/metabase:v0.64.1
```

Cada parámetro tiene un propósito concreto:

| Parámetro | Qué hace | Por qué se eligió |
|---|---|---|
| `metabase/metabase:v0.64.1` | Usa una versión concreta de la imagen | Una etiqueta móvil como `latest` podría descargar otra versión en cualquier momento. Metabase no versiona su API por separado, así que cambiar de versión puede cambiar los endpoints, la estructura de las respuestas y la interfaz. La versión fija mantiene constantes los contratos (TC-CON) y hace comparables las mediciones (TC-REN) |
| `--name metabase-qa` | Da un nombre fijo al contenedor | Los scripts del repositorio (`verificar-ambiente.ps1`, `respaldar-volumen.ps1`) y los comandos de operación lo localizan por ese nombre |
| `-p 127.0.0.1:3000:3000` | Publica el puerto 3000 solo en la interfaz local | Sin `127.0.0.1`, Docker publicaría el puerto en todas las interfaces de red. Así la instancia, que contiene cuentas de prueba, no es accesible desde otros equipos, y el tráfico externo no altera las mediciones |
| `-v metabase-qa-data:/metabase-data` | Monta un volumen con nombre dentro del contenedor | El sistema de archivos del contenedor es efímero: si se recreara el contenedor sin volumen, se perderían usuarios, permisos, preguntas y dashboards, y los recursos tendrían IDs distintos al prepararlos de nuevo |
| `-e MB_DB_FILE=/metabase-data/metabase.db` | Indica dónde guarda Metabase su base de datos de aplicación | Por defecto, Metabase la guarda en su directorio de trabajo, fuera del volumen. Esta variable la ubica dentro del volumen persistente |
| `-d` | Ejecuta el contenedor en segundo plano | Metabase funciona como servicio; la terminal queda libre |

No se definió `MB_DB_TYPE`, porque H2 es el valor predeterminado. Tampoco se añadieron otros servicios, como PostgreSQL, ni variables de correo o de cifrado (§3.5).

**Paso 4. Esperar el primer arranque.** En el primer inicio, Metabase crea su base de datos de aplicación y ejecuta sus migraciones internas, lo que tarda algunos minutos. El arranque se da por completado cuando el endpoint de salud responde:

```powershell
Invoke-RestMethod http://localhost:3000/api/health     # status = ok
```

### 3.4 Verificación de la instalación

`scripts/verificar-ambiente.ps1` comprueba la instalación sin modificar nada:

1. Docker está disponible.
2. El contenedor `metabase-qa` está en ejecución y usa la imagen `v0.64.1`.
3. El volumen `metabase-qa-data` está montado.
4. `GET /api/health` responde HTTP 200 con `{"status":"ok"}`.
5. La versión que informa la propia aplicación (`version.tag` en `GET /api/session/properties`) es `v0.64.1`.

El 2026-11-05 todas las comprobaciones resultaron correctas.

**Por qué se verifica la versión en la aplicación:** la etiqueta de la imagen indica qué se descargó. La versión que informa Metabase confirma qué se está ejecutando realmente.

### 3.5 Bases de datos: aplicación y fuente de datos

Metabase usa dos bases de datos con funciones diferentes:

| | Base de datos de aplicación | Sample Database |
|---|---|---|
| Qué contiene | La configuración de Metabase: usuarios, grupos, permisos, preguntas, dashboards, colecciones y sesiones | Datos de ejemplo de una tienda: pedidos, productos, personas, reseñas, facturas y otros |
| Motor | H2 (archivo `metabase.db.mv.db` dentro del volumen) | SQLite, incluida en la aplicación |
| Papel en las pruebas | No se consulta directamente; se modifica a través de la interfaz y la API | Es la fuente de todas las consultas de prueba |

**Por qué H2.** Es una base de datos embebida en un único archivo y no exige instalar ni administrar un servidor. Metabase no la recomienda para producción, porque es sensible a cierres abruptos y no admite varias instancias a la vez. Ninguna de esas limitaciones afecta a un ambiente académico local de una sola instancia, y el plan excluye expresamente la validación de despliegues productivos.

**Consecuencia práctica del motor SQLite.** En v0.64.1, las tablas de Sample Database se nombran sin esquema: `ORDERS`, no `PUBLIC.ORDERS`. Las consultas SQL de prueba deben escribirse sin el prefijo `PUBLIC.` (ver §11).

**Variables no utilizadas:**

- `MB_ENCRYPTION_SECRET_KEY` cifra las credenciales de conexión a bases de datos externas. No es necesaria, porque Sample Database no tiene credenciales.
- La configuración de correo saliente no forma parte del alcance del plan.

### 3.6 Operación y conservación de los datos

| Acción | Comando | Efecto sobre los datos |
|---|---|---|
| Iniciar | `docker start metabase-qa` | Ninguno |
| Detener | `docker stop metabase-qa` | Ninguno |
| Ver registros | `docker logs -f metabase-qa` | Ninguno |
| Respaldar | `docker stop metabase-qa`, luego `scripts\respaldar-volumen.ps1`, luego `docker start metabase-qa` | Genera `respaldos/metabase-qa-data-<fecha>.tar.gz` sin modificar el volumen |
| **Prohibido** | `docker volume rm metabase-qa-data`, `docker system prune --volumes`, `docker compose down -v` | Eliminan el volumen y, con él, toda la configuración preparada |

**Por qué estas reglas:**

- **El respaldo se hace con Metabase detenido.** Así el archivo H2 queda en un estado coherente.
- **El script monta el volumen en modo de solo lectura**, en un contenedor temporal sin red.
- **La imagen no se cambia sin acuerdo.** Iniciar el volumen con otra versión de Metabase migraría la base de datos de aplicación de forma irreversible.

### 3.7 Recrear un ambiente equivalente

El repositorio incluye `compose.yaml`, que crea un ambiente equivalente en otro equipo con `docker compose up -d`. Usa la misma imagen, el mismo nombre de contenedor, el mismo volumen y la misma ruta de `MB_DB_FILE`. Añade tres elementos que el contenedor descrito en §3.3 no tiene, y que no cambian el comportamiento funcional de las pruebas:

| Elemento de `compose.yaml` | Para qué sirve |
|---|---|
| `restart: unless-stopped` | Inicia Metabase automáticamente al abrir Docker Desktop. El contenedor de §3.3 se inicia a mano (`restart = no`) |
| `healthcheck` contra `/api/health` | Docker informa cuándo Metabase está listo (`healthy`) |
| `MB_SESSION_SECRET_KEY`, leída de `.env` | Clave con la que Metabase firma sus sesiones. Su ausencia no impide el funcionamiento |

La guía paso a paso para una instalación nueva es [INSTALACION-SAMUEL.md](INSTALACION-SAMUEL.md).

`compose.yaml` **no debe ejecutarse** en un equipo donde ya exista el contenedor `metabase-qa` creado con `docker run`. Docker rechazaría la creación por el nombre duplicado, y ese rechazo protege la instancia existente.

## 4. Configuración inicial de la instancia

### 4.1 Asistente de configuración

La primera vez que se abre `http://localhost:3000`, Metabase presenta un asistente que solo se completa una vez. Estas fueron las opciones elegidas y su motivo:

| Pantalla del asistente | Opción elegida | Por qué |
|---|---|---|
| Idioma preferido | **Español** | Los textos y etiquetas de la interfaz forman parte de los selectores de Cypress y de las evidencias. Un idioma fijo hace que las capturas y la automatización sean comparables y reproducibles |
| Datos de la cuenta | Creación de la **cuenta administradora** | Metabase exige un administrador inicial para configurar la instancia (§5) |
| Añade tus datos | **Añadiré mis datos más tarde**: no se conectó ninguna base de datos externa | Las pruebas usan solo Sample Database. Otra fuente añadiría variables ajenas a Metabase (red, otro motor, credenciales) y quedaría fuera del alcance del plan |
| Preferencias de datos de uso | **Recolección anónima desactivada** | Evita que el ambiente de pruebas envíe información de uso a terceros |

Al terminar el asistente, Metabase registró automáticamente Sample Database y creó la colección `Examples`, con contenido de muestra.

### 4.2 Ajustes resultantes

Valores leídos de `GET /api/session/properties`:

| Ajuste | Valor | Decisión |
|---|---|---|
| Idioma de la instancia (`site-locale`) | `es` | Elegido en el asistente |
| Recolección anónima (`anon-tracking-enabled`) | `false` | Elegido en el asistente |
| Correo saliente (`email-configured?`) | No configurado | **No se configuró**, porque el plan excluye las integraciones de notificación. Consecuencia: al crear un usuario, Metabase muestra una contraseña temporal en pantalla, en lugar de enviar una invitación |
| Zona horaria de los informes | GMT (predeterminado) | **Se conservó** el valor predeterminado. Cambiarla alteraría cómo se muestran las fechas, y no lo requiere ningún caso |
| Complejidad de contraseñas | Mínimo 6 caracteres y 1 dígito (predeterminado) | **Se conservó**. Las contraseñas de las cuentas de prueba cumplen ese requisito |
| Colección `Examples` | Presente | **Se conservó sin modificar.** Ningún recurso de prueba depende de ella |
| Sincronización de Sample Database | Metadatos cada hora; valores de campos una vez al día (predeterminados) | **Se conservó.** Sample Database no cambia, así que la sincronización no altera los datos de las pruebas |

**Criterio general:** solo se cambió lo necesario para el plan. Todo lo demás se dejó con su valor predeterminado. Así se evalúa Metabase tal como se distribuye, y el ambiente puede reproducirse sin una lista larga de ajustes.

## 5. Usuarios y permisos

### 5.1 Cuentas creadas

| Cuenta | Cómo se creó | Grupos | Uso en las pruebas |
|---|---|---|---|
| **Administradora** | En el asistente inicial (5 de noviembre, 00:08) | *Administrators* y *All Users* | Preparar los recursos, consultar identificadores y ejecutar los casos de API que requieren una sesión con todos los privilegios |
| **Usuario QA** | Por la cuenta administradora, en *Configuración de administración → Personas* (5 de noviembre, 00:17). Como no hay correo configurado, Metabase entrega la contraseña inicial en pantalla en lugar de enviar una invitación | Solo *All Users* (`is_superuser = false`) | Escenarios desde la perspectiva de un usuario sin privilegios administrativos: casos funcionales y de validación por la interfaz, y comprobaciones de control de acceso |

**Por qué dos niveles de privilegio.** El plan incluye verificar que las operaciones respeten los permisos asignados, y que los recursos protegidos no sean accesibles sin autorización. Con una sola cuenta administradora esto es imposible: un administrador tiene acceso a todo, así que ninguna restricción se manifiesta. Usar siempre el administrador tendría además dos efectos:

- **Ocultaría defectos de control de acceso**, porque cualquier operación tendría éxito por exceso de privilegios.
- **Los casos funcionales no representarían al usuario habitual** de la plataforma.

### 5.2 Permisos sobre los datos

Permisos del grupo *All Users*, al que pertenece Usuario QA, sobre Sample Database (`GET /api/permissions/graph`):

| Permiso | Valor | Qué permite |
|---|---|---|
| Ver datos | Sin restricción | Consultar todas las tablas |
| Crear consultas | Editor gráfico y SQL nativo | Construir preguntas con el editor gráfico y escribir consultas SQL |
| Descargas | Completas | Descargar resultados |

Son los **valores predeterminados** de Metabase Open Source y **no se modificaron**. Son necesarios para el plan, porque Usuario QA debe poder:

- construir consultas con el editor gráfico (TC-FUN-002, TC-FUN-004);
- ejecutar SQL (TC-FUN-003).

### 5.3 Permisos sobre las colecciones

Valores leídos de `GET /api/collection/graph`:

| Colección | *Administrators* | *All Users* |
|---|---|---|
| Nuestros análisis (raíz) | Administrar | Administrar (predeterminado) |
| Examples | Administrar | Administrar (predeterminado) |
| QA - Metabase | Administrar | **Administrar** |

`QA - Metabase` heredó el permiso de la colección raíz donde se creó. Por eso Usuario QA puede **guardar** preguntas en ella, algo que requiere TC-FUN-004 (guardar en una colección autorizada).

La guía de preparación (`docs/DATOS-Y-RECURSOS-PRUEBA.md` §3.1) prescribía *Ver* (solo lectura) para *All Users*, con el fin de proteger los recursos de referencia. Esa decisión está pendiente (§11). Con *Ver*, TC-FUN-004 necesitaría otra colección donde Usuario QA pudiera escribir.

### 5.4 Credenciales

Las cuentas existen solo dentro de Metabase. Los scripts del repositorio no contienen credenciales: las leen en memoria del archivo local `.env`, que está excluido de Git (§9). Este informe no reproduce correos, contraseñas ni tokens.

## 6. Fuente de datos: Sample Database

### 6.1 Por qué Sample Database

El plan establece que se usará la base de datos de ejemplo de la plataforma, para disponer de registros conocidos con los que validar consultas, filtros y visualizaciones.

- **Hace verificable el resultado esperado.** Un recuento, un filtro o un promedio solo puede compararse con lo que muestra Metabase si se conoce de antemano su valor sobre los mismos datos.
- **No hay proceso de carga.** Como viene dentro de la imagen, cualquier instalación de v0.64.1 tiene exactamente los mismos registros, sin cargas manuales que puedan introducir diferencias.

### 6.2 Contenido

Sample Database tiene el ID local **1**, motor `sqlite`, y ocho tablas:

- `ACCOUNTS`;
- `ANALYTIC_EVENTS`;
- `FEEDBACK`;
- `INVOICES`;
- `ORDERS`;
- `PEOPLE`;
- `PRODUCTS`;
- `REVIEWS`.

Los recursos de prueba usan dos tablas:

| Tabla | ID | Columnas utilizadas | Por qué |
|---|---|---|---|
| **Orders** (pedidos) | 2 | `Subtotal` (ID 10, numérica) | Permite evaluar filtros numéricos y recuentos sobre una tabla grande (18.760 registros) |
| **Products** (productos) | 3 | `Category` (ID 18, texto con lista de valores); `Price` (ID 44, numérica) | `Category` tiene pocas categorías fijas (Doohickey, Gadget, Gizmo, Widget). Eso la hace adecuada para agrupar, filtrar y vincular el filtro del dashboard. `Price` permite calcular promedios |

### 6.3 Valores de referencia

`recursos-compartidos/datos/valores-referencia.csv` define seis consultas de referencia:

| Referencia | Qué calcula |
|---|---|
| R01 | Registros por tabla |
| R02 | Pedidos con subtotal mayor a 100 |
| R03 | Total de pedidos |
| R04 | Productos por categoría |
| R05 | Precio promedio por categoría |
| R06 | Ausencia del valor `QA_VALOR_INEXISTENTE_2026` |

Son el resultado esperado contra el que se comparan:

- TC-FUN-002 y TC-FUN-010, con R02;
- TC-FUN-003, con R03;
- TC-FUN-005 y TC-FUN-007, con R04;
- TC-VAL-004, con R06.

**Estado de los valores:**

- **Durante la preparación no se registró ningún valor** en ese archivo.
- **Las ejecuciones posteriores obtuvieron dos** con recuentos de solo lectura sobre la fuente: R02 = 5.244 y R03 = 18.760.
- **El archivo debe corregirse:** las consultas de R01–R06 usan el prefijo `PUBLIC.`, que no funciona con SQLite (§11).

## 7. Recursos de prueba

Todos los recursos se crearon desde la interfaz con la cuenta administradora, el 5 de noviembre entre las 00:22 y las 00:49. Preparar un recurso es una precondición de los casos que lo usan, **no la aprobación** de ninguno: cada caso se ejecuta y documenta por separado en su `reporte.md`.

### 7.1 Colección `QA - Metabase`

| Elemento | Valor |
|---|---|
| Creación | *Nuevo → Colección*, en la raíz *Nuestros análisis* |
| ID local | 6 |
| Descripción | "Colección de referencia para las pruebas funcionales, de integración, API y rendimiento de Metabase." |
| Contenido | Las cinco preguntas y el dashboard de referencia |

**Por qué una colección propia.** Separa los recursos de prueba del resto del contenido de la instancia, incluida la colección `Examples`. Gracias a eso:

- los recursos se localizan por nombre exacto, sin confundirse con otros;
- los duplicados se detectan fácilmente;
- los permisos se aplican a todo el conjunto a la vez;
- queda claro qué recursos son precondiciones y no deben modificarse durante las pruebas, frente a los que crean los propios casos, que se identifican por su nombre: `QA - TC-…` o `EJEC - …`.

### 7.2 Preguntas de referencia

Cada pregunta cubre un tipo distinto de operación, para que los casos dispongan de consultas con complejidad y visualizaciones diferentes:

| ID | Nombre | Cómo se creó | Configuración | Visualización |
|---|---|---|---|---|
| 40 | QA - Pedidos con subtotal mayor a 100 | Editor gráfico: *Nuevo → Pregunta → Sample Database → Orders*, filtro *Subtotal Mayor que 100* | Filtro numérico, sin agregación | Tabla |
| 41 | QA - Conteo de pedidos | *Nuevo → Consulta SQL*: `SELECT COUNT(*) AS total_pedidos FROM orders;` | Agregación en SQL nativo | Número |
| 42 | QA - Productos por categoría | Editor gráfico: *Products → Resumir: Recuento de filas, agrupado por Category* | Recuento agrupado | Barras |
| 43 | QA - Precio promedio por categoría | Editor gráfico: *Products → Resumir: Promedio de Price, agrupado por Category* | Promedio agrupado | Barras |
| 44 | QA - Detalle de productos | Editor gráfico: *Products*, sin filtros ni resumen | Registros individuales | Tabla |

Por qué se eligió cada una:

- **40, filtro numérico simple.** Sirve para comprobar la aplicación de filtros y la ejecución de preguntas guardadas, por la interfaz y por la API (`POST /api/card/{id}/query`). El plan la usa también en las mediciones de rendimiento, porque una consulta sencilla y estable mide el tiempo de respuesta de Metabase y no la complejidad del cálculo. Al no tener agregación, la interfaz muestra como máximo 2.000 filas (límite predeterminado). Por eso la comparación con su referencia se hace mediante un recuento, no contando las filas visibles.
- **41, recuento en SQL.** Es la agregación más simple y produce un único valor, que se compara de forma inequívoca con su referencia. Al estar escrita en SQL, permite contrastar el resultado de una consulta nativa con el del editor gráfico sobre la misma tabla.
- **42, recuento agrupado en barras.** Combina agregación, agrupación y representación gráfica. Permite comprobar que el gráfico muestra las mismas categorías y valores que la consulta (TC-FUN-005).
- **43, promedio agrupado en barras.** Aplica una métrica distinta sobre la misma agrupación. Permite comprobar que el filtro del dashboard afecta de forma coherente a métricas diferentes, y que los valores decimales se representan sin perder correspondencia con los datos.
- **44, detalle de productos.** Muestra los registros individuales sobre los que se calculan 42 y 43. Al aplicar el filtro de categoría en el dashboard, se ve directamente que solo quedan los registros de esa categoría. Así el efecto del filtro es verificable fila a fila, no solo en los totales.

Las preguntas 42, 43 y 44 se construyeron con el editor gráfico sobre `Products.Category`. Esa es la condición para poder vincularlas a un mismo filtro de dashboard (§7.3).

### 7.3 Dashboard `QA - Dashboard Principal`

| Elemento | Valor |
|---|---|
| Creación | *Nuevo → Dashboard* en `QA - Metabase`; se añadieron las preguntas 42, 43 y 44 |
| ID local | 2 |
| Distribución | 42 y 43 lado a lado en la fila superior (12 × 6 cada una); 44 a todo el ancho debajo (24 × 15) |

**Filtro por categoría.** Se añadió con *Añadir un filtro → Texto o categoría* y la configuración siguiente:

| Ajuste | Valor | Por qué |
|---|---|---|
| Etiqueta | `Categoría` | Nombre descriptivo en el idioma de la interfaz |
| Tipo y operador | `string/=` (*Es*) | Selección exacta de una o varias categorías |
| Vinculación | `Products.Category` en las tres tarjetas | Un mismo valor actualiza a la vez el recuento, el promedio y el detalle, lo que permite comprobar que las tres visualizaciones son coherentes |
| Selector | Lista desplegable (Metabase la ofrece porque `Category` tiene lista de valores) | Solo permite elegir valores existentes y evita errores de escritura |
| Valor predeterminado | Ninguno | El dashboard se abre siempre con todos los datos. Ese estado inicial neutro es necesario para que las cargas medidas en TC-REN-002 sean equivalentes |
| Aplicación automática | Activada (predeterminado) | Los cambios del filtro se aplican al instante. Debe mantenerse constante, porque condiciona cómo se observan y miden las actualizaciones |

Durante la preparación se eligió *Gadget* para confirmar que las tres tarjetas respondían al filtro, y después se limpió el valor. Esta comprobación no dejó evidencia y no es una ejecución formal: la evaluación de filtros corresponde a TC-FUN-007 y a las verificaciones de integración.

**Por qué este dashboard.** TC-REN-002 exige medir la carga de un dashboard con tres visualizaciones ya configuradas. Las tres preguntas proceden de la misma tabla y comparten `Category`, pero muestran la información de tres formas (recuento, promedio y detalle). Esto permite comprobar que distintas representaciones de una misma fuente son coherentes entre sí.

Los casos TC-FUN-006 y TC-FUN-007 **no** usan este dashboard: crean y configuran uno propio durante su ejecución, para que esas operaciones puedan observarse.

## 8. Preparación para la automatización

### 8.1 Identificadores sin valores fijos

Metabase asigna los IDs de forma secuencial en cada base de datos de aplicación, así que el mismo recurso tiene un número distinto en cada instalación. Para que los scripts funcionen en cualquier instalación, ningún script compartido contiene IDs escritos directamente:

- `scripts/obtener-ids-recursos.ps1` inicia sesión con la cuenta administradora, busca por nombre exacto la base de datos, la colección, las preguntas y el dashboard, e informa de los recursos que falten o estén duplicados. Solo lee: no modifica Metabase.
- Con `-Guardar`, escribe los IDs en `configuracion/recursos-locales.json`, un archivo local excluido de Git, y solo lo hace si encontró todos los recursos obligatorios.

Valores registrados:

- Sample Database: 1.
- Colección: 6.
- Dashboard: 2.
- Preguntas: 40 a 44.

Las pruebas y los scripts leen sus valores de ese archivo.

### 8.2 Estructura de los casos

Cada caso tiene una carpeta `pruebas/<categoría>/<ID>/`:

| Elemento | Contenido |
|---|---|
| `caso.md` | Ficha con el escenario, la solicitud, el resultado esperado y el código HTTP transcritos del plan |
| `scripts/` | Automatización del caso (`<ID>.cy.js`, `<ID>.postman_collection.json` o `<ID>.jmx`) |
| `evidencias/<id-ejecución>/` | Capturas de la ejecución oficial |
| `resultados/<id-ejecución>/` | Reportes nativos de la herramienta y registros |
| `reporte.md` | Informe individual, elaborado solo después de una ejecución real |

`reportes-generales/matriz-trazabilidad.csv` relaciona cada caso con su estado y con estos elementos.

**Por qué se conservan los reportes nativos y el informe Markdown:**

- **El reporte nativo es la evidencia primaria de lo ocurrido:** JUnit de Cypress, JSON y HTML de Newman, o JTL de JMeter.
- **El `reporte.md` interpreta esa evidencia** frente al resultado esperado del plan.

Conservar ambos permite contrastar cada conclusión con los datos originales, como exigen los criterios de finalización del plan.

### 8.3 Herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Cypress | 16.2.1, instalado con versión exacta en `recursos-compartidos/cypress/` | Escenarios de interfaz |
| Node.js | v22.15.1 | Entorno de ejecución de Cypress y Newman |
| Newman, con reportador htmlextra | 6.2.2 | Colecciones de Postman para la API |
| Apache JMeter | Pendiente de instalar | Concurrencia, percentiles y throughput |

Todas se ejecutan mediante `scripts/ejecutar-herramienta.ps1`. Ese script:

- entrega las credenciales y los IDs locales a la herramienta;
- crea una carpeta de ejecución nueva sin sobrescribir las anteriores;
- protege los resultados (§9).

## 9. Protección de credenciales y sesiones

- **Credenciales.** El archivo local `.env` contiene `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`, `QA_USER_EMAIL` y `QA_USER_PASSWORD`. Los scripts las leen en memoria mediante `scripts/sesion-metabase.ps1`. No se transmiten al contenedor y nunca se escriben en archivos versionados. El repositorio solo incluye la plantilla `.env.example`, sin valores.
- **Archivos excluidos de Git** (`.gitignore`):
  - `.env`;
  - las configuraciones locales con IDs (`configuracion/*.json`);
  - los entornos de Postman con valores reales;
  - los archivos H2;
  - los respaldos;
  - `node_modules`;
  - las carpetas temporales de las herramientas.
- **Sesiones en los reportes.** Se comprobó, con valores ficticios, que Newman escribe el token de sesión en su reporte JSON, y que un error de Cypress puede incluir la cookie de sesión en su reporte. Por eso `ejecutar-herramienta.ps1`:
  - inicia la sesión fuera de la herramienta, sin entregarle la contraseña cuando no la necesita;
  - cierra la sesión al terminar y comprueba que queda invalidada (respuesta 401);
  - sustituye por un marcador cualquier token, cookie o contraseña que encuentre en los archivos generados.
- **Revisión antes de publicar.** `scripts/revisar-secretos.ps1` busca en todo el repositorio tokens, cookies de sesión y las contraseñas exactas definidas en `.env`.

## 10. Verificaciones de la preparación

| # | Comprobación | Medio | Resultado (2026-11-05) |
|---|---|---|---|
| 1 | Contenedor, imagen, volumen, disponibilidad y versión | `scripts/verificar-ambiente.ps1`, `docker inspect` | Contenedor en ejecución con la imagen `v0.64.1`, volumen montado, puerto solo en `127.0.0.1`, `/api/health` responde 200 y `version.tag` = `v0.64.1` |
| 2 | Ajustes de la instancia | `GET /api/session/properties` | Español, sin recolección anónima, sin correo, GMT, asistente completado |
| 3 | Autenticación de las dos cuentas | `scripts/probar-cuentas.ps1` | Inicio de sesión correcto en ambas. Administradora: `is_superuser = true`. Usuario QA: `false`. Sesiones cerradas e invalidadas (401) |
| 4 | Permisos | `GET /api/permissions/graph`, `GET /api/collection/graph` | Según §5.2 y §5.3 |
| 5 | Sample Database | `scripts/obtener-ids-recursos.ps1` | ID 1, motor SQLite, ocho tablas |
| 6 | Recursos de referencia | `scripts/obtener-ids-recursos.ps1`, `GET /api/card/{id}`, `GET /api/dashboard/2` | Colección 6, dashboard 2 y preguntas 40–44: cada uno una sola vez y con la configuración de §7 |
| 7 | Ausencia de secretos en el repositorio | `scripts/revisar-secretos.ps1` | Sin tokens ni contraseñas; `.env` excluido |

Estas comprobaciones verifican la **preparación**. No son ejecuciones de casos de prueba.

## 11. Diferencias y actividades pendientes

| # | Aspecto | Situación | Acción recomendada |
|---|---|---|---|
| 1 | Prefijo `PUBLIC.` en las consultas de referencia | Sample Database usa SQLite en v0.64.1: `PUBLIC.ORDERS` produce el error `no such table`. Afecta a R01–R06 en `valores-referencia.csv` y en `DATOS-Y-RECURSOS-PRUEBA.md` §1.3 | Reescribir las consultas sin esquema (`FROM ORDERS`) |
| 2 | Valores de referencia | Sin registrar en `valores-referencia.csv`. Conocidos por las ejecuciones: R02 = 5.244, R03 = 18.760 | Calcular y registrar R01–R06 una vez corregidas las consultas |
| 3 | Permiso de *All Users* sobre `QA - Metabase` | Administrar (heredado de la raíz); la guía prescribía *Ver* | Decidir el criterio. Si se cambia a *Ver*, habrá que dar otra colección con escritura a TC-FUN-004 |
| 4 | Tipo de la pregunta 41 | Creada en SQL nativo; la guía de preparación indicaba el editor gráfico | Mantener SQL, que ya se usa como referencia nativa, y actualizar la guía |
| 5 | Comprobación preliminar del filtro con *Gadget* | Sin evidencia registrada | Ninguna: el comportamiento del filtro se evalúa en TC-FUN-007 |
| 6 | Código HTTP de las consultas | Las consultas responden **202** (respuesta en *streaming*), no el 200 que el plan indica en TC-FUN-010, TC-CON-004 y TC-REN | **Decidido el 2026-11-05:** se acepta 200 o 202 con `status = "completed"`, como desviación documentada (`docs/CONFIGURACION-QA.md` §7) |
| 7 | Política de caché | Sin registrar | Registrarla antes de TC-REN y no cambiarla durante las mediciones |
| 8 | Apache JMeter | Sin instalar | Instalarlo y registrar su versión antes de TC-REN-001, 004 y 005 |
| 9 | Respaldo del volumen | No se registra un respaldo posterior a la preparación | Respaldar con `scripts\respaldar-volumen.ps1` antes de las pruebas de rendimiento |

## 12. Conclusión

El ambiente preparado cumple las condiciones que el plan exige para iniciar las pruebas:

- **Controlado.** Metabase v0.64.1 se ejecuta en un contenedor aislado con versión fija, accesible solo desde el propio equipo.
- **Persistente.** Toda la configuración reside en un volumen con nombre y puede respaldarse.
- **Con datos conocidos.** Sample Database está incluida en la imagen y es idéntica en cualquier instalación de la misma versión.
- **Con cuentas diferenciadas.** Hay una cuenta administradora y una normal, ambas verificadas.
- **Con recursos de referencia identificados.** Hay una colección, cinco preguntas que cubren filtro, agregación nativa, recuento, promedio y detalle, y un dashboard con filtro vinculado.

La instancia conserva los valores predeterminados de Metabase, salvo el idioma y la recolección anónima. Los identificadores se resuelven sin valores fijos, y los reportes se conservan como evidencia sin exponer credenciales.

Las diferencias de §11 no invalidan la preparación. Sin embargo, los casos que dependen de los valores de referencia deben esperar a que se corrijan y registren esas consultas para que sus conclusiones sean completas.

---

**Fuentes:**

- `plan/PLAN DE PRUEBAS Metabase.pdf`.
- `compose.yaml`, `.env.example`, `docs/CONFIGURACION-QA.md`, `docs/DATOS-Y-RECURSOS-PRUEBA.md`, `docs/AUTENTICACION-QA.md` y `docs/INSTALACION-SAMUEL.md`.
- `docker inspect metabase-qa` y `docker volume inspect metabase-qa-data` (configuración, sin valores de variables).
- Lecturas de la API del 2026-11-05: `/api/session/properties`, `/api/user`, `/api/permissions/graph`, `/api/collection/graph`, `/api/collection/6`, `/api/database/1`, `/api/card/{40–44}` y `/api/dashboard/2`.
