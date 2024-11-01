import React from 'react';
import { Music, Timer, Pause, Play } from 'lucide-react';
import { SpotifyTrack } from '../types/game';
import { SpotifyPlayer } from './SpotifyPlayer';

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
  onPlayPause
}) => {
  const [isReady, setIsReady] = React.useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds * 100) % 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (playing: boolean) => {
    if (!isReady) return;
    onPlayPause(playing);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          <div className="relative">
            <button
              onClick={() => handlePlayPause(!isPlaying)}
              className={`w-40 h-40 rounded-full transition-all duration-500 ${
                isReady ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5 cursor-not-allowed opacity-50'
              } ${isPlaying ? 'scale-110' : ''}`}
              disabled={!isReady}
            >
              {isPlaying ? (
                <Pause className="w-20 h-20 text-green-400" />
              ) : (
                <Play className="w-20 h-20 text-green-400" />
              )}
              {isPlaying && isReady && (
                <div className="absolute w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/20" />
                </div>
              )}
            </button>
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-3xl font-mono bg-white/5 rounded-full px-6 py-3">
            <Timer className="w-6 h-6" />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          <SpotifyPlayer 
            trackId={track.id}
            onPlay={() => handlePlayPause(true)}
            onPause={() => handlePlayPause(false)}
            isPlaying={isPlaying}
            onReady={() => setIsReady(true)}
          />
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Song title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
              autoFocus
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Artist name..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              value={artistAnswer}
              onChange={(e) => onArtistAnswerChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 mx-auto transition"
        >
          Submit Guess
        </button>
      </div>
    </div>
  );
};
