const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminAnalytics": {
    "revenueCollected": "Ingresos Recaudados",
    "totalPayments": "Total de pagos recibidos",
    "outstandingRevenue": "Ingresos Pendientes",
    "pendingInvoices": "Facturas pendientes de pago",
    "monthlyRevenue": "Ingresos Mensuales",
    "collectedMonth": "Recaudado este mes",
    "damageCharges": "Cargos por Daños",
    "assessedDamages": "Total de daños evaluados",
    "activeRentals": "Alquileres Activos",
    "onTrails": "Actualmente en ruta",
    "availableATVs": "Cuatrimotos Disponibles",
    "readyBooking": "Listos para reservar",
    "totalCustomers": "Total de Clientes",
    "registeredUsers": "Usuarios registrados",
    "revenueReport": "Informe de Ingresos",
    "earningsBookings": "Ganancias de todas las reservas",
    "fullStatement": "Estado de Cuenta",
    "bookingTrends": "Tendencias de Reservas",
    "noBookingData": "No hay datos de reservas disponibles.",
    "mostRented": "Vehículos Más Alquilados",
    "trackingDesc": "Seguimiento detallado del rendimiento del vehículo.",
    "genPdf": "Generar PDF",
    "vehicleModel": "Modelo de Vehículo",
    "totalRentals": "Total de Alquileres",
    "noData": "No hay datos disponibles",
    "times": "veces"
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
