import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function editPlayerHandler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // req.admin is set by authenticateAdmin middleware
  const { groupId } = req.admin;
  const { playerId, name, photoUrl } = req.body;

  if (!playerId || !name) {
    return res.status(400).json({ error: 'Player ID and name are required' });
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

    // Check if new name already exists for another player in the group
    const existingPlayer = await players.findOne({
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ],
      name: name.trim(),
      _id: { $ne: new ObjectId(playerId) }
    });

    if (existingPlayer) {
      return res.status(400).json({ error: 'A player with this name already exists in your group' });
    }

    // Update player
    const result = await players.updateOne(
      { _id: new ObjectId(playerId) },
      {
        $set: {
          name: name.trim(),
          photoUrl: photoUrl?.trim() || '',
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'No changes made' });
    }

    res.status(200).json({ 
      message: 'Player updated successfully',
      playerId 
    });
  } catch (error) {
    console.error('Edit player error:', error);
    res.status(500).json({ error: 'Failed to edit player' });
  }
}

export default authenticateAdmin(editPlayerHandler);
