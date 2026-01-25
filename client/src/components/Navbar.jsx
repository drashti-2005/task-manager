import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ListTodo, LogOut, User, Shield, Users, Activity, BarChart3, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Navbar() {
  const { user, logout, isAdmin, isManager, hasManagerAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-semibold">Administrator</span>;
    }
    if (isManager) {
      return <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-semibold">Manager</span>;
    }
    return <span className="text-xs text-gray-500 font-medium">User</span>;
  };

  return (
    <nav className="sticky top-0 bg-white/90 backdrop-blur-lg shadow-xl border-b-2 border-purple-100 z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link to="/dashboard" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
              <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <ListTodo className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-white" />
              </div>
              TaskManager
            </Link>
          </motion.div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Admin Dashboard - Admin only (First) */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-orange-100 hover:text-orange-700'
                }`}
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            {/* Dashboard link - show for non-admin */}
            {!isAdmin && (
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            <Link
              to="/tasks"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                location.pathname === '/tasks'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Tasks
            </Link>

            {/* Teams Menu - Manager and Admin only */}
            {hasManagerAccess && (
              <Link
                to="/teams"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/teams'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Teams
              </Link>
            )}

            {/* Analytics - Hide for admin since it's in dashboard */}
            {!isAdmin && (
              <Link
                to="/analytics"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/analytics'
                    ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            )}

            {/* Admin Menu - Admin only */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/admin/users'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link
                  to="/admin/activity-logs"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/admin/activity-logs'
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Logs
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Desktop User Info & Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-gray-700 bg-purple-50 px-3 py-1.5 rounded-lg border-2 border-purple-200 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <div className="flex flex-col items-start">
                <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-sm">
                  {user?.name || user?.email}
                </span>
                {getRoleBadge()}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-300 shadow-lg flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            <div className="text-gray-700 bg-purple-50 px-2 py-1.5 rounded-lg border-2 border-purple-200 text-[10px] sm:text-xs">
              <span className="font-bold text-purple-600">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-gray-600 hover:bg-purple-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-purple-100 bg-white/95 backdrop-blur-lg"
          >
            <div className="px-3 py-3 space-y-1.5">
              {/* User Info */}
              <div className="px-3 py-2 bg-purple-50 rounded-lg border-2 border-purple-200 mb-2">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-purple-600">
                      {user?.name || user?.email}
                    </span>
                    {getRoleBadge()}
                  </div>
                </div>
              </div>

              {/* Admin Dashboard - Admin only */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Dashboard
                </Link>
              )}

              {/* Dashboard - non-admin */}
              {!isAdmin && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-purple-100'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}

              {/* Tasks */}
              <Link
                to="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/tasks'
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-blue-100'
                }`}
              >
                <ListTodo className="h-5 w-5" />
                Tasks
              </Link>

              {/* Teams - Manager and Admin only */}
              {hasManagerAccess && (
                <Link
                  to="/teams"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === '/teams'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-blue-100'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Teams
                </Link>
              )}

              {/* Analytics - non-admin */}
              {!isAdmin && (
                <Link
                  to="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === '/analytics'
                      ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-teal-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Link>
              )}

              {/* Admin Menu */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === '/admin/users'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-indigo-100'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Users
                  </Link>
                  <Link
                    to="/admin/activity-logs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      location.pathname === '/admin/activity-logs'
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    <Activity className="h-5 w-5" />
                    Logs
                  </Link>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg mt-4"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;