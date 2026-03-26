import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NgoFeed from './pages/NgoFeed';
import Leaderboard from './pages/Leaderboard';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import DonorProfile from './pages/DonorProfile'; // feature 5
import AdminLogin from './pages/AdminLogin'; // feature 7
import AdminDashboard from './pages/AdminDashboard'; // feature 7

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          
          <Navbar />
          
          <main className="flex-1 flex flex-col items-center w-full px-4 sm:px-6 relative z-10">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'NGO']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['DONOR']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ngo-feed" 
                element={
                  <ProtectedRoute allowedRoles={['NGO']}>
                    <NgoFeed />
                  </ProtectedRoute>
                } 
              />
              {/* Feature 5 */}
              <Route 
                path="/donor/:username" 
                element={
                  <ProtectedRoute allowedRoles={['NGO']}>
                    <DonorProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Feature 7 - Admin (Secret) */}
              <Route path="/xadmin9/login" element={<AdminLogin />} />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Default Redirect */}
              <Route path="/" element={<Welcome />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="py-6 border-t border-surface-border text-center text-gray-500 text-sm mt-auto relative z-10 w-full bg-surface">
            &copy; {new Date().getFullYear()} NutriConnect. Rescuing food, feeding hope.
          </footer>
          <Chatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
