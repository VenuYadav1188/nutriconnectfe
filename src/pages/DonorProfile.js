import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DonorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const response = await api.get(`/user/donor/${username}`);
        setDonorData(response.data);
      } catch (err) {
        setError('Failed to load donor profile or invalid permissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchDonor();
  }, [username]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        <div className="bg-urgent-500/10 border border-urgent-500/30 text-urgent-400 p-4 rounded-xl text-sm max-w-lg text-center">
          ⚠️ {error}
        </div>
        <button onClick={() => navigate('/ngo-feed')} className="btn btn-ghost text-sm">
          ← Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 animate-fade-in">
      <button onClick={() => navigate('/ngo-feed')} className="text-gray-400 hover:text-white mb-6 text-sm font-medium flex items-center gap-2 transition-colors">
        <span>←</span> Back to Feed
      </button>

      <div className="glass p-8 md:p-12 relative overflow-hidden rounded-[2rem] border border-surface-border">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Avatar side */}
          <div className="flex flex-col items-center flex-shrink-0">
             <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-1 shadow-2xl mb-4">
               <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-5xl border-4 border-black/50">
                 🧑‍🍳
               </div>
             </div>
             <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
               Verified Donor
             </div>
          </div>

          {/* Details side */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{donorData.name}</h1>
            <p className="text-lg text-gray-400 mb-6">@{donorData.username}</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
              <div className="bg-surface-input border border-surface-border p-4 rounded-xl text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Donor Karma</div>
                <div className="text-2xl font-black text-green-400">{donorData.karmaPoints}</div>
              </div>
              <div className="bg-surface-input border border-surface-border p-4 rounded-xl text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Foods Given</div>
                <div className="text-2xl font-black text-white">{donorData.donationsCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Foods List */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-surface-border pb-2">Recent Donations from {donorData.name}</h3>
          
          {donorData.recentFoods?.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent food donations found.</p>
          ) : (
            <div className="grid gap-4">
              {donorData.recentFoods?.map(food => (
                <div key={food.id} className="p-4 rounded-xl bg-surface/50 border border-surface-border flex justify-between items-center group hover:border-green-500/30 transition-colors">
                  <div>
                    <h4 className="text-white font-medium">{food.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                       <span className="text-gray-400">{food.quantityKg} kg</span> • {food.category?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-surface border border-surface-border text-gray-400 group-hover:bg-green-500/10 group-hover:text-green-400 transition-colors">
                      {new Date(food.cookedTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DonorProfile;
