import React, { useState, useEffect } from 'react';
import { Music, Search, Loader } from 'lucide-react';
import { Genre } from '../types/game';
import { fetchPlaylists } from '../utils/spotify';
import type { Playlist } from '../types/spotify';

interface GenreSelectionProps {
  onGenreSelect: (genre: Genre) => void;
  genres: Genre[];
}

export const GenreSelection: React.FC<GenreSelectionProps> = ({ onGenreSelect, genres }) => {
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlaylists();
      if (data?.items) {
        setUserPlaylists(data.items);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlaylists = userPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaylistSelect = (playlist: Playlist) => {
    onGenreSelect({
      id: playlist.id,
      name: playlist.name,
      playlistId: playlist.id
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onGenreSelect(genre)}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-6 text-left transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{genre.name}</h3>
                <p className="text-white/60">Test your knowledge</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Your Playlists</h2>
          <p className="text-white/60">Or choose from your own music collection</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search your playlists..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist)}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all transform hover:scale-105"
              >
                <div className="aspect-square mb-3 rounded-md overflow-hidden bg-white/5">
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{playlist.name}</h3>
                <p className="text-xs text-white/60 mt-1">{playlist.tracks.total} tracks</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
