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

    const players = await getCollection('players');
    const filter = { 
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    };
    
    // Get all players sorted by different criteria
    const byGoals = await players.find(filter).sort({ totalGoals: -1 }).toArray();
    const byAssists = await players.find(filter).sort({ totalAssists: -1 }).toArray();
    const bySaves = await players.find(filter).sort({ totalSaves: -1 }).toArray();
    const byMVP = await players.find(filter).sort({ totalMVP: -1 }).toArray();
    const byAppearances = await players.find(filter).sort({ totalAppearances: -1 }).toArray();

    return res.status(200).json({
      goals: byGoals,
      assists: byAssists,
      saves: bySaves,
      mvp: byMVP,
      appearances: byAppearances
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
