import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await adminLogin(username, password);
    if (result.success) {
      navigate('/admin-dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-surface-border mx-auto flex items-center justify-center text-3xl mb-4 border border-red-500/30">
            🛡️
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">System Administration</h2>
          <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Secret Access Terminal</p>
        </div>

        {error && (
          <div className="bg-urgent-500/10 border border-urgent-500/30 text-urgent-400 p-3 rounded-lg text-sm mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Identifier</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input bg-black/40 border-surface-border text-white placeholder-gray-600 focus:border-red-500/50"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Secure Key</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-black/40 border-surface-border text-white placeholder-gray-600 focus:border-red-500/50"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 mt-6 border-none shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <button onClick={() => navigate('/')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors uppercase font-bold tracking-widest">
                ← Return to Public Site
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
