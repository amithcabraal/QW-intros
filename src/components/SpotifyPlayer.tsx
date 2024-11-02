import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

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
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem('spotify-volume')) || 0.5;
  });
  const [error, setError] = useState<string>('');
  const playbackStarted = useRef(false);
  const tokenRefreshTimeout = useRef<NodeJS.Timeout>();

  const handleError = useCallback((message: string) => {
    setError(message);
    onPause();
  }, [onPause]);

  const refreshToken = useCallback(async () => {
    // Implement your token refresh logic here
    // This is a placeholder that should be replaced with your actual token refresh implementation
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      });
      
      if (response.ok) {
        const { access_token, expires_in } = await response.json();
        localStorage.setItem('spotify_token', access_token);
        
        // Schedule next refresh
        tokenRefreshTimeout.current = setTimeout(refreshToken, (expires_in - 60) * 1000);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleError('Failed to refresh authentication. Please log in again.');
    }
  }, [handleError]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Beat the Intro Player',
        getOAuthToken: cb => {
          const token = localStorage.getItem('spotify_token');
          if (token) {
            cb(token);
            // Schedule token refresh
            tokenRefreshTimeout.current = setTimeout(refreshToken, 3600 * 1000);
          }
        },
        volume
      });

      // Error handling
      player.addListener('initialization_error', ({ message }: { message: string }) => {
        handleError(`Failed to initialize player: ${message}`);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        handleError('Authentication failed. Please log in again.');
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        handleError('Premium account required for playback.');
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        handleError(`Playback failed: ${message}`);
      });

      // Playback status updates
      player.addListener('player_state_changed', (state: any) => {
        if (!state) {
          return;
        }

        // Update UI based on state
        if (state.paused) {
          onPause();
        } else {
          onPlay();
        }

        // Update volume if changed externally
        if (state.volume !== volume) {
          setVolume(state.volume);
          localStorage.setItem('spotify-volume', String(state.volume));
        }
      });

      // Ready handling
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayer(player);
        transferPlayback(device_id);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
      if (tokenRefreshTimeout.current) {
        clearTimeout(tokenRefreshTimeout.current);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  const transferPlayback = async (deviceId: string) => {
    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });
    } catch (error) {
      console.error('Error transferring playback:', error);
      handleError('Failed to initialize playback. Please try again.');
    }
  };

  useEffect(() => {
    const handlePlayback = async () => {
      if (!player || !deviceId || !trackId) return;

      try {
        const state = await player.getCurrentState();
        
        if (isPlaying) {
          if (!playbackStarted.current || (state && state.track_window.current_track.id !== trackId)) {
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
              },
              body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
                position_ms: 0
              })
            });
            playbackStarted.current = true;
          } else {
            await player.resume();
          }
        } else {
          await player.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
        handleError('Playback control failed. Please try again.');
      }
    };

    handlePlayback();
  }, [trackId, isPlaying, player, deviceId, handleError]);

  useEffect(() => {
    playbackStarted.current = false;
  }, [trackId]);

  const handleVolumeChange = async (newVolume: number) => {
    if (!player) return;
    
    try {
      await player.setVolume(newVolume);
      setVolume(newVolume);
      localStorage.setItem('spotify-volume', String(newVolume));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const toggleMute = () => {
    const previousVolume = Number(localStorage.getItem('spotify-previous-volume')) || 0.5;
    handleVolumeChange(volume > 0 ? 0 : previousVolume);
    localStorage.setItem('spotify-previous-volume', String(volume));
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/20 rounded-lg px-4 py-2">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => isPlaying ? onPause() : onPlay()}
        className="bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="p-2 hover:bg-white/10 rounded-full transition"
          aria-label={volume > 0 ? 'Mute' : 'Unmute'}
        >
          {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-24 accent-green-500"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};
