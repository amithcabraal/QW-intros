import React, { useEffect, useState } from 'react';

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
    if (!window.Spotify) {
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
        });

        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
          setIsReady(false);
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Failed to initialize', message);
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Failed to authenticate', message);
          localStorage.removeItem('spotify_token');
          window.location.href = '/login';
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Failed to validate Spotify account', message);
        });

        player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Failed to perform playback', message);
        });

        player.connect();
      };
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const setupPlayback = async () => {
      if (!isReady || !deviceId) return;

      try {
        // Transfer playback to our player
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
        console.error('Error setting up playback:', error);
      }
    };

    setupPlayback();
  }, [deviceId, isReady]);

  useEffect(() => {
    const handlePlayback = async () => {
      if (!isReady || !deviceId || !trackId) return;

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
        } else if (player) {
          await player.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
        onPause();
      }
    };

    handlePlayback();
  }, [trackId, isPlaying, deviceId, isReady, player, onPause]);

  // State change listener
  useEffect(() => {
    if (!player) return;

    const stateListener = ({ position, duration, paused }: any) => {
      if (position === 0 && !paused) {
        onPlay();
      } else if (paused) {
        onPause();
      }
    };

    player.addListener('player_state_changed', stateListener);

    return () => {
      player.removeListener('player_state_changed', stateListener);
    };
  }, [player, onPlay, onPause]);

  return null; // Web Playback SDK doesn't need a visual component
};
