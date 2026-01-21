const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Parse JSON response first
    const data = await response.json();

    // Handle 401 Unauthorized - but don't redirect on login page
    if (response.status === 401) {
      // Only redirect if user is already logged in and token expired
      if (token && endpoint !== '/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Unauthorized');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData) => 
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getCurrentUser: () => fetchAPI('/auth/me'),
  
  logout: () => 
    fetchAPI('/auth/logout', {
      method: 'POST',
    }),
};

// Task API
export const taskAPI = {
  getAllTasks: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/tasks${queryString}`);
  },
  
  getTaskById: (id) => fetchAPI(`/tasks/${id}`),
  
  createTask: (taskData) => 
    fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  updateTask: (id, taskData) => 
    fetchAPI(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
  
  deleteTask: (id) => 
    fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  
  updateTaskStatus: (id, status) => 
    fetchAPI(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  searchTasks: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/tasks/search${queryString}`);
  },

  // Manager-specific endpoints
  getTeamProductivity: () => fetchAPI('/tasks/team/productivity'),
  
  getUsersForAssignment: () => fetchAPI('/tasks/users'),
  
  getTeamsForAssignment: () => fetchAPI('/tasks/teams'),
  
  reassignTask: (id, assignedTo) => 
    fetchAPI(`/tasks/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    }),
};

// User API
export const userAPI = {
  getAllUsers: () => fetchAPI('/users'),
  
  getUserById: (id) => fetchAPI(`/users/${id}`),
  
  updateUser: (id, userData) => 
    fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  
  deleteUser: (id) => 
    fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminAPI = {
  // Dashboard & Analytics
  getDashboardStats: () => fetchAPI('/admin/dashboard/stats'),
  getTaskAnalytics: (period = '7d') => fetchAPI(`/admin/analytics/tasks?period=${period}`),
  getUserAnalytics: () => fetchAPI('/admin/analytics/users'),
  getProductivityReport: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/admin/reports/productivity${queryString}`);
  },
  getSystemHealth: () => fetchAPI('/admin/system/health'),

  // User Management
  getAllUsers: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/admin/users${queryString}`);
  },
  getUserById: (id) => fetchAPI(`/admin/users/${id}`),
  createUser: (userData) =>
    fetchAPI('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUser: (id, userData) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  resetUserPassword: (id, newPassword) =>
    fetchAPI(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
  unlockUserAccount: (id) =>
    fetchAPI(`/admin/users/${id}/unlock`, {
      method: 'POST',
    }),
  deactivateUser: (id) =>
    fetchAPI(`/admin/users/${id}/deactivate`, {
      method: 'POST',
    }),
  activateUser: (id) =>
    fetchAPI(`/admin/users/${id}/activate`, {
      method: 'POST',
    }),

  // Task Management
  getAllTasksAdmin: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/admin/tasks${queryString}`);
  },
  updateTaskAdmin: (id, taskData) =>
    fetchAPI(`/admin/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),
  deleteTaskAdmin: (id) =>
    fetchAPI(`/admin/tasks/${id}`, {
      method: 'DELETE',
    }),
  reassignTask: (id, assignedTo) =>
    fetchAPI(`/admin/tasks/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    }),
  bulkDeleteTasks: (taskIds) =>
    fetchAPI('/admin/tasks/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    }),
  bulkUpdateTasks: (taskIds, updates) =>
    fetchAPI('/admin/tasks/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ taskIds, updates }),
    }),
  getTaskStatsByUser: () => fetchAPI('/admin/tasks/stats/by-user'),

  // Activity Logs
  getActivityLogs: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/admin/activity-logs${queryString}`);
  },
  getUserActivityHistory: (userId, limit = 50) =>
    fetchAPI(`/admin/activity-logs/user/${userId}?limit=${limit}`),
  getEntityAuditTrail: (entityType, entityId) =>
    fetchAPI(`/admin/activity-logs/entity/${entityType}/${entityId}`),
  getActivityLogStats: (period = '7d') =>
    fetchAPI(`/admin/activity-logs/stats?period=${period}`),
  getFailedLogins: (limit = 50) =>
    fetchAPI(`/admin/activity-logs/failed-logins?limit=${limit}`),
};

// Team API
export const teamAPI = {
  getAll: () => fetchAPI('/teams'),
  
  getTeamById: (id) => fetchAPI(`/teams/${id}`),
  
  create: (teamData) =>
    fetchAPI('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    }),
  
  update: (id, teamData) =>
    fetchAPI(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    }),
  
  delete: (id) =>
    fetchAPI(`/teams/${id}`, {
      method: 'DELETE',
    }),
  
  addTeamMembers: (id, userIds) =>
    fetchAPI(`/teams/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    }),
  
  removeTeamMember: (id, userId) =>
    fetchAPI(`/teams/${id}/members/${userId}`, {
      method: 'DELETE',
    }),
  
  getUsersForTeam: () => fetchAPI('/tasks/users'),
};

export default fetchAPI;
