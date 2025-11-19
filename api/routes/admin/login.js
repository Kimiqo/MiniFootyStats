import { getCollection } from '../../utils/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admins = await getCollection('admins');
    const admin = await admins.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.groupId) {
      return res.status(403).json({ error: 'Admin is not assigned to a group' });
    }

    // Get group details
    const groups = await getCollection('groups');
    const group = await groups.findOne({ _id: new ObjectId(admin.groupId) });

    if (!group) {
      return res.status(403).json({ error: 'Group not found' });
    }

    const token = generateToken({
      id: admin._id.toString(),
      email: admin.email,
      groupId: admin.groupId
    });

    return res.status(200).json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        groupId: admin.groupId,
        group: {
          id: group._id,
          name: group.name,
          description: group.description,
          code: group.code
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
