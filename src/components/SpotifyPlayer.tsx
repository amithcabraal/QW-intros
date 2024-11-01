import React, { useEffect, useState, useCallback } from 'react';
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

  const initializePlayer = useCallback(() => {
    const player = new window.Spotify.Player({
      name: 'Beat the Intro Web Player',
      getOAuthToken: cb => cb(localStorage.getItem('spotify_token') || ''),
      volume: 0.5
    });

    // Handle player state changes
    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;

      // If the track ends, pause our game
      if (state.paused && state.position === 0) {
        onPause();
      }
    });

    player.addListener('ready', async ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
      setIsReady(true);

      // Immediately transfer playback to our device
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
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
      } catch (err) {
        console.error('Error transferring playback:', err);
      }
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
      setIsReady(false);
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Failed to initialize:', message);
      setError('Failed to initialize player');
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Failed to authenticate:', message);
      setError('Authentication failed');
      localStorage.removeItem('spotify_token');
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
  }, [onPause]);

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

  // Control playback based on isPlaying prop
  useEffect(() => {
    const controlPlayback = async () => {
      if (!isReady || !deviceId || !trackId) return;

      try {
        if (isPlaying) {
          // Start playback of the track
          await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
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
        } else {
          // Pause playback
          await fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
            }
          });
        }
      } catch (err) {
        console.error('Playback control error:', err);
        setError('Failed to control playback');
        onPause();
      }
    };

    controlPlayback();
  }, [isPlaying, deviceId, trackId, isReady]);

  const handlePlayPause = () => {
    if (error) {
      setError(null);
      window.location.reload();
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
