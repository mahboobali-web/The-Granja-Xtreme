const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminBookings": {
    "allVehicles": "Todos los Vehículos",
    "allStatuses": "Todos los Estados",
    "month": "Mes",
    "week": "Semana",
    "months": {
      "january": "Enero",
      "february": "Febrero",
      "march": "Marzo",
      "april": "Abril",
      "may": "Mayo",
      "june": "Junio",
      "july": "Julio",
      "august": "Agosto",
      "september": "Septiembre",
      "october": "Octubre",
      "november": "Noviembre",
      "december": "Diciembre"
    },
    "days": {
      "sun": "DOM",
      "mon": "LUN",
      "tue": "MAR",
      "wed": "MIE",
      "thu": "JUE",
      "fri": "VIE",
      "sat": "SAB"
    },
    "more": "más",
    "selected": "Seleccionada",
    "date": "Fecha",
    "noBookings": "No hay reservas para esta fecha.",
    "pendingApproval": "PENDIENTE DE APROBACIÓN",
    "pendingCheckOut": "Check Out Pendiente",
    "checkedOutTime": "Salida: ",
    "viewDetails": "Ver Detalles",
    "approve": "Aprobar",
    "confirmedForToday": "CONFIRMADO PARA HOY",
    "status": {
      "pending": "Pendiente",
      "pendingsignature": "Firma Pendiente",
      "customersigned": "Firmado por Cliente",
      "reserved": "Reservado",
      "active": "Activo",
      "completed": "Completado",
      "cancelled": "Cancelado"
    },
    "checkoutSuffix": " Salida",
    "checkinSuffix": " Entrada",
    "scheduledStart": "Inicio Programado",
    "paidInFull": "Pagado por completo",
    "markAsPaid": "Marcar como Pagado",
    "details": "Detalles",
    "cancelledForToday": "CANCELADO PARA HOY",
    "cancelled": "CANCELADO",
    "viewDetailsReceipt": "Ver Detalles / Recibo",
    "vehicleHealth": "Salud de la Flota",
    "readySuffix": "% Listo",
    "staffing": "Personal",
    "activeGuides": "Guías Activos",
    "maintenance": "Mantenimiento",
    "dueForService": "Requiere Servicio",
    "scheduleFleetCheck": "Programar Revisión de Flota"
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
