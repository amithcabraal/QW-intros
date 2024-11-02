import React from 'react';
import { Share2, Trophy, Clock, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface GameHistoryItem {
  trackId: string;
  name: string;
  artist: string;
  albumImage: string;
  timestamp: string;
  score: number;
  userAnswer?: string;
  userArtistAnswer?: string;
  isCorrectTitle?: boolean;
  isCorrectArtist?: boolean;
  elapsedTime?: number;
}

export const RecentGames = () => {
  const history: GameHistoryItem[] = JSON.parse(localStorage.getItem('game_history') || '[]');

  const handleShare = async (game: GameHistoryItem) => {
    const shareText = `🎵 Try this Beat the Intro!\n\n${game.isCorrectTitle ? `I got it in ${game.elapsedTime?.toFixed(1)} seconds!` : "I couldn't get this one!"}\n\nCan you beat me? Try now: ${window.location.origin}?track=${game.trackId}`;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Ban className="w-16 h-16 mx-auto mb-4 text-white/60" />
          <h1 className="text-2xl font-bold mb-4">No Recent Games</h1>
          <p className="text-white/60 mb-8">Start playing to see your game history here!</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition"
          >
            Play Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 dark:from-gray-900 dark:to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Recent Games</h1>
        
        <div className="space-y-4">
          {history.map((game, index) => (
            <motion.div
              key={game.timestamp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={game.albumImage}
                  alt={game.name}
                  className="w-16 h-16 rounded-lg"
                />
                <div className="flex-grow">
                  <h3 className="font-bold">{game.name}</h3>
                  <p className="text-white/60">{game.artist}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span>{game.score} points</span>
                  </div>
                  {game.elapsedTime !== undefined && (
                    <div className="flex items-center gap-2 justify-end text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>{game.elapsedTime.toFixed(1)}s</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleShare(game)}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <Link
                    to={`/?track=${game.trackId}`}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                    title="Play Again"
                  >
                    <Trophy className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              <div className="mt-2 text-sm text-white/40">
                {formatDate(game.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
