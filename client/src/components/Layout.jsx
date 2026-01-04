import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListTodo, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-teal-200 relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-200/20 via-transparent to-transparent"></div>
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl border-b-2 border-purple-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex items-center"
              >
                <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                    <ListTodo className="h-6 w-6 text-white" />
                  </div>
                  TaskManager
                </Link>
              </motion.div>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
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
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <div className="text-gray-700 bg-purple-50 px-4 py-2 rounded-lg border-2 border-purple-200">
                Welcome, <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{user?.name || user?.email}</span>
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
