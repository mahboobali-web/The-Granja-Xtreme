import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Order } from '../models/order.model';
import { Invoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { Accessory } from '../models/accessory.model';
import { User } from '../models/user.model';
import { getNextTgxNumber } from '../utils/counter.utils';
import { logActivity } from './logs.controller';
import mongoose from 'mongoose';

export const checkoutPOS = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      items, // Array of { accessoryId, quantity, price, name }
      customerId, 
      guestInfo, // { firstName, lastName, email, phone }
      paymentMethod // Cash, Card, etc.
    } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Cart is empty.' });
      return;
    }

    // 1. Resolve Customer
    let finalCustomerId = customerId;
    let customerData = null;

    if (!finalCustomerId) {
      if (guestInfo?.email) {
        // Try to find by email
        customerData = await User.findOne({ email: guestInfo.email }).session(session);
      }
      
      if (!customerData) {
        // Create new or guest customer
        const guestEmail = guestInfo?.email || `guest_${Date.now()}@granjaxtreme.local`;
        customerData = await User.create([{
          firstName: guestInfo?.firstName || 'Guest',
          lastName: guestInfo?.lastName || 'Walk-in',
          email: guestEmail,
          phone: guestInfo?.phone || '0000000000',
          role: 'customer',
          status: 'active'
        }], { session });
        customerData = customerData[0];
      }
      finalCustomerId = customerData._id;
    } else {
      customerData = await User.findById(finalCustomerId).session(session);
      if (!customerData) {
        res.status(404).json({ message: 'Customer not found.' });
        return;
      }
    }

    // 2. Validate Inventory and Calculate Totals
    let grandTotal = 0;
    const validatedAccessories = [];

    for (const item of items) {
      const accessory = await Accessory.findById(item.accessoryId).session(session);
      if (!accessory) {
        throw new Error(`Accessory not found: ${item.name}`);
      }

      if (accessory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${accessory.name}. Available: ${accessory.quantity}, Requested: ${item.quantity}`);
      }

      // Deduct inventory
      accessory.quantity -= item.quantity;
      await accessory.save({ session });

      const lineTotal = item.quantity * accessory.price;
      grandTotal += lineTotal;
      
      validatedAccessories.push({
        accessoryId: accessory._id,
        name: accessory.name,
        price: accessory.price,
        quantity: item.quantity
      });
    }

    // 3. Create Retail Order
    const now = new Date();
    const orderNumber = await getNextTgxNumber('order');
    const order = await Order.create([{
      orderNumber,
      customerId: finalCustomerId,
      items: validatedAccessories,
      totalAmount: grandTotal,
      status: 'Paid',
      notes: `POS Transaction by ${req.user?.email || 'Admin'}`
    }], { session });

    const newOrder = order[0];

    // 4. Create Invoice
    const invoiceNumber = await getNextTgxNumber('invoice');
    const invoiceDescription = validatedAccessories.map(a => `${a.quantity}x ${a.name} ($${(a.price * a.quantity).toFixed(2)})`).join('\n');
    
    const invoice = await Invoice.create([{
      invoiceNumber,
      orderId: newOrder._id,
      customerId: finalCustomerId,
      invoiceType: 'Extra Charge', 
      description: `POS Retail Sale:\n${invoiceDescription}`,
      amount: grandTotal,
      balance: 0,
      status: 'Paid',
      dueDate: now
    }], { session });

    const newInvoice = invoice[0];

    // 5. Create Payment Record
    const receiptNumber = await getNextTgxNumber('receipt');
    const payment = await Payment.create([{
      receiptNumber,
      invoiceId: newInvoice._id,
      orderId: newOrder._id,
      customerId: finalCustomerId,
      collectedBy: req.user?._id,
      amount: grandTotal,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Paid'
    }], { session });

    // Link invoice back to order
    newOrder.invoiceId = newInvoice._id;
    await newOrder.save({ session });

    await logActivity(`Completed POS Sale for $${grandTotal.toFixed(2)}`, req.user?.email || 'admin', req.ip || '', 'success');

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      message: 'POS Checkout Successful', 
      orderId: newOrder._id,
      invoiceId: newInvoice._id,
      receiptNumber: payment[0].receiptNumber
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('POS Checkout Error:', error);
    res.status(400).json({ message: error.message || 'Failed to complete checkout' });
  }
};
