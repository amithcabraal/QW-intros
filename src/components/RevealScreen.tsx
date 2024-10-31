import React from 'react';
import { SkipForward, Check, X, Music2, Share2, ExternalLink } from 'lucide-react';
import { SpotifyTrack } from '../types/game';
import { calculateSimilarity } from '../utils/stringMatch';

interface RevealScreenProps {
  track: SpotifyTrack;
  userAnswer: string;
  userArtistAnswer: string;
  isCorrect: boolean;
  isArtistCorrect: boolean;
  score: number;
  onNextSong: () => void;
  elapsedTime: number;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({ 
  track, 
  userAnswer,
  userArtistAnswer,
  isCorrect,
  isArtistCorrect,
  score, 
  onNextSong,
  elapsedTime
}) => {
  const titleSimilarity = calculateSimilarity(userAnswer, track.name);
  const artistSimilarity = calculateSimilarity(userArtistAnswer, track.artists[0].name);

  const getScoreClass = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-500 scale-110';
    if (similarity >= 0.6) return 'bg-yellow-500 scale-105';
    return 'bg-red-500';
  };

  const getScoreEmoji = (similarity: number) => {
    if (similarity >= 0.8) return '🎯';
    if (similarity >= 0.6) return '👍';
    return '❌';
  };

  const handleShare = async () => {
    const shareText = `🎵 Try this Beat the Intro!\n\n${isCorrect ? `I got it in ${Math.round(elapsedTime)} seconds!` : "I couldn't get this one!"}\n\nCan you beat me? Try now: https://qw-intros.netlify.app?track=${track.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
        <div className="relative">
          <a 
            href={`https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group"
          >
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-48 h-48 mx-auto rounded-lg shadow-lg ring-4 ring-white/10 transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </a>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <Music2 className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{track.name}</h2>
            <p className="text-xl text-white/80">{track.artists[0].name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg transition-all duration-300 ${getScoreClass(titleSimilarity)} bg-opacity-20`}>
              <h3 className="text-lg font-semibold mb-2">Song Title</h3>
              <p className="text-2xl mb-1">{getScoreEmoji(titleSimilarity)}</p>
              <p className="text-sm opacity-80">Your answer:</p>
              <p className="font-medium">{userAnswer || '(no answer)'}</p>
              <p className="text-xs mt-2">
                Accuracy: {Math.round(titleSimilarity * 100)}%
              </p>
            </div>

            <div className={`p-6 rounded-lg transition-all duration-300 ${getScoreClass(artistSimilarity)} bg-opacity-20`}>
              <h3 className="text-lg font-semibold mb-2">Artist</h3>
              <p className="text-2xl mb-1">{getScoreEmoji(artistSimilarity)}</p>
              <p className="text-sm opacity-80">Your answer:</p>
              <p className="font-medium">{userArtistAnswer || '(no answer)'}</p>
              <p className="text-xs mt-2">
                Accuracy: {Math.round(artistSimilarity * 100)}%
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-2xl font-bold">
              Score: {score} {isCorrect || isArtistCorrect ? (
                <span className="text-green-400">
                  (+{(isCorrect ? 1 : 0) + (isArtistCorrect ? 1 : 0)} points)
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleShare}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 transition transform hover:scale-105"
              >
                <Share2 size={20} />
                Share Result
              </button>

              <button
                onClick={onNextSong}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 transition transform hover:scale-105"
              >
                <SkipForward size={20} />
                Next Song
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
