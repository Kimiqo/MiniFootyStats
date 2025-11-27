import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function updateMatchHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, matchGoal, videoUrl } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    const matches = await getCollection('matches');

    // Verify match belongs to admin's group
    const match = await matches.findOne({
      _id: new ObjectId(matchId),
      $or: [
        { groupId: req.admin.groupId },
        { groupId: new ObjectId(req.admin.groupId) }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or unauthorized' });
    }

    const update = {};
    if (typeof matchGoal !== 'undefined') update.matchGoal = matchGoal || null;
    if (typeof videoUrl !== 'undefined') update.videoUrl = videoUrl || null;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await matches.updateOne({ _id: new ObjectId(matchId) }, { $set: update });

    const updated = await matches.findOne({ _id: new ObjectId(matchId) });

    res.status(200).json({ message: 'Match updated', match: updated });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
}

export default authenticateAdmin(updateMatchHandler);
