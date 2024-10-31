import React from 'react';
import { Music, ListMusic } from 'lucide-react';
import { Genre } from '../types/game';

interface GenreSelectionProps {
  onGenreSelect: (genre: Genre) => void;
  onShowPlaylists: () => void;
  genres: Genre[];
}

export const GenreSelection: React.FC<GenreSelectionProps> = ({ 
  onGenreSelect, 
  onShowPlaylists,
  genres 
}) => {
  return (
    <div className="space-y-8">
      <button
        onClick={onShowPlaylists}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg p-6 text-left transition-all transform hover:scale-105"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <ListMusic className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Your Playlists</h3>
            <p className="text-white/80">Play with songs from your own playlists</p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
    </div>
  );
};
