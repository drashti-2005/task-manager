# Quick Email Setup

## ✅ Installation Complete

Nodemailer has been installed. Now you need to configure your email settings.

## 🚀 Quick Setup (Choose One Option)

### Option 1: Gmail (Easiest - 2 minutes)

1. **Create Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (if not enabled)
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" → Enter "Task Manager"
   - Copy the 16-character password

2. **Add to `server/.env`:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-gmail@gmail.com
   EMAIL_FROM_NAME=Task Manager
   CLIENT_URL=http://localhost:3001
   ```

3. **Restart server:**
   ```bash
   cd server
   npm run dev
   ```

You should see: `✅ Email server is ready to send emails`

### Option 2: Ethereal (Testing - No Real Emails)

Perfect for testing without using real email!

1. **Get Test Credentials:**
   - Go to: https://ethereal.email/create
   - Copy the Username and Password

2. **Add to `server/.env`:**
   ```env
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=username-from-ethereal
   EMAIL_PASSWORD=password-from-ethereal
   EMAIL_FROM=noreply@taskmanager.com
   EMAIL_FROM_NAME=Task Manager
   CLIENT_URL=http://localhost:3001
   ```

3. **Restart server and test**
   - The server will show a preview URL in console
   - Click it to see the email!

## 🧪 Test It

1. Start your server: `cd server && npm run dev`
2. Start your client: `cd client && npm run dev`
3. Go to: http://localhost:3001/forgot-password
4. Enter your email address
5. Check your email (or console for preview URL if using Ethereal)

## ❓ Troubleshooting

### Gmail Issues:
- ❌ "Invalid credentials" → Make sure you're using App Password, not your regular Gmail password
- ❌ "Less secure app" → You need to create an App Password (requires 2-Step Verification)

### Ethereal Issues:
- ❌ Email not showing → Check server console for preview URL
- ℹ️ Emails won't arrive in inbox (that's expected - Ethereal is for testing)

### Server won't start:
- ❌ Check that all environment variables are set
- ❌ Make sure there are no syntax errors in .env file
- ❌ Restart your terminal/IDE if env variables aren't loading

## 📧 What Happens When User Requests Reset?

1. User enters email on `/forgot-password` page
2. System generates secure reset token (expires in 10 minutes)
3. **Email is sent** with reset link
4. User clicks link → redirected to `/reset-password?token=xxx`
5. User enters new password
6. Password updated → user can login!

## 🎨 Email Preview

The email includes:
- Beautiful gradient header
- Clear "Reset Password" button  
- 10-minute expiration warning
- Manual link copy option
- Security notice
- Professional footer

## Need Help?

See detailed guide: `EMAIL_SETUP_GUIDE.md`
