import { Module } from '@nestjs/common';
import { EmailService } from './mailgun/email.service';

@Module({ exports: [EmailService], providers: [EmailService] })
export class NotificationModule {}
