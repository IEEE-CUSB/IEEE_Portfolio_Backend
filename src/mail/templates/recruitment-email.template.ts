export type RecruitmentDecision = 'accepted' | 'rejected';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildRecruitmentResultHtml(params: {
  name: string;
  decision: RecruitmentDecision;
  vacancyTitle?: string;
  logoUrl?: string;
}): string {
  const { name, decision, vacancyTitle, logoUrl } = params;
  const isAccepted = decision === 'accepted';
  const resolvedLogoUrl = logoUrl || 'cid:ieee_logo';
  
  const safeName = escapeHtml(name);
  const safeVacancyTitle = vacancyTitle ? escapeHtml(vacancyTitle) : '';

  const accentColor = isAccepted ? '#00529b' : '#64748b';
  const badgeBg = isAccepted ? '#dcfce7' : '#f1f5f9';
  const badgeText = isAccepted ? '#166534' : '#475569';
  const badgeLabel = isAccepted ? 'Application Accepted' : 'Application Update';
  
  const title = isAccepted ? 'Welcome to IEEE CUSB! 🎉' : 'Thank you for applying';
  
  const intro = isAccepted
    ? `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>IEEE CUSB</strong>. We are thrilled to let you know that you've been accepted to join the team!`
    : `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>IEEE CUSB</strong> and for the time and effort you put into your application.`;
  
  const secondParagraph = isAccepted
    ? `We'll be reaching out soon with more details about the next steps and your onboarding. We can't wait to see what we build together!`
    : `After carefully reviewing all applications, we won't be moving forward with yours at this time. We really appreciate your interest in joining us and highly encourage you to apply again in future recruitment cycles.`;

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IEEE CUSB Recruitment</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center" style="padding: 60px 16px 40px 16px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; text-align: left;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background-color: ${accentColor}; width: 100%;"></td>
          </tr>

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 48px 24px 48px;">
              <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo" width="130" style="display: block; width: 130px; max-width: 100%; height: auto; outline: none; border: none;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 40px 48px;">
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: ${badgeText}; background-color: ${badgeBg}; border-radius: 999px;">
                  ${badgeLabel}
                </span>
              </div>
              
              <h1 style="margin: 0 0 24px 0; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; line-height: 34px;">${title}</h1>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 26px; color: #334155;">
                Hi ${safeName},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 26px; color: #334155;">
                ${intro}
              </p>
              
              <p style="margin: 0 0 40px 0; font-size: 16px; line-height: 26px; color: #334155;">
                ${secondParagraph}
              </p>
              
              <!-- Signature -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 32px;">
                <p style="margin: 0; font-size: 16px; line-height: 26px; color: #334155;">
                  Best regards,<br>
                  <strong style="color: #00529b;">IEEE Cairo University Student Branch</strong>
                </p>
              </div>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding: 32px 24px;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                &copy; ${year} IEEE Cairo University Student Branch. All rights reserved.
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
