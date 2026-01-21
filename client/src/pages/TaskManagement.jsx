import { useState, useEffect } from 'react';
import { ListTodo, Plus, Edit2, Trash2, X, Search, Filter, Calendar, UserPlus, Users } from 'lucide-react';
import { taskAPI } from '../api/api';
import TaskDialog from '../components/TaskDialog';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';

function TaskManagement() {
  const { hasManagerAccess, isUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // Available users for assignment
  const [teams, setTeams] = useState([]); // Available teams for assignment
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTask, setReassignTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    tags: [],
    assignedTo: '', // For individual assignment
    assignedToTeam: '', // For team assignment
    assignmentType: 'self', // 'self', 'individual', 'team'
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchTasks();
    // Fetch users and teams for assignment if user is manager
    if (hasManagerAccess) {
      fetchUsers();
      fetchTeams();
    }
  }, [debouncedSearchQuery, filters, hasManagerAccess]);

  const fetchUsers = async () => {
    try {
      const response = await taskAPI.getUsersForAssignment();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await taskAPI.getTeamsForAssignment();
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // If search or filters are active, use search endpoint
      if (debouncedSearchQuery || filters.priority || filters.status || filters.startDate || filters.endDate) {
        const params = {
          ...(debouncedSearchQuery && { q: debouncedSearchQuery }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.status && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        };
        
        const response = await taskAPI.searchTasks(params);
        setTasks(response.data);
      } else {
        // Otherwise, use regular getAllTasks
        const tasks = await taskAPI.getAllTasks();
        setTasks(tasks);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle tags separately if needed
    if (name === 'tags') {
      setFormData({
        ...formData,
        tags: value.split(',').map(tag => tag.trim()).filter(tag => tag),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await taskAPI.updateTask(editingTask._id, formData);
      } else {
        await taskAPI.createTask(formData);
      }
      
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        tags: [],
        assignedTo: '',
        assignedToTeam: '',
        assignmentType: 'self',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags || [],
      assignedTo: task.assignedTo?._id || '',
      assignedToTeam: task.assignedToTeam?._id || '',
      assignmentType: task.assignmentType || 'self',
    });
    setShowModal(true);
  };

  const handleReassign = (task) => {
    setReassignTask(task);
    setShowReassignModal(true);
  };

  const handleReassignSubmit = async (newUserId) => {
    try {
      await taskAPI.reassignTask(reassignTask._id, newUserId);
      setShowReassignModal(false);
      setReassignTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error reassigning task:', error);
      alert('Failed to reassign task: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.deleteTask(id);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.updateTaskStatus(id, newStatus);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      priority: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = searchQuery || filters.priority || filters.status || filters.startDate || filters.endDate;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
          <ListTodo className="h-8 w-8 text-purple-500" />
          {isUser ? 'My Tasks' : 'Task Management'}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      {/* Search and Filter Section */}
      <div
        className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search tasks by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-lg flex items-center gap-2 ${
                showFilters 
                  ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white' 
                  : 'bg-gradient-to-r from-purple-100 via-blue-100 to-teal-100 text-purple-700 hover:from-purple-200 hover:via-blue-200 hover:to-teal-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 transition duration-300 shadow-lg flex items-center gap-2"
              >
                <X className="h-5 w-5" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t-2 border-purple-100"
            >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50/50 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Tasks Table */}
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100"
      >
        <table className="min-w-full divide-y divide-purple-100">
          <thead className="bg-gradient-to-r from-purple-100 via-blue-100 to-teal-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Task
              </th>
              {hasManagerAccess && (
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Assigned To
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-purple-50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <ListTodo className="h-12 w-12 text-purple-300" />
                    <p>No tasks found. Create your first task!</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <tr
                  key={task._id}
                  className="hover:bg-purple-50 hover:shadow-md transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800">{task.title}</div>
                    <div className="text-sm text-gray-600">{task.description}</div>
                  </td>
                  {hasManagerAccess && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          {task.assignmentType === 'team' ? (
                            <>
                              <div className="flex items-center gap-1 font-semibold text-blue-700">
                                <Users className="h-4 w-4" />
                                {task.assignedToTeam?.name || 'Team'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {task.assignedToTeam?.members?.length || 0} members
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold text-gray-800">{task.assignedTo?.name || 'Self'}</div>
                              <div className="text-xs text-gray-500">{task.assignedTo?.email || ''}</div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleReassign(task)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                          title="Reassign task"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border-2 transition-all duration-200 ${
                        task.status === 'completed' ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-teal-300' :
                        task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300' :
                        'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                      task.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                      task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                      'bg-gradient-to-r from-green-400 to-green-500 text-white'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    {hasManagerAccess && (
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
            <div
              className="bg-white rounded-2xl p-5 max-w-md w-full my-8 shadow-2xl border-2 border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      status: 'pending',
                      priority: 'medium',
                      startDate: '',
                      dueDate: '',
                      tags: [],
                      assignedTo: '',
                      assignedToTeam: '',
                      assignmentType: 'self',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 transition-all duration-200 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border-2 border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50/50 transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border-2 border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50/50 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Assign To field - only for managers */}
              {hasManagerAccess && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Assignment Type
                    </label>
                    <select
                      name="assignmentType"
                      value={formData.assignmentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200"
                    >
                      <option value="self">Assign to Myself</option>
                      <option value="individual">Assign to Individual</option>
                      <option value="team">Assign to Team</option>
                    </select>
                  </div>

                  {formData.assignmentType === 'individual' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        Assign To User
                      </label>
                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/50 transition-all duration-200"
                      >
                        <option value="">Select User</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.assignmentType === 'team' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Assign To Team
                      </label>
                      <select
                        name="assignedToTeam"
                        value={formData.assignedToTeam}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 transition-all duration-200"
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team._id} value={team._id}>
                            {team.name} ({team.members?.length || 0} members)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white py-2 rounded-lg font-bold text-sm transition duration-300 shadow-lg"
                >
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      status: 'pending',
                      priority: 'medium',
                      startDate: '',
                      dueDate: '',
                      tags: [],
                      assignedTo: '',
                      assignedToTeam: '',
                      assignmentType: 'self',
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-2 rounded-lg font-bold text-sm transition duration-300 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

      {/* Reassign Task Modal */}
      {showReassignModal && reassignTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-indigo-600" />
                Reassign Task
              </h2>
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignTask(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100">
                <p className="text-sm font-semibold text-gray-700 mb-1">Current Task:</p>
                <p className="text-lg font-bold text-indigo-700">{reassignTask.title}</p>
                <p className="text-sm text-gray-600 mt-2">Currently assigned to:</p>
                <p className="text-md font-semibold text-gray-800">
                  {reassignTask.assignedTo?.name || 'Unassigned'} 
                  {reassignTask.assignedTo?.email && ` (${reassignTask.assignedTo.email})`}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reassign to:
              </label>
              <select
                id="reassign-user"
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/50 transition-all duration-200"
                defaultValue=""
              >
                <option value="" disabled>Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const selectedUserId = document.getElementById('reassign-user').value;
                  if (selectedUserId) {
                    handleReassignSubmit(selectedUserId);
                  } else {
                    alert('Please select a user to reassign the task to.');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold transition duration-300 shadow-lg"
              >
                Reassign Task
              </button>
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignTask(null);
                }}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-3 rounded-xl font-bold transition duration-300 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManagement;
