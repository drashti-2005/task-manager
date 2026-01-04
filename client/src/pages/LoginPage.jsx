import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields!');
      return;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address!');
      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful! Welcome back! 🎉');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      toast.error(result.message || 'Login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-300 to-green-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '400px',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
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
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '400px',
            },
            iconTheme: {
              primary: '#e11d48',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Smooth gradient mesh background - vibrant and cool */}
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/60 via-pink-200/60 to-green-200/60"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-300/40 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-300/40 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300/30 via-transparent to-transparent"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 backdrop-blur-lg bg-opacity-95 border-2 border-white/50">
          {/* Logo and Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-xl mb-6 transform hover:rotate-6 transition-transform">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Welcome Back!
            </h2>
            <p className="mt-3 text-base text-gray-700">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-pink-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-pink-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-semibold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition duration-300 autofill:bg-white"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px white inset',
                      WebkitTextFillColor: '#111827'
                    }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="block w-full pl-12 pr-14 py-4 border-2 border-green-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-semibold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px white inset',
                      WebkitTextFillColor: '#111827'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-green-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-green-600 transition-colors" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent text-base font-bold rounded-2xl text-white bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 hover:from-orange-500 hover:via-pink-500 hover:to-purple-500 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-500"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-6 w-6 border-3 border-white border-t-transparent rounded-full"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-6 w-6" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="inline-block font-bold text-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 transition duration-200"
              >
                Create a new account →
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
