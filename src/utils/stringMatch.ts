// Levenshtein distance calculation
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}

// Clean title by removing brackets and extra spaces
export function cleanTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]|{.*?}/g, '') // Remove content in brackets
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Calculate similarity ratio between 0 and 1
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = cleanTitle(str1);
  const s2 = cleanTitle(str2);
  const maxLength = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
}

// Check if strings are similar enough (80% similarity threshold)
export function areSimilar(str1: string, str2: string): boolean {
  return calculateSimilarity(str1, str2) >= 0.8;
}