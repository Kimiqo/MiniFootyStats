import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlayers, useAddPlayer, useEditPlayer, useDeletePlayer, useBulkAddPlayers } from '../../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback';

export const PlayersManagement = () => {
  const { groupId, group } = useAuth();
  const { data: players, isLoading, error, refetch } = usePlayers(groupId);
  const addPlayer = useAddPlayer();
  const editPlayer = useEditPlayer();
  const deletePlayer = useDeletePlayer();
  const bulkAddPlayers = useBulkAddPlayers();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [bulkPlayerText, setBulkPlayerText] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load players" />;
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!newPlayerName.trim()) {
      setSubmitError('Player name is required');
      return;
    }

    try {
      await addPlayer.mutate({
        name: newPlayerName.trim(),
        photoUrl: newPlayerPhoto.trim(),
      });

      setSubmitSuccess(true);
      setNewPlayerName('');
      setNewPlayerPhoto('');
      refetch();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to add player');
    }
  };

  const handleEditPlayer = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!newPlayerName.trim()) {
      setSubmitError('Player name is required');
      return;
    }

    try {
      await editPlayer.mutate({
        playerId: editingPlayer._id,
        name: newPlayerName.trim(),
        photoUrl: newPlayerPhoto.trim(),
      });

      setSubmitSuccess(true);
      refetch();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSubmitSuccess(false);
        setEditingPlayer(null);
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to update player');
    }
  };

  const handleDeletePlayer = async (player) => {
    if (!confirm(`Are you sure you want to delete ${player.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await deletePlayer.mutate(player._id);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to delete player');
    }
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setNewPlayerPhoto(player.photoUrl || '');
    setSubmitError('');
    setSubmitSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setBulkResults(null);

    const names = bulkPlayerText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (names.length === 0) {
      setSubmitError('Please enter at least one player name');
      return;
    }

    try {
      const result = await bulkAddPlayers.mutate(names);
      setBulkResults(result.results);
      refetch();
      
      if (result.results.added.length > 0) {
        setTimeout(() => {
          setBulkPlayerText('');
          setBulkResults(null);
          setIsBulkModalOpen(false);
        }, 3000);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to add players');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Players Management</h1>
          <p className="text-gray-600 mt-1">Group: {group?.name}</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsAddModalOpen(true)}>
            ➕ Add Player
          </Button>
          <Button onClick={() => setIsBulkModalOpen(true)} variant="secondary">
            📋 Bulk Add
          </Button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          💡 <strong>Tip:</strong> Use the <strong>Bulk Add</strong> button to quickly add multiple players at once. 
          Enter one player name per line!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Players ({players?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {players && players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">⚽ Goals</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">🎯 Assists</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">🧤 Saves</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">🏆 MVP</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">📊 Apps</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">{player.totalGoals}</td>
                      <td className="py-4 px-4 text-center font-semibold">{player.totalAssists}</td>
                      <td className="py-4 px-4 text-center font-semibold">{player.totalSaves}</td>
                      <td className="py-4 px-4 text-center font-semibold text-yellow-600">
                        {player.totalMVP}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">{player.totalAppearances}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(player)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                            disabled={deletePlayer.isPending}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No players added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Player Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewPlayerName('');
          setNewPlayerPhoto('');
          setSubmitError('');
          setSubmitSuccess(false);
        }}
        title="Add New Player"
      >
        {submitSuccess && (
          <SuccessMessage message="Player added successfully!" />
        )}
        
        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        <form onSubmit={handleAddPlayer} className="mt-4 space-y-4">
          <Input
            label="Player Name"
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            required
          />

          <Input
            label="Photo URL (Optional)"
            type="url"
            value={newPlayerPhoto}
            onChange={(e) => setNewPlayerPhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={addPlayer.isPending}
              className="flex-1"
            >
              {addPlayer.isPending ? 'Adding...' : 'Add Player'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlayer(null);
          setNewPlayerName('');
          setNewPlayerPhoto('');
          setSubmitError('');
          setSubmitSuccess(false);
        }}
        title="Edit Player"
      >
        {submitSuccess && (
          <SuccessMessage message="Player updated successfully!" />
        )}
        
        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        <form onSubmit={handleEditPlayer} className="mt-4 space-y-4">
          <Input
            label="Player Name"
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            required
          />

          <Input
            label="Photo URL (Optional)"
            type="url"
            value={newPlayerPhoto}
            onChange={(e) => setNewPlayerPhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={editPlayer.isPending}
              className="flex-1"
            >
              {editPlayer.isPending ? 'Updating...' : 'Update Player'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Add Players Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setBulkPlayerText('');
          setBulkResults(null);
          setSubmitError('');
        }}
        title="Bulk Add Players"
      >
        {bulkResults && (
          <div className="mb-4 space-y-2">
            {bulkResults.added.length > 0 && (
              <SuccessMessage 
                message={`✅ Successfully added ${bulkResults.added.length} player(s): ${bulkResults.added.map(p => p.name).join(', ')}`} 
              />
            )}
            {bulkResults.skipped.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-semibold text-yellow-800">⚠️ Skipped {bulkResults.skipped.length} player(s):</p>
                <ul className="mt-1 ml-4 list-disc text-yellow-700">
                  {bulkResults.skipped.map((s, i) => (
                    <li key={i}>{s.name} - {s.reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {bulkResults.failed.length > 0 && (
              <ErrorMessage 
                message={`Failed to add ${bulkResults.failed.length} player(s): ${bulkResults.failed.map(f => f.name).join(', ')}`} 
              />
            )}
          </div>
        )}
        
        {submitError && (
          <ErrorMessage message={submitError} />
        )}

        <form onSubmit={handleBulkAdd} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Names (one per line)
            </label>
            <textarea
              value={bulkPlayerText}
              onChange={(e) => setBulkPlayerText(e.target.value)}
              placeholder="John Doe&#10;Jane Smith&#10;Bob Wilson&#10;Alice Johnson"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={10}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter one player name per line. Duplicates will be automatically skipped.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={bulkAddPlayers.isPending}
              className="flex-1"
            >
              {bulkAddPlayers.isPending ? 'Adding...' : 'Add All Players'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBulkModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
