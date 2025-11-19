import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeams } from '../api/api';

export default function Teams() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await getTeams(groupId);
        setTeams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [groupId]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          {teams && teams.teams && (
            <p className="mt-2 text-sm text-gray-500">
              Created on {new Date(teams.createdAt).toLocaleDateString()} at{' '}
              {new Date(teams.createdAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!teams || !teams.teams || teams.teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xl text-gray-600">No teams have been created yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Check back later or ask your admin to create teams
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.teams.map((team, index) => {
              // Handle both old structure (object with players array) and new structure (direct array)
              const players = Array.isArray(team) ? team : team.players || [];
              const teamNum = Array.isArray(team) ? index + 1 : team.teamNumber || index + 1;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Team {teamNum}
                    </h2>
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                      {players.length} {players.length === 1 ? 'player' : 'players'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {players.map((player, playerIndex) => (
                      <div
                        key={player._id}
                        className="flex items-center py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                          {playerIndex + 1}
                        </div>
                        <span className="ml-3 text-gray-900 font-medium">
                          {player.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
