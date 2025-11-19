import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

async function deleteMatchHandler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // req.admin is set by authenticateAdmin middleware
  const { groupId, email } = req.admin;
  const { matchId, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password confirmation required' });
  }

  if (!matchId) {
    return res.status(400).json({ error: 'Match ID is required' });
  }

  try {
    // Verify admin password first
    const admins = await getCollection('admins');
    const admin = await admins.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }
    
    if (!admin.passwordHash) {
      return res.status(500).json({ error: 'Admin password not set in database' });
    }
    
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const matches = await getCollection('matches');
    const votes = await getCollection('votes');
    const players = await getCollection('players');
    
    // Verify match belongs to admin's group
    // Handle both string and ObjectId formats for groupId (migration compatibility)
    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or unauthorized' });
    }

    // If match had an MVP winner, decrement that player's MVP count
    if (match.mvpWinner) {
      await players.updateOne(
        { _id: new ObjectId(match.mvpWinner._id) },
        { $inc: { totalMVP: -1 } }
      );
    }

    // If match had stats, reverse them from players
    if (match.stats && match.attendees && match.attendees.length > 0) {
      for (const playerId of match.attendees) {
        const playerIdStr = playerId.toString();
        const goals = match.stats.goals?.[playerIdStr] || 0;
        const assists = match.stats.assists?.[playerIdStr] || 0;
        const saves = match.stats.saves?.[playerIdStr] || 0;

        if (goals > 0 || assists > 0 || saves > 0) {
          await players.updateOne(
            { _id: playerId },
            {
              $inc: {
                totalGoals: -goals,
                totalAssists: -assists,
                totalSaves: -saves,
                totalAppearances: -1
              }
            }
          );
        } else {
          // Just decrement appearances if no stats
          await players.updateOne(
            { _id: playerId },
            { $inc: { totalAppearances: -1 } }
          );
        }
      }
    } else if (match.attendees && match.attendees.length > 0) {
      // If no stats but had attendees, just decrement appearances
      for (const playerId of match.attendees) {
        await players.updateOne(
          { _id: playerId },
          { $inc: { totalAppearances: -1 } }
        );
      }
    }

    // Delete all votes associated with this match (handle both string and ObjectId formats)
    await votes.deleteMany({ 
      matchId: new ObjectId(matchId),
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    });

    // Delete the match
    await matches.deleteOne({ _id: new ObjectId(matchId) });

    res.status(200).json({ 
      message: 'Match and associated data deleted successfully',
      matchId,
      votesDeleted: true,
      statsReversed: true
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete match' });
  }
}

export default authenticateAdmin(deleteMatchHandler);
