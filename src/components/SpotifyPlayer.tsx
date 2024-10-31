import React, { useEffect, useRef } from 'react';

interface SpotifyPlayerProps {
  trackId: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ 
  trackId, 
  onPlay, 
  onPause,
  isPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTrackPreview = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch track');
        
        const track = await response.json();
        if (audioRef.current) {
          audioRef.current.src = track.preview_url;
          audioRef.current.load();
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        onPause();
      }
    };

    fetchTrackPreview();
  }, [trackId]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback failed:', error);
          onPause();
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      audio.currentTime = 0;
      onPause();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [onPause]);

  return
