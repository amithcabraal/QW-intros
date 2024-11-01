import React, { useEffect, useState, useRef } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if browser is Safari
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);

    if (isSafariBrowser) {
      // Fetch preview URL for Safari
      const fetchPreviewUrl = async () => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch track');
          
          const data = await response.json();
          setPreviewUrl(data.preview_url);
          setIsReady(true);
        } catch (error) {
          console.error('Error fetching preview URL:', error);
        }
      };
      
      fetchPreviewUrl();
      return;
    }

    // Non-Safari browsers use Spotify Web Playback SDK
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
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, [trackId]);

  // Handle Safari audio playback
  useEffect(() => {
    if (isSafari && previewUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(previewUrl);
        audioRef.current.addEventListener('ended', () => {
          onPause();
        });
      } else {
        audioRef.current.src = previewUrl;
      }

      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            onPause();
          });
        }
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', onPause);
        audioRef.current = null;
      }
    };
  }, [isPlaying, previewUrl, isSafari, onPause]);

  const transferPlayback = async (deviceId: string) => {
    if (isSafari) return;

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
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error transferring playback:', error);
    }
  };

  useEffect(() => {
    if (!isSafari && isPlaying && isReady && deviceId) {
      const startPlayback = async () => {
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

          if (!response.ok && response.status !== 404) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error('Error starting playback:', error);
          onPause();
        }
      };

      startPlayback();
    } else if (!isSafari && !isPlaying && player) {
      player.pause().catch((error: Error) => {
        console.error('Error pausing playback:', error);
      });
    }
  }, [isPlaying, isReady, deviceId, trackId, player, isSafari, onPause]);

  const handlePlayPause = async (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <button
      onClick={handlePlayPause}
      disabled={!isReady || (isSafari && !previewUrl)}
      className={`bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition ${
        (!isReady || (isSafari && !previewUrl)) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};
