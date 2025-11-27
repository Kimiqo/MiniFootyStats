import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  useRecentMatches,
  usePlayers,
  useUpdateAttendance,
  useUpdateStats,
  useStartVoting,
  useCloseVoting,
  useDeleteMatch,
  useEndMatch,
  useUpdateMatch,
  useUploadMatchMedia,
} from '../../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback';

export const ManageMatch = () => {
  const { groupId, group } = useAuth();
  const navigate = useNavigate();
  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useRecentMatches(groupId);
  const { data: players, isLoading: playersLoading } = usePlayers(groupId);
  
  const updateAttendance = useUpdateAttendance();
  const updateStats = useUpdateStats();
  const startVoting = useStartVoting();
  const closeVoting = useCloseVoting();
  const deleteMatch = useDeleteMatch();
  const endMatch = useEndMatch();

  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [stats, setStats] = useState({ goals: {}, assists: {}, saves: {} });
  const [message, setMessage] = useState({ type: '', text: '' });
  const updateMatch = useUpdateMatch();
  const uploadMedia = useUploadMatchMedia();
  const [matchGoalInput, setMatchGoalInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);

  const selectedMatch = matches?.[selectedMatchIndex] || matches?.[0];

  useEffect(() => {
    if (selectedMatch) {
      setSelectedAttendees(selectedMatch.attendees || []);
      setSelectedCandidates(selectedMatch.mvpCandidates || []);
      setStats(selectedMatch.stats || { goals: {}, assists: {}, saves: {} });
      setMatchGoalInput(selectedMatch.matchGoal || '');
      setVideoUrlInput(selectedMatch.videoUrl || '');
    }
  }, [selectedMatch]);

  if (matchesLoading || playersLoading) {
    return <Loading />;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Match</h1>
        <ErrorMessage message="No matches found. Create a match first." />
      </div>
    );
  }

  const toggleAttendee = (playerId) => {
    setSelectedAttendees((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleUpdateAttendance = async () => {
    setMessage({ type: '', text: '' });
    try {
      await updateAttendance.mutate({
        matchId: selectedMatch._id,
        attendeeIds: selectedAttendees,
      });
      setMessage({ type: 'success', text: 'Attendance updated successfully!' });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update attendance' });
    }
  };

  const handleStatChange = (playerId, statType, value) => {
    setStats((prev) => ({
      ...prev,
      [statType]: {
        ...prev[statType],
        [playerId]: parseInt(value) || 0,
      },
    }));
  };

  const handleUpdateStats = async () => {
    setMessage({ type: '', text: '' });
    try {
      await updateStats.mutate({
        matchId: selectedMatch._id,
        stats,
      });
      setMessage({ type: 'success', text: 'Stats updated successfully!' });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update stats' });
    }
  };

  const toggleCandidate = (playerId) => {
    setSelectedCandidates((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleStartVoting = async () => {
    if (selectedCandidates.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one MVP candidate' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    try {
      await startVoting.mutate({ matchId: selectedMatch._id, candidates: selectedCandidates });
      setMessage({ type: 'success', text: 'Voting started successfully!' });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to start voting' });
    }
  };

  const handleCloseVoting = async () => {
    setMessage({ type: '', text: '' });
    if (!confirm('Are you sure you want to close voting? This cannot be undone.')) {
      return;
    }
    try {
      const result = await closeVoting.mutate({ matchId: selectedMatch._id });
      setMessage({ 
        type: 'success', 
        text: `Voting closed! Winner: ${result.winnerId}. Total votes: ${result.totalVotes}` 
      });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to close voting' });
    }
  };

  const handleEndMatch = async () => {
    if (!confirm('Are you sure you want to end this match? This will finalize all data and the match cannot be edited further.')) {
      return;
    }
    
    setMessage({ type: '', text: '' });
    try {
      await endMatch.mutate(selectedMatch._id);
      setMessage({ type: 'success', text: 'Match ended successfully! All data has been finalized.' });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to end match' });
    }
  };

  const handleDeleteMatch = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete this match and all associated data (votes, stats). This action cannot be undone. Are you sure?')) {
      return;
    }

    const password = prompt('Please enter your admin password to confirm deletion:');
    if (!password) {
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      await deleteMatch.mutate({ matchId: selectedMatch._id, password });
      
      // Immediately navigate away - don't wait for message
      navigate('/admin', { 
        state: { message: 'Match deleted successfully!' } 
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete match' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 50MB' });
        return;
      }
      setVideoFile(file);
      setVideoUrlInput(''); // Clear URL if file is selected
    }
  };

  const handleUploadFile = async () => {
    if (!videoFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setMessage({ type: '', text: '' });
    setUploadProgress('Reading file...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setUploadProgress('Uploading...');
          const base64Data = e.target?.result;
          
          await uploadMedia.mutate({
            matchId: selectedMatch._id,
            fileData: base64Data,
            fileName: videoFile.name,
            fileType: videoFile.type,
          });

          setMessage({ type: 'success', text: 'Video uploaded successfully!' });
          setUploadProgress('');
          setVideoFile(null);
          refetchMatches();
        } catch (err) {
          setMessage({ type: 'error', text: err.message || 'Failed to upload video' });
          setUploadProgress('');
        }
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to read file' });
        setUploadProgress('');
      };
      reader.readAsDataURL(videoFile);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to process video' });
      setUploadProgress('');
    }
  };

  const handleUpdateMatchMeta = async () => {
    setMessage({ type: '', text: '' });
    try {
      await updateMatch.mutate({ matchId: selectedMatch._id, matchGoal: matchGoalInput || null, videoUrl: videoUrlInput || null });
      setMessage({ type: 'success', text: 'Match details updated successfully!' });
      refetchMatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update match details' });
    }
  };

  const attendees = players?.filter((p) => selectedAttendees.includes(p._id)) || [];
  const isMatchEnded = selectedMatch?.ended;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Match</h1>
          <p className="text-gray-600 mt-1">Group: {group?.name}</p>
          {isMatchEnded && (
            <span className="inline-block mt-2 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
              ✓ Match Ended
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {new Date(selectedMatch.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          {!isMatchEnded && selectedMatch.votingClosed && (
            <button
              onClick={handleEndMatch}
              disabled={endMatch.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"
            >
              {endMatch.isPending ? '✓ Ending...' : '✓ End Match'}
            </button>
          )}
          <button
            onClick={handleDeleteMatch}
            disabled={deleteMatch.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50"
          >
            {deleteMatch.isPending ? '🗑️ Deleting...' : '🗑️ Delete Match'}
          </button>
        </div>
      </div>

      {isMatchEnded && (
        <div className="p-4 bg-gray-100 border-l-4 border-gray-600 rounded-lg">
          <p className="text-gray-800 font-semibold">✓ This match has been ended and locked</p>
          <p className="text-sm text-gray-600 mt-1">All data has been finalized. You cannot edit attendance, stats, or voting anymore.</p>
        </div>
      )}

      {message.text && (
        message.type === 'success' ? (
          <SuccessMessage message={message.text} />
        ) : (
          <ErrorMessage message={message.text} />
        )
      )}

      {/* Match Selector */}
      {matches && matches.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Match to Manage</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedMatchIndex}
              onChange={(e) => setSelectedMatchIndex(parseInt(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-base"
            >
              {matches.map((match, index) => (
                <option key={match._id} value={index}>
                  {new Date(match.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {match.ended ? ' (Ended)' : match.votingClosed ? ' (Voting Closed)' : match.votingOpen ? ' (Voting Open)' : ''}
                  {index === 0 ? ' - Latest' : ''}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Match Status */}
      <Card>
        <CardHeader>
          <CardTitle>Match Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedAttendees.length}</div>
              <div className="text-sm text-gray-600">Attendees</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {selectedMatch.votingOpen && !selectedMatch.votingClosed ? '🟢 Open' : 
                 selectedMatch.votingClosed ? '✅ Closed' : '⏸️ Not Started'}
              </div>
              <div className="text-sm text-gray-600">Voting Status</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {selectedMatch.mvpWinner ? '🏆 ' + selectedMatch.mvpWinner.name : 'TBD'}
              </div>
              <div className="text-sm text-gray-600">MVP Winner</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details: goal + video */}
      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Match Goal (optional)</label>
              <input
                type="text"
                value={matchGoalInput}
                onChange={(e) => setMatchGoalInput(e.target.value)}
                className="mt-2 w-full border rounded-md px-3 py-2"
                disabled={isMatchEnded}
                placeholder="e.g. 'Bring the energy — target 5 goals this week'"
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Video File</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isMatchEnded}
                  className="text-sm"
                />
                {videoFile && (
                  <span className="text-sm text-gray-600">
                    {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
              {uploadProgress && (
                <p className="text-sm text-blue-600 mt-2">{uploadProgress}</p>
              )}
              {videoFile && (
                <Button 
                  onClick={handleUploadFile} 
                  disabled={uploadMedia.isPending || isMatchEnded}
                  className="mt-3"
                >
                  {uploadMedia.isPending ? 'Uploading...' : 'Upload Video'}
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-2">Max file size: 50MB. Uploaded videos replace any URL.</p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700">Or paste Video URL (optional)</label>
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="mt-2 w-full border rounded-md px-3 py-2"
                disabled={isMatchEnded}
                placeholder="Paste Google Drive, YouTube, or direct video URL"
              />
              <p className="text-xs text-gray-500 mt-1">Supports: Google Drive share links, YouTube, or direct video URLs. Users will see this on the home page until replaced.</p>
              <p className="text-xs text-blue-600 mt-1">💡 For Google Drive: Share the video → Copy link → Paste here (make sure link sharing is enabled)</p>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleUpdateMatchMeta} disabled={updateMatch.isPending || isMatchEnded}>
                {updateMatch.isPending ? 'Saving...' : 'Save URL & Goal'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>1. Mark Attendance</CardTitle>
          {isMatchEnded && (
            <p className="text-sm text-gray-500 mt-1">Match has ended - attendance locked</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {players?.map((player) => (
              <div
                key={player._id}
                onClick={() => !isMatchEnded && toggleAttendee(player._id)}
                className={`p-3 border-2 rounded-lg transition ${
                  isMatchEnded ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  selectedAttendees.includes(player._id)
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{player.name}</span>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleUpdateAttendance} disabled={updateAttendance.isPending || isMatchEnded}>
            {updateAttendance.isPending ? 'Updating...' : 'Save Attendance'}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      {attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Enter Match Stats</CardTitle>
            {isMatchEnded && (
              <p className="text-sm text-gray-500 mt-1">Match has ended - stats locked</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Player</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">⚽ Goals</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">🎯 Assists</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">🧤 Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((player) => (
                    <tr key={player._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold">{player.name}</td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          value={stats.goals[player._id] || 0}
                          onChange={(e) => handleStatChange(player._id, 'goals', e.target.value)}
                          className="text-center"
                          disabled={isMatchEnded}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          value={stats.assists[player._id] || 0}
                          onChange={(e) => handleStatChange(player._id, 'assists', e.target.value)}
                          className="text-center"
                          disabled={isMatchEnded}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          value={stats.saves[player._id] || 0}
                          onChange={(e) => handleStatChange(player._id, 'saves', e.target.value)}
                          className="text-center"
                          disabled={isMatchEnded}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleUpdateStats} disabled={updateStats.isPending || isMatchEnded} className="mt-4">
              {updateStats.isPending ? 'Updating...' : 'Save Stats'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voting Controls */}
      {attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Manage MVP Voting</CardTitle>
            {isMatchEnded && (
              <p className="text-sm text-gray-500 mt-1">Match has ended - voting locked</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!selectedMatch.votingOpen && !selectedMatch.votingClosed && !isMatchEnded && (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Select MVP Candidates (players eligible for voting):
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {attendees.map((player) => (
                        <div
                          key={player._id}
                          onClick={() => toggleCandidate(player._id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                            selectedCandidates.includes(player._id)
                              ? 'border-yellow-600 bg-yellow-50'
                              : 'border-gray-200 hover:border-yellow-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold">{player.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleStartVoting} 
                    disabled={startVoting.isPending || selectedCandidates.length === 0}
                    variant="success"
                    className="w-full"
                  >
                    {startVoting.isPending ? 'Starting...' : `🟢 Start Voting (${selectedCandidates.length} candidates)`}
                  </Button>
                </>
              )}
              
              {selectedMatch.votingOpen && !selectedMatch.votingClosed && !isMatchEnded && (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">
                      ✅ Voting is currently open. Users can now vote for MVP.
                    </p>
                  </div>
                  <Button 
                    onClick={handleCloseVoting} 
                    disabled={closeVoting.isPending}
                    variant="danger"
                    className="w-full"
                  >
                    {closeVoting.isPending ? 'Closing...' : '🔴 Close Voting & Determine Winner'}
                  </Button>
                </>
              )}
              
              {(selectedMatch.votingClosed || isMatchEnded) && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-800 font-semibold">
                    ✅ Voting has been closed. 
                    {selectedMatch.mvpWinner && ` Winner: ${selectedMatch.mvpWinner.name}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
