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
  Award,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border border-purple-100 rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Top Performers 🏆
          </h2>
          <div className="space-y-4">
            {stats?.topPerformers && stats.topPerformers.length > 0 ? (
              stats.topPerformers.map((performer, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <motion.div
                    key={performer.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      index === 0
                        ? 'bg-yellow-50 border-yellow-200'
                        : index === 1
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl font-bold">{medals[index]}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{performer.completedCount}</p>
                      <p className="text-xs text-gray-500">tasks completed</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No completed tasks yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Analytics & Insights
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Task Status Distribution</h3>
              </div>
              {stats && (stats.tasks.completed > 0 || stats.tasks.pending > 0 || stats.tasks.inProgress > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: stats.tasks.completed, color: '#10b981' },
                        { name: 'In Progress', value: stats.tasks.inProgress, color: '#3b82f6' },
                        { name: 'Pending', value: stats.tasks.pending, color: '#f59e0b' },
                        { name: 'Overdue', value: stats.tasks.overdue, color: '#ef4444' },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Completed', value: stats.tasks.completed, color: '#10b981' },
                        { name: 'In Progress', value: stats.tasks.inProgress, color: '#3b82f6' },
                        { name: 'Pending', value: stats.tasks.pending, color: '#f59e0b' },
                        { name: 'Overdue', value: stats.tasks.overdue, color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No task data available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Task Summary Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Task Summary</h3>
              </div>
              {stats && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Total', value: stats.tasks.total },
                      { name: 'Completed', value: stats.tasks.completed },
                      { name: 'In Progress', value: stats.tasks.inProgress },
                      { name: 'Pending', value: stats.tasks.pending },
                      { name: 'Overdue', value: stats.tasks.overdue },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Completion Overview</h3>
              </div>
              {stats && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.tasks.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.tasks.completionRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Created Today</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.tasks.createdToday}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created This Week</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.tasks.createdThisWeek}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* User Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">User Overview</h3>
              </div>
              {stats && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { name: 'Total Users', value: stats.users.total, color: '#3b82f6' },
                      { name: 'Active 24h', value: stats.users.active24h, color: '#10b981' },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;
