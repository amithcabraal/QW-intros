import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Privacy Policy
        </motion.h1>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Data Collection</h2>
                <p className="text-white/80">
                  We only store your Spotify authentication token temporarily to enable gameplay. 
                  No personal information is permanently stored on our servers.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <Eye className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Data Usage</h2>
                <p className="text-white/80">
                  Your Spotify data is only used to play the game and is never shared with third parties.
                  Game scores and results are stored locally on your device.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <Database className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Cookies</h2>
                <p className="text-white/80">
                  We use essential cookies only for authentication and game functionality.
                  No tracking or advertising cookies are used.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Your Rights</h2>
                <p className="text-white/80">
                  You can revoke access to your Spotify account at any time by logging out.
                  This will remove all temporary data associated with your session.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};