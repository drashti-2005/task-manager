import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import { getAnalyticsOverview, getCompletionTrends, getProductivity, getTimeAnalysis, getBestDays } from '../api/analytics.api';
import toast from 'react-hot-toast';

function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [completionTrends, setCompletionTrends] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  const [bestDays, setBestDays] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState('all'); // Changed default to 'all'
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, groupBy]);

  const getDateFilters = () => {
    const endDate = new Date();
    let startDate;

    switch (dateRange) {
      case '7days':
        startDate = subDays(endDate, 7);
        break;
      case '30days':
        startDate = subDays(endDate, 30);
        break;
      case '90days':
        startDate = subDays(endDate, 90);
        break;
      case '6months':
        startDate = subDays(endDate, 180);
        break;
      case 'all':
        // Don't send any date filters to get ALL tasks
        return {};
      default:
        startDate = subDays(endDate, 30);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const filters = getDateFilters();
      console.log('📊 Fetching analytics with filters:', filters);

      const [overviewData, trendsData, productivityData, timeData, bestDaysData] = await Promise.all([
        getAnalyticsOverview(filters),
        getCompletionTrends({ ...filters, groupBy }),
        getProductivity({ ...filters, groupBy }),
        getTimeAnalysis(filters),
        getBestDays({ ...filters, limit: 7 })
      ]);

      console.log('✅ Analytics data received:', {
        overview: overviewData,
        trends: trendsData,
        productivity: productivityData,
        timeAnalysis: timeData,
        bestDays: bestDaysData
      });

      setOverview(overviewData);
      setCompletionTrends(trendsData);
      setProductivity(productivityData);
      setTimeAnalysis(timeData);
      setBestDays(bestDaysData);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: overview?.totalTasks || 0,
      icon: BarChart3,
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      barGradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Completed',
      value: overview?.completedTasks || 0,
      icon: CheckCircle2,
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      barGradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Completion Rate',
      value: `${(overview?.completionRate || 0).toFixed(2)}%`,
      icon: Target,
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      barGradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Avg. Completion Time',
      value: `${(timeAnalysis?.avgCompletionTimeHours || 0).toFixed(2)}h`,
      icon: Clock,
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-100',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      barGradient: 'from-orange-500 to-amber-500'
    },
  ];

  const pieData = overview ? [
    { name: 'Completed', value: overview.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: overview.inProgressTasks, color: '#3b82f6' },
    { name: 'Pending', value: overview.pendingTasks, color: '#f59e0b' },
    { name: 'Overdue', value: overview.overdueTasks, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start flex-wrap gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              Task Analytics
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights and productivity metrics for {user?.name}
            </p>
          </div>
          
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 flex-wrap"
          >
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border-2 border-purple-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
            </select>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 border-2 border-blue-200 rounded-xl bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="day">Group by Day</option>
              <option value="week">Group by Week</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg p-6 border ${stat.borderColor} hover:shadow-xl transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-bold mt-2 text-gray-900"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`h-2 bg-gradient-to-r ${stat.barGradient} rounded-full`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row 1: Status Distribution & Completion Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Task Status Distribution</h3>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

          {/* Completion Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Completion Trends</h3>
            </div>
            {completionTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed Tasks" dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No completion data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Row 2: Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Productivity Overview</h3>
          </div>
          {productivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="created" fill="#3b82f6" name="Created Tasks" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No productivity data available</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Time Analysis Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-orange-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Time Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-100">
              <div className="text-3xl font-bold text-red-600">
                {timeAnalysis?.byPriority?.high?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">High Priority</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-100">
              <div className="text-3xl font-bold text-yellow-600">
                {timeAnalysis?.byPriority?.medium?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Medium Priority</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
              <div className="text-3xl font-bold text-green-600">
                {timeAnalysis?.byPriority?.low?.toFixed(1) || 0}h
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">Low Priority</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border-2 border-orange-100 flex items-center justify-between">
              <span className="text-gray-600 font-medium">⚡ Fastest Completion:</span>
              <span className="text-2xl font-bold text-gray-900">
                {timeAnalysis?.minCompletionTimeHours?.toFixed(1) || 0}h
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-orange-100 flex items-center justify-between">
              <span className="text-gray-600 font-medium">🐢 Slowest Completion:</span>
              <span className="text-2xl font-bold text-gray-900">
                {timeAnalysis?.maxCompletionTimeHours?.toFixed(1) || 0}h
              </span>
            </div>
          </div>
        </motion.div>

        {/* Best Performing Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100"
        >
          <div className="px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Best Performing Days 🏆</h3>
          </div>
          <div className="p-6">
            {bestDays.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-indigo-100">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Day</th>
                      <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">Tasks Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestDays.map((day, index) => {
                      const medals = ['🥇', '🥈', '🥉'];
                      const rowColors = [
                        'bg-gradient-to-r from-yellow-50 to-amber-50',
                        'bg-gradient-to-r from-gray-50 to-slate-50',
                        'bg-gradient-to-r from-orange-50 to-amber-50',
                        'bg-white'
                      ];
                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border-b border-indigo-50 ${rowColors[index] || rowColors[3]} hover:shadow-md transition-all`}
                        >
                          <td className="py-4 px-4 text-2xl">
                            {medals[index] || `#${index + 1}`}
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">{day.date}</td>
                          <td className="py-4 px-4 text-sm text-gray-600 font-medium">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.dayOfWeek - 1]}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                              {day.completedCount} tasks
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No completed tasks yet</p>
                <p className="text-gray-400 text-sm mt-2">Complete some tasks to see your best performing days!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;
