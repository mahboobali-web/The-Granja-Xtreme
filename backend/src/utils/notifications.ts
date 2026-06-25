import https from 'https';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'The Granja Xtreme <onboarding@resend.dev>';

/**
 * Sends an email notification using Resend API. Fallback to console log if key is not configured.
 */
export const sendEmail = async (to: string, subject: string, textContent: string, htmlContent?: string): Promise<boolean> => {
  if (!RESEND_API_KEY) {
    console.log(`[SIMULATED EMAIL - RESEND] To: ${to} | Subject: ${subject}\nBody:\n${textContent}\n`);
    return true;
  }

  const postData = JSON.stringify({
    from: RESEND_FROM_EMAIL,
    to: [to],
    subject,
    text: textContent,
    html: htmlContent || textContent.replace(/\n/g, '<br>')
  });

  return new Promise((resolve) => {
    const req = https.request(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Resend] Email sent successfully to ${to}`);
            resolve(true);
          } else {
            console.error(`[Resend Error] Status: ${res.statusCode}, Body: ${body}`);
            resolve(false);
          }
        });
      }
    );

    req.on('error', (e) => {
      console.error(`[Resend Request Error] ${e.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * SMS is disabled as per client preferences. Simulated logs only.
 */
export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  console.log(`[SIMULATED SMS - DISABLED] To: ${to}\nMessage: ${body}\n`);
  return true;
};
