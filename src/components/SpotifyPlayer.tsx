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
  const [isReady, setIsReady] = useState(false);

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
        setIsReady(true);
        transferPlayback(device_id);
      });

      player.addListener('not_ready', () => {
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Failed to initialize:', message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Failed to authenticate:', message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Failed to validate Spotify account:', message);
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
      const response = await fetch('https://api.spotify.com/v1/me/player', {
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  const startPlayback = async () => {
    if (!isReady || !deviceId || !trackId) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onPlay();
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const stopPlayback = async () => {
    if (!player) return;
    try {
      await player.pause();
      onPause();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      stopPlayback();
    }
  }, [isPlaying]);

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent any default behavior
    
    if (isPlaying) {
      await stopPlayback();
    } else {
      await startPlayback();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isReady}
      className={`bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};
