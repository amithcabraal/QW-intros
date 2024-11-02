import React from 'react';
import { SkipForward, Share2, ExternalLink, Music2, Clock, Target, ThumbsUp, ThumbsDown, Ban } from 'lucide-react';
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

const getAccuracyIcon = (similarity: number) => {
  if (similarity === 1) return <Target className="w-5 h-5 text-white" />;
  if (similarity >= 0.8) return <Target className="w-5 h-5 text-white" />;
  if (similarity >= 0.6) return <ThumbsUp className="w-5 h-5 text-white" />;
  if (similarity > 0) return <ThumbsDown className="w-5 h-5 text-white" />;
  return <Ban className="w-5 h-5 text-white" />;
};

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

  const handleShare = async () => {
    const shareText = `🎵 Try this Beat the Intro!\n\n${isCorrect ? `I got it in ${elapsedTime.toFixed(1)} seconds!` : "I couldn't get this one!"}\n\nCan you beat me? Try now: ${window.location.origin}?track=${track.id}`;

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
    <div className="max-w-2xl mx-auto h-full landscape:max-w-none landscape:flex landscape:items-center landscape:gap-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="landscape:w-1/2 landscape:flex landscape:flex-col landscape:items-center landscape:justify-center"
      >
        <div className="relative mx-auto mb-4 landscape:mb-2">
          <motion.a 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            href={`https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group"
          >
            <img
              src={track.album.images[0].url}
              alt={track.name}
              className="w-64 h-64 landscape:w-48 landscape:h-48 mx-auto rounded-lg shadow-xl ring-4 ring-white/10 transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </motion.a>
        </div>

        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl landscape:text-2xl font-bold mb-1"
          >
            {track.name}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl landscape:text-lg text-white/80"
          >
            {track.artists[0].name}
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 landscape:w-1/2 landscape:h-full landscape:flex landscape:flex-col landscape:justify-center"
      >
        <div className="grid grid-cols-1 landscape:grid-cols-2 gap-4">
          {[
            { label: 'Song Title', similarity: titleSimilarity, answer: userAnswer, correct: isCorrect },
            { label: 'Artist', similarity: artistSimilarity, answer: userArtistAnswer, correct: isArtistCorrect }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-lg bg-opacity-20 ${
                item.similarity >= 0.8 ? 'bg-green-500' :
                item.similarity >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.7 + index * 0.1 
                  }}
                >
                  {getAccuracyIcon(item.similarity)}
                </motion.div>
              </div>
              <div>
                <p className="text-sm opacity-80">Your answer: <span className="font-medium">{item.answer || '(no answer)'}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-grow h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.similarity * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-xs whitespace-nowrap"
                >
                  {Math.round(item.similarity * 100)}%
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 text-xl font-bold"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{elapsedTime.toFixed(1)}s</span>
          </div>
          <div>
            Score: {score} {(isCorrect || isArtistCorrect) && (
              <span className="text-green-400">
                (+{(isCorrect ? 1 : 0) + (isArtistCorrect ? 1 : 0)})
              </span>
            )}
          </div>
        </motion.div>

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
  );
};
