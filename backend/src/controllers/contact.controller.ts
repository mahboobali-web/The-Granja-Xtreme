import { Request, Response } from 'express';
import { ContactMessage } from '../models/contact_message.model';
import { Settings } from '../models/settings.model';
import { Notification } from '../models/notification.model';
import { z } from 'zod';

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  message: z.string().min(10)
});

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid contact form data.', errors: parsed.error.format() });
      return;
    }

    const message = await ContactMessage.create(parsed.data);

    const settings = await Settings.findOne();
    const shouldNotify = !settings || !settings.notifications || settings.notifications.newMessage !== false;
    if (shouldNotify) {
      await Notification.create({
        title: 'New Message',
        message: `New inquiry from ${parsed.data.firstName} ${parsed.data.lastName}.`,
        link: '/admin/messages'
      });
    }

    res.status(201).json({ message: 'Contact message submitted successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit contact message.', error: (error as Error).message });
  }
};

export const getMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: (error as Error).message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const msg = await ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    if (!msg) {
      res.status(404).json({ message: 'Message not found.' });
      return;
    }
    res.status(200).json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message.', error: (error as Error).message });
  }
};
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const msg = await ContactMessage.findByIdAndDelete(id);
    if (!msg) {
      res.status(404).json({ message: 'Message not found.' });
      return;
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message.', error: (error as Error).message });
  }
};
