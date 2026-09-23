/**
 * send-test-emails.mjs — sends all 4 email types via SMTP (config/.env)
 * Run: node send-test-emails.mjs
 */
import { readFileSync } from 'node:fs';
import { createTransport } from 'nodemailer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(path.join(__dirname, 'config/.env'), 'utf-8');
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^"|"$/g,'')]; })
);

const TO = 'ahmedfathi20044002@gmail.com';

const transporter = createTransport(
  {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: /^(true|1|yes)$/i.test(env.SMTP_SECURE ?? ''),
    auth: { user: env.SMTP_LOGIN, pass: env.SMTP_PASSWORD },
  },
  { from: `"${env.MAIL_DEFAULT_FROM_NAME}" <${env.MAIL_DEFAULT_FROM_ADDRESS}>` }
);

const authFrom = env.MAIL_AUTH_FROM_ADDRESS
  ? (env.MAIL_AUTH_FROM_NAME
      ? `"${env.MAIL_AUTH_FROM_NAME}" <${env.MAIL_AUTH_FROM_ADDRESS}>`
      : env.MAIL_AUTH_FROM_ADDRESS)
  : undefined;

const escape = v => v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const year = new Date().getFullYear();

const attachments = [{
  filename: 'logo.png',
  path: path.join(__dirname, 'public', 'logo.png'),
  cid: 'ieee_logo'
}];

function otpHtml(otp, isReset) {
  const isEmailVerification = !isReset;
  const resolvedLogoUrl = 'cid:ieee_logo';

  if (isEmailVerification) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IEEE CUSB Verification</title>
  <style>
    body { margin:0; padding:0; background-color:#eef6fc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1a1a1a; }
    .wrapper { width:100%; padding:40px 16px; box-sizing:border-box; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,82,155,0.08); overflow:hidden; }
    .header { background:#ffffff; padding:32px 40px; text-align:center; border-bottom:1px solid #f0f4f8; }
    .header img { max-width:160px; height:auto; display:block; margin:0 auto; }
    .content { padding:40px; }
    .title { margin:0 0 16px; font-size:24px; font-weight:700; color:#00529b; text-align:center; }
    .text { margin:0 0 24px; font-size:16px; line-height:26px; color:#4a5568; text-align:center; }
    .otp-box { background:#eef6fc; border:2px dashed #00529b; border-radius:8px; padding:24px; text-align:center; margin-bottom:24px; }
    .otp-code { font-size:42px; font-weight:800; color:#00529b; letter-spacing:12px; margin:0; }
    .warning { font-size:14px; font-weight:600; color:#bd0d2a; text-align:center; margin:0 0 32px; }
    .divider { height:1px; background:#f0f4f8; margin:0 0 32px; }
    .footer-text { font-size:14px; line-height:22px; color:#4a5568; text-align:center; margin:0; }
    .footer { background:#f9fbfd; padding:24px; text-align:center; border-top:1px solid #f0f4f8; }
    .footer p { margin:0; font-size:12px; color:#8892a3; }
    @media only screen and (max-width:600px) {
      .wrapper { padding:20px 12px; }
      .content { padding:32px 24px; }
      .otp-code { font-size:32px; letter-spacing:8px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="header">
            <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo">
          </td></tr>
          <tr><td class="content">
            <h1 class="title">Verify Your Email</h1>
            <p class="text">Welcome to <strong>IEEE CUSB</strong>! To complete your account setup and verify your email address, please use the One-Time Password (OTP) below.</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p class="warning">This code expires in 10 minutes.</p>
            <div class="divider"></div>
            <p class="footer-text">If you didn't create an account with IEEE CUSB, you can safely ignore this email.</p>
          </td></tr>
          <tr><td class="footer">
            <p>&copy; ${year} IEEE Cairo University Student Branch. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
  } else {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset IEEE CUSB Password</title>
  <style>
    body { margin:0; padding:0; background-color:#f9fbfd; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1a1a1a; }
    .wrapper { width:100%; padding:40px 16px; box-sizing:border-box; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.04); border:1px solid #d0d8e0; overflow:hidden; }
    .header { background:#ffffff; padding:32px 40px; text-align:center; border-bottom:1px solid #f0f4f8; }
    .header img { max-width:160px; height:auto; display:block; margin:0 auto; }
    .content { padding:40px; }
    .title { margin:0 0 16px; font-size:24px; font-weight:700; color:#1a1a1a; text-align:center; }
    .text { margin:0 0 24px; font-size:16px; line-height:26px; color:#4a5568; text-align:center; }
    .otp-box { background:#f9fbfd; border:1px solid #d0d8e0; border-radius:8px; padding:24px; text-align:center; margin-bottom:24px; }
    .otp-code { font-size:42px; font-weight:800; color:#1a1a1a; letter-spacing:12px; margin:0; }
    .warning { font-size:14px; font-weight:600; color:#bd0d2a; text-align:center; margin:0 0 32px; }
    .divider { height:1px; background:#f0f4f8; margin:0 0 32px; }
    .footer-text { font-size:14px; line-height:22px; color:#4a5568; text-align:center; margin:0; }
    .footer { background:#f9fbfd; padding:24px; text-align:center; border-top:1px solid #f0f4f8; }
    .footer p { margin:0; font-size:12px; color:#8892a3; }
    @media only screen and (max-width:600px) {
      .wrapper { padding:20px 12px; }
      .content { padding:32px 24px; }
      .otp-code { font-size:32px; letter-spacing:8px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="header">
            <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo">
          </td></tr>
          <tr><td class="content">
            <h1 class="title">Password Reset Request</h1>
            <p class="text">We received a request to reset the password for your <strong>IEEE CUSB</strong> account. Please use the code below to proceed.</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p class="warning">This code expires in 10 minutes.</p>
            <div class="divider"></div>
            <p class="footer-text"><strong>Didn't request this?</strong> You can safely ignore this email — your password will remain unchanged.</p>
          </td></tr>
          <tr><td class="footer">
            <p>&copy; ${year} IEEE Cairo University Student Branch. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
  }
}

function recruitmentHtml(name, decision, vacancyTitle) {
  const isAccepted = decision === 'accepted';
  const resolvedLogoUrl = 'cid:ieee_logo';
  
  const safeName = escape(name);
  const safeVacancyTitle = vacancyTitle ? escape(vacancyTitle) : '';

  const accentColor = isAccepted ? '#00529b' : '#1a1a1a';
  const badgeBg = isAccepted ? '#78be20' : '#4a5568';
  const badgeText = '#ffffff';
  const badgeLabel = isAccepted ? 'Application Accepted' : 'Application Update';
  
  const title = isAccepted ? 'Welcome to IEEE CUSB! 🎉' : 'Thank you for applying';
  
  const intro = isAccepted
    ? `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>IEEE CUSB</strong>. We are thrilled to let you know that you've been accepted to join the team!`
    : `Thank you for applying${safeVacancyTitle ? ` to the <strong>${safeVacancyTitle}</strong> team` : ''} at <strong>IEEE CUSB</strong> and for the time and effort you put into your application.`;
  
  const secondParagraph = isAccepted
    ? `We'll be reaching out soon with more details about the next steps and your onboarding. We can't wait to see what we build together!`
    : `After carefully reviewing all applications, we won't be moving forward with yours at this time. We really appreciate your interest in joining us and highly encourage you to apply again in future recruitment cycles.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>IEEE CUSB Recruitment</title>
  <style>
    body { margin:0; padding:0; background-color:#f9fbfd; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1a1a1a; }
    .wrapper { width:100%; padding:40px 16px; box-sizing:border-box; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.04); border:1px solid #d0d8e0; overflow:hidden; }
    .top-bar { height:6px; background-color:${accentColor}; width:100%; }
    .header { background:#ffffff; padding:32px 40px; text-align:left; border-bottom:1px solid #f0f4f8; }
    .header img { max-width:140px; height:auto; display:block; }
    .content { padding:40px; }
    .eyebrow { margin:0 0 12px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${accentColor}; }
    .title { margin:0 0 24px; font-size:26px; line-height:34px; font-weight:700; color:#1a1a1a; }
    .badge { display:inline-block; margin:0 0 32px; padding:6px 16px; font-size:13px; font-weight:600; letter-spacing:0.5px; color:${badgeText}; background-color:${badgeBg}; border-radius:999px; }
    .text { margin:0 0 20px; font-size:16px; line-height:26px; color:#4a5568; }
    .text strong { color:#1a1a1a; font-weight:600; }
    .signature { margin-top:40px; padding-top:32px; border-top:1px solid #f0f4f8; }
    .signature p { margin:0; font-size:15px; line-height:24px; color:#1a1a1a; }
    .signature strong { color:#00529b; }
    .footer { background:#f9fbfd; padding:24px; text-align:center; border-top:1px solid #f0f4f8; }
    .footer p { margin:0; font-size:12px; color:#8892a3; }
    @media only screen and (max-width:600px) {
      .wrapper { padding:20px 12px; }
      .header { padding:24px; }
      .content { padding:32px 24px; }
      .title { font-size:24px; line-height:32px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="top-bar"></td></tr>
          <tr><td class="header">
            <img src="${resolvedLogoUrl}" alt="IEEE CUSB Logo">
          </td></tr>
          <tr><td class="content">
            <p class="eyebrow">Recruitment Update</p>
            <h1 class="title">${title}</h1>
            <span class="badge">${badgeLabel}</span>
            <p class="text">Hi ${safeName},</p>
            <p class="text">${intro}</p>
            <p class="text">${secondParagraph}</p>
            <div class="signature">
              <p>Best regards,<br><strong>IEEE Cairo University Student Branch</strong></p>
            </div>
          </td></tr>
          <tr><td class="footer">
            <p>&copy; ${year} IEEE Cairo University Student Branch. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

async function send(opts) {
  const info = await transporter.sendMail({ ...opts, attachments });
  console.log(`  ✅  ${opts.subject}`);
}

console.log(`\n📧  Sending 4 test emails to: ${TO}\n`);

try {
  await send({ from: authFrom, to: TO, subject: 'Your Email Verification One-Time Password (OTP)',   html: otpHtml('847251', false) });
  await send({ from: authFrom, to: TO, subject: 'Your Password Reset One-Time Password (OTP)',        html: otpHtml('362910', true)  });
  await send({ to: TO, subject: 'Congratulations! Your IEEE CUSB application was accepted', html: recruitmentHtml('Ahmed Fathy', 'accepted', 'Software Committee')  });
  await send({ to: TO, subject: 'Update on your IEEE CUSB application',                    html: recruitmentHtml('Ahmed Fathy', 'rejected', 'Marketing Committee') });
  console.log('🎉  All 4 emails sent! Check your inbox.\n');
} catch (err) {
  console.error('❌  Failed:', err.message ?? err);
  process.exit(1);
}
