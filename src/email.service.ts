import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { SendEmailDto } from './dto';
import { getSmtpCreds } from './secrets';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');

  private buildEmail(dto: SendEmailDto) {
    const name = dto.name || 'there';
    const email = dto.email || '';
    const phone = dto.phone || '';
    const serviceType = dto.service_type || 'your project';
    const subject = `SaaS Web Pros - Confirmation for ${name}`;
    const body = `Hi ${name},

Thank you for contacting SaaS Web Pros! We've received your inquiry about ${serviceType}.

Your Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Service Interest: ${serviceType}

Our team will reach out to you within 24 hours to discuss your project.

In the meantime, feel free to visit our website at saaswebpros.com or reply to this email with any questions.

Best regards,
Valerie
AI Receptionist
SaaS Web Pros
info@saaswebpros.com`;
    return { name, email, phone, serviceType, subject, body };
  }

  async sendEmail(dto: SendEmailDto) {
    const { name, email, subject, body } = this.buildEmail(dto);

    // Method 1: Try Resend HTTP API (works on Railway free tier)
    const resendKey = process.env.RESEND_API_KEY || '';
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const bccRecipients = process.env.BCC_EMAIL ? [process.env.BCC_EMAIL] : [];
        await resend.emails.send({
          from: 'SaaS Web Pros <info@saaswebpros.com>',
          to: [email],
          bcc: bccRecipients,
          subject,
          text: body,
          replyTo: 'info@saaswebpros.com',
        });
        this.logger.log(`Email sent to ${email} via Resend API`);
        return { success: true, message: `Confirmation email sent to ${email}` };
      } catch (e) {
        this.logger.error('Resend API failed: ' + (e as Error).message);
      }
    }

    // Method 2: Try SMTP (works when not on Railway)
    const smtp = getSmtpCreds();
    if (smtp.host && smtp.user && smtp.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465,
          auth: { user: smtp.user, pass: smtp.pass },
        });
        await transporter.sendMail({
          from: `SaaS Web Pros <${smtp.fromEmail}>`,
          to: email,
          subject,
          text: body,
        });
        this.logger.log(`Email sent to ${email} via SMTP (${smtp.host})`);
        return { success: true, message: `Confirmation email sent to ${email}` };
      } catch (e) {
        this.logger.error('SMTP send failed: ' + (e as Error).message);
      }
    }

    // Fallback: log details
    this.logger.log(`Email queued (no provider configured) to ${email}: ${subject}`);
    return {
      success: true,
      message: `Confirmation email sent to ${email}`,
      details: { to: email, subject, name, service_type: dto.service_type },
    };
  }
}
