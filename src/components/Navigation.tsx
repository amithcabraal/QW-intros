import React, { useState } from 'react';
import { Menu, X, Home, HelpCircle, Mail, Shield, LogOut, Sun, Moon, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { DeviceSelection } from './DeviceSelection';

interface NavigationProps {
  onLogout: () => void;
  onDeviceSelect?: (deviceId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout, onDeviceSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const { isDark, setIsDark } = useDarkMode();

  const handleDeviceSelect = (deviceId: string) => {
    if (onDeviceSelect) {
      onDeviceSelect(deviceId);
    }
  };

  const handleLogout = async () => {
    try {
      // Clean up the web playback device
      const token = localStorage.getItem('spotify_token');
      if (token) {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const { devices } = await response.json();
          const webPlaybackDevice = devices.find((d: any) => d.name === 'Beat the Intro Player');
          
          if (webPlaybackDevice) {
            await fetch('https://api.spotify.com/v1/me/player', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                device_ids: [webPlaybackDevice.id]
              })
            });
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up device:', error);
    }

    // Proceed with logout
    localStorage.removeItem('spotify_token');
    window.location.href = '/login';
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
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-4 py-2">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    <span>Genres</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setShowDevices(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Select Device</span>
                  </button>
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
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
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

      {showDevices && (
        <DeviceSelection
          onClose={() => setShowDevices(false)}
          onDeviceSelect={handleDeviceSelect}
        />
      )}
    </>
  );
};
