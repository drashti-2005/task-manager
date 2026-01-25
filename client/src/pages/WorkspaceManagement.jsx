import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, createWorkspace, deleteWorkspace } from '../api/workspace.api';

const WorkspaceManagement = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError(err.message || 'Failed to load workspaces');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createWorkspace({ name });
      setName('');
      setShowDialog(false);
      fetchWorkspaces();
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace?')) return;
    setLoading(true);
    try {
      await deleteWorkspace(id);
      fetchWorkspaces();
    } catch (err) {
      setError(err.message || 'Failed to delete workspace');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
          Workspaces
        </h2>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg font-semibold shadow"
        >
          + Create Workspace
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Workspace Cards */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {workspaces.map(ws => (
            <div
              key={ws._id}
              onClick={() => navigate(`/workspaces/${ws._id}`)}
              className="bg-gradient-to-br from-purple-100 to-fuchsia-100 border-2 border-purple-200 rounded-xl p-6 shadow hover:shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">📁</span>
                <span className="font-bold text-lg text-purple-700">{ws.name}</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(ws._id);
                }}
                className="text-xs text-red-500 hover:underline self-end"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Create Workspace</h3>

            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Workspace name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceManagement;
