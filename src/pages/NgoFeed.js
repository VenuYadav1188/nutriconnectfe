import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Haversine distance formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
};

const NgoFeed = () => {
  const { user } = useAuth(); // Contains context user
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [claimingId, setClaimingId] = useState(null);
  const [claimStatus, setClaimStatus] = useState({ id: null, status: '', message: '' });
  
  // Rating Modal State
  const [ratingModal, setRatingModal] = useState({ isOpen: false, foodId: null, rating: 5, notes: '' });

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch food listings
      const response = await api.get('/food');
      // We don't filter out EXPIRED anymore (Feature 6)
      
      const enrichedListings = response.data.map(item => {
        let distance = null;
        if (
          user?.latitude !== null && user?.latitude !== undefined &&
          user?.longitude !== null && user?.longitude !== undefined &&
          item.donorLatitude !== null && item.donorLatitude !== undefined &&
          item.donorLongitude !== null && item.donorLongitude !== undefined
        ) {
          distance = calculateDistance(
            user.latitude, user.longitude,
            item.donorLatitude, item.donorLongitude
          );
        }
        return { ...item, distance };
      });

      // Sort: EXPIRED goes last. Then HIGH_PRIORITY. Then by closest distance if available.
      const sorted = enrichedListings.sort((a, b) => {
        if (a.freshnessStatus === 'EXPIRED' && b.freshnessStatus !== 'EXPIRED') return 1;
        if (a.freshnessStatus !== 'EXPIRED' && b.freshnessStatus === 'EXPIRED') return -1;
        if (a.freshnessStatus === 'HIGH_PRIORITY' && b.freshnessStatus !== 'HIGH_PRIORITY') return -1;
        if (a.freshnessStatus !== 'HIGH_PRIORITY' && b.freshnessStatus === 'HIGH_PRIORITY') return 1;
        
        // Sort by distance if both have it
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
      setListings(sorted);
    } catch (err) {
      setError('Failed to load food listings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleClaim = async (id) => {
    setClaimingId(id);
    setClaimStatus({ id: null, status: '', message: '' });
    try {
      await api.post(`/food/${id}/claim`);
      setClaimStatus({ id, status: 'success', message: '✅ Food claimed successfully!' });
      
      // Open rating modal immediately after successful claim
      setRatingModal({ isOpen: true, foodId: id, rating: 5, notes: '' });

    } catch (err) {
      setClaimStatus({ 
        id, 
        status: 'error', 
        message: err.response?.data?.message || 'Failed to claim food. It might have been claimed already.' 
      });
      setClaimingId(null);
    }
  };

  const submitRating = async () => {
    try {
      await api.post(`/food/${ratingModal.foodId}/rate`, {
        rating: ratingModal.rating,
        verificationNotes: ratingModal.notes
      });
      
      // Remove from feed after rating submitted
      setListings((prev) => prev.filter((item) => item.id !== ratingModal.foodId));
      setRatingModal({ isOpen: false, foodId: null, rating: 5, notes: '' });
      setClaimStatus({ id: null, status: '', message: '' });
      setClaimingId(null);
      
      alert('Thank you for rating! This helps donors earn Karma.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 w-full pb-12 relative">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Available <span className="gradient-text">Rescues</span>
          </h1>
          <p className="text-gray-400">Live feed of fresh food waiting to be distributed.</p>
        </div>
        <button onClick={fetchData} className="btn btn-ghost text-sm py-2 px-4">
          ↻ Refresh Feed
        </button>
      </div>

      {error && (
        <div className="bg-urgent-500/10 border border-urgent-500/30 text-urgent-400 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-surface-border border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Scanning for nearby food...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border-dashed">
          <div className="text-5xl mb-4 opacity-50">🍃</div>
          <h3 className="text-xl font-bold text-white mb-2">No active listings</h3>
          <p className="text-gray-400">Looks like all food has been rescued for now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {listings.map((item) => {
            const isUrgent = item.freshnessStatus === 'HIGH_PRIORITY';
            const isExpired = item.freshnessStatus === 'EXPIRED';
            const statusForThisItem = claimStatus.id === item.id ? claimStatus : null;
            
            return (
              <div 
                key={item.id} 
                className={`glass p-6 transition-all hover:shadow-xl relative overflow-hidden group flex flex-col md:flex-row gap-6 ${
                  isUrgent ? 'border-urgent-500/30 bg-urgent-900/10' : ''
                } ${isExpired ? 'opacity-60 grayscale' : ''} ${statusForThisItem?.status === 'success' ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Image Section */}
                <div className="w-full md:w-48 h-40 rounded-xl overflow-hidden bg-surface-border flex-shrink-0 relative">
                  {item.imageBase64 ? (
                    <img src={item.imageBase64} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <span className="text-4xl mb-2">🍽️</span>
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                  {/* Category Badge overlay on image */}
                  <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
                    {item.category?.replace('_', ' ') || 'STANDARD'}
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-1 relative z-10 w-full">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {isExpired ? (
                         <span className="badge bg-gray-500/20 text-gray-400 border border-gray-500/30">⛔ Not Consumable</span>
                      ) : isUrgent ? (
                         <span className="badge badge-urgent"><span className="animate-pulse">⏳</span> High Priority</span>
                      ) : (
                         <span className="badge badge-fresh">✨ Fresh</span>
                      )}
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-input text-gray-300 border border-surface-border">
                        {item.quantityKg} kg
                      </span>
                      {item.distance !== null && item.distance !== undefined ? (
                         <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                           📍 {item.distance.toFixed(1)} km away
                         </span>
                      ) : (
                         <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                           📍 Distance unknown
                         </span>
                      )}
                    </div>

                    <h3 className={`text-xl font-bold ${isUrgent && !isExpired ? 'text-white' : 'text-gray-100'}`}>
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mt-6 pt-4 border-t border-surface-border/50">
                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                        <span>👩‍🍳</span> By <Link to={`/donor/${item.donorName}`} className="text-gray-200 font-medium underline decoration-green-500/50 underline-offset-2">{item.donorName}</Link>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🕒</span> Cooked: {new Date(item.cookedTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </div>
                      {item.donorPhone && (
                        <div className="flex items-center gap-1.5">
                          <span>📞</span> {item.donorPhone}
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-auto">
                      {statusForThisItem?.status !== 'success' && (
                        <button
                          onClick={() => handleClaim(item.id)}
                          disabled={claimingId === item.id || isExpired}
                          className={`btn w-full md:w-auto px-8 py-3 shadow-lg ${
                            isExpired ? 'bg-surface-border cursor-not-allowed text-gray-500' :
                            isUrgent ? 'btn-urgent hover:scale-105' : 'btn-primary hover:scale-105'
                          } transition-all`}
                        >
                          {claimingId === item.id ? 'Claiming...' : isExpired ? 'Expired' : 'Claim Food'}
                        </button>
                      )}
                      
                      {statusForThisItem?.status === 'error' && (
                        <div className="text-urgent-400 text-xs mt-2 text-right">{statusForThisItem.message}</div>
                      )}
                      {statusForThisItem?.status === 'success' && (
                        <div className="text-green-400 text-xs mt-2 text-right font-semibold">{statusForThisItem.message}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RATING MODAL (Feature 1) */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass w-full max-w-md p-8 shadow-2xl rounded-2xl border border-green-500/30">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-2">Rate Food Quality</h3>
              <p className="text-sm text-gray-400">Please provide a rating after you pick up the food. Rating 4 or 5 stars gives the donor Karma Points!</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star}
                  onClick={() => setRatingModal({...ratingModal, rating: star})}
                  className={`text-4xl transition-transform hover:scale-110 ${star <= ratingModal.rating ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-gray-600'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Verification Notes (Optional)</label>
              <textarea 
                className="input w-full h-24 resize-none"
                placeholder="How was the food quality, packaging, etc?"
                value={ratingModal.notes}
                onChange={(e) => setRatingModal({...ratingModal, notes: e.target.value})}
              />
            </div>

            <button onClick={submitRating} className="btn btn-primary w-full py-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              Submit Final Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoFeed;
