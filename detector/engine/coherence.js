import { tokenizeWords, tokenizeSentences } from '../utils/tokenizer.js';
import { wordFrequency, meanAndStdDev, clamp01 } from '../utils/textStats.js';

/**
 * Simple bag-of-words cosine similarity between two word arrays.
 */
function cosineSimilarity(wordsA, wordsB) {
  const freqA = wordFrequency(wordsA);
  const freqB = wordFrequency(wordsB);
  const allKeys = new Set([...freqA.keys(), ...freqB.keys()]);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const key of allKeys) {
    const a = freqA.get(key) || 0;
    const b = freqB.get(key) || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag > 0 ? dotProduct / mag : 0;
}

/**
 * Topic consistency scoring.
 * AI text maintains unnaturally consistent topics between paragraphs.
 */
function topicConsistency(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  if (paragraphs.length < 2) {
    // Fall back to sentence-level chunking
    const sentences = tokenizeSentences(text);
    if (sentences.length < 4) return { score: 0.5, avgSimilarity: 0, similarityCV: 0 };

    // Group sentences into chunks of ~3
    const chunks = [];
    for (let i = 0; i < sentences.length; i += 3) {
      chunks.push(sentences.slice(i, i + 3).join(' '));
    }
    if (chunks.length < 2) return { score: 0.5, avgSimilarity: 0, similarityCV: 0 };

    return computeTopicScore(chunks);
  }

  return computeTopicScore(paragraphs);
}

function computeTopicScore(chunks) {
  const chunkWords = chunks.map(c => tokenizeWords(c));
  const similarities = [];

  for (let i = 1; i < chunkWords.length; i++) {
    similarities.push(cosineSimilarity(chunkWords[i - 1], chunkWords[i]));
  }

  const { mean, stdDev } = meanAndStdDev(similarities);
  const cv = mean > 0 ? stdDev / mean : 0;

  // AI: high mean similarity (0.3-0.5) + low CV
  // Human: lower mean similarity, higher CV
  const meanScore = clamp01((mean - 0.1) / 0.4);
  const cvScore = clamp01(1 - (cv - 0.1) / 0.5);

  return {
    score: clamp01(meanScore * 0.5 + cvScore * 0.5),
    avgSimilarity: mean,
    similarityCV: cv,
  };
}

/**
 * Paragraph structure regularity detection.
 * AI produces paragraphs of similar length.
 */
function paragraphRegularity(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    // Use sentences instead
    const sentences = tokenizeSentences(text);
    if (sentences.length < 4) return { score: 0.5, lengthCV: 0 };
    const lengths = sentences.map(s => tokenizeWords(s).length);
    const { mean, stdDev } = meanAndStdDev(lengths);
    const cv = mean > 0 ? stdDev / mean : 0;
    const score = clamp01(1 - (cv - 0.2) / 0.5);
    return { score, lengthCV: cv };
  }

  const lengths = paragraphs.map(p => tokenizeWords(p).length);
  const { mean, stdDev } = meanAndStdDev(lengths);
  const cv = mean > 0 ? stdDev / mean : 0;

  // AI: low CV (similar paragraph lengths)
  const score = clamp01(1 - (cv - 0.15) / 0.5);

  return { score, lengthCV: cv };
}

/**
 * Semantic density evenness.
 * AI maintains uniform information density.
 */
function semanticDensity(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, densityCV: 0 };

  // Proxy for semantic density: unique words / total words per sentence
  const densities = sentences.map(s => {
    const words = tokenizeWords(s);
    if (words.length === 0) return 0;
    return new Set(words).size / words.length;
  });

  const { mean, stdDev } = meanAndStdDev(densities);
  const cv = mean > 0 ? stdDev / mean : 0;

  // AI: low CV (uniform density)
  const score = clamp01(1 - (cv - 0.05) / 0.3);

  return { score, densityCV: cv };
}

/**
 * Run all coherence analyses.
 */
export function analyzeCoherence(text) {
  const topic = topicConsistency(text);
  const structure = paragraphRegularity(text);
  const density = semanticDensity(text);

  const score = clamp01(
    topic.score * 0.40 +
    structure.score * 0.30 +
    density.score * 0.30
  );

  return {
    score,
    details: {
      topicConsistency: { score: topic.score, avgSimilarity: topic.avgSimilarity, cv: topic.similarityCV },
      paragraphRegularity: { score: structure.score, lengthCV: structure.lengthCV },
      semanticDensity: { score: density.score, densityCV: density.densityCV },
    },
  };
}
