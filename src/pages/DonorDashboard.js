import React, { useState } from 'react';
import api from '../utils/api';

const DonorDashboard = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantityKg: '',
    category: 'VEG',
    cookedTime: ''
  });
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file too large. Max 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result); // Full Data URI
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isNaN(parseFloat(formData.quantityKg))) {
      setError('Quantity must be a valid number (e.g., 20.5)');
      setLoading(false);
      return;
    }

    try {
      // Backend expects: 2026-03-13T10:00:00 format
      const formattedDate = new Date(formData.cookedTime).toISOString().slice(0, 19);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        quantityKg: parseFloat(formData.quantityKg),
        category: formData.category,
        cookedTime: formattedDate,
        imageBase64: imageBase64
      };

      await api.post('/food', payload);
      setSuccess('Food listing created successfully!');
      setFormData({ title: '', description: '', quantityKg: '', category: 'VEG', cookedTime: '' });
      setImageBase64('');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 w-full pb-12">
      {/* Header section */}
      <div className="mb-10 text-center animate-fade-in relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-500/20 rounded-full blur-[80px] -z-10"></div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          Donor <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Post your surplus food immediately with an image and accurate details. Earn Karma Points for successful rescues!
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr,300px] gap-8">
        {/* Form Form */}
        <div className="glass p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-green-400">🍽️</span> Post Food Donation
          </h2>

          {success && (
            <div data-testid="food-form-success" className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
              <span className="text-xl">✅</span> {success}
            </div>
          )}
          {error && (
             <div data-testid="food-form-error" className="bg-urgent-500/10 border border-urgent-500/30 text-urgent-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
               <span className="text-xl">⚠️</span> {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Food Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 50 Servings of Vegetable Biryani"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input [color-scheme:dark]"
                >
                  <option value="VEG">Vegetarian (VEG)</option>
                  <option value="NON_VEG">Non-Vegetarian (NON_VEG)</option>
                  <option value="PACKAGED">Packaged/Dry (PACKAGED)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Quantity (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="quantityKg"
                  required
                  value={formData.quantityKg}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 20.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
                placeholder="Details about the food, packaging, dietary info..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Cooked Time</label>
                <input
                  type="datetime-local"
                  name="cookedTime"
                  required
                  value={formData.cookedTime}
                  onChange={handleChange}
                  className="input [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Food Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="input flex items-center justify-between pointer-events-none bg-surface/80">
                    <span className="text-gray-400 truncate">
                      {imageBase64 ? 'Image Selected ✅' : 'Choose an image...'}
                    </span>
                    <span className="text-green-400">📁</span>
                  </div>
                </div>
              </div>
            </div>

            {imageBase64 && (
              <div className="w-full h-40 rounded-xl overflow-hidden border border-surface-border mt-4">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 text-base shadow-lg shadow-green-500/20">
              {loading ? 'Posting Listing...' : 'Publish Listing'}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 mx-auto flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-4">
              ✨
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Your Karma</h3>
            <p className="text-3xl font-black gradient-text mb-2">Check Navbar</p>
            <p className="text-sm text-gray-400">NGOs can rate food quality (1-5 stars). 4+ stars grants +10 bonus Karma!</p>
          </div>

          <div className="glass p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-gray-400">How it works</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-surface-border flex items-center justify-center shrink-0">1</div>
                <p className="text-gray-300">Upload an image and set correct category.</p>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-surface-border flex items-center justify-center shrink-0">2</div>
                <p className="text-gray-300">NGOs claim it based on distance & freshness.</p>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-surface-border flex items-center justify-center shrink-0">3</div>
                <p className="text-gray-300">You gain Karma after NGOs rate it high!</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
