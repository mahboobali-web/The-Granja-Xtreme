const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "frontend/src/pages/CustomersList.tsx",
  "frontend/src/pages/CustomerDetails.tsx",
  "frontend/src/pages/CustomerDashboard.tsx",
  "frontend/src/pages/CheckoutSuccess.tsx",
  "frontend/src/pages/CheckoutConfirm.tsx",
  "frontend/src/pages/BookingSummary.tsx",
  "frontend/src/pages/AdminUpcomingBookings.tsx",
  "frontend/src/pages/AdminMessages.tsx",
  "frontend/src/pages/AdminEmployees.tsx",
  "frontend/src/pages/AdminDashboard.tsx",
  "frontend/src/pages/AdminAnalytics.tsx",
  "frontend/src/components/AdminRevenueReport.tsx",
  "frontend/src/components/AdminLayout.tsx",
  "frontend/src/components/AdminBookingDetailsModal.tsx"
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace .toLocaleDateString('en-US' with .toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US'
  content = content.replace(/\.toLocaleDateString\('en-US'/g, ".toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US'");
  
  // Replace .toLocaleDateString() with .toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')
  content = content.replace(/\.toLocaleDateString\(\)/g, ".toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US')");
  
  // Replace .toLocaleDateString(undefined, with .toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US',
  content = content.replace(/\.toLocaleDateString\(undefined,/g, ".toLocaleDateString(i18n.language?.startsWith('es') ? 'es-ES' : 'en-US',");

  // Ensure i18n is available from useTranslation
  if (content.includes('useTranslation()')) {
    if (content.match(/const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/)) {
      content = content.replace(/const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/g, "const { t, i18n } = useTranslation()");
    }
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Dates replaced');
