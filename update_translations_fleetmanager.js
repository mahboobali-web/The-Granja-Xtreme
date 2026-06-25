const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "fleetManager": {
    "atvBrandName": "Marca del ATV",
    "placeholderBrand": "ej. Polaris Sportsman 570",
    "modelSeries": "Serie del Modelo",
    "placeholderSeries": "ej. Utility Edition",
    "modelYear": "Año del Modelo",
    "ratePerDay": "Tarifa / Día ($)",
    "ratePerHour": "Tarifa / Hora ($)",
    "displacement": "Cilindrada",
    "fuelTank": "Tanque de Combustible",
    "weightLimit": "Límite de Peso",
    "imageUpload": "Subir Imagen (Seleccionar varias)",
    "uploadingImages": "Subiendo imágenes...",
    "thumbnail": "Miniatura",
    "vehicleDescription": "Descripción del Vehículo",
    "placeholderVehicleDesc": "Escribe especificaciones de rendimiento, idoneidad para senderos...",
    "loading": "Cargando registro de la flota...",
    "statusAvailable": "Disponible",
    "statusRented": "Alquilado",
    "statusMaintenance": "Mantenimiento",
    "statusRetired": "Retirado",
    "searchPlaceholder": "Buscar por modelo o ID...",
    "filterAll": "Todos los Vehículos",
    "filterAvailable": "Disponibles",
    "filterMaintenance": "En Mantenimiento",
    "filterRented": "Alquilados",
    "perDay": "/día",
    "model": "Modelo",
    "edit": "Editar",
    "service": "Servicio",
    "noVehicles": "No hay vehículos que coincidan con los criterios seleccionados.",
    "registerNewQuad": "Registrar Nuevo ATV Quad",
    "saveQuadToFleet": "Guardar Quad en la Flota",
    "editAtvDetails": "Editar Detalles del ATV",
    "vehicleStatus": "Estado del Vehículo",
    "statusOptAvailable": "Disponible",
    "statusOptRented": "Alquilado (En Sendero)",
    "statusOptMaintenance": "Mantenimiento (En Taller)",
    "statusOptRetired": "Dado de baja (Retirado)",
    "saveChanges": "Guardar Cambios",
    "logMaintenanceRecord": "Registrar Mantenimiento de Servicio",
    "serviceType": "Tipo de Servicio",
    "serviceTypes": {
      "oilChange": "Cambio de Aceite",
      "tireReplacement": "Reemplazo de Neumáticos",
      "engineTuning": "Afinación del Motor",
      "brakeAdjustment": "Ajuste de Frenos",
      "bodyRepair": "Reparación de Carrocería"
    },
    "serviceCost": "Costo de Servicio ($)",
    "serviceDescDetails": "Detalles de la Descripción del Servicio",
    "placeholderServiceDesc": "ej. Cambio de filtro de aire, purgado de líneas de freno...",
    "logServiceEvent": "Registrar Evento de Servicio"
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

console.log('FleetManager translations updated successfully.');
