import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async (options: { to: string, subject: string, html: string }) => {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Mocking email send to:', options.to);
    console.log(`[EMAIL] Subject: ${options.subject}`);
    console.log(`[EMAIL] HTML: ${options.html}`);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'The Granja Xtreme <info@granjaxtreme.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email sending failed');
  }
};
