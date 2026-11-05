# Trabajo colaborativo mediante GitHub

## 1. Qué se comparte y qué no

| Se comparte en GitHub (versionado) | Permanece solo en cada computador |
|---|---|
| Documentación (`README.md`, `docs/`) | Volumen Docker `metabase-qa-data` (base de aplicación H2: usuarios, preguntas, dashboards, permisos) |
| `compose.yaml`, `.env.example`, `.gitignore` | `.env` (clave de sesión) |
| Plan, matriz de seguimiento, valores de referencia, registro de hallazgos | `configuracion/recursos-locales.json` (IDs locales) |
| Scripts (`scripts/`) | `recursos-compartidos/postman/*.postman_environment.json` con valores reales |
| Colecciones de Postman, pruebas de Cypress y planes de JMeter (sin IDs fijos ni credenciales) | `respaldos/`, `node_modules/`, artefactos temporales de Cypress y JMeter |
| Evidencias y reportes autorizados | Contraseñas, tokens y cookies (nunca en archivos del repositorio) |

### Limitación importante: las instalaciones de Metabase no se sincronizan

GitHub **no** sincroniza Metabase. Una pregunta, un dashboard, un usuario o un permiso que Samuel cree en su instalación **no aparece** en la de Juan, ni al revés. Cada instalación tiene su propia base de aplicación H2 dentro de su volumen Docker.

Para mantener recursos **equivalentes**:

1. La **definición** de cada recurso de referencia está en [DATOS-Y-RECURSOS-PRUEBA.md](DATOS-Y-RECURSOS-PRUEBA.md). Esa es la fuente única.
2. Cada integrante crea los recursos en su instalación siguiendo ese documento, con los mismos nombres exactos.
3. Cada uno verifica con `scripts/obtener-ids-recursos.ps1` (sin `[FALTA]` ni `[DUPLICADO]`) y registra sus valores en `recursos-compartidos/datos/valores-referencia.csv`.
4. Si se necesita **cambiar** un recurso de referencia, primero se actualiza el documento mediante commit y aviso al compañero, y después **ambos** aplican el cambio en su instalación.
5. Los IDs locales se mantienen fuera del repositorio. Los scripts y colecciones usan variables (`{{dashboardId}}`, `{{cardId}}`, ...).

---

## 2. Creación del repositorio (Juan; requiere autorización, aún no realizado)

En el computador de Juan, dentro de la carpeta del proyecto:

```powershell
git init -b main
git status                     # revisar que NO aparezcan .env, respaldos/ ni archivos .mv.db
git add .
git commit -m "Estructura inicial del ambiente QA de Metabase"
```

En GitHub: **New repository** → nombre `Metabase-Pruebas` → **Private** (recomendado) → sin README, para no generar conflicto → **Create**. Luego:

```powershell
git remote add origin https://github.com/<usuario>/Metabase-Pruebas.git
git push -u origin main
```

Invitar a Samuel: **Settings → Collaborators → Add people**.

> Nota: la carpeta de Juan está dentro de **OneDrive**. Si OneDrive bloquea archivos de `.git`, pause la sincronización mientras trabaja con Git o mueva el repositorio fuera de OneDrive.

## 3. Clonación (Samuel)

Ver [INSTALACION-SAMUEL.md, paso 6](INSTALACION-SAMUEL.md#paso-6-clonar-el-repositorio-desde-github).

## 4. Rutina diaria

```powershell
git pull                          # 1. siempre al empezar y antes de editar archivos compartidos
# ... trabajar ...
git status                        # 2. revisar qué cambió (que no aparezcan secretos)
git add <archivos>                # 3. agregar solo lo que corresponde
git commit -m "TC-FUN-001: ejecucion y evidencia (Samuel)"
git pull                          # 4. integrar lo que haya subido el compañero
git push                          # 5. publicar
```

Mensajes de commit sugeridos: `<ID o área>: <qué se hizo> (<integrante>)`, por ejemplo `docs: ajuste de permisos de QA - Restringida (Juan)` o `TC-REN-004: resumen JMeter (Juan)`.

## 5. Ramas y pull requests (opcional)

El flujo recomendado para un equipo de dos personas es trabajar en `main` con commits pequeños. Use ramas y pull requests para cambios que afecten la **configuración compartida** o para automatizaciones grandes:

```powershell
git switch -c samuel/postman-coleccion-inicial
# ... cambios y commits ...
git push -u origin samuel/postman-coleccion-inicial
```

En GitHub: **Compare & pull request** → el otro integrante revisa → **Merge**. Luego:

```powershell
git switch main
git pull
git branch -d samuel/postman-coleccion-inicial
```

Prefijos de rama: `juan/...` y `samuel/...`.

## 6. Evitar conflictos

- **Matriz de seguimiento** (`reportes-generales/matriz-trazabilidad.csv`): cada integrante edita **solo las filas de los casos que ejecuta**. Haga `git pull` antes de editar y `commit` + `push` inmediatamente después. No reordene filas ni guarde desde Excel ([EJECUCION-PRUEBAS.md §6](EJECUCION-PRUEBAS.md#6-abrir-la-matriz-csv-sin-romperla)).
- **Valores de referencia:** Juan completa sus columnas y hace push; Samuel hace pull y completa las suyas. No editen el archivo al mismo tiempo.
- **Registro de hallazgos:** agregue filas solo al final. Use IDs `HAL-<integrante>-<nn>` (por ejemplo `HAL-SAM-01`) para no repetir numeración.
- **Evidencias y resultados:** cada ejecución usa su propia carpeta `<AAAAMMDD>-<integrante>-<NN>` dentro del caso, así que dos integrantes no pueden sobrescribirse. Cada `reporte.md` lo edita solo quien ejecuta el caso.
- **Si aparece un conflicto:** Git marca el archivo con `<<<<<<<`, `=======` y `>>>>>>>`. Edítelo conservando las dos versiones correctas, y luego ejecute `git add <archivo>`, `git commit` y `git push`. Si tiene dudas, avise antes de resolverlo. **No use** `git push --force`.

## 7. Cambios en la configuración compartida

Los cambios en `compose.yaml`, `.env.example`, `.gitignore`, `scripts/` o los nombres o definiciones de recursos en `docs/DATOS-Y-RECURSOS-PRUEBA.md`:

1. Se proponen en una rama con pull request, o al menos con un aviso previo al compañero.
2. **Nunca** cambian la versión de la imagen (`v0.64.1`) sin acuerdo explícito, porque las migraciones de H2 no son reversibles.
3. Después del merge, cada integrante revisa el cambio (`git log -p -1 -- compose.yaml`) antes de ejecutar `docker compose up -d`. En el equipo de Juan **no** se usa Compose ([CONFIGURACION-QA.md §2](CONFIGURACION-QA.md#2-las-dos-instalaciones)).

## 8. Antes de cada push: revisión de seguridad

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\revisar-secretos.ps1   # debe mostrar [OK]
git status
git diff --cached --name-only
```

Confirme que no se incluyen `.env`, `configuracion/recursos-locales.json`, entornos de Postman con contraseña, archivos `.mv.db` ni `respaldos/`, y que ninguna captura muestra contraseñas o tokens. Si subió un secreto por error: **cámbielo de inmediato** (nueva contraseña o nueva `MB_SESSION_SECRET_KEY`) y avise. Borrar el archivo después no lo elimina del historial.
