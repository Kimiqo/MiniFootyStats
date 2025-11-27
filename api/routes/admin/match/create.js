import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';

async function createMatchHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, matchGoal, videoUrl } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const matches = await getCollection('matches');

    const newMatch = {
      date: new Date(date),
      groupId: req.admin.groupId,
      attendees: [],
      stats: {
        goals: {},
        assists: {},
        saves: {}
      },
      mvpWinnerId: null,
      votingOpen: false,
      votingClosed: false,
      // optional fields
      matchGoal: matchGoal || null,
      videoUrl: videoUrl || null,
      createdAt: new Date()
    };

    const result = await matches.insertOne(newMatch);
    newMatch._id = result.insertedId;

    return res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    return res.status(500).json({ error: 'Failed to create match' });
  }
}

export default authenticateAdmin(createMatchHandler);
