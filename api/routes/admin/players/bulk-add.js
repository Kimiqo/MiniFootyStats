import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function bulkAddPlayersHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // req.admin is set by authenticateAdmin middleware
  const { groupId } = req.admin;
  const { players } = req.body;

  if (!players || !Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'Players array is required' });
  }

  try {
    const playersCollection = await getCollection('players');
    
    // Get existing player names in this group (check both formats)
    const existingPlayers = await playersCollection
      .find({ 
        $or: [
          { groupId: groupId },
          { groupId: new ObjectId(groupId) }
        ]
      })
      .toArray();
    
    const existingNames = new Set(
      existingPlayers.map(p => p.name.toLowerCase().trim())
    );

    const results = {
      added: [],
      skipped: [],
      failed: []
    };

    // Process each player
    for (const playerName of players) {
      const name = playerName.trim();
      
      if (!name) {
        results.skipped.push({ name: playerName, reason: 'Empty name' });
        continue;
      }

      if (existingNames.has(name.toLowerCase())) {
        results.skipped.push({ name, reason: 'Already exists' });
        continue;
      }

      try {
        const newPlayer = {
          groupId: groupId,
          name,
          photoUrl: '',
          totalGoals: 0,
          totalAssists: 0,
          totalSaves: 0,
          totalMVP: 0,
          totalAppearances: 0,
          createdAt: new Date(),
        };

        const result = await playersCollection.insertOne(newPlayer);
        results.added.push({ name, id: result.insertedId });
        existingNames.add(name.toLowerCase());
      } catch (err) {
        results.failed.push({ name, reason: err.message });
      }
    }

    res.status(200).json({
      message: 'Bulk add completed',
      results
    });
  } catch (error) {
    console.error('Bulk add players error:', error);
    res.status(500).json({ error: 'Failed to add players' });
  }
}

export default authenticateAdmin(bulkAddPlayersHandler);
