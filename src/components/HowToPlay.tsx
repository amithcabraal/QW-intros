import React from 'react';
import { Music, Timer, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowToPlay = () => {
  const steps = [
    {
      icon: Music,
      title: 'Listen to the Intro',
      description: 'A song will start playing. Try to identify it as quickly as possible!'
    },
    {
      icon: Timer,
      title: 'Beat the Clock',
      description: 'You have 30 seconds to guess both the song title and artist.'
    },
    {
      icon: Trophy,
      title: 'Score Points',
      description: 'Get points for correct answers. The faster you guess, the more points you earn!'
    },
    {
      icon: Star,
      title: 'Compete & Share',
      description: 'Share your results and challenge friends to beat your score!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          How to Play
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                  <p className="text-white/80">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Scoring System</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">3</div>
              <span>Points for guessing correctly within 3 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">2</div>
              <span>Points for guessing correctly within 10 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">1</div>
              <span>Point for guessing correctly within 30 seconds</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">+1</div>
              <span>Bonus point for correctly guessing the artist</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};