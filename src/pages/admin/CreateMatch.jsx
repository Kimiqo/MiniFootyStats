import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCreateMatch } from '../../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorMessage, SuccessMessage } from '../../components/Feedback';

export const CreateMatch = () => {
  const navigate = useNavigate();
  const { group } = useAuth();
  const createMatch = useCreateMatch();

  const [matchDate, setMatchDate] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!matchDate) {
      setSubmitError('Match date is required');
      return;
    }

    try {
      await createMatch.mutate({ date: matchDate });
      setSubmitSuccess(true);
      
      setTimeout(() => {
        navigate('/admin/match/manage');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create match');
    }
  };

  // Get today's date in YYYY-MM-DD format for the input default
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Match</h1>
          <p className="text-gray-600 mt-1">Group: {group?.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <SuccessMessage message="Match created successfully! Redirecting..." />
          )}
          
          {submitError && (
            <ErrorMessage message={submitError} />
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <Input
              label="Match Date"
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              min={today}
              required
            />

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Create the match with a date</li>
                <li>Mark which players attended</li>
                <li>Enter match statistics (goals, assists, saves)</li>
                <li>Start the MVP voting poll</li>
                <li>Close voting to determine the winner</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={createMatch.isPending}
                className="flex-1"
              >
                {createMatch.isPending ? 'Creating...' : 'Create Match'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Matches can be scheduled for any day of the week</li>
            <li>After creating a match, you'll need to mark attendees manually</li>
            <li>Stats can be entered during or after the match</li>
            <li>MVP voting should be started after the match concludes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
