import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { ErrorMessage, SuccessMessage } from '../components/Feedback';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { joinGroup } from '../api/api';

export const GroupSelector = () => {
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load joined groups from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('joinedGroups');
    if (saved) {
      setJoinedGroups(JSON.parse(saved));
    }
  }, []);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await joinGroup(groupCode.trim().toUpperCase());

      // Check if already joined
      if (joinedGroups.some(g => g._id === data.group._id)) {
        setError('You have already joined this group');
        setLoading(false);
        return;
      }

      // Add to joined groups
      const updatedGroups = [...joinedGroups, data.group];
      setJoinedGroups(updatedGroups);
      localStorage.setItem('joinedGroups', JSON.stringify(updatedGroups));
      
      setGroupCode('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const handleRemoveGroup = (groupId) => {
    const updatedGroups = joinedGroups.filter(g => g._id !== groupId);
    setJoinedGroups(updatedGroups);
    localStorage.setItem('joinedGroups', JSON.stringify(updatedGroups));
  };

  return (
    <div className="space-y-8">
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-2">⚽ MiniFooty</h1>
        <p className="text-xl">Select a group to view</p>
      </div>

      {/* Join Group Form */}
      <Card>
        <CardHeader>
          <CardTitle>Join a Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Group Code
              </label>
              <Input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                required
                className="text-center text-lg tracking-widest font-mono"
              />
              <p className="text-sm text-gray-500 mt-2">
                Ask your admin for the 6-character group code
              </p>
            </div>
            {error && <ErrorMessage message={error} />}
            <Button type="submit" disabled={loading || groupCode.length !== 6}>
              {loading ? 'Joining...' : 'Join Group'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Groups */}
      <Card>
        <CardHeader>
          <CardTitle>My Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {joinedGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {joinedGroups.map((group) => (
                <div
                  key={group._id}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition relative"
                >
                  <button
                    onClick={() => handleRemoveGroup(group._id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                    title="Remove from my groups"
                  >
                    ✕
                  </button>
                  <div
                    onClick={() => handleSelectGroup(group._id)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-gray-600 text-sm">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Code: {group.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No groups joined yet. Enter a group code above to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
