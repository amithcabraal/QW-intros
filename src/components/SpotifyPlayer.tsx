import React, { useEffect, useState, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

interface SpotifyPlayerProps {
  trackId: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  deviceId?: string;
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
  isPlaying,
  deviceId
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [webPlaybackDeviceId, setWebPlaybackDeviceId] = useState<string>('');
  const playbackStarted = useRef(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Beat the Intro Player',
        getOAuthToken: cb => { cb(localStorage.getItem('spotify_token') || ''); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setWebPlaybackDeviceId(device_id);
        setPlayer(player);
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Cleanup on logout
  useEffect(() => {
    const cleanup = async () => {
      if (webPlaybackDeviceId) {
        try {
          await fetch(`https://api.spotify.com/v1/me/player/devices`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              device_ids: [webPlaybackDeviceId]
            })
          });
        } catch (error) {
          console.error('Error cleaning up device:', error);
        }
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [webPlaybackDeviceId]);

  useEffect(() => {
    const handlePlayback = async () => {
      if (!trackId) return;

      try {
        if (isPlaying) {
          if (!playbackStarted.current) {
            await fetch(`https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`, {
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
            // Resume on selected device
            await fetch(`https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
              }
            });
          }
        } else {
          // Pause on selected device
          await fetch(`https://api.spotify.com/v1/me/player/pause${deviceId ? `?device_id=${deviceId}` : ''}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
            }
          });
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
        onPause();
      }
    };

    handlePlayback();
  }, [trackId, isPlaying, deviceId, onPause]);

  useEffect(() => {
    // Reset playbackStarted when trackId changes
    playbackStarted.current = false;
  }, [trackId]);

  const togglePlayPause = async () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <button
      onClick={togglePlayPause}
      className="bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition"
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};
