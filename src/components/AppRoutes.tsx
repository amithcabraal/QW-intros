import React, { useState } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Login } from './Login';
import { SpotifyCallback } from './SpotifyCallback';
import { GameRoom } from './GameRoom';
import { HowToPlay } from './HowToPlay';
import { Privacy } from './Privacy';
import { Contact } from './Contact';
import { Navigation } from './Navigation';
import { MockReveal } from './MockReveal';

export function AppRoutes() {
  const isAuthenticated = !!localStorage.getItem('spotify_token');
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('track');
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  return (
    <>
      {isAuthenticated && window.location.pathname !== '/login' && (
        <Navigation 
          onLogout={() => {
            localStorage.removeItem('spotify_token');
            window.location.href = '/login';
          }}
          onDeviceSelect={setCurrentDeviceId}
        />
      )}
      
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <GameRoom 
                initialTrackId={trackId} 
                currentDeviceId={currentDeviceId}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route 
          path="/how-to-play" 
          element={isAuthenticated ? <HowToPlay /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/privacy" 
          element={isAuthenticated ? <Privacy /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/contact" 
          element={isAuthenticated ? <Contact /> : <Navigate to="/login" />} 
        />
        <Route path="/mock" element={<MockReveal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
