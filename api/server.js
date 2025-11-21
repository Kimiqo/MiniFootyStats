import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Import route handlers
import groupsHandler from './routes/groups.js';
import joinGroupHandler from './routes/groups/join.js';
import playersHandler from './routes/players.js';
import leaderboardHandler from './routes/leaderboard.js';
import recentMatchesHandler from './routes/matches/recent.js';
import voteHandler from './routes/vote.js';
import voteStatusHandler from './routes/vote-status.js';
import loginHandler from './routes/admin/login.js';
import addPlayerHandler from './routes/admin/players/add.js';
import editPlayerHandler from './routes/admin/players/edit.js';
import deletePlayerHandler from './routes/admin/players/delete.js';
import bulkAddPlayersHandler from './routes/admin/players/bulk-add.js';
import createMatchHandler from './routes/admin/match/create.js';
import attendanceHandler from './routes/admin/match/attendance.js';
import deleteMatchHandler from './routes/admin/match/delete.js';
import endMatchHandler from './routes/admin/match/end.js';
import updateStatsHandler from './routes/admin/stats/update.js';
import startVotingHandler from './routes/admin/voting/start.js';
import closeVotingHandler from './routes/admin/voting/close.js';
import createTeamsHandler from './routes/admin/teams/create.js';
import deleteTeamsHandler from './routes/admin/teams/delete.js';
import teamsHandler from './routes/teams.js';

// Public routes
app.all('/api/groups', groupsHandler);
app.all('/api/groups/join', joinGroupHandler);
app.all('/api/players', playersHandler);
app.all('/api/leaderboard', leaderboardHandler);
app.all('/api/teams', teamsHandler);
app.all('/api/matches/recent', recentMatchesHandler);
app.all('/api/vote', voteHandler);
app.all('/api/vote-status', voteStatusHandler);

// Admin routes
app.all('/api/admin/login', loginHandler);
app.all('/api/admin/players/add', addPlayerHandler);
app.all('/api/admin/players/edit', editPlayerHandler);
app.all('/api/admin/players/delete', deletePlayerHandler);
app.all('/api/admin/players/bulk-add', bulkAddPlayersHandler);
app.all('/api/admin/match/create', createMatchHandler);
app.all('/api/admin/match/attendance', attendanceHandler);
app.all('/api/admin/match/delete', deleteMatchHandler);
app.all('/api/admin/match/end', endMatchHandler);
app.all('/api/admin/stats/update', updateStatsHandler);
app.all('/api/admin/voting/start', startVotingHandler);
app.all('/api/admin/voting/close', closeVotingHandler);
app.all('/api/admin/teams/create', createTeamsHandler);
app.all('/api/admin/teams/delete', deleteTeamsHandler);

// For Vercel serverless deployment, export the app
export default app;

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    
    // Test database connection on startup
    try {
      await connectToDatabase();
      console.log('✅ Database connection verified');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  });
}
