import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GroupSelector } from './pages/GroupSelector';

// Public Pages
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { Vote } from './pages/Vote';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PlayersManagement } from './pages/admin/PlayersManagement';
import { CreateMatch } from './pages/admin/CreateMatch';
import { ManageMatch } from './pages/admin/ManageMatch';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<GroupSelector />} />
              <Route path="/group/:groupId" element={<Home />} />
              <Route path="/group/:groupId/leaderboard" element={<Leaderboard />} />
              <Route path="/group/:groupId/vote" element={<Vote />} />
              
              {/* Legacy redirects - redirect old URLs to group selector */}
              <Route path="/leaderboard" element={<Navigate to="/" replace />} />
              <Route path="/vote" element={<Navigate to="/" replace />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/players"
                element={
                  <ProtectedRoute>
                    <PlayersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/match/create"
                element={
                  <ProtectedRoute>
                    <CreateMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/match/manage"
                element={
                  <ProtectedRoute>
                    <ManageMatch />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
