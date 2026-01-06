import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 10) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields!');
      return;
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters!');
      return;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address!');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    // Passwords match validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      toast.success('Account created successfully! Welcome! 🎉');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      toast.error(result.message || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-300/40 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-300/40 via-transparent to-transparent"></div>
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
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="mt-3 text-base text-gray-700">
              Join us and boost your productivity
            </p>
          </motion.div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-yellow-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-yellow-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-semibold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px white inset',
                      WebkitTextFillColor: '#111827'
                    }}
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
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
                    className="block w-full pl-12 pr-4 py-4 border-2 border-pink-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-semibold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition duration-300"
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
                transition={{ delay: 0.5 }}
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
                    autoComplete="new-password"
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
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${getPasswordStrengthColor()}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="block w-full pl-12 pr-14 py-4 border-2 border-green-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-semibold placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-300"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px white inset',
                      WebkitTextFillColor: '#111827'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-green-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-green-600 transition-colors" />
                    )}
                  </button>
                </div>
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        <span>Passwords don't match</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-6 w-6" />
                    <span>Create Account</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-block font-bold text-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 transition duration-200"
              >
                Sign in instead →
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
