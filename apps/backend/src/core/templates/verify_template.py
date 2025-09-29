def get_verify_email_template(username: str, otp: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #333333; margin-bottom: 20px; text-align: center;">
            Email Verification
          </h2>
          <p style="color: #555555; font-size: 15px;">
            Hello <b>{username or "User"}</b>,
          </p>
          <p style="color: #555555; font-size: 15px; line-height: 1.6;">
            Thank you for signing up. To complete your verification, please use the following One-Time Password (OTP):
          </p>

          <!-- OTP Box -->
          <div style="background: #f0f0f0; color: #222222; padding: 15px; border-radius: 6px; font-size: 22px; font-weight: bold; letter-spacing: 3px; text-align: center; margin: 20px 0;">
            {otp}
          </div>

          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            This code is valid for <b>5 minutes</b>. Please do not share it with anyone.
          </p>

          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            If you did not request this, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />

          <p style="color: #888888; font-size: 12px; text-align: center;">
            © {2025} Doclin Team. All rights reserved.<br/>
            This is an automated message, please do not reply.
          </p>
        </div>
      </body>
    </html>
    """
