export type RecruitmentDecision = 'accepted' | 'rejected';

// Names and vacancy titles come from user data, so escape them before putting them in HTML
function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]!,
  );
}

export function buildRecruitmentResultHtml(params: {
  name: string;
  decision: RecruitmentDecision;
  vacancyTitle?: string;
}): string {
  const { decision } = params;

  const name = escapeHtml(params.name);
  const vacancy = params.vacancyTitle ? escapeHtml(params.vacancyTitle) : '';
  const isAccepted = decision === 'accepted';

  const accentColor = isAccepted ? '#00629B' : '#64748B';
  const badgeBg = isAccepted ? '#ECFDF3' : '#F1F5F9';
  const badgeBorder = isAccepted ? '#A7E8C4' : '#CBD5E1';
  const badgeText = isAccepted ? '#067647' : '#475569';
  const badgeLabel = isAccepted ? 'Application Accepted' : 'Application Update';
  const eyebrow = 'Recruitment Result';

  const title = isAccepted
    ? 'Welcome to IEEE CUSB! 🎉'
    : 'Thank you for applying';

  const intro = isAccepted
    ? `Thank you for applying${
        vacancy ? ` to the <strong>${vacancy}</strong> team` : ''
      } at <strong>IEEE CUSB</strong>. We're happy to let you know that you've been accepted to join the team!`
    : `Thank you for applying${
        vacancy ? ` to the <strong>${vacancy}</strong> team` : ''
      } at <strong>IEEE CUSB</strong> and for the time you put into your application.`;

  const secondParagraph = isAccepted
    ? `We'll be reaching out soon with more details about what's next. See you soon!`
    : `After reviewing the applications, we won't be moving forward with your application this time. We really appreciate your interest in IEEE CUSB and encourage you to apply again in future recruitment cycles.`;

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IEEE CUSB Recruitment</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f6f7;
      font-family: Arial, Helvetica, sans-serif;
      color: #333333;
    }

    .wrapper {
      width: 100%;
      padding: 40px 16px;
      box-sizing: border-box;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      overflow: hidden;
    }

    .top-line {
      height: 4px;
      background-color: ${accentColor};
    }

    .content {
      padding: 40px 40px 36px;
    }

    .eyebrow {
      margin: 0 0 12px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: ${accentColor};
    }

    .title {
      margin: 0 0 24px;
      font-size: 26px;
      line-height: 34px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .badge {
      display: inline-block;
      margin: 0 0 28px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      color: ${badgeText};
      background-color: ${badgeBg};
      border: 1px solid ${badgeBorder};
      border-radius: 999px;
    }

    .text {
      margin: 0 0 20px;
      font-size: 15px;
      line-height: 25px;
      color: #555555;
    }

    .text strong {
      color: #333333;
    }

    .signature {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #eeeeee;
    }

    .signature p {
      margin: 0;
      font-size: 14px;
      line-height: 22px;
      color: #555555;
    }

    .signature strong {
      color: #333333;
    }

    .footer {
      background-color: #f4f4f7;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #eaeaec;
    }

    .footer p {
      margin: 0;
      font-size: 12px;
      line-height: 18px;
      color: #999999;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 30px 24px 32px;
      }

      .title {
        font-size: 23px;
        line-height: 30px;
      }
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
    >
      <tr>
        <td align="center">

          <table
            role="presentation"
            class="container"
            cellpadding="0"
            cellspacing="0"
            border="0"
          >

            <!-- Accent line -->
            <tr>
              <td class="top-line"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content">

                <p class="eyebrow">${eyebrow}</p>

                <h1 class="title">
                  ${title}
                </h1>

                <span class="badge">${badgeLabel}</span>

                <p class="text">
                  Hi ${name},
                </p>

                <p class="text">
                  ${intro}
                </p>

                <p class="text">
                  ${secondParagraph}
                </p>

                <div class="signature">
                  <p>
                    Best Regards,<br>
                    <strong>IEEE Cairo University Student Branch</strong>
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p>
                  &copy; ${new Date().getFullYear()} IEEE Cairo University Student Branch. All rights reserved.<br>
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>

</body>
</html>`;
}
