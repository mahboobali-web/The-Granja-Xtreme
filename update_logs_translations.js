const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminLogs": {
    "searchLabel": "Buscar",
    "searchPlaceholder": "Buscar acción o usuario...",
    "eventTypeLabel": "Tipo de Evento",
    "allEvents": "Todos los Eventos",
    "info": "Información",
    "success": "Éxito",
    "warning": "Advertencia",
    "error": "Error",
    "startDate": "Fecha de Inicio",
    "endDate": "Fecha de Fin",
    "event": "Evento",
    "user": "Usuario",
    "ipAddress": "Dirección IP",
    "timestamp": "Marca de Tiempo",
    "loadingLogs": "Cargando registros...",
    "noLogs": "No se encontraron registros de actividad.",
    "showingLogs": "Mostrando {{start}} a {{end}} de {{total}} registros"
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

console.log('Logs translations updated successfully.');
