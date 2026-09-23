import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailService } from './mail.service';
import { MAIL_TRANSPORTER } from './mail.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      useFactory: (config: ConfigService) => {
        const options: SMTPTransport.Options = {
          host: config.get<string>('SMTP_HOST'),
          port: Number(config.get('SMTP_PORT')),
          secure: /^(true|1|yes)$/i.test(String(config.get('SMTP_SECURE') ?? '')),
          auth: {
            user: config.get<string>('SMTP_LOGIN'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
        };

        // Default sender used for all outgoing mail unless a call-site overrides it.
        const fromName = config.get<string>('MAIL_DEFAULT_FROM_NAME');
        const fromAddress = config.get<string>('MAIL_DEFAULT_FROM_ADDRESS');

        return nodemailer.createTransport(options, {
          from: `"${fromName}" <${fromAddress}>`,
        });
      },
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
