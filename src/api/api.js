const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to make API calls
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Public API calls
export const getGroups = () => apiFetch('/groups', { skipAuth: true });
export const joinGroup = (code) => apiFetch('/groups/join', {
  method: 'POST',
  body: JSON.stringify({ code }),
  skipAuth: true
});
export const getPlayers = (groupId) => apiFetch(`/players?groupId=${groupId}`, { skipAuth: true });
export const getLeaderboard = (groupId) => apiFetch(`/leaderboard?groupId=${groupId}`, { skipAuth: true });
export const getRecentMatches = (groupId) => apiFetch(`/matches/recent?groupId=${groupId}`, { skipAuth: true });
export const getVoteStatus = (groupId) => apiFetch(`/vote-status?groupId=${groupId}`, { skipAuth: true });
export const getTeams = (groupId) => apiFetch(`/teams?groupId=${groupId}`, { skipAuth: true });
export const submitVote = (data) => apiFetch('/vote', {
  method: 'POST',
  body: JSON.stringify(data),
  skipAuth: true,
});

// Admin API calls
export const adminLogin = (credentials) => apiFetch('/admin/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
  skipAuth: true,
});

export const addPlayer = (playerData) => apiFetch('/admin/players/add', {
  method: 'POST',
  body: JSON.stringify(playerData),
});

export const editPlayer = (playerData) => apiFetch('/admin/players/edit', {
  method: 'PUT',
  body: JSON.stringify(playerData),
});

export const deletePlayer = (playerId) => apiFetch('/admin/players/delete', {
  method: 'DELETE',
  body: JSON.stringify({ playerId }),
});

export const bulkAddPlayers = (players) => apiFetch('/admin/players/bulk-add', {
  method: 'POST',
  body: JSON.stringify({ players }),
});

export const createMatch = (matchData) => apiFetch('/admin/match/create', {
  method: 'POST',
  body: JSON.stringify(matchData),
});

export const updateAttendance = (data) => apiFetch('/admin/match/attendance', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const deleteMatch = ({ matchId, password }) => apiFetch('/admin/match/delete', {
  method: 'DELETE',
  body: JSON.stringify({ matchId, password }),
});

export const endMatch = (matchId) => apiFetch('/admin/match/end', {
  method: 'POST',
  body: JSON.stringify({ matchId }),
});

export const createTeams = ({ playerIds, numTeams }) => apiFetch('/admin/teams/create', {
  method: 'POST',
  body: JSON.stringify({ playerIds, numTeams }),
});

export const deleteTeams = (teamId) => apiFetch('/admin/teams/delete', {
  method: 'DELETE',
  body: JSON.stringify({ teamId }),
});

export const updateStats = (data) => apiFetch('/admin/stats/update', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const startVoting = (data) => apiFetch('/admin/voting/start', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const closeVoting = (data) => apiFetch('/admin/voting/close', {
  method: 'POST',
  body: JSON.stringify(data),
});

export default apiFetch;
