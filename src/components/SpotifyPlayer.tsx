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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackPreview = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
          }
        });
        const data = await response.json();
        setPreviewUrl(data.preview_url);
      } catch (error) {
        console.error('Error fetching track preview:', error);
      }
    };

    fetchTrackPreview();
  }, [trackId]);

  useEffect(() => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Playback failed:', error);
        onPause();
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, previewUrl]);

  useEffect(() => {
    if (!audioRef.current || !previewUrl) return;
    audioRef.current.src = previewUrl;
    audioRef.current.load();
  }, [previewUrl]);

  return (
    <audio
      ref={audioRef}
      onEnded={() => onPause()}
      onError={() => onPause()}
      preload="auto"
    />
  );
};
