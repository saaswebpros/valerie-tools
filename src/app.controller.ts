import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CreateLeadDto, SendEmailDto, SendSmsDto } from './dto';

@Controller()
export class AppController {
  constructor(
    private readonly leads: LeadsService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
  ) {}

  @Get()
  root() {
    return {
      status: 'ok',
      service: 'Valerie AI Webhook Server',
      endpoints: ['/create-lead', '/send-email', '/send-sms'],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('create-lead')
  @HttpCode(200)
  createLead(@Body() body: CreateLeadDto) {
    return this.leads.createLead(body || {});
  }

  @Post('send-email')
  @HttpCode(200)
  async sendEmail(@Body() body: SendEmailDto) {
    try {
      return await this.email.sendEmail(body || {});
    } catch (e) {
      const error = (e as Error).message || 'Failed to send confirmation email';
      return { success: false, error };
    }
  }

  @Post('send-sms')
  @HttpCode(200)
  async sendSms(@Body() body: SendSmsDto) {
    return this.sms.sendSms(body || {});
  }
}
