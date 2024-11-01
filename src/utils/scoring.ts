export const calculateScore = (isCorrectTitle: boolean, isCorrectArtist: boolean, timeElapsed: number): number => {
  let score = 0;

  if (isCorrectTitle) {
    // Base points for correct title
    score += 1;
    
    // Time bonus for title
    if (timeElapsed <= 3) score += 2;
    else if (timeElapsed <= 10) score += 1;
  }

  if (isCorrectArtist) {
    // Points for correct artist
    score += 1;
  }

  return score;
};
