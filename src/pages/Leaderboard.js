import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/public/leaderboard');
        const data = response.data.map((donor, idx) => {
          let rankIcon = `${idx + 1}`;
          if (idx === 0) rankIcon = "🥇";
          if (idx === 1) rankIcon = "🥈";
          if (idx === 2) rankIcon = "🥉";
          
          return {
            id: donor.username,
            name: donor.name || donor.username,
            points: donor.karmaPoints,
            rank: rankIcon,
            trend: `+${donor.donationsCount} rescues`
          };
        });
        setTopDonors(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 w-full pb-12">
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-[0_0_40px_rgba(234,179,8,0.4)] mb-2">
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Food Rescue <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Heroes</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Honoring the top donors making a massive impact in our community. Every successful rescue earns +10 Karma points.
        </p>
      </div>

      <div className="glass overflow-hidden">
        <div className="bg-surface-card px-6 py-4 border-b border-surface-border grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Donor Identity</div>
          <div className="col-span-4 text-right">Karma Points</div>
        </div>
        
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
        ) : (
          <div className="divide-y divide-surface-border">
            {topDonors.map((donor, idx) => (
              <div 
                key={donor.id} 
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-white/[0.02] ${
                  idx === 0 ? 'bg-yellow-500/[0.03]' : ''
                }`}
              >
                <div className="col-span-2 flex justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx < 3 ? '' : 'bg-surface-input text-gray-400'
                  }`}>
                    {donor.rank}
                  </div>
                </div>
                
                <div className="col-span-6">
                  <div className="font-bold text-white text-base truncate">{donor.name}</div>
                  <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <span>📈</span> {donor.trend}
                  </div>
                </div>
                
                <div className="col-span-4 text-right">
                  <div className="font-black text-xl text-yellow-400">{donor.points}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
