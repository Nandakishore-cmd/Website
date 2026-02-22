import { tokenizeWords, tokenizeSentences, countSyllables } from '../utils/tokenizer.js';
import { meanAndStdDev, clamp01 } from '../utils/textStats.js';

/**
 * Calculate Flesch-Kincaid Reading Ease for a chunk of text.
 */
function fleschKincaid(words, sentenceCount) {
  if (words.length === 0 || sentenceCount === 0) return 50;
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  return 206.835 - 1.015 * (words.length / sentenceCount) - 84.6 * (syllables / words.length);
}

/**
 * Calculate Gunning Fog Index for a chunk of text.
 */
function gunningFog(words, sentenceCount) {
  if (words.length === 0 || sentenceCount === 0) return 10;
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;
  return 0.4 * ((words.length / sentenceCount) + 100 * (complexWords / words.length));
}

/**
 * Calculate Coleman-Liau Index for text.
 */
function colemanLiau(text, words, sentenceCount) {
  if (words.length === 0 || sentenceCount === 0) return 10;
  const letters = text.replace(/[^a-zA-Z]/g, '').length;
  const L = (letters / words.length) * 100;
  const S = (sentenceCount / words.length) * 100;
  return 0.0588 * L - 0.296 * S - 15.8;
}

/**
 * Analyze cross-paragraph readability variance for a single metric.
 */
function analyzeVariance(chunks, metricFn) {
  const scores = chunks.map(chunk => metricFn(chunk));
  const { mean, stdDev } = meanAndStdDev(scores);
  const cv = mean !== 0 ? Math.abs(stdDev / mean) : 0;
  return { mean, stdDev, cv };
}

/**
 * Split text into analyzable chunks (paragraphs or sentence groups).
 */
function getChunks(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  if (paragraphs.length >= 3) return paragraphs;

  // Fall back to sentence groups
  const sentences = tokenizeSentences(text);
  if (sentences.length < 6) return sentences.length >= 2 ? sentences : [text];

  const chunks = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, Math.min(i + 3, sentences.length)).join(' ');
    if (chunk.trim().length > 0) chunks.push(chunk);
  }
  return chunks;
}

/**
 * Run readability forensics — cross-paragraph readability variance.
 * AI produces uniform readability across paragraphs; humans vary.
 */
export function analyzeReadabilityForensics(text) {
  const chunks = getChunks(text);

  if (chunks.length < 2) {
    return {
      score: 0.5,
      details: {
        fleschKincaid: { score: 0.5, mean: 0, cv: 0 },
        gunningFog: { score: 0.5, mean: 0, cv: 0 },
        colemanLiau: { score: 0.5, mean: 0, cv: 0 },
      },
    };
  }

  // Flesch-Kincaid variance
  const fkData = analyzeVariance(chunks, chunk => {
    const words = tokenizeWords(chunk);
    const sentences = tokenizeSentences(chunk);
    return fleschKincaid(words, sentences.length || 1);
  });

  // Gunning Fog variance
  const gfData = analyzeVariance(chunks, chunk => {
    const words = tokenizeWords(chunk);
    const sentences = tokenizeSentences(chunk);
    return gunningFog(words, sentences.length || 1);
  });

  // Coleman-Liau variance
  const clData = analyzeVariance(chunks, chunk => {
    const words = tokenizeWords(chunk);
    const sentences = tokenizeSentences(chunk);
    return colemanLiau(chunk, words, sentences.length || 1);
  });

  // Low CV = uniform readability = AI-like
  const fkScore = clamp01(1 - (fkData.cv - 0.05) / 0.4);
  const gfScore = clamp01(1 - (gfData.cv - 0.05) / 0.4);
  const clScore = clamp01(1 - (clData.cv - 0.05) / 0.4);

  const score = clamp01(fkScore * 0.40 + gfScore * 0.30 + clScore * 0.30);

  return {
    score,
    details: {
      fleschKincaid: { score: fkScore, mean: fkData.mean, cv: fkData.cv },
      gunningFog: { score: gfScore, mean: gfData.mean, cv: gfData.cv },
      colemanLiau: { score: clScore, mean: clData.mean, cv: clData.cv },
    },
  };
}
