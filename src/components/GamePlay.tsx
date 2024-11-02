import React, { useRef } from 'react';
import { Music, Timer, Pause, Play, Mic, Loader2 } from 'lucide-react';
import { SpotifyTrack } from '../types/game';
import { SpotifyPlayer } from './SpotifyPlayer';
import { SpotifyPreviewPlayer } from './SpotifyPreviewPlayer';
import { CircularProgress } from './CircularProgress';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface GamePlayProps {
  track: SpotifyTrack;
  answer: string;
  artistAnswer: string;
  onAnswerChange: (value: string) => void;
  onArtistAnswerChange: (value: string) => void;
  onSubmit: () => void;
  elapsedTime: number;
  isPlaying: boolean;
  hasStarted: boolean;
  onPlayPause: (playing: boolean) => void;
  isPremium?: boolean;
  isLoading: boolean;
}

export const GamePlay: React.FC<GamePlayProps> = ({
  track,
  answer,
  artistAnswer,
  onAnswerChange,
  onArtistAnswerChange,
  onSubmit,
  elapsedTime,
  isPlaying,
  hasStarted,
  onPlayPause,
  isPremium = false,
  isLoading
}) => {
  const { startListening: startTitleListening } = useSpeechRecognition(onAnswerChange);
  const { startListening: startArtistListening } = useSpeechRecognition(onArtistAnswerChange);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds * 100) % 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  return (
    <div className="max-w-2xl mx-auto landscape:max-w-none landscape:flex landscape:items-center landscape:gap-8">
      <div className="flex flex-col items-center justify-center mb-8 landscape:mb-0 landscape:w-1/2">
        <div className="relative">
          <button
            ref={playButtonRef}
            onClick={() => !isLoading && onPlayPause(!isPlaying)}
            className={`w-40 h-40 rounded-full bg-white/5 dark:bg-gray-700/50 flex items-center justify-center transition-all duration-500 hover:bg-white/10 dark:hover:bg-gray-600/50 ${
              isPlaying ? 'scale-110' : ''
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-20 h-20 text-green-400 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-20 h-20 text-green-400" />
            ) : (
              <Play className="w-20 h-20 text-green-400" />
            )}
            {isPlaying && <CircularProgress progress={(elapsedTime / 30) * 100} />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-3xl font-mono bg-white/5 dark:bg-gray-700/50 rounded-full px-6 py-3 mt-6">
          <Timer className="w-6 h-6" />
          <span>{formatTime(elapsedTime)}</span>
        </div>

        <div className="sr-only">
          {isPremium ? (
            <SpotifyPlayer 
              trackId={track.id}
              onPlay={() => onPlayPause(true)}
              onPause={() => onPlayPause(false)}
              isPlaying={isPlaying}
            />
          ) : (
            <SpotifyPreviewPlayer
              previewUrl={track.preview_url}
              onPlay={() => onPlayPause(true)}
              onPause={() => onPlayPause(false)}
              isPlaying={isPlaying}
            />
          )}
        </div>
      </div>

      <div className="space-y-4 landscape:w-1/2">
        <div className="relative">
          <input
            type="text"
            placeholder="Song title..."
            className="w-full bg-white/5 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600 rounded-lg px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          />
          <button
            onClick={startTitleListening}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <Mic className="w-5 h-5 text-green-400" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Artist name..."
            className="w-full bg-white/5 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600 rounded-lg px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={artistAnswer}
            onChange={(e) => onArtistAnswerChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          />
          <button
            onClick={startArtistListening}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <Mic className="w-5 h-5 text-green-400" />
          </button>
        </div>

        <button
          onClick={onSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 justify-center transition transform hover:scale-105"
        >
          Guess
        </button>
      </div>
    </div>
  );
};
