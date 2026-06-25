const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'frontend/src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add lazy and Suspense to React import
if (content.includes("import { useEffect, useState, useRef } from 'react';")) {
  content = content.replace(
    "import { useEffect, useState, useRef } from 'react';",
    "import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';\nimport { GlobalLoader } from './components/Skeletons';"
  );
}

// 2. Replace static imports with lazy
const componentsToLazyLoad = [
  'Home', 'Fleet', 'VehicleDetails', 'BookingSummary', 'CheckoutConfirm',
  'CheckoutSuccess', 'CustomerDashboard', 'Profile', 'Login', 'Register',
  'ForgotPassword', 'ResetPassword', 'Story', 'Contact', 'AdminDashboard',
  'FleetManager', 'CustomersList', 'CustomerDetails', 'CmsManager',
  'InspectionForm', 'AdminBookings', 'AdminUpcomingBookings', 'AdminAnalytics',
  'AdminEmployees', 'AdminSettings', 'AdminLogs', 'AdminMessages', 'AdminPayments'
];

componentsToLazyLoad.forEach(comp => {
  const regex = new RegExp(`import \\{ ${comp} \\} from '\\.\/pages\/${comp}';\\n`);
  content = content.replace(regex, `const ${comp} = lazy(() => import('./pages/${comp}').then(module => ({ default: module.${comp} })));\n`);
});

// 3. Wrap <Routes> with <Suspense fallback={<GlobalLoader />}>
content = content.replace(
  /<Routes>/g,
  '<Suspense fallback={<GlobalLoader />}><Routes>'
);
content = content.replace(
  /<\/Routes>/g,
  '</Routes></Suspense>'
);

fs.writeFileSync(appPath, content, 'utf8');
console.log("App.tsx refactored for lazy loading!");
