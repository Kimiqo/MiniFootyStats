import { getCollection, connectToDatabase } from './utils/db.js';

async function debugVotes() {
  try {
    await connectToDatabase();
    
    const matches = await getCollection('matches');
    const votes = await getCollection('votes');
    
    // Find all matches with voting open
    console.log('\n=== MATCHES WITH VOTING OPEN ===');
    const openMatches = await matches.find({ 
      votingOpen: true 
    }).toArray();
    
    console.log(`Found ${openMatches.length} matches with voting open:`);
    openMatches.forEach(match => {
      console.log(`\nMatch ID: ${match._id}`);
      console.log(`Group ID: ${match.groupId}`);
      console.log(`Date: ${match.date}`);
      console.log(`Voting Open: ${match.votingOpen}`);
      console.log(`Voting Closed: ${match.votingClosed}`);
      console.log(`Attendees: ${match.attendees?.length || 0}`);
      console.log(`MVP Candidates: ${match.mvpCandidates?.length || 0}`);
    });
    
    // Check all votes
    console.log('\n\n=== ALL VOTES ===');
    const allVotes = await votes.find({}).toArray();
    console.log(`Total votes in database: ${allVotes.length}`);
    
    allVotes.forEach(vote => {
      console.log(`\nVote ID: ${vote._id}`);
      console.log(`Match ID: ${vote.matchId}`);
      console.log(`Group ID: ${vote.groupId}`);
      console.log(`Voter Name: ${vote.voterName}`);
      console.log(`Player Voted For: ${vote.playerVotedForId}`);
      console.log(`Timestamp: ${vote.timestamp}`);
    });
    
    // Count votes per match
    console.log('\n\n=== VOTES PER MATCH ===');
    for (const match of openMatches) {
      const matchVotes = await votes.find({ 
        matchId: match._id.toString()
      }).toArray();
      console.log(`Match ${match._id}: ${matchVotes.length} votes`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugVotes();
