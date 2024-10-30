import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onReady: () => void;
  onStateChange: (state: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onReady, onStateChange }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
        },
        events: {
          onReady,
          onStateChange: (event: any) => onStateChange(event.data),
        },
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return <div ref={containerRef} className="hidden" />;
};

export const useYouTubePlayer = () => {
  const playerRef = useRef<any>(null);

  const setPlayer = (player: any) => {
    playerRef.current = player;
  };

  const playVideo = () => {
    playerRef.current?.playVideo();
  };

  const pauseVideo = () => {
    playerRef.current?.pauseVideo();
  };

  const stopVideo = () => {
    playerRef.current?.stopVideo();
  };

  return { setPlayer, playVideo, pauseVideo, stopVideo };
};