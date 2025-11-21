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

    if (match.ended) {
      return res.status(400).json({ error: 'Cannot update attendance - match has ended' });
    }

    // Get previous attendees to calculate who was added/removed
    const previousAttendees = match.attendees || [];
    const previousAttendeeSet = new Set(previousAttendees);
    const newAttendeeSet = new Set(attendeeIds);

    // Find players who were added (in new but not in previous)
    const addedAttendees = attendeeIds.filter(id => !previousAttendeeSet.has(id));
    
    // Find players who were removed (in previous but not in new)
    const removedAttendees = previousAttendees.filter(id => !newAttendeeSet.has(id));

    // Update match attendees
    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { $set: { attendees: attendeeIds } }
    );

    // Increment appearances for newly added attendees
    if (addedAttendees.length > 0) {
      const addedObjectIds = addedAttendees.map(id => new ObjectId(id));
      await players.updateMany(
        { 
          _id: { $in: addedObjectIds },
          groupId: req.admin.groupId
        },
        { $inc: { totalAppearances: 1 } }
      );
    }

    // Decrement appearances for removed attendees
    if (removedAttendees.length > 0) {
      const removedObjectIds = removedAttendees.map(id => new ObjectId(id));
      await players.updateMany(
        { 
          _id: { $in: removedObjectIds },
          groupId: req.admin.groupId
        },
        { $inc: { totalAppearances: -1 } }
      );
    }

    return res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ error: 'Failed to update attendance' });
  }
}

export default authenticateAdmin(attendanceHandler);
