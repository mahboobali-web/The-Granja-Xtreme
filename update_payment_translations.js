const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminPayments": {
    "outstandingBalance": "Saldo Pendiente",
    "requiresAttention": "Requiere atención",
    "todaysCollections": "Cobros de Hoy",
    "processedToday": "Procesado hoy",
    "monthlyCollections": "Cobros Mensuales",
    "currentMonthTotal": "Total del mes actual",
    "unpaidInvoices": "Facturas No Pagadas",
    "pendingResolution": "Pendiente de resolución",
    "searchPlaceholder": "Buscar por # factura, cliente o teléfono...",
    "filterAll": "Todos",
    "filterUnpaid": "No Pagados",
    "filterPaid": "Pagados",
    "filterPartiallyPaid": "Parcialmente Pagados",
    "filterRentalCharges": "Cargos de Alquiler",
    "filterDamageCharges": "Cargos por Daños",
    "invoiceNum": "Factura #",
    "customer": "Cliente",
    "atvType": "ATV / Tipo",
    "amount": "Monto",
    "balance": "Saldo",
    "status": "Estado",
    "method": "Método",
    "actions": "Acciones",
    "noInvoices": "Ninguna factura coincide con el filtro actual.",
    "cancelled": "Cancelado",
    "statusPaid": "Pagado",
    "statusPartiallyPaid": "Parcialmente Pagado",
    "statusUnpaid": "No Pagado",
    "statusDraft": "Borrador",
    "onArrival": "A la llegada",
    "unknown": "Desconocido",
    "viewDetails": "Ver Detalles",
    "collectPayment": "Cobrar Pago",
    "viewPrintReceipt": "Ver e Imprimir Recibo",
    "collectPaymentTitle": "Cobrar Pago",
    "amountToCollect": "Monto a Cobrar",
    "remainingBalance": "Saldo Restante:",
    "paymentMethod": "Método de Pago",
    "cancel": "Cancelar",
    "processing": "Procesando...",
    "confirmPayment": "Confirmar Pago",
    "invalidAmount": "Por favor ingrese un monto válido hasta",
    "failedRecordPayment": "Error al registrar el pago."
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

console.log('Payment translations updated successfully.');
