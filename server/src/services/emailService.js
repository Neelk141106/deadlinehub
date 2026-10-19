const nodemailer = require('nodemailer');

/**
 * Checks whether SMTP email delivery configuration is present in environment variables.
 */
function isEmailConfigured() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(host && user && pass);
}

/**
 * Creates and returns a Nodemailer transporter using environment variables.
 */
function createTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Sends a 6-digit OTP verification email to the user.
 * Never logs the OTP code.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient user name
 * @param {string} options.otp - 6-digit OTP code (plain)
 */
async function sendVerificationEmail({ to, name, otp }) {
  if (!isEmailConfigured()) {
    const error = new Error(
      'Email delivery service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM in your environment variables.'
    );
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || `"DeadlineHub" <${process.env.SMTP_USER}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your DeadlineHub Account</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560px" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); text-align: center;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">DeadlineHub</h1>
                    <p style="margin: 6px 0 0 0; font-size: 14px; color: #e0e7ff;">Academic Deadlines & Announcements</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">Email Verification Code</h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                      Hello <strong style="color: #ffffff;">${name || 'Student'}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                      Thank you for creating an account on DeadlineHub. To complete your registration and protect your account, please enter the following 6-digit verification code:
                    </p>
                    <!-- OTP Code Box -->
                    <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #818cf8; display: inline-block;">
                        ${otp}
                      </span>
                    </div>
                    <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.5; color: #94a3b8; text-align: center;">
                      ⏰ This code will expire in <strong style="color: #cbd5e1;">10 minutes</strong>.
                    </p>
                    <div style="border-top: 1px solid #334155; margin: 28px 0; padding-top: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        🔒 <strong>Security Notice:</strong> If you did not create a DeadlineHub account, please disregard this email. Never share this code with anyone.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} DeadlineHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textContent = `
DeadlineHub Email Verification

Hello ${name || 'Student'},

Thank you for creating an account on DeadlineHub.
Your 6-digit email verification code is: ${otp}

This code will expire in 10 minutes.
If you did not create a DeadlineHub account, please ignore this email.
  `.trim();

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Your DeadlineHub Email Verification Code',
    text: textContent,
    html: htmlContent,
  });

  return info;
}

module.exports = {
  isEmailConfigured,
  createTransporter,
  sendVerificationEmail,
};
