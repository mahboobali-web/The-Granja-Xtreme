const fs = require('fs');
const files = [
  'CustomersList.tsx',
  'CustomerDashboard.tsx',
  'AdminUpcomingBookings.tsx',
  'AdminSettings.tsx',
  'AdminPayments.tsx',
  'AdminLogs.tsx',
  'AdminEmployees.tsx',
  'AdminAnalytics.tsx',
  'AdminBookings.tsx'
];

files.forEach(f => {
  const path = 'd:/New folder/Granja Xtreme (ATV_Rental_System)/frontend/src/pages/' + f;
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes('admin-table-container')) return;
  content = content.replace(/<table([\s\S]*?)<\/table>/g, '<div className="admin-table-container">\n<table$1</table>\n</div>');
  fs.writeFileSync(path, content, 'utf8');
  console.log('Updated ' + f);
});
console.log('Done!');
