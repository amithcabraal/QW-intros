import React, { useState, useEffect } from 'react';
import { Search, Music, ArrowLeft } from 'lucide-react';
import { fetchPlaylists } from '../utils/spotify';
import type { Playlist } from '../types/spotify';

interface PlaylistSelectionProps {
  onPlaylistSelect: (playlist: Playlist) => void;
  onBack: () => void;
}

export const PlaylistSelection: React.FC<PlaylistSelectionProps> = ({ onPlaylistSelect, onBack }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await fetchPlaylists();
        if (data?.items) {
          setPlaylists(data.items);
        }
      } catch (error) {
        console.error('Failed to load playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlaylistImage = (playlist: Playlist) => {
    if (!playlist.images || playlist.images.length === 0 || !playlist.images[0]?.url) {
      return null;
    }
    return playlist.images[0].url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search your playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading your playlists...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => {
            const imageUrl = getPlaylistImage(playlist);
            
            return (
              <button
                key={playlist.id}
                onClick={() => onPlaylistSelect(playlist)}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition transform hover:scale-105 text-left"
              >
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-black/20">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xl mb-2 line-clamp-1">{playlist.name}</h3>
                <p className="text-white/60">
                  {playlist.tracks?.total ?? 0} tracks
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
 
