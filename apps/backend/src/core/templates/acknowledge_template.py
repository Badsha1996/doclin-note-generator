def get_acknowledge_template(username:str):
    return f"""
<html lang="en">
  <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; color: #333; padding: 20px;">
    <div style="background-color: #fff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      
      <h2 style="color: #2E86C1;">✅ Issue Report Received</h2>
      
      <p>Hello {username},</p>
      
      <p>Thank you for reporting the issue. Our team has received your message and will review it shortly.</p>
      
      <p>If we need more information, we will contact you. Otherwise, we will keep you updated on any progress.</p>
      
      <p style="margin-top: 20px; font-size: 0.9em; color: #888; text-align: center;">
        This is an automated message. Please do not reply directly.
      </p>
    </div>
  </body>
</html>"""