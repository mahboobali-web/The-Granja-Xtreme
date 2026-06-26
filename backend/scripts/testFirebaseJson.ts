import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

let raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || '';
if (raw.startsWith("'") && raw.endsWith("'")) {
  raw = raw.slice(1, -1);
}

try {
  const parsed = JSON.parse(raw);
  console.log('Success!', parsed.project_id);
} catch (e: any) {
  console.log('JSON Parse Error:', e.message);
  console.log('Raw string:', raw.substring(0, 100) + '...');
}
