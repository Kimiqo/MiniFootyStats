import { useParams } from 'react-router-dom';
import { useRecentMatches, useLeaderboard, useVoteStatus } from '../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loading, ErrorMessage } from '../components/Feedback';
import { Link } from 'react-router-dom';

export const Home = () => {
  const { groupId } = useParams();
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useRecentMatches(groupId);
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useLeaderboard(groupId);
  const { data: voteStatus, isLoading: voteLoading } = useVoteStatus(groupId);

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
              {latestMatch.votingOpen && !latestMatch.votingClosed && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-2">🗳️ Voting is now open!</p>
                  <Link to={`/group/${groupId}/vote`}>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                      Cast Your Vote
                    </button>
                  </Link>
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
