def get_verify_email_template(username: str, otp: str) -> str:
    return f"""
   <html>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
          <h2>Kon’nichiwa, {username or "Brave Soul"} 👋✨</h2>
          <p>Your adventure continues, and to unlock the next chapter you’ll need this One-Time Secret Code:</p>

          <!-- OTP with copy icon -->
          <div style="background:#222; color:white; padding:15px; border-radius:8px; font-size:22px; letter-spacing:2px; display:flex; align-items:center;">
  <span style="flex:1; text-align:center;">
     <b>{otp}</b> 
  </span>
  <div style="margin-left:auto;">
    📋
  </div>
</div>

          <p>Like a hidden scroll in your favorite anime, this code will vanish after <b>5 minutes ⏳</b>.<br>
             Use it quickly before it disappears into the shadows! 🥷💨</p>
          <p>⚔️ Tip: Never share this code with villains, rivals, or anyone else. Keep it safe like your ultimate technique!</p>
          <p>May your journey be filled with courage, friendship, and victory. 🌠</p>
          <p><i>Arigatou,<br>Doclin Team 💖</i></p>
        </div>
      </body>
    </html>
    """
