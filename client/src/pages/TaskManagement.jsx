import { useState, useEffect } from 'react';
import { ListTodo, Plus, Edit2, Trash2, X, Search, Filter, Calendar, UserPlus, Users, FolderPlus, Folder, Pencil, LayoutGrid, List } from 'lucide-react';
import { createWorkspace, getWorkspaces, deleteWorkspace, updateWorkspace } from '../api/workspace.api';
import { taskAPI } from '../api/api';
import TaskDialog from '../components/TaskDialog';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TaskManagement() {
  // View state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  
  // Workspace state
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [renamingWorkspace, setRenamingWorkspace] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverWorkspace, setDragOverWorkspace] = useState(null);

  const { hasManagerAccess, isUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // Available users for assignment
  const [teams, setTeams] = useState([]); // Available teams for assignment
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTask, setReassignTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [dateError, setDateError] = useState('');
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
    workspace: '', // Add workspace field
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
    fetchWorkspaces();
    fetchTasks();
    // Fetch users and teams for assignment if user is manager
    if (hasManagerAccess) {
      fetchUsers();
      fetchTeams();
    }
  }, [debouncedSearchQuery, filters, hasManagerAccess, selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setWorkspaceLoading(true);
    setWorkspaceError('');
    try {
      await createWorkspace({ name: workspaceName, description: workspaceDescription });
      setWorkspaceName('');
      setWorkspaceDescription('');
      setShowWorkspaceModal(false);
      fetchWorkspaces();
      toast.success('Workspace created!');
    } catch (err) {
      setWorkspaceError(err.message || 'Failed to create workspace');
    }
    setWorkspaceLoading(false);
  };

  const handleDeleteWorkspace = async (id) => {
    if (!window.confirm('Delete this workspace? This will not delete tasks.')) return;
    try {
      await deleteWorkspace(id);
      if (selectedWorkspace?._id === id) {
        setSelectedWorkspace(null);
      }
      fetchWorkspaces();
      toast.success('Workspace deleted!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete workspace');
    }
  };

  const handleWorkspaceClick = (workspace) => {
    if (selectedWorkspace?._id === workspace._id) {
      setSelectedWorkspace(null); // Deselect if clicking the same workspace
    } else {
      setSelectedWorkspace(workspace);
    }
  };

  const handleCreateTaskInWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    setFormData({
      ...formData,
      workspace: workspace._id,
    });
    setShowModal(true);
  };

  const handleStartRename = (e, workspace) => {
    e.stopPropagation();
    setRenamingWorkspace(workspace._id);
    setRenameValue(workspace.name);
  };

  const handleCancelRename = () => {
    setRenamingWorkspace(null);
    setRenameValue('');
  };

  const handleSaveRename = async (e, workspaceId) => {
    e.stopPropagation();
    if (!renameValue.trim()) {
      toast.error('Workspace name cannot be empty');
      return;
    }
    try {
      await updateWorkspace(workspaceId, { name: renameValue });
      setRenamingWorkspace(null);
      setRenameValue('');
      fetchWorkspaces();
      toast.success('Workspace renamed!');
    } catch (error) {
      toast.error(error.message || 'Failed to rename workspace');
    }
  };

  // Drag and drop handlers for moving tasks to workspaces
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleWorkspaceDragOver = (e, workspace) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverWorkspace(workspace?._id || 'none');
  };

  const handleWorkspaceDragLeave = (e) => {
    e.preventDefault();
    setDragOverWorkspace(null);
  };

  const handleWorkspaceDrop = async (e, workspace) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverWorkspace(null);
    
    if (!draggedTask) return;

    const targetWorkspaceId = workspace ? workspace._id : null;
    const currentWorkspaceId = draggedTask.workspace?._id || draggedTask.workspace;

    // Don't update if dropping on the same workspace
    if (targetWorkspaceId === currentWorkspaceId) {
      setDraggedTask(null);
      return;
    }

    try {
      const updateData = { ...draggedTask };
      if (workspace) {
        updateData.workspace = workspace._id;
      } else {
        updateData.workspace = null;
      }

      await taskAPI.updateTask(draggedTask._id, updateData);
      toast.success(`Task moved to ${workspace ? workspace.name : 'common area'}!`);
      fetchTasks();
    } catch (error) {
      toast.error(error.message || 'Failed to move task');
    }
    
    setDraggedTask(null);
  };

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
      
      // Build params
      const params = {
        ...(debouncedSearchQuery && { q: debouncedSearchQuery }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      
      // If a workspace is selected, only show tasks from that workspace
      if (selectedWorkspace) {
        params.workspace = selectedWorkspace._id;
      } else {
        // If no workspace is selected, show only common tasks (tasks without workspace)
        params.workspace = 'none';
      }
      
      // Use search endpoint with workspace filter
      const response = await taskAPI.searchTasks(params);
      setTasks(response.data || []);
      
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
    
    // Date validation
    const validateDates = (startDate, dueDate) => {
      if (startDate || dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          
          if (start < today) {
            return { isValid: false, error: 'Start date cannot be in the past' };
          }
        }

        if (startDate && dueDate) {
          const start = new Date(startDate);
          const due = new Date(dueDate);
          
          if (due <= start) {
            return { isValid: false, error: 'Due date must be after start date' };
          }
        }
      }
      return { isValid: true, error: '' };
    };

    const validation = validateDates(formData.startDate, formData.dueDate);
    
    if (!validation.isValid) {
      setDateError(validation.error);
      return;
    }
    
    setDateError('');
    
    try {
      // Create task data, only include workspace if one is selected
      const taskData = {
        ...formData,
      };
      
      // If no workspace selected or creating common task, don't include workspace field
      if (!selectedWorkspace || !formData.workspace) {
        delete taskData.workspace;
      }
      
      if (editingTask) {
        await taskAPI.updateTask(editingTask._id, taskData);
      } else {
        await taskAPI.createTask(taskData);
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
        workspace: '',
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
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.updateTaskStatus(id, newStatus);
      fetchTasks();
      toast.success('Task status updated!');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id;
    const newStatus = over.id;
    
    // Update task status
    if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
      await handleStatusChange(taskId, newStatus);
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

  // Draggable Task Card Component
  const TaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task._id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border-2 border-purple-100 cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 flex-1">{task.title}</h3>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(task);
              }}
              className="text-blue-500 hover:text-blue-700 p-1"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {hasManagerAccess && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task._id);
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Kanban Column Component
  const KanbanColumn = ({ status, title, tasks, colorClass }) => {
    const taskIds = tasks.map(t => t._id);

    return (
      <div className="flex-1 min-w-[280px] sm:min-w-[300px]">
        <div className={`${colorClass} rounded-t-lg p-2 sm:p-3 border-2 border-b-0`}>
          <h3 className="font-bold text-white text-center flex items-center justify-center gap-2 text-sm sm:text-base">
            {title}
            <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs sm:text-sm">
              {tasks.length}
            </span>
          </h3>
        </div>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div 
            id={status}
            className="bg-gray-50 rounded-b-lg p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] border-2 border-t-0 space-y-2 sm:space-y-3"
          >
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
          <ListTodo className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
          {isUser ? 'My Tasks' : 'Task Management'}
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-4 py-2 rounded-md font-semibold transition flex items-center gap-1 sm:gap-2 text-sm ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-2 sm:px-4 py-2 rounded-md font-semibold transition flex items-center gap-1 sm:gap-2 text-sm ${
                viewMode === 'board'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition duration-300 shadow flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
          >
            <FolderPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Workspace</span>
            <span className="sm:hidden">WS</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Task</span>
          </button>
        </div>
      </div>
      {/* Workspace Creation Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-xl p-3 sm:p-4 w-full max-w-xs border-2 border-purple-200">
            <h2 className="text-base sm:text-lg font-bold mb-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 bg-clip-text text-transparent">Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <input
                type="text"
                placeholder="Workspace name"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                required
                className="w-full mb-2 p-2 border border-purple-200 rounded text-sm"
              />
              {workspaceError && <div className="text-red-500 mb-2 text-xs">{workspaceError}</div>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-purple-200 text-xs sm:text-sm"
                  disabled={workspaceLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded font-semibold text-xs sm:text-sm"
                  disabled={workspaceLoading}
                >
                  {workspaceLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Folders Section */}
      {workspaces.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl p-3 sm:p-4 md:p-6 border-2 border-purple-100">
          <h2 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4 text-purple-700 flex items-center gap-1.5 sm:gap-2">
            <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            Workspaces
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {/* Common Area Drop Zone */}
            <div
              onDragOver={(e) => handleWorkspaceDragOver(e, null)}
              onDragLeave={handleWorkspaceDragLeave}
              onDrop={(e) => handleWorkspaceDrop(e, null)}
              className={`relative group cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                dragOverWorkspace === 'none'
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title="Drop here to move task to common area (no workspace)"
            >
              <div className="flex flex-col items-center gap-2">
                <Folder className="h-10 w-10 text-gray-400 group-hover:text-gray-500" />
                <span className="text-sm font-semibold text-gray-700 text-center">
                  Common Tasks
                </span>
              </div>
              {dragOverWorkspace === 'none' && (
                <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-xl bg-green-50 bg-opacity-50 flex items-center justify-center">
                  <span className="text-green-700 font-bold text-xs">Drop Here</span>
                </div>
              )}
            </div>

            {workspaces.map(workspace => (
              <div
                key={workspace._id}
                onClick={() => handleWorkspaceClick(workspace)}
                onDragOver={(e) => handleWorkspaceDragOver(e, workspace)}
                onDragLeave={handleWorkspaceDragLeave}
                onDrop={(e) => handleWorkspaceDrop(e, workspace)}
                className={`relative group cursor-pointer bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                  dragOverWorkspace === workspace._id
                    ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                    : selectedWorkspace?._id === workspace._id
                    ? 'border-purple-500 shadow-lg scale-105'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Folder 
                    className={`h-10 w-10 ${
                      selectedWorkspace?._id === workspace._id 
                        ? 'text-purple-600' 
                        : 'text-purple-400 group-hover:text-purple-500'
                    }`} 
                  />
                  {renamingWorkspace === workspace._id ? (
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e, workspace._id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        className="w-full text-sm font-semibold text-purple-700 text-center border-2 border-purple-400 rounded px-1 py-0.5"
                        autoFocus
                      />
                      <div className="flex gap-1 mt-1 justify-center">
                        <button
                          onClick={(e) => handleSaveRename(e, workspace._id)}
                          className="text-xs bg-green-500 text-white px-2 py-0.5 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRename();
                          }}
                          className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-purple-700 text-center line-clamp-2">
                      {workspace.name}
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTaskInWorkspace(workspace);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full shadow-lg transition"
                    title="Create task in this workspace"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => handleStartRename(e, workspace)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition"
                    title="Rename workspace"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace._id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition"
                    title="Delete workspace"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Selected Indicator */}
                {selectedWorkspace?._id === workspace._id && (
                  <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    ✓
                  </div>
                )}
                
                {/* Drop Zone Indicator */}
                {dragOverWorkspace === workspace._id && (
                  <div className="absolute inset-0 border-2 border-dashed border-green-500 rounded-xl bg-green-50 bg-opacity-50 flex items-center justify-center pointer-events-none">
                    <span className="text-green-700 font-bold text-xs">Drop Here</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {selectedWorkspace && (
            <div className="mt-4 p-3 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-700">
                Showing tasks from: <span className="text-purple-900">{selectedWorkspace.name}</span>
              </span>
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="text-purple-700 hover:text-purple-900 font-semibold text-sm flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Show All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Section */}
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100"
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 transition-all duration-200 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition duration-300 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
                showFilters 
                  ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 text-white' 
                  : 'bg-gradient-to-r from-purple-100 via-blue-100 to-teal-100 text-purple-700 hover:from-purple-200 hover:via-blue-200 hover:to-teal-200'
              }`}
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300 transition duration-300 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-purple-100"
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

      {/* Tasks View - Board or List */}
      {viewMode === 'board' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              status="pending"
              title="📋 Pending"
              tasks={tasks.filter(t => t.status === 'pending')}
              colorClass="bg-gradient-to-r from-yellow-400 to-orange-500"
            />
            <KanbanColumn
              status="in-progress"
              title="🔄 In Progress"
              tasks={tasks.filter(t => t.status === 'in-progress')}
              colorClass="bg-gradient-to-r from-blue-400 to-indigo-500"
            />
            <KanbanColumn
              status="completed"
              title="✅ Completed"
              tasks={tasks.filter(t => t.status === 'completed')}
              colorClass="bg-gradient-to-r from-green-400 to-teal-500"
            />
          </div>
        </DndContext>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
          <div className="overflow-x-auto">
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
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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
                    draggable="true"
                    onDragStart={(e) => handleTaskDragStart(e, task)}
                    onDragEnd={() => setDraggedTask(null)}
                    className="hover:bg-purple-50 hover:shadow-md transition-all duration-200 cursor-move"
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
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
      {/* Tasks Table */}

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
            
            {dateError && (
              <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs">
                {dateError}
              </div>
            )}
            
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
                    min={new Date().toISOString().split('T')[0]}
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
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
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
                        {users.filter(user => user.role === 'employee').map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
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
                            {team.name} - {team.members?.map(m => m.name || m.email).join(', ') || 'No members'}
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
                    setDateError('');
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
