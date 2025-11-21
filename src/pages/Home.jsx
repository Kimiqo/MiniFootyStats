import { useParams } from 'react-router-dom';
import { useRecentMatches, useLeaderboard, useVoteStatus } from '../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loading, ErrorMessage } from '../components/Feedback';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTeams } from '../api/api';

export const Home = () => {
  const { groupId } = useParams();
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useRecentMatches(groupId);
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useLeaderboard(groupId);
  const { data: voteStatus, isLoading: voteLoading } = useVoteStatus(groupId);
  const [teams, setTeams] = useState(null);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setTeamsLoading(true);
        const data = await getTeams(groupId);
        setTeams(data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [groupId]);

  if (matchesLoading || leaderboardLoading) {
    return <Loading />;
  }

  if (matchesError || leaderboardError) {
    return <ErrorMessage message="Failed to load data" />;
  }

  const latestMatch = matches?.[0];
  const topScorers = leaderboard?.goals?.slice(0, 5) || [];
  const topMVPs = leaderboard?.mvp?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-2">MiniFooty Stats</h1>
        <p className="text-xl">Track your game, celebrate your stars</p>
      </div>

      {/* Latest Match */}
      {latestMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(latestMatch.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Players:</span>
                <span className="font-semibold">{latestMatch.attendeesDetails?.length || 0}</span>
              </div>
              {latestMatch.mvpWinner && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MVP:</span>
                  <span className="font-semibold text-yellow-600">
                    🏆 {latestMatch.mvpWinner.name}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Vote Status */}
      {!voteLoading && voteStatus?.votingActive && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">🗳️ Live Vote Status</CardTitle>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                VOTING OPEN
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Votes Cast:</span>
                <span className="font-bold text-lg text-gray-800">{voteStatus.totalVotes}</span>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Current Standings:</p>
                <div className="space-y-2">
                  {voteStatus.leaderboard?.slice(0, 5).map((candidate, index) => (
                    <div 
                      key={candidate._id} 
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {index === 0 && <span className="text-xl">👑</span>}
                        <span className="font-semibold">{candidate.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ 
                              width: `${(candidate.votes / voteStatus.totalVotes) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-800 w-8 text-right">{candidate.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to={`/group/${groupId}/vote`}>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold">
                  Cast Your Vote Now
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Vote Standings */}
      {!voteLoading && voteStatus?.votingActive && voteStatus.totalVotes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Current Vote Standings</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {voteStatus.totalVotes} vote{voteStatus.totalVotes !== 1 ? 's' : ''} cast so far
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voteStatus.leaderboard?.map((candidate, index) => (
                <div 
                  key={candidate._id} 
                  className={`flex justify-between items-center p-4 rounded-lg transition ${
                    index === 0 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg w-6 ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    {index === 0 && <span className="text-2xl">👑</span>}
                    <span className="font-semibold text-gray-900">{candidate.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-3 hidden sm:block">
                      <div 
                        className={`h-3 rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${(candidate.votes / voteStatus.totalVotes) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="font-bold text-gray-900 text-lg w-12 text-right">
                      {candidate.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">⚽ Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topScorers.map((player, index) => (
                <div key={player._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400 w-6">{index + 1}</span>
                    <span className="font-semibold">{player.name}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    {player.totalGoals}
                  </span>
                </div>
              ))}
            </div>
            <Link to={`/group/${groupId}/leaderboard`} className="block mt-4 text-center text-blue-600 hover:text-blue-800 font-semibold">
              View Full Leaderboard →
            </Link>
          </CardContent>
        </Card>

        {/* MVP Leaders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🏆 MVP Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMVPs.map((player, index) => (
                <div key={player._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400 w-6">{index + 1}</span>
                    <span className="font-semibold">{player.name}</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                    {player.totalMVP}
                  </span>
                </div>
              ))}
            </div>
            <Link to={`/group/${groupId}/leaderboard`} className="block mt-4 text-center text-blue-600 hover:text-blue-800 font-semibold">
              View Full Leaderboard →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Current Teams */}
      {!teamsLoading && teams && teams.teams && teams.teams.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">🎲 Current Teams</CardTitle>
              <Link to={`/group/${groupId}/teams`} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                View Full Teams →
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(teams.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.teams.map((team, index) => {
                // Handle both old structure (object with players array) and new structure (direct array)
                const players = Array.isArray(team) ? team : team.players || [];
                const teamNum = Array.isArray(team) ? index + 1 : team.teamNumber || index + 1;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h3 className="font-bold text-sm text-gray-900 mb-2 text-center border-b pb-1">
                      Team {teamNum}
                    </h3>
                    <div className="space-y-1">
                      {players.slice(0, 3).map((player) => (
                        <div key={player._id} className="text-xs text-gray-700 truncate">
                          • {player.name}
                        </div>
                      ))}
                      {players.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{players.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches */}
      {matches && matches.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.slice(1, 4).map((match) => (
                <div key={match._id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {match.attendeesDetails?.length || 0} players
                    </span>
                  </div>
                  {match.mvpWinner && (
                    <p className="text-sm text-gray-700 mt-1">
                      MVP: <span className="font-semibold">{match.mvpWinner.name}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
