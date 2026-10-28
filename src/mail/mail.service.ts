import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { MAIL_TRANSPORTER } from './mail.constants';
import {
  buildRecruitmentResultHtml,
  type RecruitmentDecision,
} from './templates/recruitment-email.template';
import {
  buildEmailVerificationHtml,
  buildPasswordResetEmailHtml,
} from './templates/otp-email.template';
import { Society } from 'src/recruitment/enums/society.enum';
import { getBranding } from './society-branding';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_TRANSPORTER)
    private readonly transporter: Transporter,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generic send. `from` is optional — omit it to use the default sender
   * configured on the transporter (MAIL_DEFAULT_FROM_*).
   * Pass e.g. '"IEEE CUSB Events" <events@ieeecusb.org>' to override it.
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    from?: string,
    attachments?: any[],
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...(from ? { from } : {}),
        to,
        subject,
        html,
        ...(attachments?.length ? { attachments } : {}),
      });

      this.logger.log(`Email sent to ${to}${from ? ` from ${from}` : ''}`);
    } catch (error) {
      this.logger.error(
        `Could not send email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException('Could not send email');
    }
  }

  private getAuthFrom(): string | undefined {
    const name = this.configService.get<string>('MAIL_AUTH_FROM_NAME');
    const address = this.configService.get<string>('MAIL_AUTH_FROM_ADDRESS');
    if (!address) return undefined;
    return name ? `"${name}" <${address}>` : address;
  }

  /**
   * Returns the local logo as a CID attachment.
   *
   * logoFile is relative to the public directory.
   */
  private getLogoAttachment(logoFile = 'logo.png') {
    const publicDirectory = path.resolve(process.cwd(), 'public');

    const logoPath = path.resolve(publicDirectory, logoFile);

    // Prevent paths outside public from being accessed.
    if (
      logoPath !== publicDirectory &&
      !logoPath.startsWith(publicDirectory + path.sep)
    ) {
      this.logger.warn(`Invalid logo path: ${logoFile}`);

      return undefined;
    }

    if (!fs.existsSync(logoPath)) {
      this.logger.warn(`Logo file not found at: ${logoPath}`);

      return undefined;
    }

    return {
      filename: path.basename(logoPath),
      path: logoPath,
      cid: 'ieee_logo',
    };
  }

  async sendRecruitmentResultEmail(
    to: string,
    params: {
      name: string;
      decision: RecruitmentDecision;
      vacancyTitle?: string;
      society?: Society | null;
    },
  ): Promise<void> {
    const branding = getBranding(params.society);

    const subject =
      params.decision === 'accepted'
        ? 'Congratulations! Your IEEE CUSB application was accepted'
        : 'Update on your IEEE CUSB application';

    const html = buildRecruitmentResultHtml({
      ...params,
      branding,
    });

    const fromAddress = this.configService.get<string>(
      'MAIL_DEFAULT_FROM_ADDRESS',
    );

    const from =
      branding.fromName && fromAddress
        ? `"${branding.fromName}" <${fromAddress}>`
        : undefined;

    const logoAttachment =
      this.getLogoAttachment(branding.logoFile) ?? this.getLogoAttachment(); // falls back to public/logo.png

    await this.sendEmail(
      to,
      subject,
      html,
      from,
      logoAttachment ? [logoAttachment] : undefined,
    );
  }

  async sendEmailVerificationOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your Email Verification One-Time Password (OTP)';

    const html = buildEmailVerificationHtml({ otp });

    const logoAttachment = this.getLogoAttachment();

    await this.sendEmail(
      to,
      subject,
      html,
      this.getAuthFrom(),
      logoAttachment ? [logoAttachment] : undefined,
    );
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your Password Reset One-Time Password (OTP)';
    const html = buildPasswordResetEmailHtml({ otp });

    const logoAttachment = this.getLogoAttachment();

    await this.sendEmail(
      to,
      subject,
      html,
      this.getAuthFrom(),
      logoAttachment ? [logoAttachment] : undefined,
    );
  }
}
