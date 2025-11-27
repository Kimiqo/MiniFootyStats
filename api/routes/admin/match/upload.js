import { authenticateAdmin } from '../../../utils/auth.js';
import { getCollection } from '../../../utils/db.js';
import { ObjectId } from 'mongodb';

async function uploadMatchMediaHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matchId, fileData, fileName, fileType } = req.body;

    if (!matchId || !fileData || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const matches = await getCollection('matches');

    // Verify match belongs to admin's group
    const match = await matches.findOne({
      _id: new ObjectId(matchId),
      $or: [
        { groupId: req.admin.groupId },
        { groupId: new ObjectId(req.admin.groupId) }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or unauthorized' });
    }

    // Store file data as base64 in the database
    // In production, you'd upload to S3/Cloudinary/etc and store the URL
    const mediaData = {
      fileName,
      fileType: fileType || 'video/mp4',
      data: fileData, // base64 string
      uploadedAt: new Date()
    };

    await matches.updateOne(
      { _id: new ObjectId(matchId) },
      { 
        $set: { 
          videoData: mediaData,
          videoUrl: null // Clear URL if file is uploaded
        } 
      }
    );

    res.status(200).json({ 
      message: 'Media uploaded successfully',
      fileName 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
}

export default authenticateAdmin(uploadMatchMediaHandler);
