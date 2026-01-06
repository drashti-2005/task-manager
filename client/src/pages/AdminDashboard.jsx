import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, healthData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemHealth(),
      ]);

      setStats(statsData.data);
      setHealth(healthData.data);
      setRecentActivity(statsData.data.recentActivity || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      subValue: `${stats?.users?.active24h || 0} active (24h)`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Tasks',
      value: stats?.tasks?.total || 0,
      subValue: `${stats?.tasks?.createdToday || 0} created today`,
      icon: ListTodo,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Completed',
      value: stats?.tasks?.completed || 0,
      subValue: `${stats?.tasks?.completionRate || 0}% completion rate`,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'In Progress',
      value: stats?.tasks?.inProgress || 0,
      subValue: `${stats?.tasks?.pending || 0} pending`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Overdue Tasks',
      value: stats?.tasks?.overdue || 0,
      subValue: 'Require attention',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Weekly Tasks',
      value: stats?.tasks?.createdThisWeek || 0,
      subValue: 'Created this week',
      icon: TrendingUp,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ];

  const healthMetrics = [
    {
      title: 'Login Success Rate',
      value: `${health?.loginActivity?.successRate || 100}%`,
      subValue: `${health?.loginActivity?.failed || 0} failed attempts`,
      icon: ShieldCheck,
      color: 'text-green-600',
    },
    {
      title: 'Locked Accounts',
      value: health?.accountSecurity?.lockedAccounts || 0,
      subValue: 'Temporarily locked',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      title: 'Suspended Accounts',
      value: health?.accountSecurity?.suspendedAccounts || 0,
      subValue: 'Require review',
      icon: UserCheck,
      color: 'text-red-600',
    },
    {
      title: 'System Activity (24h)',
      value: health?.systemActivity?.totalActivities24h || 0,
      subValue: 'Total actions',
      icon: Activity,
      color: 'text-blue-600',
    },
  ];

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'bg-blue-100 text-blue-700';
    if (action.includes('CREATED')) return 'bg-green-100 text-green-700';
    if (action.includes('UPDATED')) return 'bg-yellow-100 text-yellow-700';
    if (action.includes('DELETED')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

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
              Admin Dashboard
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
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const cardBgs = [
              'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
              'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100',
              'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
              'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100',
              'bg-gradient-to-br from-red-50 to-pink-50 border-red-100',
              'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100'
            ];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`${cardBgs[index]} rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <motion.h3
                      key={card.value}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-bold text-gray-900 mb-2"
                    >
                      {card.value}
                    </motion.h3>
                    <p className="text-sm text-gray-600">
                      {card.subValue}
                    </p>
                  </div>
                  <div className={`${card.bgColor} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`h-2 bg-gradient-to-r ${card.color} rounded-full`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="text-center bg-white rounded-xl p-4 border border-gray-100">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${metric.color}`} />
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </h4>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {metric.subValue}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 10).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getActionBadgeColor(activity.action)}`}>
                      {activity.action}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.details || 'No details available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;
