import { DEFAULT_BRANDING } from '../society-branding';
import type { Branding } from '../society-branding';
export type RecruitmentDecision = 'accepted' | 'rejected';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatRichHtmlMessage(
  rawHtml: string,
  accentColor: string,
): string {
  if (!rawHtml) return '';

  // Clean empty tags and &nbsp; to detect whether there is actual text content
  const plainText = rawHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  if (!plainText) return '';

  // Strip dangerous tags and attributes
  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<(iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/\s+href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, '')
    .replace(/&nbsp;/g, ' ');

  // If input was plain text without HTML tags, wrap it properly
  if (!/<[a-z][\s\S]*>/i.test(clean)) {
    return `<p style="margin: 0; font-size: 15px; line-height: 24px; color: #334155;">${escapeHtml(clean).replace(/\r?\n/g, '<br>')}</p>`;
  }

  // Format rich HTML elements for email client rendering
  clean = clean
    .replace(
      /<p(\s*|\s+[^>]*)>/gi,
      '<p style="margin: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #334155;">',
    )
    .replace(
      /<ul(\s*|\s+[^>]*)>/gi,
      '<ul style="margin: 0 0 12px 0; padding-left: 20px; color: #334155;">',
    )
    .replace(
      /<ol(\s*|\s+[^>]*)>/gi,
      '<ol style="margin: 0 0 12px 0; padding-left: 20px; color: #334155;">',
    )
    .replace(
      /<li(\s*|\s+[^>]*)>/gi,
      '<li style="margin-bottom: 4px; font-size: 15px; line-height: 22px;">',
    )
    .replace(
      /<h1(\s*|\s+[^>]*)>/gi,
      '<h1 style="margin: 14px 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 28px;">',
    )
    .replace(
      /<h2(\s*|\s+[^>]*)>/gi,
      '<h2 style="margin: 12px 0 6px 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 26px;">',
    )
    .replace(
      /<h3(\s*|\s+[^>]*)>/gi,
      '<h3 style="margin: 10px 0 4px 0; font-size: 16px; font-weight: 600; color: #0f172a; line-height: 24px;">',
    )
    .replace(
      /<a\s+(?:[^>]*?\s+)?href=(['"])(.*?)\1([^>]*)>/gi,
      `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${accentColor}; text-decoration: underline; font-weight: 500;"$3>`,
    );

  return clean;
}

export function buildRecruitmentResultHtml(params: {
  branding: Branding;
  name: string;
  decision: RecruitmentDecision;
  vacancyTitle?: string;
  logoUrl?: string;
  isBanner?: boolean;
  message?: string;
}): string {
  const isAccepted = params.decision === 'accepted';
  const resolvedLogoUrl = params.logoUrl || 'cid:ieee_logo';
  const b = params.branding ?? DEFAULT_BRANDING;
  const isBanner = Boolean(params.isBanner);

  const safeName = escapeHtml(params.name);
  const safeVacancyTitle = params.vacancyTitle
    ? escapeHtml(params.vacancyTitle)
    : '';

  const accentColor = isAccepted ? b.accent : '#64748b';
  const badgeBg = isAccepted ? b.acceptedBadgeBg : '#f1f5f9';
  const badgeText = isAccepted ? b.acceptedBadgeText : '#475569';

  const badgeLabel = isAccepted ? 'APPLICATION ACCEPTED' : 'APPLICATION UPDATE';

  const title = isAccepted
    ? `Welcome to ${b.displayName}!`
    : 'Thank you for applying';

  const intro = isAccepted
    ? `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>${escapeHtml(b.displayName)}</strong>. We are thrilled to let you know that you've been accepted to join the team!`
    : `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>${escapeHtml(b.displayName)}</strong> and for the time and effort you put into your application.`;

  const richHtmlMessage = params.message
    ? formatRichHtmlMessage(params.message, accentColor)
    : '';
  const hasMessage = Boolean(richHtmlMessage);

  const messageBoxLabel = isAccepted
    ? 'Message from the Team'
    : 'Feedback / Notes from the Team';

  const messageBoxHtml = richHtmlMessage
    ? `
              <!-- Message Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0; width: 100%;">
                <tr>
                  <td class="message-box" style="background-color: #f8fafc; border-left: 4px solid ${accentColor}; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 22px;">
                    <p class="message-box-label" style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${accentColor};">
                      ${messageBoxLabel}
                    </p>
                    <div class="message-content" style="font-size: 15px; line-height: 24px; color: #334155;">
                      ${richHtmlMessage}
                    </div>
                  </td>
                </tr>
              </table>`
    : '';

  let secondParagraphHtml = '';
  if (isAccepted) {
    if (!hasMessage) {
      secondParagraphHtml = `
              <p class="email-text" style="margin: 0 0 40px 0; font-size: 16px; line-height: 26px; color: #334155;">
                We'll be reaching out soon with more details about the next steps and your onboarding. We can't wait to see what we build together!
              </p>`;
    }
  } else {
    secondParagraphHtml = `
              <p class="email-text" style="margin: 0 0 40px 0; font-size: 16px; line-height: 26px; color: #334155;">
                After carefully reviewing all applications, we won't be moving forward with yours at this time. We really appreciate your interest in joining us and highly encourage you to apply again in future recruitment cycles.
              </p>`;
  }

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IEEE CUSB Recruitment</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-outer {
        padding: 32px 12px 24px 12px !important;
      }

      .email-card {
        border-radius: 12px !important;
      }

      .logo-cell {
        padding: 28px 24px 20px 24px !important;
      }

      .logo-image {
        width: 112px !important;
      }

      .banner-image {
        width: 100% !important;
        max-width: 100% !important;
      }

      .email-content {
        padding: 24px 20px 30px 20px !important;
      }

      .status-badge-wrap {
        margin-bottom: 18px !important;
      }

      .status-badge {
        padding: 5px 12px !important;
        font-size: 12px !important;
      }

      .email-title {
        font-size: 22px !important;
        line-height: 30px !important;
        margin-bottom: 18px !important;
      }

      .email-text {
        font-size: 15px !important;
        line-height: 24px !important;
      }

      .message-box {
        padding: 14px 16px !important;
      }

      .message-box-label {
        font-size: 12px !important;
      }

      .message-content,
      .message-content p,
      .message-content li {
        font-size: 14px !important;
        line-height: 22px !important;
      }

      .signature-wrap {
        padding-top: 24px !important;
      }

      .footer-cell {
        padding: 24px 16px !important;
      }

      .footer-text {
        font-size: 12px !important;
        line-height: 18px !important;
      }
    }

    @media only screen and (max-width: 420px) {
      .email-title {
        font-size: 20px !important;
        line-height: 28px !important;
      }

      .email-content {
        padding: 20px 16px 24px 16px !important;
      }

      .status-badge {
        letter-spacing: 0.3px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center" class="email-outer" style="padding: 60px 16px 40px 16px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" class="email-card" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; text-align: left;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background-color: ${accentColor}; width: 100%;"></td>
          </tr>

          ${
            isBanner
              ? `<!-- Banner Header -->
          <tr>
            <td style="padding: 0; line-height: 0; background-color: #ffffff; text-align: center;">
              <img src="${resolvedLogoUrl}" alt="${escapeHtml(b.displayName)} Banner" width="560" class="banner-image" style="display: block; width: 100%; max-width: 560px; height: auto; outline: none; border: none; margin: 0 auto;">
            </td>
          </tr>`
              : `<!-- Logo Header -->
          <tr>
            <td align="center" class="logo-cell" style="padding: 40px 48px 24px 48px; text-align: center;">
              <img src="${resolvedLogoUrl}" alt="${escapeHtml(b.displayName)} Logo" width="130" class="logo-image" style="display: block; width: 130px; max-width: 100%; height: auto; outline: none; border: none; margin: 0 auto;">
            </td>
          </tr>`
          }

          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: ${isBanner ? '36px' : '0'} 48px 40px 48px;">
              <div class="status-badge-wrap" style="margin-bottom: 24px;">
                <span class="status-badge" style="display: inline-block; padding: 6px 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: ${badgeText}; background-color: ${badgeBg}; border-radius: 999px;">
                  ${badgeLabel}
                </span>
              </div>
              
              <h1 class="email-title" style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; line-height: 34px;">${title}</h1>
              
              <p class="email-text" style="margin: 0 0 20px 0; font-size: 16px; line-height: 26px; color: #334155;">
                Hi ${safeName},
              </p>
              
              <p class="email-text" style="margin: 0 0 20px 0; font-size: 16px; line-height: 26px; color: #334155;">
                ${intro}
              </p>
              ${messageBoxHtml}
              ${secondParagraphHtml}
              
              <!-- Signature -->
              <div class="signature-wrap" style="border-top: 1px solid #e2e8f0; padding-top: 32px;">
                <p class="email-text" style="margin: 0; font-size: 16px; line-height: 26px; color: #334155;">
                  Best regards,<br>
                  <strong style="color: ${b.accent};">${escapeHtml(b.displayName)}</strong>
                </p>
              </div>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
          <tr>
            <td align="center" class="footer-cell" style="padding: 32px 24px;">
              <p class="footer-text" style="margin: 0; font-size: 13px; color: #94a3b8;">
                &copy; ${year}  ${escapeHtml(b.displayName)}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
