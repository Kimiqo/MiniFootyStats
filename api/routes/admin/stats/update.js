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

    if (match.ended) {
      return res.status(400).json({ error: 'Cannot update stats - match has ended' });
    }

    // Get previous stats to calculate the difference
    const previousStats = match.stats || { goals: {}, assists: {}, saves: {} };
    const { goals = {}, assists = {}, saves = {} } = stats;

    // Calculate differences for each stat type
    const allPlayerIds = new Set([
      ...Object.keys(goals),
      ...Object.keys(previousStats.goals || {}),
      ...Object.keys(assists),
      ...Object.keys(previousStats.assists || {}),
      ...Object.keys(saves),
      ...Object.keys(previousStats.saves || {})
    ]);

    // Update player cumulative stats with only the difference
    for (const playerId of allPlayerIds) {
      const goalsDiff = (goals[playerId] || 0) - (previousStats.goals?.[playerId] || 0);
      const assistsDiff = (assists[playerId] || 0) - (previousStats.assists?.[playerId] || 0);
      const savesDiff = (saves[playerId] || 0) - (previousStats.saves?.[playerId] || 0);

      if (goalsDiff !== 0 || assistsDiff !== 0 || savesDiff !== 0) {
        const updateObj = {};
        if (goalsDiff !== 0) updateObj.totalGoals = goalsDiff;
        if (assistsDiff !== 0) updateObj.totalAssists = assistsDiff;
        if (savesDiff !== 0) updateObj.totalSaves = savesDiff;

        await players.updateOne(
          { 
            _id: new ObjectId(playerId),
            groupId: req.admin.groupId
          },
          { $inc: updateObj }
        );
      }
    }

    // Update match stats after updating players
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { $set: { stats } }
    );

    return res.status(200).json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating stats:', error);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}

export default authenticateAdmin(updateStatsHandler);
