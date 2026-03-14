import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get('/user/me'),
          api.get(user?.role === 'DONOR' ? '/user/my-donations' : '/user/my-claims')
        ]);
        setProfileData(profileRes.data);
        setHistoryData(historyRes.data);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-urgent-500/10 border border-urgent-500/30 text-urgent-400 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 animate-fade-in">
      <div className="glass relative overflow-hidden rounded-[2rem] border border-surface-border">
        {/* Header Cover */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-green-600/20 to-blue-600/20 relative">
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm"></div>
        </div>

        <div className="px-6 md:px-12 pb-12 relative -mt-16 md:-mt-20">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 p-1.5 shadow-2xl mb-6 relative z-10">
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-5xl md:text-6xl border-4 border-black/50">
              {profileData.role === 'DONOR' ? '🧑‍🍳' : '🤝'}
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{profileData.name || profileData.username}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                <span className="text-gray-300">@{profileData.username}</span>
                <span>•</span>
                <span>{profileData.email}</span>
                {profileData.phoneNumber && (
                   <>
                    <span>•</span>
                    <span>📞 {profileData.phoneNumber}</span>
                   </>
                )}
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface-border rounded text-green-400 border border-green-500/20">
                  {profileData.role}
                </span>
                {profileData.address && (
                  <span className="px-3 py-1 text-xs font-medium bg-surface-input rounded text-gray-300 border border-surface-border truncate max-w-[200px]">
                    📍 {profileData.address}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-surface-border flex-shrink-0">
              <div className="text-center px-4">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Karma</div>
                <div className="text-2xl font-black gradient-text">{profileData.karmaPoints}</div>
              </div>
              <div className="w-px bg-surface-border"></div>
              <div className="text-center px-4">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  {profileData.role === 'DONOR' ? 'Donated' : 'Claimed'}
                </div>
                <div className="text-2xl font-black text-white">
                  {profileData.role === 'DONOR' ? profileData.donationsCount : profileData.claimsCount}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-surface-border mb-8">
            <button 
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'overview' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
              {activeTab === 'overview' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
            </button>
            <button 
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'history' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setActiveTab('history')}
            >
              Feed History
              {activeTab === 'history' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
            </button>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-center text-gray-400 py-12">
               <p className="md:col-span-2">Welcome to your NutriConnect profile. Manage your rescued foods and track your karma points.</p>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              {historyData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-surface-border rounded-2xl">
                  <div className="text-4xl mb-3">📭</div>
                  No history records found yet.
                </div>
              ) : (
                historyData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface-input border border-surface-border flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* Tiny thumbnail */}
                    {item.imageBase64 && (
                      <img src={item.imageBase64} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 w-full text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface border border-white/10 text-gray-300 uppercase">
                          {item.category || 'FOOD'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {profileData.role === 'DONOR' ? 'Cooked: ' + new Date(item.cookedTime).toLocaleDateString() : 'Claimed: ' + new Date(item.claimedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-lg leading-tight">{item.title || item.foodTitle}</h4>
                      <div className="text-sm text-gray-400 mt-1">
                        Quantity: <span className="text-gray-300">{item.quantityKg} kg</span>
                         {profileData.role === 'NGO' && item.donorName && (
                            <span className="ml-3">From: <Link to={`/donor/${item.donorName}`} className="text-green-400 hover:underline">{item.donorName}</Link></span>
                         )}
                      </div>
                    </div>

                    {/* Status/Rating Block */}
                    <div className="w-full md:w-auto text-right">
                       {profileData.role === 'NGO' && item.status && (
                         <div className="mb-2">
                           <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                             {item.status}
                           </span>
                         </div>
                       )}
                       {item.qualityRating > 0 && (
                          <div className="text-yellow-400 text-sm tracking-widest drop-shadow-md">
                            {'★'.repeat(item.qualityRating)}{'☆'.repeat(5-item.qualityRating)}
                          </div>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
