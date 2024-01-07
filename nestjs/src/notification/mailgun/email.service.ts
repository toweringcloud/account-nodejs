import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailVar {
  key: string;
  value: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const MAILGUN_DOMAIN = this.configService.get('MAILGUN_DOMAIN');
    const MAILGUN_APIKEY = this.configService.get('MAILGUN_APIKEY');

    const form = new URLSearchParams();
    form.append('from', `admin <admin@i-screamarts.com>`);
    form.append('to', `test@i-screamarts.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${MAILGUN_APIKEY}`).toString(
            'base64',
          )}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
