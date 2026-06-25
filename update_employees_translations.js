const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminEmployees": {
    "searchPlaceholder": "Buscar empleados por nombre, correo, rol o puesto...",
    "addEmployee": "Agregar Empleado",
    "loading": "Cargando directorio de empleados...",
    "noEmployees": "No se encontraron empleados",
    "tryDifferentSearch": "Intenta con otro término de búsqueda.",
    "noAccountsYet": "Aún no has agregado ninguna cuenta de personal o administrador.",
    "employee": "Empleado",
    "roleAndStatus": "Rol y Estado",
    "contact": "Contacto",
    "activity": "Actividad",
    "actions": "Acciones",
    "adminRole": "Administrador",
    "staffRole": "Personal",
    "noTitle": "Sin Título",
    "joined": "Se unió:",
    "lastLogin": "Último Acceso:",
    "editEmployee": "Editar Empleado",
    "resetPasswordTitle": "Restablecer Contraseña",
    "removeEmployeeTitle": "Eliminar Empleado",
    "editEmployeeTitle": "Editar Empleado",
    "addEmployeeTitle": "Agregar Empleado",
    "firstName": "Nombre(s) *",
    "lastName": "Apellidos *",
    "emailLabel": "Correo electrónico *",
    "phoneLabel": "Teléfono *",
    "positionLabel": "Puesto / Cargo",
    "systemRole": "Rol del Sistema *",
    "staffOption": "Personal (Acceso Limitado)",
    "adminOption": "Administrador (Acceso Completo)",
    "accountStatus": "Estado de la Cuenta *",
    "statusActive": "Activo",
    "statusInactive": "Inactivo",
    "statusSuspended": "Suspendido",
    "initialPassword": "Contraseña Inicial *",
    "cancel": "Cancelar",
    "saveEmployee": "Guardar Empleado",
    "saving": "Guardando...",
    "newPassword": "Nueva Contraseña",
    "resetting": "Restableciendo...",
    "removeWarning": "¿Estás seguro de que deseas eliminar permanentemente esta cuenta de empleado? Perderá todo acceso inmediatamente. Esta acción no se puede deshacer.",
    "removing": "Eliminando...",
    "yesRemove": "Sí, Eliminar"
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

console.log('Employees translations updated successfully.');
