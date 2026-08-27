import fs from 'fs';
import path from 'path';

const file = path.resolve('src/controllers/booking.controller.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/snapshotTaxRate,\s+snapshotSecurityDeposit,\s+snapshotAtvRates/g, 'snapshotTaxRate: taxRate, snapshotSecurityDeposit: depositPerAtv, snapshotAtvRates: atvs.map(a => ({ atvId: a._id, ratePerDay: a.ratePerDay }))');

// But wait, there is ONE occurrence in adminCreateBooking that SHOULD be shorthand (snapshotTaxRate, snapshotSecurityDeposit, snapshotAtvRates) because I literally just declared them as variables!
// So I will only replace the FIRST occurrence in the file which belongs to createBooking.

let count = 0;
content = content.replace(/snapshotTaxRate,\s+snapshotSecurityDeposit,\s+snapshotAtvRates/g, (match) => {
  count++;
  if (count === 1) {
    return 'snapshotTaxRate: taxRate, snapshotSecurityDeposit: depositPerAtv, snapshotAtvRates: atvs.map(a => ({ atvId: a._id, ratePerDay: a.ratePerDay }))';
  }
  return match;
});

fs.writeFileSync(file, content);
console.log('done replacing');
