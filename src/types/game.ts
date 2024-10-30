export interface Genre {
  id: string;
  name: string;
  playlistId: string;
}

export interface GameState {
  currentTrack: SpotifyTrack | null;
  score: number;
  gameStatus: 'selecting' | 'playing' | 'revealed';
  timeLeft: number;
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