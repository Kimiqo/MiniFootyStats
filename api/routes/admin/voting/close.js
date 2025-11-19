import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function closeVotingHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    const matches = await getCollection('matches');
    const votes = await getCollection('votes');
    const players = await getCollection('players');

    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      groupId: req.admin.groupId
    });
    if (!match) {
      return res.status(404).json({ error: 'Match not found or access denied' });
    }

    if (match.votingClosed) {
      return res.status(400).json({ error: 'Voting has already been closed' });
    }

    // Count votes for this match in this group
    const matchVotes = await votes.find({ 
      matchId,
      groupId: req.admin.groupId
    }).toArray();

    if (matchVotes.length === 0) {
      return res.status(400).json({ error: 'No votes have been cast for this match' });
    }

    // Tally votes
    const voteCounts = {};
    matchVotes.forEach(vote => {
      const playerId = vote.playerVotedForId;
      voteCounts[playerId] = (voteCounts[playerId] || 0) + 1;
    });

    // Find winner (player with most votes)
    let winnerId = null;
    let maxVotes = 0;
    for (const [playerId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = playerId;
      }
    }

    // Update match with winner and close voting
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { 
        $set: { 
          votingClosed: true,
          votingOpen: false,
          mvpWinnerId: winnerId
        } 
      }
    );

    // Update winner's MVP count (only for players in the same group)
    if (winnerId) {
      await players.updateOne(
        { 
          _id: new ObjectId(winnerId),
          groupId: req.admin.groupId
        },
        { $inc: { totalMVP: 1 } }
      );
    }

    return res.status(200).json({ 
      message: 'Voting closed successfully',
      winnerId,
      totalVotes: matchVotes.length,
      voteCounts
    });
  } catch (error) {
    console.error('Error closing voting:', error);
    return res.status(500).json({ error: 'Failed to close voting' });
  }
}

export default authenticateAdmin(closeVotingHandler);
