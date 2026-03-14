import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    role: ''
  });
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Google Maps Autocomplete is removed to fix typing conflicts
    // Users will now rely on the 'Detect Location' button for precise coordinates
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };
 
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
 
    setCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setCapturingLocation(false);
        setFormData(prev => ({ ...prev, address: 'Location detected automatically' }));
      },
      (err) => {
        setError('Failed to detect location. Please type your address manually.');
        setCapturingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.role) {
      setError('Please select your role');
      return;
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude
    };

    const result = await register(payload);
    if (result.success) {
      navigate('/login', { state: { registered: true } });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full">
      <div className="glass w-full max-w-xl p-8 shadow-2xl animate-fade-in relative z-10 transition-all">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Join NutriConnect</h2>
          <p className="text-gray-400 text-sm">Become a part of the food rescue mission</p>
        </div>

        {error && (
          <div className="bg-urgent-500/20 border border-urgent-500/50 text-urgent-400 p-3 rounded-lg text-sm mb-6 text-center animate-shake">
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name / Org Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
                placeholder="(Optional) Phone"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-300">Address</label>
              <button 
                type="button" 
                onClick={handleDetectLocation}
                className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
              >
                📍 {capturingLocation ? 'Detecting...' : 'Detect my location'}
              </button>
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
              placeholder="Search for your address..."
            />
            {location.latitude && (
               <p className="text-[10px] text-green-500 mt-1">✓ Coordinates captured</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input bg-surface-input border-surface-border text-white placeholder-gray-500"
              placeholder="Create a password"
            />
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('DONOR')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'DONOR' 
                    ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                    : 'border-surface-border bg-surface-card hover:border-gray-500'
                }`}
              >
                <span className="text-2xl mb-2">🤝</span>
                <span className={`text-sm font-medium ${formData.role === 'DONOR' ? 'text-green-400' : 'text-gray-300'}`}>Donor</span>
                <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Donate surplus food</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelect('NGO')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === 'NGO' 
                    ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                    : 'border-surface-border bg-surface-card hover:border-gray-500'
                }`}
              >
                <span className="text-2xl mb-2">❤️</span>
                <span className={`text-sm font-medium ${formData.role === 'NGO' ? 'text-green-400' : 'text-gray-300'}`}>NGO / Shelter</span>
                <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">Receive & distribute food</span>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn w-full btn-primary text-base py-3 mt-6 flex items-center justify-center gap-2 relative group overflow-hidden">
            <span className="relative z-10">{loading ? 'Creating Account...' : (capturingLocation ? 'Saving Location...' : 'Create Account')}</span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></div>
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6 relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
