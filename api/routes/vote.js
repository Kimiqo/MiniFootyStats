import { getCollection } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterName, matchId, playerId } = req.body;

    // Validation
    if (!voterName || !matchId || !playerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (voterName.trim().length < 2) {
      return res.status(400).json({ error: 'Voter name must be at least 2 characters' });
    }

    const votes = await getCollection('votes');
    const matches = await getCollection('matches');

    // Check if match exists and voting is open
    const match = await matches.findOne({ _id: new ObjectId(matchId) });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.votingClosed) {
      return res.status(400).json({ error: 'Voting is closed for this match' });
    }

    if (!match.votingOpen) {
      return res.status(400).json({ error: 'Voting has not started for this match' });
    }

    // Check if this person already voted for this match
    const existingVote = await votes.findOne({
      matchId: matchId,
      groupId: match.groupId,
      voterName: voterName.trim().toLowerCase()
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted for this match' });
    }

    // Check if player was an attendee
    if (!match.attendees.includes(playerId)) {
      return res.status(400).json({ error: 'Player was not an attendee of this match' });
    }

    // Check if player is in the list of candidates (if candidates were specified)
    if (match.mvpCandidates && match.mvpCandidates.length > 0) {
      if (!match.mvpCandidates.includes(playerId)) {
        return res.status(400).json({ error: 'Player is not eligible for MVP voting' });
      }
    }

    // Create vote
    const vote = {
      matchId,
      groupId: match.groupId,
      voterName: voterName.trim().toLowerCase(),
      playerVotedForId: playerId,
      timestamp: new Date()
    };

    await votes.insertOne(vote);

    return res.status(201).json({ message: 'Vote recorded successfully', vote });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ error: 'Failed to record vote' });
  }
}
