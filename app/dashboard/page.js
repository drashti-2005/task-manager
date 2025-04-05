'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

// Task status options
const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  // Task state
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filter and sort state
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    if (user) {
      const storedTasks = localStorage.getItem(`tasks_${user.email}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }
  }, [user]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`tasks_${user.email}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle form submission for creating/editing tasks
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, title, description, dueDate, status, updatedAt: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      showToast('Task updated successfully');
    } else {
      // Create new task
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
      showToast('Task created successfully');
    }
    
    // Reset form
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus(STATUS_OPTIONS[0]);
    setEditingTask(null);
  };

  // Edit task
  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setStatus(task.status);
  };

  // Delete task
  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    showToast('Task deleted successfully', 'error');
  };

  // Filter tasks by status
  const filteredTasks = tasks.filter(task => 
    filterStatus === 'All' ? true : task.status === filterStatus
  );

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return sortOrder === 'asc' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    } else if (sortBy === 'createdAt') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Task Manager</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">Welcome, {user.name}</span>
            <ThemeToggle />
            <button 
              onClick={logout}
              className="px-3 py-1 text-sm bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  
                  {editingTask && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-bold">Your Tasks</h2>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                  {/* Filter dropdown */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    >
                      <option value="All">All Status</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort dropdown */}
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="createdAt">Creation Time</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Task list */}
              {sortedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks found. Create your first task!
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{task.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${task.status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : task.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg max-w-xs"
          style={{
            backgroundColor: toast.type === 'error' ? '#FEE2E2' : '#ECFDF5',
            color: toast.type === 'error' ? '#B91C1C' : '#065F46',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}