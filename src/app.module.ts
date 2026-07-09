import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LeadsService } from './leads.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Module({
  controllers: [AppController],
  providers: [LeadsService, EmailService, SmsService],
})
export class AppModule {}
