import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, LogOut, Home } from 'lucide-react';
import { fetchPlaylistTracks } from '../utils/spotify';
import { GenreSelection } from './GenreSelection';
import { PlaylistSelection } from './PlaylistSelection';
import { GamePlay } from './GamePlay';
import { RevealScreen } from './RevealScreen';
import { genres } from '../data/genres';
import { areSimilar } from '../utils/stringMatch';
import type { Genre, GameState, SpotifyTrack } from '../types/game';
import type { Playlist } from '../types/spotify';

interface GameRoomProps {
  initialTrackId?: string | null;
}

export const GameRoom: React.FC<GameRoomProps> = ({ initialTrackId }) => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    currentTrack: null,
    score: 0,
    gameStatus: initialTrackId ? 'playing' : 'selecting',
    timeLeft: 30
  });
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [answer, setAnswer] = useState('');
  const [artistAnswer, setArtistAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    if (!token) {
      navigate('/login');
    } else {
      // Check if user has premium
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setIsPremium(data.product === 'premium');
        document.title = isPremium ? 'Beat the Intro' : 'Name that Tune';
      })
      .catch(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  // ... rest of the component remains exactly the same until the return statement

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Music className="w-10 h-10 text-green-400" />
              <h1 className="text-3xl font-bold">
                {isPremium ? 'Beat the Intro' : 'Name that Tune'}
              </h1>
            </div>
          </div>

          {gameState.gameStatus !== 'selecting' && (
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">
                Score: {gameState.score}
              </div>
              <button
                onClick={handleReturnToGenres}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition"
              >
                <Home size={20} />
                Return to Genres
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          )}
        </div>

        {gameState.gameStatus === 'selecting' && !showPlaylists && (
          <GenreSelection 
            genres={genres} 
            onGenreSelect={handleGenreSelect}
            onShowPlaylists={() => setShowPlaylists(true)}
          />
        )}

        {gameState.gameStatus === 'selecting' && showPlaylists && (
          <PlaylistSelection
            onPlaylistSelect={handlePlaylistSelect}
            onBack={() => setShowPlaylists(false)}
          />
        )}

        {gameState.gameStatus === 'playing' && gameState.currentTrack && (
          <GamePlay
            track={gameState.currentTrack}
            answer={answer}
            artistAnswer={artistAnswer}
            onAnswerChange={setAnswer}
            onArtistAnswerChange={setArtistAnswer}
            onSubmit={handleAnswerSubmit}
            elapsedTime={elapsedTime}
            isPlaying={isPlaying}
            hasStarted={hasStarted}
            onPlayPause={handlePlayPause}
            isPremium={isPremium}
          />
        )}

        {gameState.gameStatus === 'revealed' && gameState.currentTrack && (
          <RevealScreen
            track={gameState.currentTrack}
            userAnswer={answer}
            userArtistAnswer={artistAnswer}
            isCorrect={isCorrectAnswer()}
            isArtistCorrect={isCorrectArtist()}
            score={gameState.score}
            onNextSong={handleNextSong}
            elapsedTime={elapsedTime}
          />
        )}
      </div>
    </div>
  );
};
