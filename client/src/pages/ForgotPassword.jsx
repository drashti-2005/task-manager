import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { authAPI } from '../api/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setEmailSent(true);
      setResetInfo(response);
      
      // If reset token is returned (email not configured), show it
      if (response.resetToken) {
        toast.success('Reset link generated! (Email not configured)');
      } else {
        toast.success('Password reset link sent to your email!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
          success: {
            style: {
              background: 'linear-gradient(to right, #d1fae5, #a7f3d0, #d1fae5)',
              border: '2px solid #86efac',
              color: '#065f46',
              padding: '20px 24px',
              borderRadius: '16px',
              fontWeight: '600',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(to right, #fce7f3, #fbcfe8, #fce7f3)',
              border: '2px solid #f9a8d4',
              color: '#9f1239',
              padding: '20px 24px',
              borderRadius: '16px',
              fontWeight: '600',
              boxShadow: '0 10px 25px rgba(244, 63, 94, 0.2)',
            },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border-2 border-purple-200"
      >
        <div>
          <Link 
            to="/login"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 font-semibold transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          
          <h2 className="text-center text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Forgot Password?
          </h2>
          <p className="text-center text-gray-600 text-sm">
            {emailSent 
              ? "Check your email for the reset link"
              : "Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        {!emailSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-12 pr-4 py-4 border-2 border-purple-200 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 font-medium"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:via-blue-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h3 className="text-lg font-bold text-green-800 mb-2">
                {resetInfo?.resetToken ? 'Reset Link Generated!' : 'Email Sent!'}
              </h3>
              <p className="text-sm text-green-700">
                {resetInfo?.resetToken ? (
                  <>Copy the link below to reset your password:</>
                ) : (
                  <>We've sent a password reset link to <strong>{email}</strong></>
                )}
              </p>
              
              {resetInfo?.resetUrl && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                  <Link
                    to={`/reset-password?token=${resetInfo.resetToken}`}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm break-all"
                  >
                    Click here to reset password
                  </Link>
                </div>
              )}
              
              {resetInfo?.note && (
                <p className="text-xs text-orange-600 mt-3 font-semibold">
                  ⚠️ Email service not configured. Click the link above to reset your password.
                </p>
              )}
              
              {!resetInfo?.resetToken && (
                <p className="text-xs text-green-600 mt-3">
                  Please check your inbox and click the link to reset your password.
                </p>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setResetInfo(null);
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                Didn't receive the email? Try again
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold text-sm transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
