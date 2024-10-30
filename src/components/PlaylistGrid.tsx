import React from 'react';
import { Playlist } from '../types/spotify';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistSelect: (playlist: Playlist) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition cursor-pointer"
          onClick={() => onPlaylistSelect(playlist)}
        >
          <div className="aspect-square mb-4 rounded-lg overflow-hidden">
            <img
              src={playlist.images[0]?.url}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-xl mb-2">{playlist.name}</h3>
          <p className="text-white/60">{playlist.tracks.total} tracks</p>
        </div>
      ))}
    </div>
  );
};