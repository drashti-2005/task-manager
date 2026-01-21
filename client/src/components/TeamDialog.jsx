import React from 'react';
import toast from 'react-hot-toast';

function TeamDialog({ 
  showModal, 
  setShowModal, 
  editingTeam, 
  setEditingTeam, 
  formData, 
  setFormData, 
  handleSubmit, 
  users,
  toggleMember
}) {
  
  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      members: [],
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter team name');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter team description');
      return;
    }
    
    if (formData.members.length === 0) {
      toast.error('Please select at least one member');
      return;
    }
    
    // If validation passes, call the handleSubmit
    handleSubmit(e);
  };

  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 bg-clip-text text-transparent mb-4">
          {editingTeam ? 'Edit Team' : 'New Team'}
        </h2>
        
        <form onSubmit={onSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
              placeholder="Enter team name"
              autoComplete="off"
              style={{ backgroundColor: '#f3f4f6', color: 'black' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-teal-50/50"
              placeholder="Enter team description"
              rows="3"
              autoComplete="off"
              style={{ backgroundColor: '#f0fdfa', color: 'black' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Members <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-purple-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-purple-50/50">
              {users.filter(user => user.role === 'employee').length === 0 ? (
                <p className="text-gray-500 text-sm">No employees available</p>
              ) : (
                <div className="space-y-2">
                  {users.filter(user => user.role === 'employee').map(user => (
                    <label
                      key={user._id}
                      className="flex items-center gap-2 p-2 hover:bg-purple-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.members.includes(user._id)}
                        onChange={() => toggleMember(user._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.members.length} member(s) selected
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white py-2 rounded-lg font-bold transition duration-300 shadow-lg"
            >
              {editingTeam ? 'Update' : 'Create'}
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

export default TeamDialog;
