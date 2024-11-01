import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Login } from './Login';
import { SpotifyCallback } from './SpotifyCallback';
import { GameRoom } from './GameRoom';
import { HowToPlay } from './HowToPlay';
import { Privacy } from './Privacy';
import { Contact } from './Contact';

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
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
