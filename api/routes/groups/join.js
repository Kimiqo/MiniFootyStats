import { getCollection } from '../../utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Valid 6-character code is required' });
    }

    const groups = await getCollection('groups');
    const group = await groups.findOne({ code: code.toUpperCase() });

    if (!group) {
      return res.status(404).json({ error: 'Group not found. Please check the code and try again.' });
    }

    return res.status(200).json({
      message: 'Group found successfully',
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        code: group.code
      }
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ error: 'Failed to join group' });
  }
}
