import { getCollection } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ error: 'groupId query parameter is required' });
    }

    const teams = await getCollection('teams');
    
    // Get the most recent team randomization for this group
    const latestTeam = await teams.findOne(
      {
        $or: [
          { groupId: groupId },
          { groupId: new ObjectId(groupId) }
        ]
      },
      {
        sort: { createdAt: -1 }
      }
    );

    if (!latestTeam) {
      return res.status(200).json(null);
    }

    return res.status(200).json({
      _id: latestTeam._id,
      teams: latestTeam.teams,
      createdAt: latestTeam.createdAt
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ error: 'Failed to fetch teams' });
  }
}
