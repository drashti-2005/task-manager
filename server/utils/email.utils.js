import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  // For production, use your actual email service (Gmail, SendGrid, etc.)
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }
  
  // Default: Use SMTP settings from env
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Task Manager'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Task Manager',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #667eea;
              margin-top: 0;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              opacity: 0.9;
            }
            .info-box {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              color: #dc3545;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName || 'there'}!</h2>
              <p>We received a request to reset your password for your Task Manager account.</p>
              <p>Click the button below to reset your password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>⏰ This link will expire in 10 minutes</strong></p>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <p class="warning">
                <strong>⚠️ Important:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              
              <p>For security reasons, we never send your password via email.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Task Manager. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello ${userName || 'there'}!
        
        We received a request to reset your password for your Task Manager account.
        
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        
        For security reasons, we never send your password via email.
        
        ---
        This is an automated email from Task Manager.
        © ${new Date().getFullYear()} Task Manager. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent: %s', info.messageId);
    
    // Preview URL for Ethereal (development only)
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};
