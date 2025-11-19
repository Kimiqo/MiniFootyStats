import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecentMatches, useSubmitVote } from '../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loading, ErrorMessage, SuccessMessage } from '../components/Feedback';

export const Vote = () => {
  const { groupId } = useParams();
  const { data: matches, isLoading, error } = useRecentMatches(groupId);
  const submitVote = useSubmitVote();
  
  const [voterName, setVoterName] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load matches" />;
  }

  const activeMatch = matches?.find(m => m.votingOpen && !m.votingClosed);

  if (!activeMatch) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
          <h1 className="text-4xl font-bold mb-2">MVP Voting</h1>
          <p className="text-xl">Vote for the Man of the Match</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Active Voting</h2>
            <p className="text-gray-600">
              There are currently no open voting polls. Check back after the next match!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!voterName.trim()) {
      setSubmitError('Please enter your name');
      return;
    }

    if (!selectedPlayer) {
      setSubmitError('Please select a player');
      return;
    }

    try {
      await submitVote.mutate({
        voterName: voterName.trim(),
        matchId: activeMatch._id,
        playerId: selectedPlayer,
      });

      setSubmitSuccess(true);
      setVoterName('');
      setSelectedPlayer('');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit vote');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-2">MVP Voting</h1>
        <p className="text-xl">Vote for the Man of the Match</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🗳️ Voting is Open!</CardTitle>
          <p className="text-gray-600 mt-2">
            Match Date: {new Date(activeMatch.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <SuccessMessage message="Your vote has been recorded! Thank you for participating." />
          )}
          
          {submitError && (
            <ErrorMessage message={submitError} />
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <Input
              label="Your Name"
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Player
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {activeMatch.attendeesDetails?.map((player) => (
                  <div
                    key={player._id}
                    onClick={() => setSelectedPlayer(player._id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedPlayer === player._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{player.name}</p>
                        <p className="text-sm text-gray-500">
                          ⚽ {player.totalGoals} • 🏆 {player.totalMVP}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitVote.isPending || !voterName || !selectedPlayer}
            >
              {submitVote.isPending ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Voting Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You can only vote once per match using the same name</li>
            <li>You can only vote for players who attended this match</li>
            <li>Voting closes when the admin ends the poll</li>
            <li>The player with the most votes wins the MVP award</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
