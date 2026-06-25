const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminAnalytics": {
    "last30DaysRev": "Estado de Ingresos de los Últimos 30 Días",
    "revenueStatement": "Estado de Ingresos",
    "last30Days": "Últimos 30 Días",
    "close": "Cerrar",
    "printStatement": "Imprimir Estado",
    "generatingStatement": "Generando Estado...",
    "officialStatement": "ESTADO DE INGRESOS OFICIAL",
    "generated": "Generado:",
    "generatedBy": "Generado Por: Sistema Admin",
    "totalRevMetrics": "Ingresos Totales",
    "activeDays": "Días Activos",
    "avgDaily": "Promedio Diario",
    "date": "Fecha",
    "dailyRev": "Ingresos Diarios",
    "pctOfTotal": "% del Total",
    "noRevData": "No hay datos de ingresos para este período.",
    "total": "TOTAL",
    "preparedFor": "PREPARADO PARA",
    "execMgmt": "GERENCIA EJECUTIVA",
    "reportHash": "HASH DE AUTENTICIDAD DEL INFORME",
    "printReport": "Imprimir Informe",
    "generatingReport": "Generando Informe...",
    "fleetReportTitle": "INFORME DE UTILIZACIÓN DE FLOTA",
    "currentOps": "Estado Operativo Actual",
    "totalFleetSize": "Tamaño Total de la Flota",
    "currentlyRented": "Actualmente Alquilado",
    "inMaintenance": "En Mantenimiento",
    "operationalPct": "% Operativo",
    "vehicleModelName": "Modelo / Nombre del Vehículo",
    "totalAllTimeRentals": "Total de Alquileres Históricos",
    "noVehicleData": "No hay datos de vehículos disponibles.",
    "fleetMgmt": "GESTIÓN DE FLOTAS"
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

console.log('Report translations updated successfully.');
