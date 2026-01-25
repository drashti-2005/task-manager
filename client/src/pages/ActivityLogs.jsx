import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  RefreshCw,
  UserCheck,
  FileEdit,
  Trash2,
} from 'lucide-react';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getActivityLogs({ page: 1, limit: 100 });
      setLogs(response.data.logs || response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-4xl font-bold mt-2 text-gray-900">{logs.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-4xl font-bold mt-2 text-gray-900">
                  {logs.filter(l => l.action?.includes('CREATED')).length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100 rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Updated</p>
                <p className="text-4xl font-bold mt-2 text-gray-900">
                  {logs.filter(l => l.action?.includes('UPDATED')).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <FileEdit className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100 rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deleted</p>
                <p className="text-4xl font-bold mt-2 text-gray-900">
                  {logs.filter(l => l.action?.includes('DELETED')).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
