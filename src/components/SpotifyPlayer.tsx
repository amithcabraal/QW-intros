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

  // Initialize the Spotify Web Playback SDK
  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Beat the Intro Web Player',
          getOAuthToken: cb => cb(localStorage.getItem('spotify_token') || ''),
          volume: 0.5
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsReady(true);
          
          // Transfer playback to our player
          fetch('https://api.spotify.com/v1/me/player', {
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

        player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Failed to perform playback:', message);
          setError('Playback failed');
        });

        player.connect();
        setPlayer(player);
      };
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Control playback based on isPlaying prop
  useEffect(() => {
    const controlPlayback = async () => {
      if (!isReady || !deviceId) return;

      try {
        if (isPlaying) {
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
            throw new Error('Failed to start playback');
          }
        } else if (player) {
          await player.pause();
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
