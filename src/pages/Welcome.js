import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Welcome = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center px-4 py-12 lg:py-24">
      {/* Hero Section */}
      <div className="relative mb-16 animate-fade-in w-full max-w-4xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-lg">
          Rescue Food. <br className="hidden md:block" />
          <span className="gradient-text">Feed Hope.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          NutriConnect bridges the gap between massive food surplus and food scarcity. 
          Are you a restaurant with fresh surplus or an NGO feeding the hungry? Join our intelligent food rescue platform today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link 
              to={user.role === 'DONOR' ? '/donor-dashboard' : '/ngo-feed'}
              className="btn btn-primary px-8 py-4 text-lg rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-all w-full sm:w-auto"
            >
              Go to Dashboard ✨
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="btn btn-primary px-8 py-4 text-lg rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-all w-full sm:w-auto"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="btn glass px-8 py-4 text-lg rounded-full border border-surface-border hover:bg-surface transition-all w-full sm:w-auto text-white"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center text-3xl shadow-lg mb-6">
            🏃‍♂️
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Real-Time Rescue</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Our smart Freshness Timer prioritizes urgent listings, ensuring highly perishable food reaches those in need before it spoils.
          </p>
        </div>

        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-3xl shadow-lg mb-6">
            🤝
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Direct Connection</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            No middlemen. Donors post directly to the feed, and verified NGOs claim food instantly, streamlining the logistics of giving.
          </p>
        </div>

        <div className="glass p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-400 flex items-center justify-center text-3xl shadow-lg mb-6">
            ✨
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Karma System</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Donors earn Karma Points for every successful donation. Check the Leaderboard to see your impact on fighting hunger!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
