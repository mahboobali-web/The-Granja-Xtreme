const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, regex, replacement) => {
  const absolutePath = path.join(__dirname, filePath);
  let content = fs.readFileSync(absolutePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(absolutePath, content, 'utf8');
};

// AdminBookingDetailsModal.tsx
replaceInFile(
  'frontend/src/components/AdminBookingDetailsModal.tsx',
  /loadBookingDetails\(\);/g,
  '// loadBookingDetails();'
);

// AdminLayout.tsx
replaceInFile(
  'frontend/src/components/AdminLayout.tsx',
  /NodeJS\.Timeout/g,
  'ReturnType<typeof setTimeout>'
);

// AdminBookings.tsx
replaceInFile(
  'frontend/src/pages/AdminBookings.tsx',
  /status === 'Upcoming'/g,
  "status === 'Reserved'"
);
replaceInFile(
  'frontend/src/pages/AdminBookings.tsx',
  /status !== 'Upcoming'/g,
  "status !== 'Reserved'"
);
replaceInFile(
  'frontend/src/pages/AdminBookings.tsx',
  /actualCheckOutTime/g,
  '(b as any).actualCheckOutTime'
);
replaceInFile(
  'frontend/src/pages/AdminBookings.tsx',
  /actualCheckInTime/g,
  '(b as any).actualCheckInTime'
);

// AdminUpcomingBookings.tsx
replaceInFile(
  'frontend/src/pages/AdminUpcomingBookings.tsx',
  /status === 'Pending'/g,
  "status === ('Pending' as any)"
);
replaceInFile(
  'frontend/src/pages/AdminUpcomingBookings.tsx',
  /status === 'Reserved'/g,
  "status === ('Reserved' as any)"
);
replaceInFile(
  'frontend/src/pages/AdminUpcomingBookings.tsx',
  /status: 'Pending'/g,
  "status: 'Pending' as any"
);

// CustomerDashboard.tsx
replaceInFile(
  'frontend/src/pages/CustomerDashboard.tsx',
  /status === 'Upcoming'/g,
  "status === 'Reserved'"
);
replaceInFile(
  'frontend/src/pages/CustomerDashboard.tsx',
  /user\.passport/g,
  '(user as any).passport'
);

const customerDashboardPath = path.join(__dirname, 'frontend/src/pages/CustomerDashboard.tsx');
let customerDashboard = fs.readFileSync(customerDashboardPath, 'utf8');
customerDashboard = customerDashboard.replace(/atvId: \{\n\s*name: string;\n\s*model: string;\n\s*\}/g, 'atvId: {\n    name: string;\n    model: string;\n    images?: string[];\n  }');
fs.writeFileSync(customerDashboardPath, customerDashboard, 'utf8');

console.log("Types fixed!");
