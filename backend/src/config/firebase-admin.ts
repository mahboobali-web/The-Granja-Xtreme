import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let serviceAccount: ServiceAccount | undefined;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (raw.startsWith("'") && raw.endsWith("'")) {
      raw = raw.slice(1, -1);
    }
    serviceAccount = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Verify environment variables.');
}

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    console.warn('Firebase Admin is not configured. Authentication will fail.');
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
