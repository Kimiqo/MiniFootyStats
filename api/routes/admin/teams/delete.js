import { getCollection } from '../../../utils/db.js';
import { authenticateAdmin } from '../../../utils/auth.js';
import { ObjectId } from 'mongodb';

async function deleteTeamsHandler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.admin;
  const { teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ error: 'Team ID is required' });
  }

  try {
    const teams = await getCollection('teams');

    // Delete the team randomization, ensuring it belongs to this group
    const result = await teams.deleteOne({
      _id: new ObjectId(teamId),
      $or: [
        { groupId: groupId },
        { groupId: new ObjectId(groupId) }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Team randomization not found or unauthorized' });
    }

    res.status(200).json({ message: 'Teams deleted successfully' });
  } catch (error) {
    console.error('Delete teams error:', error);
    res.status(500).json({ error: 'Failed to delete teams' });
  }
}

export default authenticateAdmin(deleteTeamsHandler);
