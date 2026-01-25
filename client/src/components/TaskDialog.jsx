import React, { useState } from 'react';

function TaskDialog({ 
  showModal, 
  setShowModal, 
  editingTask, 
  setEditingTask, 
  formData, 
  setFormData, 
  handleSubmit, 
  handleInputChange 
}) {
  const [dateError, setDateError] = useState('');

  // Date validation helper function
  const validateDates = (startDate, dueDate) => {
    if (!startDate && !dueDate) {
      return { isValid: true, error: '' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate startDate is not in the past
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      if (start < today) {
        return { isValid: false, error: 'Start date cannot be in the past' };
      }
    }

    // Validate dueDate is after startDate
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (due <= start) {
        return { isValid: false, error: 'Due date must be after start date' };
      }
    }

    return { isValid: true, error: '' };
  };

  const closeModal = () => {
    setDateError('');
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
    });
  };

  // Wrap handleSubmit with date validation
  const onSubmitWithValidation = (e) => {
    e.preventDefault();
    
    const validation = validateDates(formData.startDate, formData.dueDate);
    
    if (!validation.isValid) {
      setDateError(validation.error);
      return;
    }
    
    setDateError('');
    handleSubmit(e);
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {editingTask ? 'Edit Task' : 'New Task'}
        </h2>
        
        {dateError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {dateError}
          </div>
        )}
        
        <form onSubmit={onSubmitWithValidation} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter task title"
              autoComplete="off"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter task description"
              autoComplete="off"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={getTodayDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={formData.startDate || getTodayDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="e.g., urgent, meeting, project"
              autoComplete="off"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition duration-200"
            >
              {editingTask ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskDialog;
