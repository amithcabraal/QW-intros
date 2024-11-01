import { LucideIcon } from 'lucide-react';

export interface Genre {
  id: string;
  name: string;
  playlistId: string;
  description: string;
  icon: LucideIcon;
}

export interface GameState {
  currentTrack: SpotifyTrack | null;
  score: number;
  gameStatus: 'selecting' | 'playing' | 'revealed';
  timeLeft: number;
  playedTracks: Set<string>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  album: {
    images: { url: string }[];
  };
}
