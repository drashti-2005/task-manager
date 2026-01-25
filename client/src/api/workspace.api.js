import { API_URL } from './config.js';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const createWorkspace = async (data) => {
  const response = await fetch(`${API_URL}/workspaces`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to create workspace');
  return result.data;
};

export const getWorkspaces = async () => {
  const response = await fetch(`${API_URL}/workspaces`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to get workspaces');
  return result.data;
};

export const updateWorkspace = async (id, data) => {
  const response = await fetch(`${API_URL}/workspaces/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update workspace');
  return result.data;
};

export const deleteWorkspace = async (id) => {
  const response = await fetch(`${API_URL}/workspaces/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to delete workspace');
  return result;
};
