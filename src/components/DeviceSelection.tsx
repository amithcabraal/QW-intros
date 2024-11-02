import React, { useState, useEffect } from 'react';
import { Loader2, Smartphone, Laptop, Speaker, Computer } from 'lucide-react';
import { motion } from 'framer-motion';

interface Device {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface DeviceSelectionProps {
  onClose: () => void;
  onDeviceSelect: (deviceId: string) => void;
}

export const DeviceSelection: React.FC<DeviceSelectionProps> = ({ onClose, onDeviceSelect }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }

        const data = await response.json();
        setDevices(data.devices);
      } catch (error) {
        setError('Failed to load devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'smartphone':
        return Smartphone;
      case 'computer':
        return Computer;
      case 'speaker':
        return Speaker;
      default:
        return Laptop;
    }
  };

  const handleDeviceSelect = async (deviceId: string) => {
    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });

      onDeviceSelect(deviceId);
      onClose();
    } catch (error) {
      setError('Failed to switch device. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Select Device</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : devices.length === 0 ? (
          <div className="text-center py-4 text-gray-600 dark:text-gray-300">
            No available devices found
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.type);
              return (
                <button
                  key={device.id}
                  onClick={() => handleDeviceSelect(device.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg transition ${
                    device.is_active
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm opacity-75">{device.type}</div>
                  </div>
                  {device.is_active && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
