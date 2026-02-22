import { tokenizeWords, tokenizeSentences, countSyllables } from '../utils/tokenizer.js';
import { wordFrequency, shannonEntropy, meanAndStdDev, clamp01 } from '../utils/textStats.js';

/**
 * Score an individual sentence for AI-likelihood.
 */
function scoreSentence(sentence, globalFreq, globalTotal) {
  const words = tokenizeWords(sentence);
  if (words.length < 3) return 0.5;

  // 1. Perplexity relative to document
  let surprise = 0;
  for (const w of words) {
    const p = (globalFreq.get(w) || 0.5) / globalTotal;
    surprise += -Math.log2(Math.max(p, 1e-10));
  }
  const avgSurprise = surprise / words.length;
  const perplexityScore = clamp01(1 - (avgSurprise - 3) / 9);

  // 2. Vocabulary richness
  const unique = new Set(words).size;
  const ttr = unique / words.length;
  const ttrScore = clamp01(1 - (ttr - 0.4) / 0.4);

  // 3. Sentence length normality (AI tends toward 15-25 words)
  const lenScore = (words.length >= 12 && words.length <= 28)
    ? clamp01(0.5 + (1 - Math.abs(words.length - 20) / 20) * 0.5)
    : clamp01(0.3);

  // 4. Readability
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const fk = 206.835 - 1.015 * words.length - 84.6 * (syllables / Math.max(words.length, 1));
  const readScore = (fk >= 30 && fk <= 70) ? 0.65 : 0.35;

  // 5. Entropy
  const entropy = shannonEntropy(words);
  const entropyScore = clamp01(1 - (entropy - 2) / 4);

  return clamp01(
    perplexityScore * 0.30 +
    ttrScore * 0.20 +
    lenScore * 0.15 +
    readScore * 0.15 +
    entropyScore * 0.20
  );
}

/**
 * Detect cross-sentence coherence patterns.
 * AI text has unnaturally smooth transitions between sentences.
 */
function crossSentenceCoherence(sentences) {
  if (sentences.length < 3) return { score: 0.5, coherenceCV: 0 };

  const sentenceWordSets = sentences.map(s => new Set(tokenizeWords(s)));
  const overlaps = [];

  for (let i = 1; i < sentenceWordSets.length; i++) {
    const prev = sentenceWordSets[i - 1];
    const curr = sentenceWordSets[i];
    const intersection = [...curr].filter(w => prev.has(w)).length;
    const union = new Set([...prev, ...curr]).size;
    overlaps.push(union > 0 ? intersection / union : 0);
  }

  const { mean, stdDev } = meanAndStdDev(overlaps);
  const cv = mean > 0 ? stdDev / mean : 0;

  // Low variation in overlap = AI-like
  const score = clamp01(1 - (cv - 0.1) / 0.6);

  return { score, coherenceCV: cv };
}

/**
 * Sentence-level AI analysis with per-sentence scores.
 */
export function analyzeSentenceLevel(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 2) {
    return {
      score: 0.5,
      sentenceScores: sentences.map(s => ({ text: s, score: 0.5 })),
      details: { avgScore: 0.5, coherenceCV: 0 },
    };
  }

  const allWords = tokenizeWords(text);
  const globalFreq = wordFrequency(allWords);
  const globalTotal = allWords.length;

  // Score each sentence
  const sentenceScores = sentences.map(sentence => ({
    text: sentence,
    score: scoreSentence(sentence, globalFreq, globalTotal),
  }));

  const scores = sentenceScores.map(s => s.score);
  const { mean: avgScore } = meanAndStdDev(scores);

  // Cross-sentence coherence
  const coherence = crossSentenceCoherence(sentences);

  const score = clamp01(avgScore * 0.65 + coherence.score * 0.35);

  return {
    score,
    sentenceScores,
    details: {
      avgScore,
      coherenceCV: coherence.coherenceCV,
      sentenceCount: sentences.length,
    },
  };
}
