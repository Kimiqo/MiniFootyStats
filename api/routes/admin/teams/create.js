import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function createTeamsHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.admin;
  const { playerIds, numTeams } = req.body;

  if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
    return res.status(400).json({ error: 'Player IDs array is required' });
  }

  if (!numTeams || numTeams < 2) {
    return res.status(400).json({ error: 'Number of teams must be at least 2' });
  }

  if (playerIds.length < numTeams) {
    return res.status(400).json({ error: 'Not enough players for the number of teams' });
  }

  try {
    const players = await getCollection('players');
    const teams = await getCollection('teams');

    // Fetch player details
    const playerDocs = await players.find({
      _id: { $in: playerIds.map(id => new ObjectId(id)) },
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    }).toArray();

    if (playerDocs.length !== playerIds.length) {
      return res.status(400).json({ error: 'Some players not found or unauthorized' });
    }

    // Shuffle players randomly
    const shuffled = [...playerDocs].sort(() => Math.random() - 0.5);

    // Distribute players into teams
    const teamArrays = Array.from({ length: numTeams }, () => []);
    shuffled.forEach((player, index) => {
      teamArrays[index % numTeams].push({
        _id: player._id,
        name: player.name,
        photoUrl: player.photoUrl
      });
    });

    // Create team randomization record
    const teamRandomization = {
      groupId: groupId,
      teams: teamArrays,
      createdAt: new Date(),
      createdBy: req.admin.email
    };

    const result = await teams.insertOne(teamRandomization);

    res.status(201).json({
      _id: result.insertedId,
      teams: teamArrays,
      createdAt: teamRandomization.createdAt
    });
  } catch (error) {
    console.error('Create teams error:', error);
    res.status(500).json({ error: 'Failed to create teams' });
  }
}

export default authenticateAdmin(createTeamsHandler);
