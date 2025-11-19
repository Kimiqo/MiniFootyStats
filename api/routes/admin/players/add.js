import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';

async function addPlayerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, photoUrl } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name is required' });
    }

    const players = await getCollection('players');

    // Check if player already exists in this group
    const existingPlayer = await players.findOne({ 
      name: name.trim(),
      groupId: req.admin.groupId
    });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Player already exists in your group' });
    }

    const newPlayer = {
      name: name.trim(),
      groupId: req.admin.groupId,
      photoUrl: photoUrl || '',
      totalGoals: 0,
      totalAssists: 0,
      totalSaves: 0,
      totalMVP: 0,
      totalAppearances: 0,
      createdAt: new Date()
    };

    const result = await players.insertOne(newPlayer);
    newPlayer._id = result.insertedId;

    return res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error adding player:', error);
    return res.status(500).json({ error: 'Failed to add player' });
  }
}

export default authenticateAdmin(addPlayerHandler);
