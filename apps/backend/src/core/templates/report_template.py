def get_report_email_template(username:str,email:str,description:str)->str:
    return f"""
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; padding: 20px;">
    <div style="background-color: #fff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #e74c3c;">🛠 New Issue Reported</h2>
      <p>Hello Team,</p>
      <p>An issue has been reported with the following details:</p>

      <div style="background-color: #f7f7f7; border-radius: 5px; padding: 10px; margin: 15px 0;">
        <p><strong>Reporter Name:</strong> {username}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Description:</strong> {description}</p>
      </div>

      <p>Please review the issue and take necessary action.</p>

      <p style="margin-top: 20px; font-size: 0.9em; color: #888; text-align: center;">
        This is an automated message. Do not reply to this email.
      </p>
    </div>
  </body>
</html>

"""