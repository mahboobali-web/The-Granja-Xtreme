const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminMessages": {
    "deleteConfirm": "¿Estás seguro de que quieres eliminar este mensaje?",
    "searchMessages": "Buscar mensajes...",
    "tab_all": "Todos",
    "tab_unread": "No leídos",
    "tab_read": "Leídos",
    "loading": "Cargando...",
    "noMessagesFound": "No se encontraron mensajes.",
    "messageFrom": "Mensaje de",
    "readStatus": "Leído",
    "from": "De",
    "email": "Correo electrónico",
    "phone": "Teléfono",
    "date": "Fecha",
    "messageLabel": "Mensaje",
    "replyViaGmail": "Responder vía Gmail",
    "delete": "Eliminar",
    "noMessageSelected": "Ningún Mensaje Seleccionado",
    "selectMessagePrompt": "Seleccione un mensaje de la lista para ver sus detalles."
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

console.log('Messages translations updated successfully.');
