import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [playlistTitle, setPlaylistTitle] = useState<string>('');

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

    // Save to history
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
      setPlaylistTitle(genre.name);
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
      setPlaylistTitle(playlist.name);
      startGame(validTracks);
    } catch (error) {
      console.error('Failed to load tracks:', error);
      setError('Failed to load tracks. Please try again.');
    }
  };

  const handleAnswerSubmit = () => {
    if (!gameState.currentTrack) return;
    
    setIsPlaying(false);
    setHasStarted(false);
    const isCorrectTitle = isCorrectAnswer();
    const isCorrectArtist = isCorrectArtistAnswer();
    const points = calculateScore(isCorrectTitle, isCorrectArtist, elapsedTime);
    
    // Update history with results
    const history = JSON.parse(localStorage.getItem('game_history') || '[]');
    const currentTrackIndex = history.findIndex((item: any) => item.trackId === gameState.currentTrack?.id);
    if (currentTrackIndex !== -1) {
      history[currentTrackIndex] = {
        ...history[currentTrackIndex],
        score: points,
        userAnswer: answer,
        userArtistAnswer: artistAnswer,
        isCorrectTitle,
        isCorrectArtist,
        elapsedTime
      };
      localStorage.setItem('game_history', JSON.stringify(history));
    }
    
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

  const isCorrectArtistAnswer = () => {
    if (!gameState.currentTrack) return false;
    return areSimilar(artistAnswer, gameState.currentTrack.artists[0].name);
  };

  const handleNextSong = () => {
    setIsPlaying(false); // Stop any playing music
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

  const goToGenres = () => {
    setIsPlaying(false);
    setGameState(prev => ({ ...prev, gameStatus: 'selecting' }));
    setTracks([]);
    setShowPlaylists(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          <Link 
            to="/"
            onClick={goToGenres}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <Music className="w-10 h-10 text-green-400" />
              <h1 className="text-3xl font-bold">
                {isPremium ? 'Beat the Intro' : 'Name that Tune'}
                {playlistTitle && gameState.gameStatus !== 'selecting' && (
                  <span className="text-white/60"> - {playlistTitle}</span>
                )}
              </h1>
            </div>
          </Link>

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
            isArtistCorrect={isCorrectArtistAnswer()}
            score={gameState.score}
            onNextSong={handleNextSong}
            elapsedTime={elapsedTime}
          />
        )}
      </div>
    </div>
  );
};
