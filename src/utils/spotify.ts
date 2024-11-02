const CLIENT_ID = 'aec280afedc14dbcb5f99bc29047df8e';
const REDIRECT_URI = `${window.location.origin}/callback`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state'
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

export const checkSpotifyPremium = async (): Promise<boolean> => {
  try {
    const api = await getSpotifyApi();
    if (!api) return false;

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: api.headers
    });

    if (!response.ok) {
      if (response.status === 403) {
        return false;
      }
      
      if (response.status === 401) {
        localStorage.removeItem('spotify_token');
      }
      
      return false;
    }

    const data = await response.json();
    return data.product === 'premium';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

export const fetchPlaylists = async () => {
  const api = await getSpotifyApi();
  if (!api) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: api.headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('spotify_token');
        return null;
      }
      if (response.status === 403) {
        return { items: [] };
      }
      throw new Error('Failed to fetch playlists');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return { items: [] };
  }
};

async function fetchAllPlaylistTracks(playlistId: string, api: { headers: HeadersInit }) {
  let tracks = [];
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,artists,album,preview_url)),next`;

  while (nextUrl) {
    try {
      const response = await fetch(nextUrl, { headers: api.headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      tracks = [...tracks, ...data.items];
      nextUrl = data.next;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      break;
    }
  }

  return tracks;
}

export const fetchPlaylistTracks = async (playlistId: string) => {
  const api = await getSpotifyApi();
  if (!api) return null;

  try {
    // First try to fetch all tracks
    const tracks = await fetchAllPlaylistTracks(playlistId, api);
    
    if (tracks.length > 0) {
      return { items: tracks };
    }

    // If no tracks were fetched, try getting the playlist details
    const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: api.headers
    });
    
    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist');
    }

    const playlistData = await playlistResponse.json();
    return {
      items: playlistData.tracks.items.filter((item: any) => 
        item.track && item.track.preview_url
      )
    };
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    return { items: [] };
  }
};
