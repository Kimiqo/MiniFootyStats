import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function attendanceHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, attendeeIds } = req.body;

    if (!matchId || !Array.isArray(attendeeIds)) {
      return res.status(400).json({ error: 'Match ID and attendee IDs array required' });
    }

    const matches = await getCollection('matches');
    const players = await getCollection('players');

    // Verify match exists and belongs to admin's group
    const match = await matches.findOne({ 
      _id: new ObjectId(matchId),
      groupId: req.admin.groupId
    });
    if (!match) {
      return res.status(404).json({ error: 'Match not found or access denied' });
    }

    // Update match attendees
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { $set: { attendees: attendeeIds } }
    );

    // Update player appearances (only for players in the same group)
    const attendeeObjectIds = attendeeIds.map(id => new ObjectId(id));
    await players.updateMany(
      { 
        _id: { $in: attendeeObjectIds },
        groupId: req.admin.groupId
      },
      { $inc: { totalAppearances: 1 } }
    );

    return res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ error: 'Failed to update attendance' });
  }
}

export default authenticateAdmin(attendanceHandler);
