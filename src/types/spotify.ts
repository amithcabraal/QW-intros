export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Playlist {
  id: string;
  name: string;
  images: Image[];
  tracks: {
    total: number;
  };
}

export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  preview_url: string | null;
}