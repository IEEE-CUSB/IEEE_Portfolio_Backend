import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MAIL_TRANSPORTER } from './mail.constants';
import * as fs from 'node:fs';
import { Society } from 'src/recruitment/enums/society.enum';
import { DEFAULT_BRANDING, SOCIETY_BRANDING } from './society-branding';

const mockTransporter = { sendMail: jest.fn() };
const mockConfigService = { get: jest.fn() };

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    jest.resetAllMocks();

    mockConfigService.get.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MAIL_TRANSPORTER,
          useValue: mockTransporter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    service = module.get<MailService>(MailService);
  });

  // ─── sendEmail ────────────────────────────────────────────────────────────

  describe('sendEmail', () => {
    it('sends a mail with correct params', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmail('to@example.com', 'Subject', '<p>HTML</p>');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'to@example.com',
          subject: 'Subject',
          html: '<p>HTML</p>',
        }),
      );
    });

    it('includes from field when provided', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmail(
        'to@example.com',
        'Subject',
        '<p>HTML</p>',
        '"Sender" <s@x.com>',
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: '"Sender" <s@x.com>' }),
      );
    });

    it('omits from field when not provided', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmail('to@example.com', 'Subject', '<p>HTML</p>');
      expect(mockTransporter.sendMail.mock.calls[0][0]).not.toHaveProperty(
        'from',
      );
    });

    it('throws ServiceUnavailableException when transporter fails', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));
      await expect(
        service.sendEmail('to@example.com', 'Subject', '<p>HTML</p>'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  // ─── sendRecruitmentResultEmail ───────────────────────────────────────────

  describe('sendRecruitmentResultEmail', () => {
    it('sends accepted email with correct subject', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendRecruitmentResultEmail('u@x.com', {
        name: 'Ahmed',
        decision: 'accepted',
        vacancyTitle: 'Software',
      });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Congratulations! Your IEEE CUSB application was accepted',
        }),
      );
    });

    it('sends rejected email with correct subject', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendRecruitmentResultEmail('u@x.com', {
        name: 'Ahmed',
        decision: 'rejected',
      });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Update on your IEEE CUSB application',
        }),
      );
    });

    it('HTML-escapes dangerous characters in name', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendRecruitmentResultEmail('u@x.com', {
        name: '<script>alert(1)</script>',
        decision: 'accepted',
      });
      const html: string = mockTransporter.sendMail.mock.calls[0][0]
        .html as string;
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  // ─── sendEmailVerificationOtp ─────────────────────────────────────────────

  describe('sendEmailVerificationOtp', () => {
    it('sends OTP verification email with OTP in HTML', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmailVerificationOtp('u@x.com', '123456');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Email Verification One-Time Password (OTP)',
          html: expect.stringContaining('123456'),
        }),
      );
    });
  });

  // ─── sendPasswordResetOtp ─────────────────────────────────────────────────

  describe('sendPasswordResetOtp', () => {
    it('sends password reset OTP email', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendPasswordResetOtp('u@x.com', '654321');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Your Password Reset One-Time Password (OTP)',
          html: expect.stringContaining('654321'),
        }),
      );
    });
  });

  // ─── getAuthFrom (via OTP sends) ──────────────────────────────────────────

  describe('getAuthFrom', () => {
    it('uses full formatted from when name+address configured', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_AUTH_FROM_NAME') return 'IEEE CUSB Accounts';
        if (key === 'MAIL_AUTH_FROM_ADDRESS') return 'no-reply@ieeecusb.org';
      });
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmailVerificationOtp('u@x.com', '111111');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"IEEE CUSB Accounts" <no-reply@ieeecusb.org>',
        }),
      );
    });

    it('uses bare address when name absent', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_AUTH_FROM_ADDRESS') return 'no-reply@ieeecusb.org';
      });
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmailVerificationOtp('u@x.com', '222222');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'no-reply@ieeecusb.org' }),
      );
    });

    it('omits from when MAIL_AUTH_FROM_ADDRESS not set', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockTransporter.sendMail.mockResolvedValueOnce({});
      await service.sendEmailVerificationOtp('u@x.com', '333333');
      expect(mockTransporter.sendMail.mock.calls[0][0]).not.toHaveProperty(
        'from',
      );
    });
  });

  describe('Custom recruitment emails', () => {
    beforeEach(() => {
      mockTransporter.sendMail.mockResolvedValue({});
    });

    it('uses the correct branding for RAS recruitment emails', async () => {
      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        vacancyTitle: 'Software',
        society: Society.RAS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.subject).toBe(
        'Congratulations! Your IEEE CUSB application was accepted',
      );

      expect(sentMail.html).toContain(SOCIETY_BRANDING[Society.RAS].displayName);
      expect(sentMail.html).toContain(SOCIETY_BRANDING[Society.RAS].accent);
      expect(sentMail.html).toContain('Ahmed');
      expect(sentMail.html).toContain('Software');
    });

    it('uses the correct branding for PES recruitment emails', async () => {
      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Mariam',
        decision: 'accepted',
        society: Society.PES,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.html).toContain(SOCIETY_BRANDING[Society.PES].displayName);
      expect(sentMail.html).toContain(SOCIETY_BRANDING[Society.PES].accent);
    });

    it('uses default branding when no society is provided', async () => {
      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.html).toContain(DEFAULT_BRANDING.displayName);
      expect(sentMail.html).toContain(DEFAULT_BRANDING.accent);
    });

    it('uses the society logo when the logo file exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        society: Society.RAS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.attachments).toEqual([
        expect.objectContaining({
          filename: 'RASlogo.png',
          cid: 'ieee_logo',
        }),
      ]);

      expect(sentMail.html).toContain('cid:ieee_logo');
    });

    it('does not attach a logo when the file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        society: Society.RAS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.attachments).toBeUndefined();

      // The email still renders, even though the logo is missing.
      expect(sentMail.html).toContain(SOCIETY_BRANDING[Society.RAS].displayName);
    });

    it('uses the configured sender address for recruitment emails', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_DEFAULT_FROM_ADDRESS') {
          return 'no-reply@ieeecusb.org';
        }

        return undefined;
      });

      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        society: Society.RAS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.from).toBe(
        `"${SOCIETY_BRANDING[Society.RAS].fromName}" <no-reply@ieeecusb.org>`,
      );
    });

    it('does not construct an invalid sender when the address is missing', async () => {
      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        society: Society.RAS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.from).toBeUndefined();
    });

    it('uses society-specific recruitment sender from env when configured', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'MAIL_RECRUITMENT_CS_FROM_ADDRESS') {
          return 'careers@cs.ieeecusb.org';
        }
        if (key === 'MAIL_RECRUITMENT_CS_FROM_NAME') {
          return 'CS IEEE CUSB Recruitment';
        }
        if (key === 'MAIL_DEFAULT_FROM_ADDRESS') {
          return 'careers@ieeecusb.org';
        }
        return undefined;
      });

      await service.sendRecruitmentResultEmail('user@example.com', {
        name: 'Ahmed',
        decision: 'accepted',
        society: Society.CS,
      });

      const sentMail = mockTransporter.sendMail.mock.calls[0][0] as Record<
        string,
        any
      >;

      expect(sentMail.from).toBe('"CS IEEE CUSB Recruitment" <careers@cs.ieeecusb.org>');
    });
  });
});
