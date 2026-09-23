import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { BrevoMailService } from './mail-brevo.service';
import { BREVO_MAIL_TRANSPORTER } from './mail-brevo.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BREVO_MAIL_TRANSPORTER,
      useFactory: (config: ConfigService) => {
        const options: SMTPTransport.Options = {
          host: config.get<string>('BREVO_SMTP_HOST'),
          port: Number(config.get('BREVO_SMTP_PORT')),
          secure: String(config.get('BREVO_SMTP_SECURE')) === 'true',
          auth: {
            user: config.get<string>('BREVO_SMTP_LOGIN'),
            pass: config.get<string>('BREVO_SMTP_PASSWORD'),
          },
        };

        // Default sender only. Individual sends can override it per call.
        const fromName = config.get<string>('BREVO_DEFAULT_FROM_NAME');
        const fromAddress = config.get<string>('BREVO_DEFAULT_FROM_ADDRESS');

        return nodemailer.createTransport(options, {
          from: `"${fromName}" <${fromAddress}>`,
        });
      },
      inject: [ConfigService],
    },
    BrevoMailService,
  ],
  exports: [BrevoMailService],
})
export class BrevoMailModule {}
