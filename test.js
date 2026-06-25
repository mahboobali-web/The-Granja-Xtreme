const mongoose = require('mongoose');
require('dotenv').config({path: './backend/.env'});

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Invoice = mongoose.model('Invoice', new mongoose.Schema({}, { strict: false }));
  
  const inv = await Invoice.findOne({ status: { $ne: 'Paid' } });
  console.log('Sample Unpaid Invoice:', inv);
  
  if (inv) {
    const invoiceId = inv._id.toString();
    const invoiceQuery = { _id: invoiceId, status: { $ne: 'Paid' } };
    console.log('Test query 1 (string ID):', invoiceQuery);
    const result1 = await Invoice.findOne(invoiceQuery);
    console.log('Result 1 found:', !!result1);

    const invoiceQuery2 = { _id: new mongoose.Types.ObjectId(invoiceId), status: { $ne: 'Paid' } };
    console.log('Test query 2 (ObjectId):', invoiceQuery2);
    const result2 = await Invoice.findOne(invoiceQuery2);
    console.log('Result 2 found:', !!result2);
  }
  
  process.exit();
}
run();
