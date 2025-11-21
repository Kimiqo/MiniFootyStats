import { getCollection } from '../utils/db.js';
import { ObjectId } from 'mongodb';

async function voteStatusHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ error: 'groupId is required' });
  }

  try {
    const matches = await getCollection('matches');
    const votes = await getCollection('votes');
    const players = await getCollection('players');

    // Find the latest match with active voting (handle both string and ObjectId formats)
    const activeMatch = await matches.findOne({
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ],
      votingOpen: true,
      votingClosed: false
    }, {
      sort: { date: -1 }
    });

    if (!activeMatch) {
      return res.status(200).json({ 
        votingActive: false,
        message: 'No active voting session'
      });
    }

    // Get all votes for this match (handle both string and ObjectId formats for matchId)
    const matchVotes = await votes.find({ 
      $or: [
        { matchId: activeMatch._id.toString() },
        { matchId: activeMatch._id }
      ],
      groupId: groupId
    }).toArray();

    // Count votes per player
    const voteCounts = {};
    matchVotes.forEach(vote => {
      const playerId = vote.playerVotedForId.toString();
      voteCounts[playerId] = (voteCounts[playerId] || 0) + 1;
    });

    // Get player details and build leaderboard
    const playerIds = Object.keys(voteCounts).map(id => new ObjectId(id));
    const playerDetails = await players.find({
      _id: { $in: playerIds }
    }).toArray();

    const voteLeaderboard = playerDetails.map(player => ({
      _id: player._id,
      name: player.name,
      votes: voteCounts[player._id.toString()] || 0
    })).sort((a, b) => b.votes - a.votes);

    res.status(200).json({
      votingActive: true,
      matchDate: activeMatch.date,
      totalVotes: matchVotes.length,
      leaderboard: voteLeaderboard,
      topCandidate: voteLeaderboard[0] || null
    });
  } catch (error) {
    console.error('Vote status error:', error);
    res.status(500).json({ error: 'Failed to fetch vote status' });
  }
}

export default voteStatusHandler;
