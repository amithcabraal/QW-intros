import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { SpotifyCallback } from './components/SpotifyCallback';
import { GameRoom } from './components/GameRoom';

function App() {
  const isAuthenticated = !!localStorage.getItem('spotify_token');

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <GameRoom /> : <Navigate to="/login" />} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;