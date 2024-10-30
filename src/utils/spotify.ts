const CLIENT_ID = 'aec280afedc14dbcb5f99bc29047df8e';
const REDIRECT_URI = 'https://taupe-stroopwafel-284d5b.netlify.app/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-modify-playback-state'
];

export const loginWithSpotify = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('spotify_auth_state', state);

  const args = new URLSearchParams({
    response_type: 'token',
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: 'true'
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args}`;
};

export const getHashParams = () => {
  const hashParams: Record<string, string> = {};
  const hash = window.location.hash.substring(1);
  const regex = /([^&;=]+)=?([^&;]*)/g;
  let match;

  while ((match = regex.exec(hash))) {
    hashParams[match[1]] = decodeURIComponent(match[2]);
  }

  return hashParams;
};

export const getSpotifyApi = async () => {
  const token = localStorage.getItem('spotify_token');
  if (!token) return null;

  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchPlaylists = async () => {
  const api = await getSpotifyApi();
  if (!api) return null;

  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: api.headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('spotify_token');
      return null;
    }
    throw new Error('Failed to fetch playlists');
  }

  return response.json();
};

export const fetchPlaylistTracks = async (playlistId: string) => {
  const api = await getSpotifyApi();
  if (!api) return null;

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: api.headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('spotify_token');
      return null;
    }
    throw new Error('Failed to fetch playlist tracks');
  }

  return response.json();
};