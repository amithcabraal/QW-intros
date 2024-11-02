import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { fetchPlaylistTracks, checkSpotifyPremium } from '../utils/spotify';
import { GenreSelection } from './GenreSelection';
import { PlaylistSelection } from './PlaylistSelection';
import { GamePlay } from './GamePlay';
import { RevealScreen } from './RevealScreen';
import { genres } from '../data/genres';
import { areSimilar } from '../utils/stringMatch';
import { calculateScore } from '../utils/scoring';
import type { Genre, GameState, SpotifyTrack } from '../types/game';
import type { Playlist } from '../types/spotify';

interface GameRoomProps {
  initialTrackId?: string | null;
}

export const GameRoom: React.FC<GameRoomProps> = ({ initialTrackId }) => {
  // ... (previous code remains the same until startTrack function)

  const startTrack = (track: SpotifyTrack) => {
    setGameState(prev => ({
      ...prev,
      currentTrack: track,
      gameStatus: 'playing',
      timeLeft: 30,
      playedTracks: new Set([...prev.playedTracks, track.id])
    }));
    setElapsedTime(0);
    setHasStarted(false);
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);

    // Save to history with additional IDs
    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    if (history.length >= 20) {
      history.pop(); // Remove oldest entry
    }
    history.unshift({
      trackId: track.id,
      name: track.name,
      artist: track.artists[0].name,
      artistId: track.artists[0].id,
      albumId: track.album.id,
      albumImage: track.album.images[0]?.url,
      timestamp: new Date().toISOString(),
      score: 0
    });
    localStorage.setItem('game_history', JSON.stringify(history));
  };

  // ... (rest of the code remains the same)
};
