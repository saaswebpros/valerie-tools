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
    const { email, subject, body } = this.buildEmail(dto);

    if (!email) {
      throw new Error('Recipient email address is required to send a confirmation email.');
    }

    const resendKey = process.env.RESEND_API_KEY || '';
    const smtp = getSmtpCreds();
    const hasSmtp = !!(smtp.host && smtp.user && smtp.pass);

    // No provider configured at all — this is a real failure, do not fake success.
    if (!resendKey && !hasSmtp) {
      throw new Error(
        'No email provider is configured (missing RESEND_API_KEY and SMTP credentials).',
      );
    }

    // Method 1: Try Resend HTTP API (works on Railway free tier)
    if (resendKey) {
      const resend = new Resend(resendKey);
      const bccRecipients = process.env.BCC_EMAIL ? [process.env.BCC_EMAIL] : [];

      let resendError: string | null = null;
      try {
        // The Resend SDK returns { data, error } and does NOT throw on API
        // errors (e.g. HTTP 403 when the domain is not verified). We must
        // inspect the returned error explicitly.
        const { data, error } = await resend.emails.send({
          from: 'SaaS Web Pros <onboarding@resend.dev>',
          to: [email],
          bcc: bccRecipients,
          subject,
          text: body,
          replyTo: 'info@saaswebpros.com',
        });

        if (error) {
          resendError =
            (error as any).message ||
            JSON.stringify(error) ||
            'Unknown Resend API error';
        } else {
          this.logger.log(
            `Email sent to ${email} via Resend API (id: ${data?.id ?? 'n/a'})`,
          );
          return {
            success: true,
            message: `Confirmation email sent to ${email}`,
            id: data?.id,
          };
        }
      } catch (e) {
        resendError = (e as Error).message;
      }

      this.logger.error(`Resend API failed for ${email}: ${resendError}`);

      // If SMTP is not available as a fallback, propagate the Resend error.
      if (!hasSmtp) {
        throw new Error(`Failed to send email via Resend: ${resendError}`);
      }
    }

    // Method 2: Try SMTP (fallback when Resend fails or is not configured)
    if (hasSmtp) {
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
        const smtpError = (e as Error).message;
        this.logger.error(`SMTP send failed for ${email}: ${smtpError}`);
        throw new Error(`Failed to send email via SMTP: ${smtpError}`);
      }
    }

    // Should be unreachable, but never fake success.
    throw new Error('Failed to send confirmation email: no provider succeeded.');
  }
}
