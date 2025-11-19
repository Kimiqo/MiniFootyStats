import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function updateStatsHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, stats } = req.body;

    if (!matchId || !stats) {
      return res.status(400).json({ error: 'Match ID and stats are required' });
    }

    const matches = await getCollection('matches');
    const players = await getCollection('players');

    // Verify match exists and belongs to admin's group
    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      groupId: req.admin.groupId
    });
    if (!match) {
      return res.status(404).json({ error: 'Match not found or access denied' });
    }

    // Update match stats
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { $set: { stats } }
    );

    // Update player cumulative stats
    const { goals = {}, assists = {}, saves = {} } = stats;

    // Update goals (only for players in the same group)
    for (const [playerId, goalCount] of Object.entries(goals)) {
      if (goalCount > 0) {
        await players.updateOne(
          { 
            _id: new ObjectId(playerId),
            groupId: req.admin.groupId
          },
          { $inc: { totalGoals: goalCount } }
        );
      }
    }

    // Update assists (only for players in the same group)
    for (const [playerId, assistCount] of Object.entries(assists)) {
      if (assistCount > 0) {
        await players.updateOne(
          { 
            _id: new ObjectId(playerId),
            groupId: req.admin.groupId
          },
          { $inc: { totalAssists: assistCount } }
        );
      }
    }

    // Update saves (only for players in the same group)
    for (const [playerId, saveCount] of Object.entries(saves)) {
      if (saveCount > 0) {
        await players.updateOne(
          { 
            _id: new ObjectId(playerId),
            groupId: req.admin.groupId
          },
          { $inc: { totalSaves: saveCount } }
        );
      }
    }

    return res.status(200).json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating stats:', error);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}

export default authenticateAdmin(updateStatsHandler);
