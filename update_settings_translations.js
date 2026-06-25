const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminSettings": {
    "loadFailed": "Error al cargar la configuración.",
    "saveSuccess": "Configuración del sistema guardada exitosamente.",
    "saveFailed": "Error al guardar la configuración.",
    "tabGeneral": "General",
    "tabNotifications": "Notificaciones",
    "tabSecurity": "Seguridad",
    "tabBackups": "Copias de seguridad",
    "rentalParams": "Parámetros de Alquiler",
    "taxRateLabel": "Tasa Base de Impuestos (%)",
    "depositLabel": "Depósito de Seguridad Predeterminado ($)",
    "currencyLabel": "Moneda",
    "businessDetails": "Detalles del Negocio",
    "emailLabel": "Correo del Negocio",
    "phoneLabel": "Teléfono del Negocio",
    "cancellationPolicyLabel": "Política de Cancelación",
    "operatingHours": "Horario de Atención",
    "businessDaysLabel": "Días Laborables",
    "daysPlaceholder": "ej. De Lunes a Domingo",
    "openingTimeLabel": "Hora de Apertura",
    "closingTimeLabel": "Hora de Cierre",
    "systemAlerts": "Alertas del Sistema",
    "newOrderAlerts": "Alertas de Nuevos Pedidos",
    "newOrderDesc": "Recibe una notificación cuando un cliente realice una nueva reserva.",
    "newMessageAlerts": "Alertas de Nuevos Mensajes",
    "newMessageDesc": "Recibe una notificación cuando alguien envíe una consulta a través del formulario de Contacto.",
    "securityControls": "Controles de Seguridad",
    "securityDesc": "Registros de auditoría y controles de seguridad activos para el panel de Administración.",
    "timeoutLabel": "Tiempo de inactividad para cierre de sesión automático (Minutos)",
    "timeoutDesc": "Si un administrador está inactivo por este tiempo, su sesión se cerrará automáticamente.",
    "auditLogTitle": "Registro de Auditoría de Autenticación",
    "loadingLogs": "Cargando registros...",
    "time": "Hora",
    "event": "Evento",
    "email": "Correo",
    "ipAddress": "Dirección IP",
    "noLogs": "No hay actividad de inicio de sesión reciente.",
    "unknownIp": "Desconocido",
    "dbExport": "Exportación de Base de Datos",
    "exportDesc": "Descarga una copia segura y encriptada de toda la base de datos principal, incluyendo clientes, reservas, vehículos, facturas y configuración.",
    "downloadBtn": "Descargar Base de Datos Completa",
    "exportSuccess": "Exportación de la base de datos completada exitosamente.",
    "exportFailed": "Error al exportar la base de datos.",
    "saveConfig": "Guardar Configuración"
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

console.log('Settings translations updated successfully.');
