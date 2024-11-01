import React, { useRef, useEffect, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';

interface SpotifyPreviewPlayerProps {
  previewUrl: string | null;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
}

export const SpotifyPreviewPlayer: React.FC<SpotifyPreviewPlayerProps> = ({
  previewUrl,
  onPlay,
  onPause,
  isPlaying
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTimeRef = useRef<number>(0);

  const handleEnded = useCallback(() => {
    onPause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [onPause]);

  useEffect(() => {
    if (!previewUrl) return;
    
    audioRef.current = new Audio(previewUrl);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        currentTimeRef.current = audioRef.current.currentTime;
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [previewUrl, handleEnded]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.currentTime = currentTimeRef.current;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        onPause();
      });
    } else {
      currentTimeRef.current = audioRef.current.currentTime;
      audioRef.current.pause();
    }
  }, [isPlaying, onPause]);

  const togglePlayPause = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  if (!previewUrl) {
    return (
      <div className="text-red-500 text-sm">
        Preview not available for this track
      </div>
    );
  }

  return (
    <button
      onClick={togglePlayPause}
      className="bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center transition"
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};
