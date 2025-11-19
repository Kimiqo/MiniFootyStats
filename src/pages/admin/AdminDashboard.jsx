import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecentMatches, usePlayers, useLeaderboard } from '../../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback';

export const AdminDashboard = () => {
  const { groupId, group } = useAuth();
  const location = useLocation();
  const { data: matches, isLoading: matchesLoading } = useRecentMatches(groupId);
  const { data: players, isLoading: playersLoading } = usePlayers(groupId);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(groupId);

  if (matchesLoading || playersLoading || leaderboardLoading) {
    return <Loading />;
  }

  const latestMatch = matches?.[0];
  const totalPlayers = players?.length || 0;
  const totalMatches = matches?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Managing: {group?.name}</p>
        </div>
      </div>

      {location.state?.message && (
        <SuccessMessage message={location.state.message} />
      )}

      {/* Group Code Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Group Join Code</h3>
              <p className="text-blue-100 text-sm">Share this code with members to join your group</p>
            </div>
            <div className="bg-white text-blue-800 px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold tracking-widest font-mono">
                {group?.code || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-blue-600">{totalPlayers}</div>
            <div className="text-gray-600 mt-1">Total Players</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">⚽</div>
            <div className="text-3xl font-bold text-green-600">{totalMatches}</div>
            <div className="text-gray-600 mt-1">Total Matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-yellow-600">
              {leaderboard?.mvp?.[0]?.totalMVP || 0}
            </div>
            <div className="text-gray-600 mt-1">Top MVP Count</div>
            <div className="text-xs text-gray-500 mt-1">
              {leaderboard?.mvp?.[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">⚽</div>
            <div className="text-3xl font-bold text-red-600">
              {leaderboard?.goals?.[0]?.totalGoals || 0}
            </div>
            <div className="text-gray-600 mt-1">Top Goals</div>
            <div className="text-xs text-gray-500 mt-1">
              {leaderboard?.goals?.[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/admin/match/create">
              <Button variant="primary" className="w-full">
                ➕ Create Match
              </Button>
            </Link>
            <Link to="/admin/players">
              <Button variant="secondary" className="w-full">
                👥 Manage Players
              </Button>
            </Link>
            {latestMatch && !latestMatch.votingClosed && (
              <Link to="/admin/match/manage">
                <Button variant="success" className="w-full">
                  📊 Manage Latest Match
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Latest Match Status */}
      {latestMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Match Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(latestMatch.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Players:</span>
                <span className="font-semibold">{latestMatch.attendeesDetails?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Voting Status:</span>
                <span className={`font-semibold ${
                  latestMatch.votingClosed ? 'text-gray-500' :
                  latestMatch.votingOpen ? 'text-green-600' :
                  'text-orange-600'
                }`}>
                  {latestMatch.votingClosed ? '✅ Closed' :
                   latestMatch.votingOpen ? '🟢 Open' :
                   '⏸️ Not Started'}
                </span>
              </div>
              {latestMatch.mvpWinner && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MVP Winner:</span>
                  <span className="font-semibold text-yellow-600">
                    🏆 {latestMatch.mvpWinner.name}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <div key={match._id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">
                      {new Date(match.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {match.attendeesDetails?.length || 0} players
                      {match.mvpWinner && ` • MVP: ${match.mvpWinner.name}`}
                    </p>
                  </div>
                  <Link to="/admin/match/manage">
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No matches yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
