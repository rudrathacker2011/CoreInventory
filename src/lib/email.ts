import nodemailer from "nodemailer";

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

type SendResult = {
  ok: boolean;
  channel?: "smtp" | "resend";
  error?: string;
  id?: string;
};

const isProd = process.env.NODE_ENV === "production";

const getBaseUrl = () => {
  const base =
    process.env.NEXTAUTH_URL || (!isProd ? "http://localhost:3000" : "");

  if (!base) {
    console.warn("NEXTAUTH_URL is not set; email links may be broken.");
  }

  return base ?? "";
};

const validateSmtpEnv = () => {
  const missing = [
    "EMAIL_SERVER_HOST",
    "EMAIL_SERVER_PORT",
    "EMAIL_SERVER_USER",
    "EMAIL_SERVER_PASSWORD",
    "EMAIL_FROM",
  ].filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing email credentials: ${missing.join(", ")}`);
  }

  const port = Number(process.env.EMAIL_SERVER_PORT);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error("EMAIL_SERVER_PORT must be a valid number");
  }

  if (!isProd) {
    console.log("Email config loaded:", {
      host: process.env.EMAIL_SERVER_HOST,
      user: process.env.EMAIL_SERVER_USER,
      hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
      port,
    });
  }

  return {
    host: process.env.EMAIL_SERVER_HOST as string,
    port,
    user: process.env.EMAIL_SERVER_USER as string,
    pass: process.env.EMAIL_SERVER_PASSWORD as string,
    from: process.env.EMAIL_FROM as string,
  };
};

const createTransporter = () => {
  const { host, port, user, pass } = validateSmtpEnv();

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

let cachedTransporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
};

const sendViaSmtp = async (mailOptions: MailOptions): Promise<SendResult> => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    return { ok: true, channel: "smtp", id: info.messageId };
  } catch (error: any) {
    console.error("SMTP send failed:", error);
    return { ok: false, error: error?.message || "SMTP send failed" };
  }
};

const sendViaResend = async (mailOptions: MailOptions): Promise<SendResult> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailOptions.from,
        to: [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Resend failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    return { ok: true, channel: "resend", id: data.id };
  } catch (error: any) {
    console.error("Resend send failed:", error);
    return { ok: false, error: error?.message || "Resend send failed" };
  }
};

const sendEmail = async (mailOptions: MailOptions): Promise<SendResult> => {
  let smtpResult = await sendViaSmtp(mailOptions);

  if (smtpResult.ok) return smtpResult;

  if (process.env.RESEND_API_KEY) {
    const resendResult = await sendViaResend(mailOptions);
    if (resendResult.ok) return resendResult;
    return resendResult;
  }

  return smtpResult;
};

/* ==============================
   PASSWORD RESET EMAIL
================================ */
export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetLink = `${process.env.NEXTAUTH_URL || baseUrl}/auth/new-password?token=${token}`;

  const mailOptions: MailOptions = {
    from: `"Support Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
      <table align="center" width="600" style="background:#ffffff;border-radius:8px;padding:30px;">
        
        <tr>
          <td style="text-align:center;">
            <h2 style="color:#333;">Password Reset Request</h2>
            <p style="color:#555;">
              We received a request to reset your password.
              Click the button below to set a new password.
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:20px;">
            <a href="${resetLink}"
              style="background:#4f46e5;color:#fff;padding:12px 25px;
              text-decoration:none;border-radius:6px;font-weight:bold;">
              Reset Password
            </a>
          </td>
        </tr>

        <tr>
          <td style="text-align:center;color:#666;font-size:14px;">
            This link will expire in <b>1 hour</b>.
          </td>
        </tr>

        <tr>
          <td style="padding-top:20px;text-align:center;color:#777;font-size:13px;">
            If you didn’t request this password reset, you can safely ignore this email.
          </td>
        </tr>

        <tr>
          <td style="padding-top:30px;text-align:center;font-size:12px;color:#999;">
            © ${new Date().getFullYear()} True root. All rights reserved.
          </td>
        </tr>

      </table>
    </div>
    `,
  };

  const result = await sendEmail(mailOptions);

  if (!result.ok) {
    console.error("Password reset email failed:", result.error);
  }

  return result;
}

/* ==============================
   EMAIL VERIFICATION
================================ */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string,
) {
  const baseUrl = getBaseUrl();
  const verificationLink = `${process.env.NEXTAUTH_URL || baseUrl}/auth/new-verification?token=${token}`;

  const mailOptions: MailOptions = {
    from: `"Support Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
      <table align="center" width="600" style="background:#ffffff;border-radius:8px;padding:30px;">
        
        <tr>
          <td style="text-align:center;">
            <h2 style="color:#333;">Verify Your Email</h2>
            <p style="color:#555;">
              Hi <b>${name}</b>, <br/><br/>
              Thanks for signing up. Please confirm your email address by clicking the button below.
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:20px;">
            <a href="${verificationLink}"
              style="background:#10b981;color:#fff;padding:12px 25px;
              text-decoration:none;border-radius:6px;font-weight:bold;">
              Verify Email
            </a>
          </td>
        </tr>

        <tr>
          <td style="text-align:center;color:#666;font-size:14px;">
            This verification link will expire soon.
          </td>
        </tr>

        <tr>
          <td style="padding-top:20px;text-align:center;color:#777;font-size:13px;">
            If you did not create an account, you can ignore this email.
          </td>
        </tr>

        <tr>
          <td style="padding-top:30px;text-align:center;font-size:12px;color:#999;">
            © ${new Date().getFullYear()} True root. All rights reserved.
          </td>
        </tr>

      </table>
    </div>
    `,
  };

  const result = await sendEmail(mailOptions);

  if (!result.ok) {
    console.error("Verification email failed:", result.error);
  }

  return result;
}
