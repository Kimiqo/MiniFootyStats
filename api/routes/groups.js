import { getCollection } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const groups = await getCollection('groups');

    if (id) {
      const group = await groups.findOne({ _id: new ObjectId(id) });
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
      return res.status(200).json(group);
    }

    const allGroups = await groups.find({}).sort({ name: 1 }).toArray();
    return res.status(200).json(allGroups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
}
