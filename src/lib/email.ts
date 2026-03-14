import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ==============================
   PASSWORD RESET EMAIL
================================ */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.BASE_URL}/auth/new-password?token=${token}`;

  const mailOptions = {
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw error;
  }
}

/* ==============================
   EMAIL VERIFICATION
================================ */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string,
) {
  const verificationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;

  const mailOptions = {
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

  try {
    console.log("Sending verification email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}