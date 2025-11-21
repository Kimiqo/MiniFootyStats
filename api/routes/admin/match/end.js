import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function endMatchHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    const matches = await getCollection('matches');

    // Verify match exists and belongs to admin's group
    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      groupId: req.admin.groupId
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found or access denied' });
    }

    // Check if match is already ended
    if (match.ended) {
      return res.status(400).json({ error: 'Match has already been ended' });
    }

    // Verify voting is closed before ending match
    if (match.votingOpen && !match.votingClosed) {
      return res.status(400).json({ error: 'Please close voting before ending the match' });
    }

    // Mark match as ended
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { 
        $set: { 
          ended: true,
          endedAt: new Date()
        } 
      }
    );

    return res.status(200).json({ 
      message: 'Match ended successfully',
      matchId: matchId
    });
  } catch (error) {
    console.error('Error ending match:', error);
    return res.status(500).json({ error: 'Failed to end match' });
  }
}

export default authenticateAdmin(endMatchHandler);
