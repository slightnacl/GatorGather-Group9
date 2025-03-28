// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import existing pages
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Home from './Home'; // Keep this for the main dashboard route

// Import new placeholder pages
import Events from './Events';
import MapPage from './MapPage'; // Use the new name
import CreateEvent from './CreateEvent';
import Profile from './Profile';



// Import CSS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if user exists, false otherwise
      setIsLoading(false); // Finished checking auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show loading indicator while checking auth state
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/home" />} />

        {/* Protected Routes */}
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/events" element={isAuthenticated ? <Events /> : <Navigate to="/login" />} />
        <Route path="/map" element={isAuthenticated ? <MapPage /> : <Navigate to="/login" />} />
        <Route path="/create-event" element={isAuthenticated ? <CreateEvent /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

        {/* Optional: Redirect any unknown paths for authenticated users to home */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;