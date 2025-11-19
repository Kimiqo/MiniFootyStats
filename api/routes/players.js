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
    const allPlayers = await players
      .find({ 
        $or: [
          { groupId: groupId },
          { groupId: new ObjectId(groupId) }
        ]
      })
      .sort({ name: 1 })
      .toArray();

    return res.status(200).json(allPlayers);
  } catch (error) {
    console.error('Error fetching players:', error);
    return res.status(500).json({ error: 'Failed to fetch players' });
  }
}
