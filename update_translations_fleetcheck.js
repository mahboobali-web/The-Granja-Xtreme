const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "fleetCheckModal": {
    "title": "Programar Revisión de Flota",
    "error": "Error al programar la revisión de la flota",
    "selectAtv": "Seleccionar ATV",
    "chooseAtv": "-- Elegir ATV --",
    "serviceDescription": "Descripción del Servicio",
    "placeholderDescription": "ej. Servicio de 500 millas, Cambio de aceite",
    "mechanicName": "Nombre del Mecánico",
    "placeholderMechanic": "Juan Pérez",
    "estimatedCost": "Costo Estimado ($)",
    "scheduledDate": "Fecha Programada",
    "scheduling": "Programando...",
    "confirm": "Confirmar Revisión de Flota"
  }
};

let esData = JSON.parse(fs.readFileSync(esFilePath, 'utf8'));

// Deep merge
function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

mergeDeep(esData, newTranslations);

fs.writeFileSync(esFilePath, JSON.stringify(esData, null, 2), 'utf8');

console.log('Translations updated successfully.');
