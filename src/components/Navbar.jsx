import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout, group } = useAuth();
  const location = useLocation();
  const { groupId } = useParams();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={groupId ? `/group/${groupId}` : '/'} className="text-xl font-bold">
            ⚽ {group?.name || 'MiniFooty'}
          </Link>

          <div className="flex items-center space-x-6">
            {groupId && (
              <>
                <Link 
                  to={`/group/${groupId}`}
                  className={`hover:text-blue-200 transition ${isActive(`/group/${groupId}`) ? 'font-bold' : ''}`}
                >
                  Home
                </Link>
                <Link 
                  to={`/group/${groupId}/leaderboard`}
                  className={`hover:text-blue-200 transition ${isActive(`/group/${groupId}/leaderboard`) ? 'font-bold' : ''}`}
                >
                  Leaderboard
                </Link>
                <Link 
                  to={`/group/${groupId}/vote`}
                  className={`hover:text-blue-200 transition ${isActive(`/group/${groupId}/vote`) ? 'font-bold' : ''}`}
                >
                  Vote
                </Link>
                <Link 
                  to="/"
                  className="hover:text-blue-200 transition text-sm"
                >
                  Change Group
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/admin" 
                  className={`hover:text-blue-200 transition ${isActive('/admin') ? 'font-bold' : ''}`}
                >
                  Admin
                </Link>
                <button 
                  onClick={logout}
                  className="hover:text-blue-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className={`hover:text-blue-200 transition ${isActive('/admin/login') ? 'font-bold' : ''}`}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
