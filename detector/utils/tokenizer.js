const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'dept', 'est', 'fig', 'govt', 'inc', 'ltd', 'vs', 'etc', 'al', 'approx',
  'dept', 'e.g', 'i.e', 'vol', 'no',
]);

/**
 * Split text into individual words, lowercased, punctuation stripped.
 */
export function tokenizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Split text into sentences. Handles common abbreviations and edge cases.
 */
export function tokenizeSentences(text) {
  const sentences = [];
  let current = '';

  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    current += chars[i];

    if (chars[i] === '.' || chars[i] === '!' || chars[i] === '?') {
      // Check if this period is part of an abbreviation
      if (chars[i] === '.') {
        const wordBefore = current.trim().split(/\s+/).pop().replace('.', '').toLowerCase();
        if (ABBREVIATIONS.has(wordBefore)) continue;
        // Check for ellipsis or decimal numbers
        if (chars[i + 1] === '.' || (chars[i - 1] && /\d/.test(chars[i - 1]) && chars[i + 1] && /\d/.test(chars[i + 1]))) continue;
      }

      // Check if followed by a space and uppercase letter (or end of text)
      const next = chars[i + 1];
      const nextNext = chars[i + 2];
      if (!next || next === ' ' || next === '\n' || next === '"' || next === "'") {
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          sentences.push(trimmed);
          current = '';
        }
      }
    }
  }

  const remaining = current.trim();
  if (remaining.length > 0) {
    sentences.push(remaining);
  }

  return sentences;
}

/**
 * Generate n-grams from a word array.
 */
export function getNgrams(words, n) {
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Count syllables in a word (approximate).
 */
export function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}
