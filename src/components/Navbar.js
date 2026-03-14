import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar py-4 px-6 mb-8 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-2xl">🍲</span> <span className="gradient-text">NutriConnect</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'DONOR' && (
                <Link to="/donor-dashboard" className="text-sm font-medium hover:text-green-400 transition-colors">
                  Donor Dashboard
                </Link>
              )}
              {user.role === 'NGO' && (
                <Link to="/ngo-feed" className="text-sm font-medium hover:text-green-400 transition-colors">
                  NGO Feed
                </Link>
              )}
              <Link to="/leaderboard" className="text-sm font-medium hover:text-green-400 transition-colors">
                Leaderboard
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin-dashboard" className="text-sm font-medium hover:text-green-400 transition-colors">
                  Dashboard
                </Link>
              )}
              {user.role !== 'ADMIN' && (
                <Link to="/profile" className="text-sm font-medium hover:text-green-400 transition-colors">
                  Profile
                </Link>
              )}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-surface-border">
                {user.role === 'DONOR' && user.karmaPoints !== undefined && (
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <span className="text-sm">✨</span>
                    <span className="text-xs font-bold text-green-400">{user.karmaPoints} Karma</span>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-200">@{user.username}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost text-xs py-1.5 px-3">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
