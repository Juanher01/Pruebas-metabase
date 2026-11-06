// Configuracion compartida de Cypress para Metabase-Pruebas.
// Se ejecuta SIEMPRE mediante scripts/ejecutar-herramienta.ps1 -Herramienta cypress, que:
//   - usa la raiz del repositorio como proyecto (--project) y este archivo (--config-file);
//   - fija baseUrl y screenshotsFolder (= pruebas/<cat>/<ID>/evidencias/<id-ejecucion>/) con las
//     variables MBQA_BASE_URL y MBQA_EVIDENCIAS;
//   - entrega las credenciales QA solo como variables del proceso (CYPRESS_QA_EMAIL,
//     CYPRESS_QA_PASSWORD), que las especificaciones leen con cy.env([...], { log: false }).
// No crear cypress.env.json con valores reales.
const fs = require('fs');
const path = require('path');

module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'pruebas/**/scripts/*.cy.js',
    supportFile: false,
    fixturesFolder: false,
    video: false,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: false, // nunca borrar evidencias de ejecuciones anteriores
    screenshotsFolder: 'recursos-compartidos/cypress/screenshots',
    downloadsFolder: 'recursos-compartidos/cypress/downloads',
    videosFolder: 'recursos-compartidos/cypress/videos',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
      // El script de ejecucion indica la carpeta de evidencias y la URL mediante variables del
      // proceso (los valores de --config no prevalecen sobre los del bloque e2e en Cypress 16).
      if (process.env.MBQA_EVIDENCIAS) { config.screenshotsFolder = process.env.MBQA_EVIDENCIAS; }
      if (process.env.MBQA_BASE_URL) { config.baseUrl = process.env.MBQA_BASE_URL; }
      // Guardar cada captura directamente en screenshotsFolder (sin subcarpetas por spec).
      on('after:screenshot', (details) => {
        const destino = path.join(config.screenshotsFolder, path.basename(details.path));
        if (path.resolve(destino) !== path.resolve(details.path)) {
          fs.renameSync(details.path, destino);
          return { path: destino };
        }
        return {};
      });
      return config;
    },
  },
};
