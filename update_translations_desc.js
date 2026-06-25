const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "fleetManager": {
    "vehicleDescriptionEn": "Descripción del Vehículo (Inglés)",
    "vehicleDescriptionEs": "Descripción del Vehículo (Español)",
    "placeholderVehicleDescEn": "Escribe especificaciones de rendimiento en inglés...",
    "placeholderVehicleDescEs": "Escribe especificaciones de rendimiento en español..."
  }
};

let esData = JSON.parse(fs.readFileSync(esFilePath, 'utf8'));

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
