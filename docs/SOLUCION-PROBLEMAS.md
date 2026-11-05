# Solución de problemas

**Regla general:** no elimine contenedores ni volúmenes como primera solución. Primero diagnostique (estado, registros) y, si va a hacer algo irreversible, haga un respaldo ([CONFIGURACION-QA.md §4](CONFIGURACION-QA.md#4-copias-de-seguridad)).

Comandos de diagnóstico útiles:

```powershell
docker ps -a --filter "name=metabase-qa" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
docker logs --tail 100 metabase-qa
docker inspect --format "{{.State.Status}} OOM={{.State.OOMKilled}} Reinicios={{.RestartCount}}" metabase-qa
powershell -ExecutionPolicy Bypass -File .\scripts\verificar-ambiente.ps1
```

---

## 1. Docker Desktop no inicia

1. Reinicie Windows y abra Docker Desktop de nuevo.
2. Compruebe WSL en PowerShell como administrador: `wsl --status` y `wsl --update`.
3. Compruebe que la virtualización está activada ([INSTALACION-SAMUEL.md, paso 1](INSTALACION-SAMUEL.md#paso-1-comprobar-los-requisitos-previos)).
4. Docker Desktop → **Troubleshoot** (ícono de insecto) → **Restart Docker Desktop**. *Clean / Purge data* y *Reset to factory defaults* **borran los volúmenes**: no los use sin un respaldo.

## 2. Docker Engine no responde

Síntoma: *"Cannot connect to the Docker daemon"*, *"error during connect"* o `docker info` falla.

- Espere a que Docker Desktop muestre **Engine running**.
- Cierre Docker Desktop desde el ícono de la bandeja (**Quit Docker Desktop**) y ábralo de nuevo.
- `wsl --shutdown` (PowerShell) y vuelva a abrir Docker Desktop. Esto no borra datos.

## 3. Puerto 3000 ocupado

Síntoma: *"Bind for 127.0.0.1:3000 failed: port is already allocated"*.

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object LocalAddress, OwningProcess
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

- Si es otro programa (por ejemplo un servidor de desarrollo de Node), deténgalo.
- Si es otro contenedor, deténgalo con `docker stop <nombre>`.
- Alternativa (solo con Compose): en `.env`, ponga `MB_PUERTO_LOCAL=3001`, ejecute `docker compose up -d` y use `http://localhost:3001` en `configuracion/recursos-locales.json` y en Postman. Registre el cambio.

## 4. El contenedor ya existe

Síntoma: *"The container name "/metabase-qa" is already in use"*.

1. Revise qué contenedor es: `docker inspect --format "{{.Config.Image}} {{index .Config.Labels \"com.docker.compose.project\"}}" metabase-qa`.
2. **Equipo de Juan:** es la instalación original creada con `docker run`. **No la elimine.** Úsela con `docker start metabase-qa`. No use Compose en ese equipo.
3. **Equipo de Samuel:** si fue creado por Compose (la etiqueta muestra `metabase-pruebas`), use `docker compose start`. Si es un intento anterior manual y no contiene nada que conservar, puede eliminar **solo el contenedor** con `docker rm metabase-qa`. El volumen se conserva y Compose lo reutilizará.

## 5. Metabase tarda en iniciar

- El primer arranque crea la base de aplicación y puede tardar de 1 a 5 minutos. Los siguientes suelen ser más rápidos.
- Siga los registros con `docker logs -f metabase-qa` hasta ver `Metabase Initialization COMPLETE`.
- Si el equipo tiene poca memoria: Docker Desktop → Settings → Resources → asigne al menos 4 GB, y cierre otras aplicaciones o contenedores. Si `OOMKilled=true`, se quedó sin memoria.

## 6. `/api/health` no responde

1. ¿El contenedor está `Up`? `docker ps -a --filter name=metabase-qa`. Si está `Exited`, inícielo (`docker start metabase-qa` o `docker compose start`).
2. ¿Sigue iniciando? Revise los registros (sección 5).
3. ¿El puerto es el correcto? `docker port metabase-qa` debe mostrar `3000/tcp -> 127.0.0.1:3000`.
4. Use `http://localhost:3000` o `http://127.0.0.1:3000` (el puerto solo escucha en la interfaz local).
5. En Windows PowerShell 5.1 use `Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/health`.

## 7. Sample Database no aparece

- Revise **Configuración de administración → Bases de datos** (*Admin settings → Databases*): puede estar presente aunque no aparezca en **Explorar datos** (*Browse data*).
- La variable `MB_LOAD_SAMPLE_CONTENT` no debe estar en `false`; `compose.yaml` no la define.
- Si se eliminó: en **Configuración de administración → Bases de datos** puede aparecer la opción para volver a agregar la base de datos de ejemplo (*Sample Database*). Regístrelo como incidencia del ambiente.
- Si aparece sin tablas: **Configuración de administración → Bases de datos → Sample Database → Sincronizar esquema de la base de datos** (*Sync database schema*).

## 8. Errores al crear usuarios

- *"Email address already in use"*: el usuario ya existe, posiblemente desactivado. Búsquelo en **Personas** (*People*), incluyendo la pestaña de desactivados, y reactívelo.
- Sin servidor de correo no se envía la invitación. Use la contraseña temporal que muestra Metabase o **Restablecer contraseña** (*Reset password*) ([DATOS-Y-RECURSOS-PRUEBA.md §2.2](DATOS-Y-RECURSOS-PRUEBA.md#22-crear-invitar-el-usuario-normal)).
- Contraseña rechazada: siga los requisitos de complejidad que indica el formulario.

## 9. Problemas de permisos

- **El usuario normal ve un recurso restringido:** el grupo **Todos los usuarios** (*All Users*) todavía tiene acceso. Los permisos se suman ([DATOS-Y-RECURSOS-PRUEBA.md §2.4](DATOS-Y-RECURSOS-PRUEBA.md#24-permisos-acumulativos-de-all-users-precaución-importante)). Ponga **Todos los usuarios → Sin acceso** (*No access*) en `QA - Restringida` y confirme que el usuario no pertenece a otro grupo con acceso.
- **El usuario normal no puede consultar Sample Database:** revise **Permisos → Datos** (*Permissions → Data*) para Todos los usuarios ([DATOS-Y-RECURSOS-PRUEBA.md §2.5](DATOS-Y-RECURSOS-PRUEBA.md#25-permisos-de-datos)).
- **Los cambios no se aplican:** confirme que pulsó **Guardar cambios** (*Save changes*) en la pantalla de permisos y vuelva a iniciar sesión con el usuario.

## 10. Diferencias de identificadores de preguntas y dashboards

Es **normal**: cada instalación asigna sus propios IDs. No copie los IDs del compañero. Ejecute `scripts/obtener-ids-recursos.ps1 -Guardar` y actualice su entorno local de Postman. Si el script informa `[DUPLICADO]`, archive el recurso sobrante. Si informa `[FALTA]`, revise que el nombre sea exactamente igual, incluidas las tildes.

## 11. Conflictos entre `docker run` y Docker Compose

- No gestione el mismo contenedor con los dos métodos. En el equipo de Juan: `docker start/stop/logs metabase-qa`. En el de Samuel: `docker compose start/stop/logs`.
- Nunca ejecute dos contenedores sobre el mismo volumen H2 al mismo tiempo.
- La migración del equipo de Juan a Compose está documentada como alternativa, con respaldo y autorización previos: [CONFIGURACION-QA.md §5](CONFIGURACION-QA.md#5-alternativa-futura-no-ejecutada-migrar-la-instalación-de-juan-a-compose).

## 12. Reiniciar sin perder datos

| Situación | Comando seguro |
|---|---|
| Equipo de Juan | `docker restart metabase-qa` |
| Equipo de Samuel | `docker compose restart` |
| Recrear el contenedor (Samuel, por ejemplo tras un cambio aprobado en `compose.yaml`) | `docker compose up -d` (el volumen se conserva) |

**Comandos que borran datos (no usar):** `docker compose down -v`, `docker volume rm metabase-qa-data`, `docker volume prune`, `docker system prune --volumes`, y *Clean/Purge data* o *Reset to factory defaults* de Docker Desktop.

## 13. Copias de seguridad del ambiente local

```powershell
docker stop metabase-qa          # Samuel: docker compose stop
powershell -ExecutionPolicy Bypass -File .\scripts\respaldar-volumen.ps1
docker start metabase-qa         # Samuel: docker compose start
```

Para **restaurar** (solo si es necesario y con autorización, porque **reemplaza** el contenido actual del volumen), con Metabase detenido:

```powershell
docker run --rm --network none --entrypoint sh -v metabase-qa-data:/destino -v "${PWD}\respaldos:/respaldo:ro" metabase/metabase:v0.64.1 -c "cd /destino && tar xzf /respaldo/<ARCHIVO>.tar.gz"
```

Antes de restaurar, haga un respaldo del estado actual.
