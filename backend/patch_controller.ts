import fs from 'fs';
import path from 'path';

const file = path.resolve('src/controllers/booking.controller.ts');
let content = fs.readFileSync(file, 'utf8');

const target1 = `    let { atvId, atvIds, customerId, startDate, endDate, notes, customDiscountRate } = req.body;
    
    // Normalize to array of ATV IDs
    let selectedAtvIds: string[] = [];
    if (Array.isArray(atvIds) && atvIds.length > 0) {
      selectedAtvIds = atvIds;
    } else if (atvId) {
      selectedAtvIds = [atvId];
    }

    if (selectedAtvIds.length === 0) {
      res.status(400).json({ message: 'At least one ATV must be selected.' });
      return;
    }`;

const rep1 = `    let { atvId, atvIds, customerId, startDate, endDate, notes, customDiscountRate, bookingType } = req.body;
    bookingType = bookingType || 'Rental';
    
    // Normalize to array of ATV IDs
    let selectedAtvIds: string[] = [];
    if (Array.isArray(atvIds) && atvIds.length > 0) {
      selectedAtvIds = atvIds;
    } else if (atvId) {
      selectedAtvIds = [atvId];
    }

    if (bookingType !== 'Retail' && selectedAtvIds.length === 0) {
      res.status(400).json({ message: 'At least one ATV must be selected.' });
      return;
    }`;

content = content.replace(target1, rep1);

const target2 = `    const atvs = await Atv.find({ _id: { $in: selectedAtvIds } });
    if (atvs.length !== selectedAtvIds.length) {
      res.status(404).json({ message: 'One or more selected ATVs were not found.' });
      return;
    }

    // Check availability for all selected ATVs
    const conflictingAtvNames: string[] = [];
    for (const atv of atvs) {
      if (atv.status === 'MAINTENANCE' || atv.status === 'DECOMMISSIONED') {
        const label = atv.unitNumber ? \`\${atv.unitNumber} - \${atv.name}\` : atv.name;
        conflictingAtvNames.push(\`\${label} (Under \${atv.status.toLowerCase()})\`);
        continue;
      }

      const overlapping = await isAtvBooked(atv._id.toString(), startDate, endDate);
      if (overlapping) {
        const label = atv.unitNumber ? \`\${atv.unitNumber} - \${atv.name}\` : atv.name;
        conflictingAtvNames.push(label);
      }
    }

    if (conflictingAtvNames.length > 0) {
      res.status(400).json({ 
        message: \`Double booking conflict: The following vehicle(s) are already booked or unavailable for the selected dates: \${conflictingAtvNames.join(', ')}\`,
        conflictingAtvs: conflictingAtvNames
      });
      return;
    }`;

const rep2 = `    const atvs = await Atv.find({ _id: { $in: selectedAtvIds } });
    if (bookingType !== 'Retail' && atvs.length !== selectedAtvIds.length) {
      res.status(404).json({ message: 'One or more selected ATVs were not found.' });
      return;
    }

    // Check availability for all selected ATVs
    const conflictingAtvNames: string[] = [];
    if (bookingType !== 'Retail') {
      for (const atv of atvs) {
        if (atv.status === 'MAINTENANCE' || atv.status === 'DECOMMISSIONED') {
          const label = atv.unitNumber ? \`\${atv.unitNumber} - \${atv.name}\` : atv.name;
          conflictingAtvNames.push(\`\${label} (Under \${atv.status.toLowerCase()})\`);
          continue;
        }

        const overlapping = await isAtvBooked(atv._id.toString(), startDate, endDate);
        if (overlapping) {
          const label = atv.unitNumber ? \`\${atv.unitNumber} - \${atv.name}\` : atv.name;
          conflictingAtvNames.push(label);
        }
      }

      if (conflictingAtvNames.length > 0) {
        res.status(400).json({ 
          message: \`Double booking conflict: The following vehicle(s) are already booked or unavailable for the selected dates: \${conflictingAtvNames.join(', ')}\`,
          conflictingAtvs: conflictingAtvNames
        });
        return;
      }
    }`;

content = content.replace(target2, rep2);

const target3 = `    let snapshotSecurityDeposit = settings?.securityDeposit || 150;
    let snapshotTaxRate = settings?.baseTaxRate || 10;
    
    // Store snapshot of ATV rates
    const snapshotAtvRates = atvs.map(a => ({
      atvId: a._id,
      ratePerDay: a.ratePerDay || 0
    }));`;

const rep3 = `    let snapshotSecurityDeposit = bookingType === 'Retail' ? 0 : (settings?.securityDeposit || 150);
    let snapshotTaxRate = bookingType === 'Retail' ? 0 : (settings?.baseTaxRate || 10);
    
    // Store snapshot of ATV rates
    const snapshotAtvRates = bookingType === 'Retail' ? [] : atvs.map(a => ({
      atvId: a._id,
      ratePerDay: a.ratePerDay || 0
    }));`;

content = content.replace(target3, rep3);

const target4 = `    const booking = new Booking({
      bookingNumber,
      customerId,
      atvIds: selectedAtvIds,
      startDate,
      endDate,`;

const rep4 = `    const booking = new Booking({
      bookingNumber,
      bookingType,
      customerId,
      atvIds: selectedAtvIds,
      startDate: bookingType === 'Retail' ? new Date() : startDate,
      endDate: bookingType === 'Retail' ? new Date() : endDate,`;

content = content.replace(target4, rep4);

const target5 = `    const invoice = new Invoice({
      invoiceNumber: \`INV-\${Date.now().toString().slice(-6)}\`,
      bookingId: booking._id,
      customerId,
      atvId: selectedAtvIds[0], // Keep for backward compatibility or handle multiple
      invoiceType: 'Rental Charge',`;

const rep5 = `    const invoice = new Invoice({
      invoiceNumber: \`INV-\${Date.now().toString().slice(-6)}\`,
      bookingId: booking._id,
      customerId,
      atvId: selectedAtvIds[0] || null, // Keep for backward compatibility or handle multiple
      invoiceType: bookingType === 'Retail' ? 'Retail' : 'Rental Charge',`;

content = content.replace(target5, rep5);

fs.writeFileSync(file, content);
console.log('done');

