'use server';

import nodemailer from 'nodemailer';
import { config } from '@/lib/config';

function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

function baseHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${config.smtp.fromName}</title>
      </head>
      <body style="margin:0;padding:0;background:#0f1117;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#ff4b6e,#ff6b8a);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:1px;">
                      ✦ ${config.smtp.fromName}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;color:#e0e0e0;font-size:15px;line-height:1.6;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;text-align:center;color:#666;font-size:12px;border-top:1px solid #2a2d37;">
                    &copy; ${new Date().getFullYear()} ${config.smtp.fromName}. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${config.appUrl}/verify-email?token=${token}`;

  const html = baseHtml(`
    <h2 style="color:#fff;margin-top:0;">Verify Your Email</h2>
    <p>Welcome to ${config.smtp.fromName}! Please verify your email address to get started.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verifyUrl}"
         style="display:inline-block;padding:14px 32px;background:#ff4b6e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
        Verify Email
      </a>
    </div>
    <p style="color:#888;font-size:13px;">
      If the button doesn&rsquo;t work, copy and paste this link into your browser:<br/>
      <a href="${verifyUrl}" style="color:#ff4b6e;word-break:break-all;">${verifyUrl}</a>
    </p>
  `);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
    to: email,
    subject: `Verify your email — ${config.smtp.fromName}`,
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${config.appUrl}/reset-password?token=${token}`;

  const html = baseHtml(`
    <h2 style="color:#fff;margin-top:0;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new one.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;padding:14px 32px;background:#ff4b6e;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
        Reset Password
      </a>
    </div>
    <p style="color:#888;font-size:13px;">
      If you didn&rsquo;t request this, you can safely ignore this email.<br/>
      This link will expire in 1 hour.
    </p>
    <p style="color:#888;font-size:13px;">
      Or copy and paste this link:<br/>
      <a href="${resetUrl}" style="color:#ff4b6e;word-break:break-all;">${resetUrl}</a>
    </p>
  `);

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.from}>`,
    to: email,
    subject: `Reset your password — ${config.smtp.fromName}`,
    html,
  });
}
