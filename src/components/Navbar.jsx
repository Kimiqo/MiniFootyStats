import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { isAuthenticated, logout, group } = useAuth();
  const location = useLocation();
  const { groupId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={groupId ? `/group/${groupId}` : '/'} className="flex items-center space-x-2">
            <img src="/minifooty_logo.png" alt="MiniFooty Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold">{group?.name || ''}</span>
          </Link>

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
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
                  to={`/group/${groupId}/teams`}
                  className={`hover:text-blue-200 transition ${isActive(`/group/${groupId}/teams`) ? 'font-bold' : ''}`}
                >
                  Team Randomizer
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {groupId && (
              <>
                <Link 
                  to={`/group/${groupId}`}
                  className={`block py-2 hover:bg-blue-700 rounded px-2 ${isActive(`/group/${groupId}`) ? 'font-bold bg-blue-700' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to={`/group/${groupId}/leaderboard`}
                  className={`block py-2 hover:bg-blue-700 rounded px-2 ${isActive(`/group/${groupId}/leaderboard`) ? 'font-bold bg-blue-700' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link 
                  to={`/group/${groupId}/teams`}
                  className={`block py-2 hover:bg-blue-700 rounded px-2 ${isActive(`/group/${groupId}/teams`) ? 'font-bold bg-blue-700' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Team Randomizer
                </Link>
                <Link 
                  to="/"
                  className="block py-2 hover:bg-blue-700 rounded px-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Change Group
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/admin" 
                  className={`block py-2 hover:bg-blue-700 rounded px-2 ${isActive('/admin') ? 'font-bold bg-blue-700' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 hover:bg-blue-700 rounded px-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/admin/login" 
                className={`block py-2 hover:bg-blue-700 rounded px-2 ${isActive('/admin/login') ? 'font-bold bg-blue-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
