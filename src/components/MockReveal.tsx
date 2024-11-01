import React from 'react';
import { RevealScreen } from './RevealScreen';

const mockTrack = {
  id: '123',
  name: 'Big Yellow Taxi',
  artists: [{ name: 'Joni Mitchell' }],
  album: {
    images: [{ url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800' }]
  },
  preview_url: null
};

export const MockReveal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-8">
      <RevealScreen
        track={mockTrack}
        userAnswer="Good Time"
        userArtistAnswer="Michael"
        isCorrect={false}
        isArtistCorrect={false}
        score={0}
        onNextSong={() => {}}
        elapsedTime={13.7}
      />
    </div>
  );
};
