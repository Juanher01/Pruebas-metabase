# Configuración del ambiente QA de Metabase

Este documento describe la configuración técnica compartida del ambiente: el servicio Docker, la persistencia, las variables de entorno, la diferencia entre las instalaciones de Juan y Samuel, la configuración local de identificadores y los endpoints de la API verificados para Metabase **v0.64.1**.

> Guía paso a paso para una instalación nueva: [INSTALACION-SAMUEL.md](INSTALACION-SAMUEL.md).

---

## 1. Resumen del ambiente

| Elemento | Valor |
|---|---|
| Producto | Metabase Open Source |
| Imagen Docker | `metabase/metabase:v0.64.1` (fija, no cambiar sin autorización) |
| Nombre del contenedor | `metabase-qa` |
| URL | `http://localhost:3000` (publicado solo en `127.0.0.1`) |
| Volumen persistente | `metabase-qa-data`, montado en `/metabase-data` |
| Base de datos de aplicación | H2, archivo `/metabase-data/metabase.db` (`MB_DB_FILE`) |
| Fuente de datos de las pruebas | **Sample Database** (incluida en Metabase) |
| Verificación | `GET http://localhost:3000/api/health` → HTTP 200 `{"status":"ok"}` |

### Dos bases de datos diferentes (no confundir)

| | Base de datos de **aplicación** (H2) | **Sample Database** |
|---|---|---|
| Qué guarda | Configuración de Metabase: usuarios, grupos, permisos, preguntas, dashboards, colecciones, sesiones | Datos de ejemplo de una tienda: pedidos, productos, personas, reseñas |
| Dónde está | `/metabase-data/metabase.db.mv.db` dentro del volumen `metabase-qa-data` | Incluida en la aplicación de Metabase; se registra automáticamente como base de datos de ejemplo |
| Se consulta en las pruebas | No directamente (solo a través de la UI y la API) | Sí: es la fuente de todas las consultas de prueba |
| Se sube a GitHub | **Nunca** | No aplica (viene con Metabase) |

**H2 como base de aplicación solo es aceptable para este ambiente académico local.** Metabase no lo recomienda para producción: H2 es un archivo único, sensible a cierres abruptos, y no admite varias instancias a la vez. Para producción, Metabase recomienda PostgreSQL o MySQL. Este cambio queda **fuera del alcance** del plan.

---

## 2. Las dos instalaciones

| | Computador de **Juan** (principal) | Computador de **Samuel** |
|---|---|---|
| Cómo se creó | `docker run` manual (antes de este repositorio) | `docker compose up -d` usando [compose.yaml](../compose.yaml) |
| Contenedor | `metabase-qa` | `metabase-qa` |
| Volumen | `metabase-qa-data` | `metabase-qa-data` |
| `MB_DB_FILE` | `/metabase-data/metabase.db` | `/metabase-data/metabase.db` |
| Puerto | `127.0.0.1:3000` | `127.0.0.1:3000` (configurable con `MB_PUERTO_LOCAL`) |
| `MB_SESSION_SECRET_KEY` | No configurada | Configurada desde `.env` |
| Política de reinicio | `no` | `unless-stopped` |
| Iniciar | `docker start metabase-qa` | `docker compose start` (o `docker compose up -d`) |
| Detener | `docker stop metabase-qa` | `docker compose stop` |
| Registros | `docker logs -f metabase-qa` | `docker compose logs -f` |

Las diferencias de `MB_SESSION_SECRET_KEY` y de la política de reinicio no cambian el comportamiento funcional de las pruebas. La primera solo afecta la firma interna de las sesiones, y la segunda, el arranque automático. Se registran por transparencia y deben mencionarse en el informe final como diferencia de ambiente.

> **Estado observado en el equipo de Juan:**
> - **2026-11-04:** `metabase-qa` estaba detenido (`Exited (143)`, detención normal). Su configuración (imagen, puerto, volumen y `MB_DB_FILE`) coincide con la descrita.
> - **2026-11-05:** en ejecución. `scripts/verificar-ambiente.ps1` informó `/api/health` → 200 y `version.tag` = `v0.64.1`, y el asistente ya estaba completado (`has-user-setup: true`).
> - En ningún momento se modificó el contenedor ni el volumen.

### Asignación de casos por instalación

| Instalación | Responsable | Casos que se ejecutan en ella |
|---|---|---|
| Equipo de Juan | Juan Esteban Hernández Lozano | Funcionales (TC-FUN-001 a 010) y validación de entradas (TC-VAL-001 a 005) |
| Equipo de Samuel | Samuel Alexander Perdomo Fajardo | Manejo de errores (TC-ERR-001 a 005), contrato (TC-CON-001 a 004) y rendimiento (TC-REN-001 a 005) |

Esta asignación fue definida por el equipo el 2026-11-05 y **difiere de la tabla de roles del plan v1.0**, que asignaba los funcionales, la validación, los errores y el contrato a Samuel, y el rendimiento a Juan. Debe mencionarse en el informe final. Como cada uno ejecuta en su propia instalación, **ambas deben prepararse completas** según [DATOS-Y-RECURSOS-PRUEBA.md](DATOS-Y-RECURSOS-PRUEBA.md). Las métricas de rendimiento corresponderán al equipo de Samuel, cuyos recursos de hardware deben registrarse.

### Por qué no ejecutar `docker compose up` en el equipo de Juan

`compose.yaml` usa el mismo nombre de contenedor (`metabase-qa`) y de volumen (`metabase-qa-data`) que la instalación existente. Esto mantiene equivalentes ambos ambientes. Además, si alguien ejecuta `docker compose up` por error en el equipo de Juan, Docker rechazará la creación con un error de tipo *"The container name "/metabase-qa" is already in use"*. El rechazo protege los datos: la instalación existente no se toca.

Aun así, **no lo intente**. Use siempre `docker start` / `docker stop` en ese equipo.

---

## 3. Docker Compose ([compose.yaml](../compose.yaml))

Servicio único `metabase`:

- **Imagen:** `metabase/metabase:v0.64.1`.
- **Puertos:** `127.0.0.1:${MB_PUERTO_LOCAL:-3000}:3000`. Solo es accesible desde el propio computador.
- **Persistencia:** volumen con nombre `metabase-qa-data` montado en `/metabase-data`. La base de aplicación H2 se guarda allí (`MB_DB_FILE=/metabase-data/metabase.db`). Detener, iniciar o reiniciar el contenedor **no** borra datos. Incluso `docker compose down` (sin `-v`) conserva el volumen.
- **Variables:** `MB_DB_TYPE=h2`, `MB_DB_FILE` y `MB_SESSION_SECRET_KEY` (obligatoria, se lee de `.env`).
- **Reinicio:** `unless-stopped`.
- **Healthcheck:** `curl` contra `/api/health` (la imagen incluye `curl`, verificado), con `start_period` de 180 s para el primer arranque.
- No se agregan servicios adicionales ni PostgreSQL.

### Variables de entorno ([.env.example](../.env.example))

| Variable | Obligatoria | Uso |
|---|---|---|
| `MB_SESSION_SECRET_KEY` | Sí | Metabase firma con ella las sesiones guardadas en la base de aplicación. Mínimo 16 caracteres. Si se cambia, se cierran todas las sesiones activas; los datos no se pierden. Verificada en la documentación de variables de entorno de v0.64.1. |
| `MB_PUERTO_LOCAL` | No (3000) | Puerto local, por si el 3000 está ocupado. |
| `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` | Para los scripts de pruebas | Cuenta administradora de su instalación. **No** se pasan al contenedor: solo las leen los scripts ([AUTENTICACION-QA.md](AUTENTICACION-QA.md)). |
| `QA_USER_EMAIL`, `QA_USER_PASSWORD` | Para los scripts de pruebas | Cuenta normal Usuario QA. Igual que las anteriores. |

Generar un valor seguro en PowerShell:

```powershell
$b = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

El archivo `.env` está excluido de Git. Guarde el valor en un gestor de contraseñas personal.

> `MB_ENCRYPTION_SECRET_KEY` (cifrado de las credenciales de conexión a bases de datos) **no se usa**, porque Sample Database no tiene credenciales. Si se agregara en el futuro, debe conservarse para siempre: perderla impide leer las conexiones guardadas.

### Comandos de operación (computador con Compose)

Ejecutar desde la carpeta del repositorio en PowerShell:

```powershell
docker compose config            # valida compose.yaml + .env (no inicia nada)
docker compose pull              # descarga la imagen v0.64.1
docker compose up -d             # crea e inicia el contenedor
docker compose ps                # estado; la columna STATUS muestra (healthy) cuando está listo
docker compose logs -f           # registros en vivo (Ctrl+C para salir; no detiene Metabase)
docker compose logs --tail 200   # últimas 200 líneas
docker compose stop              # detiene sin borrar datos
docker compose start             # inicia de nuevo
docker compose restart           # reinicia
Invoke-RestMethod http://localhost:3000/api/health   # debe mostrar: status ok
```

**Prohibido:** `docker compose down -v`, `docker volume rm metabase-qa-data`, `docker system prune --volumes`. Todos eliminan la configuración de Metabase.

### Verificación automática

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1 -GuardarEvidencia
```

El script es de solo lectura. Comprueba Docker, el contenedor, la imagen, el volumen, `/api/health` y la versión informada por `/api/session/properties`. Con `-GuardarEvidencia` deja un archivo `.txt` en `reportes-generales/evidencias-ambiente/`.

---

## 4. Copias de seguridad

Por coherencia del archivo H2, respalde con Metabase **detenido**:

```powershell
docker stop metabase-qa                 # Samuel también puede usar: docker compose stop
powershell -ExecutionPolicy Bypass -File .\scripts\respaldar-volumen.ps1
docker start metabase-qa                # o: docker compose start
```

El script monta el volumen en **solo lectura** dentro de un contenedor temporal (`--rm`, sin red ni puertos) y genera `respaldos/metabase-qa-data-<fecha>.tar.gz`. La carpeta `respaldos/` está excluida de Git. Copie el archivo a un lugar seguro fuera del repositorio.

Se recomienda un respaldo **después de preparar los recursos de referencia** y otro **antes de las pruebas de rendimiento**.

---

## 5. Alternativa futura (NO ejecutada): migrar la instalación de Juan a Compose

Solo con **autorización explícita de Juan** y **después de un respaldo verificado**. No forma parte de esta tarea.

1. `docker stop metabase-qa`
2. Respaldo: `scripts\respaldar-volumen.ps1`. Compruebe que el `.tar.gz` existe y tiene un tamaño razonable.
3. Conservar el contenedor antiguo sin borrarlo: `docker rename metabase-qa metabase-qa-legacy`
4. Crear `.env` (ver `.env.example`).
5. `docker compose up -d`. El nuevo contenedor usará **el mismo volumen** `metabase-qa-data`, porque tiene el mismo nombre. Docker puede advertir que el volumen "already exists but was not created by Docker Compose"; el aviso es esperado.
6. Verificar `scripts\verificar-ambiente.ps1`, iniciar sesión y comprobar que los recursos `QA - ...` siguen presentes y conservan sus IDs.
7. Solo cuando todo esté verificado, y con nueva autorización: `docker rm metabase-qa-legacy`. Nunca borre el volumen.

Reversión: `docker compose stop`, `docker rm metabase-qa` (solo el contenedor nuevo), `docker rename metabase-qa-legacy metabase-qa`, `docker start metabase-qa`.

> Nunca ejecute dos contenedores a la vez sobre el mismo volumen H2.

---

## 6. Configuración local de identificadores (IDs)

Los IDs numéricos de preguntas, dashboards y colecciones **son distintos en cada instalación**, aunque los recursos tengan el mismo nombre. Por eso:

- Ningún script, colección de Postman, prueba de Cypress o plan de JMeter compartido debe tener IDs escritos de forma fija.
- Cada integrante mantiene su propia configuración local, **no versionada**:

| Archivo versionado (plantilla) | Copia local (excluida por `.gitignore`) | Uso |
|---|---|---|
| [configuracion/recursos-locales.example.json](../configuracion/recursos-locales.example.json) | `configuracion/recursos-locales.json` | Registro de URL base e IDs de su instalación |
| [recursos-compartidos/postman/metabase-local.example.postman_environment.json](../recursos-compartidos/postman/metabase-local.example.postman_environment.json) | `recursos-compartidos/postman/metabase-local.postman_environment.json` | Entorno de Postman/Newman |

### Obtener los IDs

**Opción A, desde la interfaz:** abra el recurso y lea el número de la URL.

| Recurso | Ejemplo de URL | ID |
|---|---|---|
| Pregunta | `http://localhost:3000/question/34-qa-pedidos-con-subtotal-mayor-a-100` | 34 |
| Dashboard | `http://localhost:3000/dashboard/7-qa-dashboard-principal` | 7 |
| Colección | `http://localhost:3000/collection/5-qa-metabase` | 5 |
| Base de datos | Admin settings → Databases → Sample Database: `.../admin/databases/1` | 1 |

(Los números del ejemplo son ilustrativos. Use los suyos.)

**Opción B, con el script de solo lectura** (recomendado):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\obtener-ids-recursos.ps1 -Guardar -Integrante "Samuel"
```

El script pide el correo y la contraseña del administrador (no los guarda) y busca por nombre exacto los recursos `QA - ...`. Informa los recursos que faltan o están **duplicados**, lista las tablas de Sample Database y escribe `configuracion/recursos-locales.json`. Al terminar cierra su propia sesión. No crea ni modifica nada en Metabase.

### Secretos

- La contraseña y el identificador de sesión (`X-Metabase-Session`) **no se guardan en archivos versionados**.
- En la aplicación Postman (para diseñar o depurar), use la variable `password` de tipo *secret* solo en su entorno local, que está excluido de Git.
- **En las ejecuciones formales con Newman o JMeter no se entrega la contraseña a la herramienta.** Newman guarda las variables del entorno y las cabeceras en sus reportes nativos (comprobado el 2026-11-05 con valores falsos). Use siempre [scripts/ejecutar-herramienta.ps1](../scripts/ejecutar-herramienta.ps1): inicia la sesión fuera de la herramienta, la cierra al terminar y redacta el token en los archivos generados. Detalles en [HERRAMIENTAS-NEWMAN-JMETER.md](HERRAMIENTAS-NEWMAN-JMETER.md).

---

## 7. Endpoints de la API verificados para v0.64.1

Verificación hecha el 2026-11-04 sobre el **código fuente de la etiqueta `v0.64.1`** del repositorio oficial `metabase/metabase` (archivos de rutas `api_routes/routes.clj` y definiciones `defendpoint`). Contra la instancia en ejecución de Juan solo se han consultado los endpoints públicos `GET /api/health` y `GET /api/session/properties` (2026-11-05). Los endpoints de la tabla **aún no se han ejecutado** contra una instancia: confírmelos en la ejecución piloto.

| # | Endpoint del plan | ¿Existe en v0.64.1? | Notas de la fuente |
|---|---|---|---|
| 1 | `POST /api/session` | Sí | Cuerpo cerrado: solo `{"username": "...", "password": "..."}`. Devuelve `id` (token de sesión). También existe `DELETE /api/session` (cierre de sesión). |
| 2 | `GET /api/card` | Sí | Parámetro opcional `f` (`all` por defecto, `mine`, `archived`, ...). |
| 3 | `POST /api/card/{card-id}/query` | Sí | Cuerpo opcional: `ignore_cache` (booleano), `parameters`, `dashboard_id`. Acepta ID numérico o `entity_id`. |
| 4 | `GET /api/dashboard` | Sí, **marcado como deprecated** | La fuente indica que el frontend ya no lo usa y que "may be removed in the future". Parámetro `f`: `all`, `mine`, `archived`. |
| 5 | `GET /api/dashboard/{id}` | Sí | Acepta entero positivo o `entity_id` (NanoID). |
| 6 | `GET /api/collection` | Sí | Parámetros `archived`, `exclude-other-user-collections`, `personal-only`, `namespace`. |
| 7 | `GET /api/database` | Sí | Parámetro `include=tables` o `include=schemas`. La respuesta incluye la lista de bases de datos (con `is_sample` en Sample Database). |
| 8 | `POST /api/dataset` | Sí | Ejecuta una consulta ad hoc (`database`, `type`, `query`/`native`). "The query will not use the cache". |

Endpoints auxiliares también verificados: `GET /api/health`, `GET /api/session/properties` (público; incluye `version.tag`), `GET /api/card/{id}`, `GET /api/collection/{id}` y `GET /api/docs`.

**Rutas que no existen**, relevantes para los casos de error:

- No existe `GET /api/session`: solo `POST` y `DELETE` sobre `/api/session`, además de subrutas como `/properties`. Esto es lo que evalúa TC-ERR-004.

### Observaciones que deben confirmarse en la ejecución piloto

1. **Código HTTP de las consultas en streaming.** En v0.64.1, las respuestas de `POST /api/card/{card-id}/query` y `POST /api/dataset` se envían en *streaming*. La función genérica de streaming establece **`202` por defecto** (`(or status 202)` en `server/streaming_response.clj`), y no se encontró que estos endpoints la reemplacen por 200. Por tanto, es probable que una consulta exitosa responda **HTTP 202 Accepted**, mientras que el plan espera `200 OK` en TC-FUN-010, TC-CON-004, TC-REN-001, TC-REN-003, TC-REN-004 y TC-REN-005.
   - **Confirmado el 2026-11-05** en TC-FUN-010. `POST /api/card/{id}/query` responde 202 Accepted con cualquier cabecera `Accept` y con `ignore_cache`. La propia interfaz web también recibe 202 al mostrar una pregunta. `POST /api/dataset` responde igual (TC-FUN-003).
   - **Decisión del equipo (2026-11-05), desviación documentada del plan**, conforme a su matriz de riesgos ("Diferencias entre los contratos de la API y la versión instalada"): en los endpoints de consulta (`POST /api/card/{card-id}/query` y `POST /api/dataset`) se acepta como éxito **HTTP 200 o HTTP 202, siempre que el cuerpo tenga `status = "completed"`**. Aplica a TC-FUN-010, TC-CON-004, TC-REN-001, TC-REN-003, TC-REN-004 y TC-REN-005. Cada reporte debe registrar el código realmente obtenido y citar esta decisión. El texto del plan no se modifica; la desviación se informa en el informe final.
2. **Errores de consulta.** Una consulta que falla puede devolver un cuerpo JSON con `"status": "failed"` y el error. El código HTTP depende de si la respuesta ya había comenzado a enviarse. Verifíquelo en el piloto antes de escribir aserciones.
3. **TC-ERR-002** (`/api/dashboard/abc`): el parámetro `id` se valida como entero positivo o NanoID de 21 caracteres. Registre el código realmente obtenido; el plan admite 400 o 404.
4. **Caché.** `POST /api/card/{id}/query` admite `{"ignore_cache": true}`. Para TC-REN, registre la política de caché configurada (Admin settings → Performance, si está disponible en la edición OSS) y decida en el piloto si se envía `ignore_cache`. Use la misma decisión en todas las ejecuciones comparables.

> **Resultado del piloto (2026-11-05, instalación de Samuel):** el punto 1 **se confirmó**: `POST /api/card/40/query` y `POST /api/dataset` respondieron **202** con `status = "completed"`. TC-CON-004 quedó *No aprobado* por esa diferencia (hallazgo H-001); esa ejecución se hizo antes de la decisión del equipo del punto 1, y su resultado se conserva tal como se registró hasta que el responsable del caso lo reevalúe conforme a dicha decisión. Detalle en [CONTRATOS-API-V0.64.1.md §3](CONTRATOS-API-V0.64.1.md#3-resultados-del-piloto-del-2026-11-05-samuel).

### Consultar la referencia de la API de la instancia instalada

1. Con Metabase en ejecución, abra **`http://localhost:3000/api/docs`**. En v0.64.1, la ruta `/api/docs` está montada en el enrutador de la API y ofrece la documentación OpenAPI generada por la propia instancia. Si pide autenticación, inicie sesión primero en `http://localhost:3000`.
2. Guarde una copia (PDF o captura) en `reportes-generales/evidencias-ambiente/` como evidencia de la "documentación oficial revisada", criterio de inicio del plan.
3. Referencia complementaria: documentación oficial de la API en el sitio de Metabase, seleccionando la versión 0.64, y el código fuente de la etiqueta `v0.64.1` en GitHub.

---

## 8. Ajustes de la instancia que deben coincidir

Además de la versión y de los recursos de prueba, estos ajustes deben ser **iguales en las dos instalaciones**. Si no coinciden, pueden cambiar lo que se observa en la interfaz o las mediciones.

| Ajuste | Valor en la instalación de Juan (verificado 2026-11-05) | Dónde se define / revisa |
|---|---|---|
| Idioma de la instancia (`site-locale`) | `es` (Español) | Asistente inicial; **Configuración de administración → Ajustes →** localización |
| Zona horaria del informe (`report-timezone-short`) | `GMT` (valor predeterminado, no modificado) | **Configuración de administración → Ajustes →** localización. No cambiar |
| Recolección anónima de uso (`anon-tracking-enabled`) | `false` | Asistente inicial (paso 6) o **Ajustes** |
| Correo configurado (`email-configured?`) | `false` (sin servidor de correo) | No configurar. Por eso las invitaciones muestran una contraseña temporal |
| Complejidad de contraseñas (`password-complexity`) | Mínimo 6 caracteres y 1 dígito (por defecto) | No modificar |
| Contenido de ejemplo (colección `Examples`) | Presente | Se crea automáticamente; no modificar ni borrar |
| Política de caché | **Pendiente de registrar** (no es un ajuste público) | **Configuración de administración → Rendimiento → Caché** (*Performance → Caching*). Registrar el valor en ambas instalaciones antes de TC-REN y no cambiarlo sin acuerdo |
| Idioma del navegador | Registrar en la evidencia | El idioma de la interfaz lo fija la instancia, pero conviene que ambos usen el mismo navegador |

Comando para leer los ajustes públicos. Es de solo lectura y no requiere sesión:

```powershell
$p = Invoke-RestMethod http://localhost:3000/api/session/properties
[pscustomobject]@{
  version          = $p.version.tag
  idioma           = $p.'site-locale'
  zona_horaria     = $p.'report-timezone-short'
  seguimiento_anon = $p.'anon-tracking-enabled'
  correo           = $p.'email-configured?'
  asistente_hecho  = $p.'has-user-setup'
  contrasenas      = ($p.'password-complexity' | ConvertTo-Json -Compress)
}
```

**Resultado esperado en ambas instalaciones:** `version v0.64.1`, `idioma es`, `zona_horaria GMT`, `seguimiento_anon False`, `correo False`, `asistente_hecho True`, `contrasenas {"total":6,"digit":1}`. Guarde la salida en `reportes-generales/evidencias-ambiente/ajustes-instancia_<integrante>_<AAAAMMDD>.txt`.
