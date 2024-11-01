import React, { useEffect, useState } from 'react';

interface SpotifyPlayerProps {
  trackId: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  onReady: () => void;
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
  onReady
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

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

      player.addListener('player_state_changed', (state: any) => {
        if (state && !isInitialized) {
          setIsInitialized(true);
          onReady();
        }
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

      // Pre-load the track
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

      // Immediately pause to prepare for playback
      setTimeout(async () => {
        await player.pause();
      }, 100);
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  useEffect(() => {
    const handlePlayback = async () => {
      if (!player || !deviceId || !trackId || !isInitialized) return;

      try {
        if (isPlaying) {
          await player.resume();
        } else {
          await player.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    };

    handlePlayback();
  }, [trackId, isPlaying, player, deviceId, isInitialized]);

  return null;
};
