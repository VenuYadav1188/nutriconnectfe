import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      if (result.role === 'DONOR') navigate('/donor-dashboard');
      else if (result.role === 'NGO') navigate('/ngo-feed');
      else navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 shadow-2xl animate-fade-in relative z-10">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to rescue food with NutriConnect</p>
        </div>

        {location.state?.registered && !error && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm mb-6 text-center">
            Account created successfully! Please sign in.
          </div>
        )}

        {error && (
          <div className="bg-urgent-500/20 border border-urgent-500/50 text-urgent-400 p-3 rounded-lg text-sm mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn w-full btn-primary text-base py-3 mt-4 flex items-center justify-center gap-2 relative group overflow-hidden">
            <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></div>
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6 relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
