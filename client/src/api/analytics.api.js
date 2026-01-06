const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to build query string from params
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw data;
  }
  
  return data.data;
};

/**
 * Get overview analytics
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.userId - User ID (admin only)
 * @returns {Promise<Object>} Overview analytics data
 */
export const getAnalyticsOverview = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_URL}/analytics/overview${queryString ? `?${queryString}` : ''}`;
    console.log('🔍 Fetching overview from:', url);
    console.log('🔑 Auth headers:', getAuthHeader());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    console.log('📡 Response status:', response.status);
    const data = await handleResponse(response);
    console.log('📊 Overview data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching analytics overview:', error);
    throw error;
  }
};

/**
 * Get completion trends
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.groupBy - 'day' or 'week'
 * @param {string} params.userId - User ID (admin only)
 * @returns {Promise<Array>} Completion trends data
 */
export const getCompletionTrends = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_URL}/analytics/completion-trends${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching completion trends:', error);
    throw error;
  }
};

/**
 * Get productivity metrics
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.groupBy - 'day' or 'week'
 * @param {string} params.userId - User ID (admin only)
 * @returns {Promise<Array>} Productivity data
 */
export const getProductivity = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_URL}/analytics/productivity${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    throw error;
  }
};

/**
 * Get time analysis
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.userId - User ID (admin only)
 * @returns {Promise<Object>} Time analysis data
 */
export const getTimeAnalysis = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_URL}/analytics/time-analysis${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching time analysis:', error);
    throw error;
  }
};

/**
 * Get best performing days
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.limit - Number of days to return
 * @param {string} params.userId - User ID (admin only)
 * @returns {Promise<Array>} Best performing days
 */
export const getBestDays = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const url = `${API_URL}/analytics/best-days${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching best performing days:', error);
    throw error;
  }
};
