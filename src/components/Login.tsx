import { Music } from 'lucide-react';
import { loginWithSpotify } from '../utils/spotify';

export const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <Music className="w-20 h-20 mx-auto mb-6 text-green-400" />
        <h1 className="text-5xl font-bold mb-4">Beat the Intro</h1>
        <p className="text-xl mb-8 text-white/80">Test your music knowledge with Spotify!</p>
        
        <button
          onClick={loginWithSpotify}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect with Spotify
        </button>
        
        <p className="mt-8 text-white/60 text-sm">
          You'll need a Spotify account to play. Don't worry, we don't store any of your credentials!
        </p>
      </div>
    </div>
  );
};