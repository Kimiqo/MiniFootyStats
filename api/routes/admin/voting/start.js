import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function startVotingHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, candidates } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'At least one candidate is required' });
    }

    const matches = await getCollection('matches');

    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      groupId: req.admin.groupId
    });
    if (!match) {
      return res.status(404).json({ error: 'Match not found or access denied' });
    }

    if (match.votingClosed) {
      return res.status(400).json({ error: 'Voting has already been closed for this match' });
    }

    if (match.ended) {
      return res.status(400).json({ error: 'Cannot start voting - match has ended' });
    }

    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { $set: { votingOpen: true, mvpCandidates: candidates } }
    );

    return res.status(200).json({ message: 'Voting started successfully' });
  } catch (error) {
    console.error('Error starting voting:', error);
    return res.status(500).json({ error: 'Failed to start voting' });
  }
}

export default authenticateAdmin(startVotingHandler);
