import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { getTwilioCreds, toE164 } from './secrets';
import { SendSmsDto } from './dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger('SmsService');

  async sendSms(dto: SendSmsDto) {
    const { accountSid, authToken, fromPhone } = getTwilioCreds();
    const name = dto.name || 'there';
    const serviceType = dto.service_type || 'your project';

    if (!accountSid || !authToken || !fromPhone) {
      this.logger.warn('Twilio credentials not fully configured');
      return { success: false, message: 'Twilio credentials not fully configured' };
    }

    const to = toE164(dto.phone || '');
    const body = `Hi ${name}! Thanks for contacting SaaS Web Pros about ${serviceType}. We'll reach out within 24 hours. - Valerie`;

    try {
      const client = twilio(accountSid, authToken);
      const msg = await client.messages.create({ to, from: fromPhone, body });
      this.logger.log(`SMS sent to ${to} (sid=${msg.sid})`);
      return { success: true, message: `Confirmation SMS sent to ${dto.phone}`, sid: msg.sid };
    } catch (e) {
      this.logger.error('SMS send failed: ' + (e as Error).message);
      return { success: false, message: `Failed to send SMS: ${(e as Error).message}` };
    }
  }
}
