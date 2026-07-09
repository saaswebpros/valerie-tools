interface TwilioCreds {
  accountSid: string;
  authToken: string;
  fromPhone: string;
}

export function getTwilioCreds(): TwilioCreds {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromPhone: process.env.TWILIO_PHONE_NUMBER || '',
  };
}

interface SmtpCreds {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
}

export function getSmtpCreds(): SmtpCreds {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'info@saaswebpros.com';
  const pass = process.env.SMTP_PASSWORD || '';
  const fromEmail = process.env.FROM_EMAIL || user;
  return { host, port, user, pass, fromEmail };
}

export function toE164(phone: string): string {
  let digits = (phone || '').replace(/[^\d]/g, '');
  if (digits.length === 10) digits = '1' + digits;
  if (!digits.startsWith('+')) digits = '+' + digits;
  return digits;
}
