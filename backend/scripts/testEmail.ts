import { sendEmail } from '../src/utils/email';

const test = async () => {
  console.log('Sending test email...');
  try {
    const data = await sendEmail({
      to: 'tgranjaxtreme065@gmail.com',
      subject: 'Resend API Test',
      html: '<h1>Hello!</h1><p>If you received this, the Resend API is perfectly configured!</p>'
    });
    console.log('Success! API response:', data);
  } catch (err: any) {
    console.error('Failed:', err.message);
  }
};

test();
