import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Login } from './Login';
import { SpotifyCallback } from './SpotifyCallback';
import { GameRoom } from './GameRoom';

export function AppRoutes() {
  const isAuthenticated = !!localStorage.getItem('spotify_token');
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('track');

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <GameRoom initialTrackId={trackId} /> : <Navigate to="/login" />} 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<SpotifyCallback />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
