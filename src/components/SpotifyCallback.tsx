import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHashParams } from '../utils/spotify';

export const SpotifyCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle both hash and search params
    const params = getHashParams();
    const searchParams = new URLSearchParams(location.search);
    
    if (params.access_token) {
      localStorage.setItem('spotify_token', params.access_token);
      navigate('/', { replace: true });
    } else if (searchParams.get('error')) {
      console.error('Authentication error:', searchParams.get('error'));
      navigate('/login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-lg">Connecting to Spotify...</p>
      </div>
    </div>
  );
};