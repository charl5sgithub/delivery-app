/**
 * emailService.js
 *
 * Sends OTP emails via Gmail SMTP using Nodemailer.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in your .env
 */

import nodemailer from 'nodemailer';

let transporter;

/**
 * Sends a styled OTP email to the given recipient.
 */
export async function sendOtpEmail(to, otp) {
    // Lazy initialization of transporter to ensure process.env is ready
    if (!transporter) {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error('Email configuration missing in .env: GMAIL_USER or GMAIL_APP_PASSWORD not defined.');
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    const mailOptions = {
        from: `"FreshDelivery" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🔐 Your FreshDelivery Login Code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#EAE2D5;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="520" style="max-width:520px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(46,66,54,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2E4236 0%,#4a6b57 60%,#6F8E52 100%);padding:36px 40px 28px;text-align:center;">
              <div style="font-size:2.8rem;margin-bottom:8px;">🥬</div>
              <h1 style="margin:0;color:#ffffff;font-size:1.55rem;font-weight:800;letter-spacing:-0.02em;">FreshDelivery</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.72);font-size:0.9rem;">Your one-time login code</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:1rem;line-height:1.6;">
                Hi there! Here is your secure login code for <strong>FreshDelivery</strong>. 
                It expires in <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#f0fde9,#e8f5d8);border:2px solid #6F8E52;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 10px;color:#2E4236;font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">Your OTP Code</p>
                <div style="font-size:2.8rem;font-weight:900;letter-spacing:0.25em;color:#2E4236;">${otp}</div>
              </div>
              <p style="margin:0;color:#6b7280;font-size:0.875rem;line-height:1.6;">
                If you didn't request this code, you can safely ignore this email.
                Never share this code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:0.78rem;">
                © ${new Date().getFullYear()} FreshDelivery · Sent to ${to}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
}
