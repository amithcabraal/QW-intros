import React, { useState } from 'react';
import { Menu, X, Home, HelpCircle, Mail, Shield, LogOut, Sun, Moon, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, setIsDark } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get the current playback state to check active devices
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      });

      if (response.ok) {
        const { devices } = await response.json();
        const webPlayer = devices.find((d: any) => d.name === 'Beat the Intro Player');
        
        // If our web player is found, disconnect it
        if (webPlayer) {
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
            },
            body: JSON.stringify({
              device_ids: [devices.find((d: any) => d.id !== webPlayer.id)?.id].filter(Boolean)
            })
          });
        }
      }
    } catch (error) {
      console.error('Error cleaning up Spotify device:', error);
    } finally {
      setIsOpen(false);
      onLogout();
    }
  };

  const handleGenresClick = () => {
    setIsOpen(false);
    navigate('/', { replace: true });
    window.location.reload(); // Force reload to reset all state
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-white/5 hover:bg-white/10 dark:bg-gray-800/20 dark:hover:bg-gray-700/30 backdrop-blur-sm rounded-full p-2 transition-colors"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-800 dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-4 py-2">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleGenresClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <Home className="w-5 h-5" />
                    <span>Choose Playlist</span>
                  </button>
                </li>
                <li>
                  <Link
                    to="/recent"
                    className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <History className="w-5 h-5" />
                    <span>Recent Games</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-to-play"
                    className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>How to Play</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
