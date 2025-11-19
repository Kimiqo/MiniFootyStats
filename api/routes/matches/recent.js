import { getCollection } from '../../utils/db.js';
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

    const matches = await getCollection('matches');
    const players = await getCollection('players');
    
    // Get the 5 most recent matches for the group
    // Try both string and ObjectId formats to handle migration
    const recentMatches = await matches
      .find({ 
        $or: [
          { groupId: groupId },
          { groupId: new ObjectId(groupId) }
        ]
      })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // Populate player details for each match
    const enrichedMatches = await Promise.all(
      recentMatches.map(async (match) => {
        const attendeeIds = match.attendees.map(id => new ObjectId(id));
        const attendeePlayers = await players.find({ 
          _id: { $in: attendeeIds },
          groupId
        }).toArray();
        
        let mvpPlayer = null;
        if (match.mvpWinnerId) {
          mvpPlayer = await players.findOne({ 
            _id: new ObjectId(match.mvpWinnerId),
            groupId
          });
        }

        return {
          ...match,
          attendeesDetails: attendeePlayers,
          mvpWinner: mvpPlayer
        };
      })
    );

    return res.status(200).json(enrichedMatches);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return res.status(500).json({ error: 'Failed to fetch recent matches' });
  }
}
