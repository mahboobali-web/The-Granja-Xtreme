const fs = require('fs');
const path = require('path');

const esFilePath = path.join(__dirname, 'frontend/public/locales/es/translation.json');

const newTranslations = {
  "adminCms": {
    "saveSuccess": "¡Guardado!",
    "saving": "Guardando...",
    "loading": "Cargando panel de CMS...",
    "heroSection": "Sección Hero de Inicio",
    "heroSectionDesc": "El banner principal en la parte superior de la página de inicio.",
    "heroTitle": "Título del Hero",
    "heroSubtitle": "Subtítulo del Hero",
    "descBodyText": "Texto de Descripción",
    "heroBannerImage": "Imagen del Banner",
    "imageUrl": "URL de la Imagen",
    "uploading": "Subiendo...",
    "saveHero": "Guardar Hero",
    "statsBar": "Barra de Estadísticas",
    "statsBarDesc": "La fila de números mostrada debajo del hero (Aventuras, Calificación, Guías, Rutas).",
    "valueLabel": "Valor (ej. 10k+)",
    "label": "Etiqueta",
    "addStat": "Agregar Estadística",
    "saveStats": "Guardar Estadísticas",
    "featuresSection": "Características — 'Los Estándares Xtreme'",
    "featuresSectionDesc": "Las 3 tarjetas de características en la sección oscura.",
    "sectionTitle": "Título de la Sección",
    "sectionSubtitle": "Subtítulo de la Sección",
    "icon": "Icono",
    "title": "Título",
    "description": "Descripción",
    "addFeature": "Agregar Característica",
    "saveFeatures": "Guardar Características",
    "testimonials": "Testimonios — 'Historias Inolvidables'",
    "testimonialsDesc": "Tarjetas de reseñas de clientes en la página de inicio.",
    "name": "Nombre",
    "role": "Rol",
    "stars": "Estrellas",
    "initials": "Iniciales",
    "quote": "Cita",
    "addTestimonial": "Agregar Testimonio",
    "saveTestimonials": "Guardar Testimonios",
    "gallery": "Galería — 'Captura la Emoción'",
    "galleryDesc": "La cuadrícula de fotos en la parte inferior de la página de inicio.",
    "altText": "Texto alternativo",
    "addImage": "Agregar Imagen",
    "saveGallery": "Guardar Galería",
    "waiverTitle": "Acuerdo de Exención de Responsabilidad",
    "waiverDesc": "El contrato legal mostrado durante el proceso de pago.",
    "docHeader": "Encabezado del Documento de Contrato",
    "waiverBody": "Cuerpo del Texto de la Exención",
    "saveWaiver": "Guardar Exención",
    "storyTitle": "Historia y Nosotros",
    "storyDesc": "Contenido y miembros del equipo para la página 'Nosotros'.",
    "storyHeadline": "Titular de la Historia",
    "storyBodyText": "Texto del Cuerpo de la Historia",
    "storyQuote": "Cita de la Historia",
    "teamMembers": "Miembros del Equipo",
    "addTeamMember": "Agregar Miembro",
    "saveStory": "Guardar Historia",
    "contactTitle": "Contacto e Información de Ubicación",
    "contactDesc": "Dirección, indicaciones y enlaces sociales usados en el sitio.",
    "physicalAddress": "Dirección Física",
    "directions": "Indicaciones",
    "facebookUrl": "URL de Facebook",
    "instagramUrl": "URL de Instagram",
    "twitterUrl": "URL de Twitter/X",
    "saveContact": "Guardar Contacto",
    "faqTitle": "Preguntas Frecuentes",
    "faqDesc": "Preguntas y respuestas mostradas en la página de Contacto/FAQ.",
    "question": "Pregunta",
    "answer": "Respuesta",
    "addFaq": "Agregar FAQ",
    "saveFaqs": "Guardar FAQs",
    "footerTitle": "Contenido del Pie de Página",
    "footerDesc": "Texto de la sección inferior.",
    "footerSlogan": "Eslogan/Texto del Pie de Página",
    "saveFooter": "Guardar Pie de Página"
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

console.log('CMS translations updated successfully.');
