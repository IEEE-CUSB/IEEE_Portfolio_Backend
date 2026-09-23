export function buildEmailVerificationHtml(params: {
  otp: string;
  logoUrl?: string;
}): string {
  const { otp, logoUrl } = params;
  const resolvedLogoUrl = logoUrl || 'cid:ieee_logo';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IEEE CUSB Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center" style="padding: 60px 16px 40px 16px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 48px 40px 32px 40px;">
              <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo" width="150" style="display: block; width: 150px; max-width: 100%; height: auto; outline: none; border: none;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 48px 48px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Verify Your Email</h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 26px; color: #475569;">
                Welcome to <strong>IEEE CUSB</strong>! To complete your account setup and verify your email address, please enter the One-Time Password (OTP) below.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto 24px auto;">
                <p style="margin: 0; font-size: 40px; font-weight: 700; color: #00529b; letter-spacing: 12px; text-align: center; font-family: 'Courier New', Courier, monospace;">${otp}</p>
              </div>

              <!-- Warning text -->
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #bd0d2a;">
                <span style="display:inline-block; vertical-align:middle; margin-right:4px;">⏱</span> This code expires in 10 minutes.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding: 32px 24px;">
              <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                If you didn't create an account with IEEE CUSB, you can safely ignore this email.
              </p>
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

export function buildPasswordResetEmailHtml(params: {
  otp: string;
  logoUrl?: string;
}): string {
  const { otp, logoUrl } = params;
  const resolvedLogoUrl = logoUrl || 'cid:ieee_logo';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset IEEE CUSB Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center" style="padding: 60px 16px 40px 16px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 48px 40px 32px 40px;">
              <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo" width="150" style="display: block; width: 150px; max-width: 100%; height: auto; outline: none; border: none;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 48px 48px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Password Reset Request</h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 26px; color: #475569;">
                We received a request to reset the password for your <strong>IEEE CUSB</strong> account. Please enter the One-Time Password (OTP) below.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto 24px auto;">
                <p style="margin: 0; font-size: 40px; font-weight: 700; color: #1e293b; letter-spacing: 12px; text-align: center; font-family: 'Courier New', Courier, monospace;">${otp}</p>
              </div>

              <!-- Warning text -->
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #bd0d2a;">
                <span style="display:inline-block; vertical-align:middle; margin-right:4px;">⏱</span> This code expires in 10 minutes.
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding: 32px 24px;">
              <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                <strong>Didn't request this?</strong> You can safely ignore this email — your password will remain unchanged.
              </p>
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
