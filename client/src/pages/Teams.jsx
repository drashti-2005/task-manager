import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { teamAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import TeamDialog from '../components/TeamDialog';

function Teams() {
  const { hasManagerAccess } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAll();
      console.log('Teams fetched:', response.data);
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await teamAPI.getUsersForTeam();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        await teamAPI.update(editingTeam._id, formData);
      } else {
        await teamAPI.create(formData);
      }
      
      setShowModal(false);
      setEditingTeam(null);
      setFormData({ name: '', description: '', members: [] });
      await fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      alert(error.message || 'Error saving team');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      members: team.members?.map(m => m._id) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await teamAPI.delete(teamId);
      await fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert(error.message || 'Error deleting team');
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          Teams
        </h1>
        {hasManagerAccess && (
          <button
            onClick={() => {
              setEditingTeam(null);
              setFormData({ name: '', description: '', members: [] });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Team
          </button>
        )}
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                Team Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Members
              </th>
              {hasManagerAccess && (
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-50">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={hasManagerAccess ? "4" : "3"} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-blue-300" />
                    <p>No teams found. Create your first team!</p>
                  </div>
                </td>
              </tr>
            ) : (
              teams.map(team => (
                <tr key={team._id} className="hover:bg-blue-50 hover:shadow-md transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-800">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{team.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                      </span>
                      {team.members && team.members.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {team.members.map(member => (
                            <span
                              key={member._id}
                              className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                              title={`${member.name} (${member.email}) - ${member.role}`}
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No members</span>
                      )}
                    </div>
                  </td>
                  {hasManagerAccess && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                          title="Edit team"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(team._id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                          title="Delete team"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Team Dialog */}
      <TeamDialog 
        showModal={showModal}
        setShowModal={setShowModal}
        editingTeam={editingTeam}
        setEditingTeam={setEditingTeam}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        users={users}
        toggleMember={toggleMember}
      />
    </div>
  );
}

export default Teams;
