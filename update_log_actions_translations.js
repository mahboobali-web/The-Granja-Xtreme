const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminLogs": {
    "actions": {
      "uploadCloudinary": "Imagen subida a Cloudinary ({{id}})",
      "login": "LOGIN_{{status}}",
      "newUserFirebase": "Nuevo usuario registrado vía Firebase ({{role}})",
      "linkedFirebase": "Usuario de MongoDB existente vinculado a Firebase Auth",
      "updatedProfile": "Detalles del perfil actualizados",
      "createdEmployee": "Nuevo empleado creado",
      "updatedEmployee": "Perfil de empleado actualizado ({{email}})",
      "deletedEmployee": "Empleado eliminado ({{email}})",
      "resetPassword": "Contraseña restablecida para el empleado ({{email}})",
      "addedAtv": "Nuevo ATV añadido ({{model}})",
      "updatedAtv": "ATV actualizado ({{model}})",
      "deletedAtv": "ATV eliminado ({{model}})",
      "addedMaintenance": "Registro de mantenimiento añadido para ATV ({{model}})",
      "addedDamage": "Registro de daños añadido para ATV ({{model}})",
      "updatedCms": "Sección del CMS actualizada: {{key}}",
      "signedWaiver": "Exención firmada para la reserva {{id}}",
      "loggedInspection": "Inspección de {{type}} registrada para la reserva {{id}}",
      "updatedBookingStatus": "Estado de la reserva {{id}} actualizado a {{status}}",
      "generatedReceipt": "Recibo en PDF generado para la reserva {{id}}",
      "collectedPayment": "Pago de ${{amount}} cobrado para la reserva {{id}}",
      "updatedSettings": "Configuración del sistema actualizada",
      "downloadedBackup": "Copia de seguridad de la base de datos descargada"
    }
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

console.log('Logs actions translations updated successfully.');
