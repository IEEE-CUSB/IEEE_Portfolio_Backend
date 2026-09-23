import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import { BREVO_MAIL_TRANSPORTER } from './mail-brevo.constants';
import {
  buildRecruitmentResultHtml,
  type RecruitmentDecision,
} from './templates/recruitment-email.template';
import {
  buildEmailVerificationHtml,
  buildPasswordResetEmailHtml,
} from './templates/otp-email.template';

@Injectable()
export class BrevoMailService {
  private readonly logger = new Logger(BrevoMailService.name);

  constructor(
    @Inject(BREVO_MAIL_TRANSPORTER) private readonly transporter: Transporter,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generic send. `from` is optional — omit it to use the default sender
   * configured on the transporter (BREVO_DEFAULT_FROM_*).
   * Pass e.g. '"IEEE CUSB Events" <events@ieeecusb.org>' to override it.
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    from?: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...(from ? { from } : {}),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}${from ? ` from ${from}` : ''}`);
    } catch (error) {
      this.logger.error(`Could not send email to ${to}`, error as Error);
      throw new ServiceUnavailableException('Could not send email');
    }
  }
  private getAuthFrom(): string | undefined {
    const name = this.configService.get<string>('BREVO_AUTH_FROM_NAME');
    const address = this.configService.get<string>('BREVO_AUTH_FROM_ADDRESS');
    if (!address) return undefined;
    return name ? `"${name}" <${address}>` : address;
  }

  async sendRecruitmentResultEmail(
    to: string,
    params: {
      name: string;
      decision: RecruitmentDecision;
      vacancyTitle?: string;
    },
  ): Promise<void> {
    const subject =
      params.decision === 'accepted'
        ? 'Congratulations! Your IEEE CUSB application was accepted'
        : 'Update on your IEEE CUSB application';

    const html = buildRecruitmentResultHtml(params);

    // No `from` passed: uses the default (careers@ieeecusb.org)
    await this.sendEmail(to, subject, html);
  }

  async sendEmailVerificationOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your Email Verification One-Time Password (OTP)';
    const html = buildEmailVerificationHtml({ otp });
    await this.sendEmail(to, subject, html, this.getAuthFrom());
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your Password Reset One-Time Password (OTP)';
    const html = buildPasswordResetEmailHtml({ otp });
    await this.sendEmail(to, subject, html, this.getAuthFrom());
  }
}
