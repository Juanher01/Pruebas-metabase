# Casos de prueba

Hay una carpeta por cada uno de los **29 casos** del plan, agrupadas por categoría:

| Categoría | Carpeta | Casos |
|---|---|---|
| Funcionales | `funcionales/` | TC-FUN-001 … TC-FUN-010 |
| Validación de entradas | `validacion/` | TC-VAL-001 … TC-VAL-005 |
| Manejo de errores | `errores/` | TC-ERR-001 … TC-ERR-005 |
| Contrato y consistencia | `contrato/` | TC-CON-001 … TC-CON-004 |
| Rendimiento | `rendimiento/` | TC-REN-001 … TC-REN-005 |

## Contenido de cada caso

```
TC-XXX-000/
├── caso.md        Ficha del caso extraída del plan (ya creada)
├── scripts/       Automatización específica del caso (se crea al automatizar)
├── evidencias/    Capturas y evidencias observables, por ejecución
├── resultados/    Salidas nativas de Cypress / Newman / JMeter, por ejecución
└── reporte.md     Informe individual: se crea SOLO tras una ejecución real
```

- **Nombres de scripts:** `scripts/<ID>.cy.js` (Cypress), `scripts/<ID>.postman_collection.json` (Postman/Newman) o `scripts/<ID>.jmx` (JMeter).
- **Ejecuciones:** cada ejecución usa una subcarpeta `<AAAAMMDD>-<integrante>-<NN>` dentro de `evidencias/` y de `resultados/`, con el mismo nombre en ambas. Nunca se reutiliza ni se borra una carpeta de ejecución anterior.
- **Newman y JMeter:** se ejecutan con `scripts/ejecutar-herramienta.ps1`, que crea la carpeta de ejecución y protege la sesión ([docs/HERRAMIENTAS-NEWMAN-JMETER.md](../docs/HERRAMIENTAS-NEWMAN-JMETER.md)).
- **Reporte:** `reporte.md` se crea a partir de [la plantilla compartida](../recursos-compartidos/plantillas/plantilla-reporte.md).
- **Seguimiento:** cada caso tiene una fila en la [matriz de trazabilidad](../reportes-generales/matriz-trazabilidad.csv), con sus rutas.
- **Recursos compartidos:** la configuración, las funciones y los datos reutilizables van en [`recursos-compartidos/`](../recursos-compartidos/), no dentro de cada caso.

Las verificaciones complementarias de seguridad funcional e integración **no** son casos con identificador propio en el plan. Se registran en [`reportes-generales/verificaciones-complementarias/`](../reportes-generales/verificaciones-complementarias/).
