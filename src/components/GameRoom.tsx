import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { fetchPlaylistTracks, checkSpotifyPremium } from '../utils/spotify';
import { GenreSelection } from './GenreSelection';
import { PlaylistSelection } from './PlaylistSelection';
import { GamePlay } from './GamePlay';
import { RevealScreen } from './RevealScreen';
import { Navigation } from './Navigation';
import { genres } from '../data/genres';
import { areSimilar } from '../utils/stringMatch';
import { calculateScore } from '../utils/scoring';
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
    timeLeft: 30,
    playedTracks: new Set()
  });
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [answer, setAnswer] = useState('');
  const [artistAnswer, setArtistAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const hasPremium = await checkSpotifyPremium();
        setIsPremium(hasPremium);
        document.title = hasPremium ? 'Beat the Intro' : 'Name that Tune';
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (initialTrackId) {
      const fetchInitialTrack = async () => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/tracks/${initialTrackId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`,
            }
          });
          if (!response.ok) throw new Error('Failed to fetch track');
          const track = await response.json();
          setGameState(prev => ({
            ...prev,
            currentTrack: track,
            gameStatus: 'playing'
          }));
          setTracks([track]);
        } catch (error) {
          console.error('Failed to fetch initial track:', error);
          setGameState(prev => ({ ...prev, gameStatus: 'selecting' }));
        }
      };
      fetchInitialTrack();
    }
  }, [initialTrackId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && hasStarted) {
      timer = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 0.01;
          if (newTime >= 30) {
            handleAnswerSubmit();
            return 30;
          }
          return newTime;
        });
      }, 10);
    }
    return () => clearInterval(timer);
  }, [isPlaying, hasStarted]);

  const startGame = useCallback((availableTracks: SpotifyTrack[]) => {
    const unplayedTracks = availableTracks.filter(track => 
      !gameState.playedTracks.has(track.id)
    );

    if (unplayedTracks.length === 0) {
      if (availableTracks.length === 0) {
        setError('No playable tracks found in this playlist. Try another one!');
      } else {
        // Reset played tracks if all have been played
        setGameState(prev => ({ ...prev, playedTracks: new Set() }));
        const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        startTrack(randomTrack);
      }
      return;
    }

    const randomTrack = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
    startTrack(randomTrack);
  }, [gameState.playedTracks]);

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
  };

  const handleGenreSelect = async (genre: Genre) => {
    try {
      const data = await fetchPlaylistTracks(genre.playlistId);
      if (!data) {
        navigate('/login');
        return;
      }
      const validTracks = data.items
        .map((item: any) => item.track)
        .filter((track: SpotifyTrack) => track && track.preview_url);
      
      setTracks(validTracks);
      startGame(validTracks);
    } catch (error) {
      console.error('Failed to load tracks:', error);
      setError('Failed to load tracks. Please try again.');
      navigate('/login');
    }
  };

  const handlePlaylistSelect = async (playlist: Playlist) => {
    try {
      const data = await fetchPlaylistTracks(playlist.id);
      if (!data) {
        navigate('/login');
        return;
      }
      const validTracks = data.items
        .map((item: any) => item.track)
        .filter((track: SpotifyTrack) => track && track.preview_url);
      
      setTracks(validTracks);
      setShowPlaylists(false);
      startGame(validTracks);
    } catch (error) {
      console.error('Failed to load tracks:', error);
      setError('Failed to load tracks. Please try again.');
    }
  };

  const handleAnswerSubmit = () => {
    setIsPlaying(false);
    setHasStarted(false);
    const isCorrectTitle = isCorrectAnswer();
    const isCorrectArtist = isCorrectArtist();
    const points = calculateScore(isCorrectTitle, isCorrectArtist, elapsedTime);
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'revealed',
      score: prev.score + points
    }));
  };

  const isCorrectAnswer = () => {
    if (!gameState.currentTrack) return false;
    return areSimilar(answer, gameState.currentTrack.name);
  };

  const isCorrectArtist = () => {
    if (!gameState.currentTrack) return false;
    return areSimilar(artistAnswer, gameState.currentTrack.artists[0].name);
  };

  const handleNextSong = () => {
    if (initialTrackId) {
      setGameState(prev => ({ ...prev, gameStatus: 'selecting' }));
      setTracks([]);
    } else {
      startGame(tracks);
    }
    setAnswer('');
    setArtistAnswer('');
  };

  const handlePlayPause = (playing: boolean) => {
    setIsLoading(true);
    setIsPlaying(playing);
    if (playing && !hasStarted) {
      setTimeout(() => {
        setIsLoading(false);
        setHasStarted(true);
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsPlaying(false);
    try {
      const token = localStorage.getItem('spotify_token');
      if (token) {
        await fetch('https://accounts.spotify.com/api/token/revoke', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      localStorage.removeItem('spotify_token');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white">
      <Navigation onLogout={handleLogout} />
      
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Music className="w-10 h-10 text-green-400" />
              <h1 className="text-3xl font-bold">{isPremium ? 'Beat the Intro' : 'Name that Tune'}</h1>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg">
              {error}
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
            isLoading={isLoading}
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
