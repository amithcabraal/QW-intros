import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

interface SpotifyPlayerProps {
  trackId: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ 
  trackId, 
  onPlay, 
  onPause,
  isPlaying
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const currentTrackRef = useRef<string | null>(null);

  const checkPlaybackState = useCallback(async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get playback state');
      }

      const data = await response.json();
      if (!data.is_playing && isPlaying) {
        // Playback stopped unexpectedly, retry
        controlPlayback(true);
      }
    } catch (err) {
      console.error('Error checking playback state:', err);
    }
  }, [isPlaying]);

  const controlPlayback = async (forcePlay = false) => {
    if (!isReady || !deviceId || !trackId) return;

    try {
      if (isPlaying || forcePlay) {
        // Only start playback if the track has changed or playback was forced
        if (currentTrackRef.current !== trackId || forcePlay) {
          const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uris: [`spotify:track:${trackId}`],
              position_ms: 0
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          currentTrackRef.current = trackId;
          
          // Set up periodic check for playback state
          const checkInterval = setInterval(() => {
            checkPlaybackState();
          }, 2000);

          return () => clearInterval(checkInterval);
        }
      } else {
        await fetch('https://api.spotify.com/v1/me/player/pause', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
          }
        });
      }

      retryCount.current = 0; // Reset retry count on successful playback
    } catch (err) {
      console.error('Playback control error:', err);
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`Retrying playback (attempt ${retryCount.current}/${maxRetries})...`);
        setTimeout(() => controlPlayback(true), 1000 * retryCount.current);
      } else {
        setError('Failed to control playback');
        onPause();
      }
    }
  };

  const initializePlayer = useCallback(() => {
    const player = new window.Spotify.Player({
      name: 'Beat the Intro Web Player',
      getOAuthToken: cb => cb(localStorage.getItem('spotify_token') || ''),
      volume: 0.5
    });

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;

      if (state.paused && state.position === 0) {
        onPause();
      }

      // Handle unexpected pauses
      if (state.paused && isPlaying) {
        controlPlayback(true);
      }
    });

    player.addListener('ready', async ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
      setIsReady(true);

      try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error transferring playback:', err);
        // Retry transfer if it fails
        setTimeout(() => {
          player.connect();
        }, 1000);
      }
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
      setIsReady(false);
      // Attempt to reconnect
      setTimeout(() => {
        player.connect();
      }, 1000);
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Failed to initialize:', message);
      setError('Failed to initialize player');
      // Attempt to reinitialize
      setTimeout(() => {
        player.connect();
      }, 1000);
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Failed to authenticate:', message);
      setError('Authentication failed');
      localStorage.removeItem('spotify_token');
      window.location.href = '/login';
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('Failed to validate Spotify account:', message);
      setError('Premium account required');
    });

    player.connect().then((success: boolean) => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
      }
    });

    setPlayer(player);

    return () => {
      player.disconnect();
    };
  }, [onPause, isPlaying]);

  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializePlayer();
    }
  }, [initializePlayer]);

  useEffect(() => {
    const cleanup = controlPlayback();
    return () => {
      if (cleanup) cleanup();
    };
  }, [isPlaying, deviceId, trackId, isReady]);

  const handlePlayPause = () => {
    if (error) {
      setError(null);
      retryCount.current = 0;
      initializePlayer();
      return;
    }

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  if (error) {
    return (
      <div className="text-center">
        <button
          onClick={handlePlayPause}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm"
        >
          {error} - Click to retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handlePlayPause}
      disabled={!isReady}
      className={`bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition ${
        !isReady ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};
