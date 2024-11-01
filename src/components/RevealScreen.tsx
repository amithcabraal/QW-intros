import React from 'react';
import { SkipForward, Share2, ExternalLink, Music2, Clock } from 'lucide-react';
import { SpotifyTrack } from '../types/game';
import { calculateSimilarity } from '../utils/stringMatch';
import { motion } from 'framer-motion';

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

  const getScoreEmoji = (similarity: number) => {
    if (similarity >= 0.8) return '🎯';
    if (similarity >= 0.6) return '👍';
    return '❌';
  };

  const handleShare = async () => {
    const shareText = `🎵 Try this Beat the Intro!\n\n${isCorrect ? `I got it in ${Math.round(elapsedTime)} seconds!` : "I couldn't get this one!"}\n\nCan you beat me? Try now: https://qw-intros.netlify.app?track=${track.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-8">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mx-auto mb-8"
        >
          <a 
            href={`https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group"
          >
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-64 h-64 mx-auto rounded-lg shadow-xl ring-4 ring-white/10 transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </a>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            <Music2 className="w-6 h-6 text-green-400" />
          </div>
        </motion.div>

        <div className="mt-12 space-y-6">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              {track.name}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80"
            >
              {track.artists[0].name}
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Song Title', similarity: titleSimilarity, answer: userAnswer },
              { label: 'Artist', similarity: artistSimilarity, answer: userArtistAnswer }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-6 rounded-lg bg-opacity-20 ${
                  item.similarity >= 0.8 ? 'bg-green-500' :
                  item.similarity >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                <p className="text-2xl mb-1">{getScoreEmoji(item.similarity)}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm opacity-80">Your answer:</p>
                    <p className="font-medium">{item.answer || '(no answer)'}</p>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.similarity * 100}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                  <p className="text-xs">
                    Accuracy: {Math.round(item.similarity * 100)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Clock className="w-6 h-6" />
              <span>{Math.round(elapsedTime)}s</span>
            </div>

            <p className="text-2xl font-bold">
              Score: {score} {isCorrect || isArtistCorrect ? (
                <span className="text-green-400">
                  (+{(isCorrect ? 1 : 0) + (isArtistCorrect ? 1 : 0)} points)
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 transition"
              >
                <Share2 size={20} />
                Share Result
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNextSong}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 transition"
              >
                <SkipForward size={20} />
                Next Song
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
