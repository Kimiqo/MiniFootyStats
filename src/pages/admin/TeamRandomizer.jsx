import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlayers, createTeams, getTeams, deleteTeams } from '../../api/api';

export default function TeamRandomizer() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [numTeams, setNumTeams] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersData, teamsData] = await Promise.all([
          getPlayers(groupId),
          getTeams(groupId)
        ]);
        setPlayers(playersData);
        setTeams(teamsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(p => p._id));
    }
  };

  const handleRandomize = async () => {
    if (selectedPlayers.length < numTeams) {
      setError(`Please select at least ${numTeams} players`);
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const result = await createTeams({
        playerIds: selectedPlayers,
        numTeams: parseInt(numTeams)
      });
      setTeams(result);
      setSelectedPlayers([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeams = async () => {
    if (!teams || !teams._id) return;
    
    if (!window.confirm('Are you sure you want to delete the current teams? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await deleteTeams(teams._id);
      setTeams(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Randomizer</h1>
          <button
            onClick={() => navigate(`/admin`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Players</h2>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {selectedPlayers.length === players.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Teams
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={numTeams}
                onChange={(e) => setNumTeams(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-gray-500">No players available</p>
              ) : (
                players.map(player => (
                  <label
                    key={player._id}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player._id)}
                      onChange={() => handlePlayerToggle(player._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-900">{player.name}</span>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={handleRandomize}
              disabled={creating || selectedPlayers.length < numTeams}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Randomizing...' : `Randomize into ${numTeams} Teams`}
            </button>

            <p className="mt-2 text-sm text-gray-500 text-center">
              {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Teams Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Teams</h2>
              {teams && teams.teams && (
                <button
                  onClick={handleDeleteTeams}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Teams'}
                </button>
              )}
            </div>
            
            {!teams || !teams.teams ? (
              <p className="text-gray-500 text-center py-8">No teams created yet</p>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Created on {new Date(teams.createdAt).toLocaleDateString()} at{' '}
                  {new Date(teams.createdAt).toLocaleTimeString()}
                </p>
                
                <div className="space-y-4">
                  {teams.teams.map((team, index) => {
                    // Handle both old structure (object with players array) and new structure (direct array)
                    const players = Array.isArray(team) ? team : team.players || [];
                    const teamNum = Array.isArray(team) ? index + 1 : team.teamNumber || index + 1;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Team {teamNum}
                        </h3>
                        <div className="space-y-1">
                          {players.map(player => (
                            <div key={player._id} className="text-gray-700">
                              {player.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
