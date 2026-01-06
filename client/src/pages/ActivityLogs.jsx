import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  RefreshCw,
  Filter,
  UserCheck,
  FileEdit,
  Trash2,
  LogIn,
} from 'lucide-react';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

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

  const getActionIcon = (action) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) return LogIn;
    if (action.includes('CREATED')) return UserCheck;
    if (action.includes('UPDATED')) return FileEdit;
    if (action.includes('DELETED')) return Trash2;
    return Activity;
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('CREATED')) return 'bg-green-100 text-green-700 border-green-200';
    if (action.includes('UPDATED')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (action.includes('DELETED')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredLogs = logs.filter(log => {
    if (!actionFilter) return true;
    return log.action?.includes(actionFilter);
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="REGISTER">Register</option>
              <option value="CREATED">Created</option>
              <option value="UPDATED">Updated</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <motion.div
                    key={log._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl">
                        <ActionIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {log.performedBy?.name || log.userId?.name || 'Unknown User'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {log.details || log.description || 'No details available'}
                        </p>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {log.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(log.createdAt || log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt || log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No activity logs found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ActivityLogs;
