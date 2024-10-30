import React, { useEffect, useState } from 'react';
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
        setDeviceId(device_id);
        setPlayer(player);
        transferPlayback(device_id);
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
    }
  };

  useEffect(() => {
    const handlePlayback = async () => {
      if (!player || !deviceId || !trackId) return;

      try {
        if (isPlaying) {
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
        } else {
          await player.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    };

    handlePlayback();
  }, [trackId, isPlaying, player, deviceId]);

  const togglePlayPause = async () => {
    if (!player) return;

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