# Forgot Password Feature

Complete implementation of forgot password functionality for all users.

## Features Implemented

### Frontend Components

1. **ForgotPassword Page** (`/forgot-password`)
   - Email input with validation
   - Sends password reset request
   - Displays success message after email sent
   - Beautiful UI matching the existing design system

2. **ResetPassword Page** (`/reset-password?token=xxx`)
   - Takes reset token from URL query parameter
   - Password and confirm password fields
   - Password validation (minimum 6 characters)
   - Automatically redirects to login after successful reset

3. **Login Page Update**
   - Added "Forgot your password?" link

### Backend Implementation

1. **User Model Updates**
   - Added `resetPasswordToken` field (hashed)
   - Added `resetPasswordExpire` field (10 minutes expiry)

2. **Auth Controller**
   - **forgotPassword**: Generates reset token, stores hashed version in DB
   - **resetPassword**: Validates token, updates password, clears reset fields

3. **Auth Routes**
   - `POST /api/auth/forgot-password` - Public route
   - `POST /api/auth/reset-password` - Public route

## User Flow

1. User clicks "Forgot your password?" on login page
2. User enters email address on forgot password page
3. System generates reset token (valid for 10 minutes)
4. **In Development**: Reset token/URL returned in API response
5. **In Production**: Email would be sent with reset link
6. User clicks reset link with token
7. User enters new password (minimum 6 characters)
8. Password is updated and user is redirected to login

## API Endpoints

### Forgot Password
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }

Response (Development):
{
  "success": true,
  "message": "Password reset link sent to email",
  "resetUrl": "http://localhost:5000/reset-password?token=xxx",
  "resetToken": "xxx"
}
```

### Reset Password
```
POST /api/auth/reset-password
Body: { 
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successful",
  "token": "jwt-token",
  "user": { ... }
}
```

## Security Features

- Reset tokens are hashed using SHA256 before storing
- Tokens expire after 10 minutes
- Password must be at least 6 characters
- Password is hashed using bcrypt before saving
- Old token is cleared after successful reset
- `lastPasswordChange` timestamp is updated

## Development Notes

In development mode, the API returns the reset token directly in the response. This allows testing without setting up email service.

In production, you should:
1. Set up an email service (SendGrid, AWS SES, etc.)
2. Remove the `resetToken` and `resetUrl` from the API response
3. Send the reset link via email instead

## Testing

1. Start both servers:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. Go to login page
3. Click "Forgot your password?"
4. Enter a registered email
5. Copy the reset token from the API response (shown in browser console or network tab)
6. Navigate to `/reset-password?token=YOUR_TOKEN`
7. Enter new password
8. Login with new password

## Routes Added

- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page (requires token query parameter)
