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

export default fetchAPI;
