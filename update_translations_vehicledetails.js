const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "Vehicle Specifications Not Found": "Especificaciones del Vehículo no Encontradas",
  "The requested quad is not in our registry.": "El quad solicitado no está en nuestro registro.",
  "Browse our fleet": "Explorar nuestra flota",
  "Photos": "Fotos",
  "Premium Elite": "Premium Élite",
  "Adventure Standard": "Aventura Estándar",
  "Available Now": "Disponible Ahora",
  "Engine Size": "Tamaño del Motor",
  "Fuel Capacity": "Capacidad de Combustible",
  "Weight Limit": "Límite de Peso",
  "Drive Type": "Tipo de Tracción",
  "Transmission": "Transmisión",
  "Experience Level": "Nivel de Experiencia",
  "The Experience": "La Experiencia",
  "Dominate the landscape of The Granja Xtreme with a machine built for champions. The": "Domina el paisaje de Granja Xtreme con una máquina construida para campeones. El",
  "combines a high-torque performance engine with a lightweight chassis, offering trail maneuverability that defies its size. Whether you're navigating tight technical forest sections or opening up the throttle on wide open flats, this vehicle provides a visceral, stable connection to the terrain.": "combina un motor de rendimiento de alto par con un chasis ligero, ofreciendo una maniobrabilidad en senderos que desafía su tamaño. Ya sea que estés navegando por secciones técnicas y estrechas del bosque o abriendo el acelerador en llanuras abiertas, este vehículo proporciona una conexión visceral y estable con el terreno.",
  "Our entire fleet is maintained to the highest safety and reliability standards, ensuring that while your off-road ride is extreme, your safety and the machine's mechanical performance are never in question.": "Toda nuestra flota se mantiene con los más altos estándares de seguridad y fiabilidad, asegurando que mientras tu paseo todoterreno es extremo, tu seguridad y el rendimiento mecánico de la máquina nunca están en duda.",
  "Key Features": "Características Principales",
  "Reinforced roll cage framework": "Estructura de jaula antivuelco reforzada",
  "GPS enabled navigation unit": "Unidad de navegación con GPS activado",
  "Electronic power steering (EPS)": "Dirección asistida electrónica (EPS)",
  "Extended range fuel cell": "Celda de combustible de rango extendido",
  "Dynamic suspension tuning": "Ajuste dinámico de suspensión",
  "Ergonomic racing seats": "Asientos de carreras ergonómicos",
  "Rental Rules & Check-out requirements": "Reglas de Alquiler y Requisitos de Salida",
  "Minimum age 18+ with valid identity card": "Edad mínima de 18+ con tarjeta de identidad válida",
  "Safety briefing mandatory before departure": "Charla de seguridad obligatoria antes de la salida",
  "Full safety gear provided (Helmet, Gloves)": "Equipo de seguridad completo proporcionado (Casco, Guantes)",
  "Refundable security deposit required": "Depósito de seguridad reembolsable requerido",
  "Return with full fuel tank": "Devolver con el tanque de combustible lleno",
  "No nighttime trail riding permitted": "No se permite andar en los senderos de noche",
  "Safety Information": "Información de Seguridad",
  "Your safety is our absolute priority. Every vehicle undergoes a rigorous 40-point inspection prior to your reservation. Furthermore, all reservations include a complimentary guided briefing.": "Tu seguridad es nuestra absoluta prioridad. Cada vehículo pasa por una rigurosa inspección de 40 puntos antes de tu reserva. Además, todas las reservas incluyen una charla guiada complementaria.",
  "Safety Briefing": "Charla de Seguridad",
  "A 15-minute operational and trail safety briefing is required for all riders, regardless of experience.": "Se requiere una charla de seguridad operativa y de sendero de 15 minutos para todos los conductores, independientemente de la experiencia.",
  "Gear Provision": "Provisión de Equipo",
  "DOT-approved helmets and protective eyewear are provided and mandatory while operating the vehicle.": "Se proporcionan cascos aprobados por el DOT y gafas protectoras, y son obligatorios mientras se opera el vehículo.",
  "day": "día",
  "Best Value": "Mejor Valor",
  "CHECK-IN DATE": "FECHA DE ENTRADA",
  "Select Check-In": "Seleccionar Entrada",
  "CHECK-OUT DATE": "FECHA DE SALIDA",
  "Select Check-Out": "Seleccionar Salida",
  "EXPERIENCE LEVEL": "NIVEL DE EXPERIENCIA",
  "Beginner": "Principiante",
  "Intermediate / Advanced": "Intermedio / Avanzado",
  "Expert": "Experto",
  "100% Secure Booking": "Reserva 100% Segura",
  "Free cancellation up to 48 hours": "Cancelación gratuita hasta 48 horas",
  "Licensed Professional Guides": "Guías Profesionales Licenciados",
  "This vehicle is currently unavailable (Status: ": "Este vehículo no está disponible actualmente (Estado: ",
  "Checking availability...": "Comprobando disponibilidad...",
  "Quad is available for these dates!": "¡El quad está disponible para estas fechas!",
  "Daily Rate": "Tarifa Diaria",
  "days": "días",
  "Trail Access Pass": "Pase de Acceso a Senderos",
  "Taxes & Fees (10%)": "Impuestos y Tarifas (10%)",
  "Total": "Total",
  "Please select rental dates on the calendar to see pricing breakdown.": "Por favor, selecciona las fechas de alquiler en el calendario para ver el desglose de precios.",
  "Initiating Secure Booking...": "Iniciando Reserva Segura...",
  "Reserve This Vehicle": "Reservar Este Vehículo",
  "You won't be charged yet": "Aún no se te cobrará",
  "Other Elite Vehicles": "Otros Vehículos de Élite",
  "View Details": "Ver Detalles",
  "Conquer any terrain with premium performance and ultimate reliability.": "Conquista cualquier terreno con un rendimiento premium y máxima fiabilidad.",
  "AVAILABLE": "DISPONIBLE",
  "RENTED": "ALQUILADO",
  "MAINTENANCE": "MANTENIMIENTO",
  "DECOMMISSIONED": "RETIRADO"
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

console.log('Vehicle Details translations updated successfully.');
