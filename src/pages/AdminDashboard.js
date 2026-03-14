import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('stats'); // 'stats' | 'users' | 'listings' | 'claims'
  const navigate = useNavigate();

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, claimsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/claims')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      alert('Access Denied or Session Expired. Admins only.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const adjustKarma = async (userId, points) => {
    try {
      await api.put(`/admin/users/${userId}/karma`, { points });
      fetchData(); // Refresh
    } catch (err) {
      alert('Failed to adjust karma');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent animate-spin rounded-full"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Restricted Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Admin <span className="text-red-500">Terminal</span></h1>
          <p className="text-gray-500 text-sm">System Overview & Resource Management</p>
        </div>
        <button onClick={fetchData} className="btn btn-ghost text-xs">↻ Reload</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 text-center border-l-4 border-l-blue-500 shadow-xl">
          <div className="text-3xl font-black text-white">{stats?.totalUsers || 0}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total Users</div>
        </div>
        <div className="glass p-6 text-center border-l-4 border-l-green-500 shadow-xl">
          <div className="text-3xl font-black text-white">{stats?.totalListings || 0}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Active Listings</div>
        </div>
        <div className="glass p-6 text-center border-l-4 border-l-orange-500 shadow-xl">
          <div className="text-3xl font-black text-white">{stats?.totalClaims || 0}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total Claims</div>
        </div>
        <div className="glass p-6 text-center border-l-4 border-l-red-500 shadow-xl">
          <div className="text-3xl font-black text-white">ACTIVE</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">System Status</div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-surface-border mb-8 overflow-x-auto pb-1">
        {['stats', 'users', 'listings', 'claims'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-all relative ${activeView === view ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {view}
            {activeView === view && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600"></div>}
          </button>
        ))}
      </div>

      <div className="glass p-1 overflow-hidden">
        {activeView === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Karma</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{u.username} <div className="text-[10px] text-gray-500">{u.email}</div></td>
                    <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'DONOR' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {u.role}
                        </span>
                    </td>
                    <td className="p-4 text-green-400 font-bold">{u.karmaPoints}</td>
                    <td className="p-4 flex gap-2">
                       <button onClick={() => adjustKarma(u.id, 10)} className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-green-600/40">+10</button>
                       <button onClick={() => adjustKarma(u.id, -10)} className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600/40">-10</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'listings' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
             {listings.map((l, i) => (
               <div key={i} className="bg-black/30 border border-surface-border p-4 rounded-xl flex gap-4">
                 {l.imageBase64 && <img src={l.imageBase64} className="w-16 h-16 rounded object-cover" alt=""/>}
                 <div className="flex-1">
                    <div className="text-white font-bold">{l.title}</div>
                    <div className="text-xs text-gray-500">By @{l.donorName} • {l.quantityKg} kg</div>
                    <div className="mt-2 text-[10px] text-gray-400 line-clamp-1">{l.description}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-gray-500">{l.status}</span>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeView === 'claims' && (
          <div className="p-4 space-y-4">
             {claims.map((c, i) => (
                <div key={i} className="bg-black/30 border border-surface-border p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                   <div>
                      <div className="text-white font-bold">Claim #{c.claimId}</div>
                      <div className="text-xs text-gray-500">NGO @{c.ngoUsername} claimed "{c.foodTitle}"</div>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(c.claimedAt).toLocaleString()}</div>
                   </div>
                   <div className="text-right">
                      <div className={`text-[10px] font-bold uppercase mb-2 ${c.status === 'COMPLETED' ? 'text-green-500' : 'text-blue-500'}`}>{c.status}</div>
                      {c.qualityRating && (
                         <div className="text-yellow-500 text-xs">Rating: {c.qualityRating}/5</div>
                      )}
                   </div>
                </div>
             ))}
          </div>
        )}

        {activeView === 'stats' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div className="bg-black/30 border border-surface-border p-6 rounded-xl">
                 <h3 className="text-white font-bold mb-4">System Overview</h3>
                 <div className="flex justify-between items-center py-2 border-b border-surface-border/50">
                    <span className="text-gray-400 text-sm">Registered Users</span>
                    <span className="text-white font-mono">{stats?.totalUsers || 0}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-surface-border/50">
                    <span className="text-gray-400 text-sm">Active Food Listings</span>
                    <span className="text-white font-mono">{stats?.totalListings || 0}</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 text-sm">Total Claims Processed</span>
                    <span className="text-white font-mono">{stats?.totalClaims || 0}</span>
                 </div>
              </div>
              <div className="bg-black/30 border border-surface-border p-6 rounded-xl">
                 <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                 <p className="text-gray-400 text-sm mb-4">Use the tabs above to manage users, monitor listings, and resolve claims.</p>
                 <button onClick={() => setActiveView('users')} className="btn border border-surface-border text-gray-300 hover:bg-surface-border hover:text-white w-full py-2 mb-3 rounded-lg transition-colors">Manage Users</button>
                 <button onClick={() => setActiveView('listings')} className="btn border border-surface-border text-gray-300 hover:bg-surface-border hover:text-white w-full py-2 rounded-lg transition-colors">Review Listings</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
