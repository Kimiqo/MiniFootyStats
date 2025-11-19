import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function deletePlayerHandler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // req.admin is set by authenticateAdmin middleware
  const { groupId } = req.admin;
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  try {
    const players = await getCollection('players');
    
    // Verify player belongs to admin's group (handle both string and ObjectId formats)
    const player = await players.findOne({ 
      _id: new ObjectId(playerId),
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found or unauthorized' });
    }

    // Check if player has any match history
    const matches = await getCollection('matches');
    const hasMatchHistory = await matches.findOne({
      groupId: new ObjectId(groupId),
      attendees: new ObjectId(playerId)
    });

    if (hasMatchHistory) {
      return res.status(400).json({ 
        error: 'Cannot delete player with match history. Consider editing instead.' 
      });
    }

    // Delete player
    await players.deleteOne({ _id: new ObjectId(playerId) });

    res.status(200).json({ 
      message: 'Player deleted successfully',
      playerId 
    });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
}

export default authenticateAdmin(deletePlayerHandler);
