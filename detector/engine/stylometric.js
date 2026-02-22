import { tokenizeWords, tokenizeSentences } from '../utils/tokenizer.js';
import { wordFrequency, meanAndStdDev, clamp01 } from '../utils/textStats.js';

const FUNCTION_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same',
  'than', 'too', 'very', 'just', 'because', 'if', 'when', 'where',
  'how', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
  'them', 'their', 'theirs', 'themselves',
]);

/**
 * Punctuation diversity — AI avoids unusual punctuation like ; — ... ()
 */
function punctuationDiversity(text) {
  const punctuationTypes = [';', ':', '—', '–', '...', '(', ')', '"', "'", '!', '?', ',', '.'];
  const found = new Set();
  for (const p of punctuationTypes) {
    if (text.includes(p)) found.add(p);
  }

  const diversity = found.size / punctuationTypes.length;
  // Low punctuation diversity → AI-like → higher score
  const score = clamp01(1 - (diversity - 0.15) / 0.55);

  return { score, diversity, typesFound: found.size };
}

/**
 * Function word frequency distribution.
 * AI has more uniform function word distribution.
 */
function functionWordDistribution(text) {
  const words = tokenizeWords(text);
  if (words.length < 20) return { score: 0.5, functionWordRatio: 0, distributionCV: 0 };

  const freq = wordFrequency(words);
  const functionWordCounts = [];
  let totalFunctionWords = 0;

  for (const fw of FUNCTION_WORDS) {
    const count = freq.get(fw) || 0;
    if (count > 0) {
      functionWordCounts.push(count);
      totalFunctionWords += count;
    }
  }

  const ratio = totalFunctionWords / words.length;
  const { mean, stdDev } = meanAndStdDev(functionWordCounts);
  const cv = mean > 0 ? stdDev / mean : 0;

  // AI: higher function word ratio (0.5-0.6), low CV
  // Human: more variable (0.35-0.5), higher CV
  const ratioScore = clamp01((ratio - 0.35) / 0.25);
  const cvScore = clamp01(1 - (cv - 0.5) / 1.5);

  return {
    score: clamp01(ratioScore * 0.5 + cvScore * 0.5),
    functionWordRatio: ratio,
    distributionCV: cv,
  };
}

/**
 * Yule's K vocabulary richness measure.
 * Lower K = richer vocabulary = more human-like.
 */
function yulesK(text) {
  const words = tokenizeWords(text);
  if (words.length < 20) return { score: 0.5, k: 0 };

  const freq = wordFrequency(words);
  const N = words.length;

  // Count frequency of frequencies
  const freqOfFreq = new Map();
  for (const count of freq.values()) {
    freqOfFreq.set(count, (freqOfFreq.get(count) || 0) + 1);
  }

  // Yule's K = 10^4 * (sum(i^2 * Vi) - N) / N^2
  let sumI2Vi = 0;
  for (const [i, vi] of freqOfFreq.entries()) {
    sumI2Vi += i * i * vi;
  }

  const K = N > 0 ? 10000 * (sumI2Vi - N) / (N * N) : 0;

  // AI: K tends to be lower (50-100), more uniform
  // Human: K tends to be higher (100-200+), more varied
  const score = clamp01(1 - (K - 50) / 150);

  return { score, k: K };
}

/**
 * Word length distribution analysis.
 * AI tends toward more uniform word lengths.
 */
function wordLengthDistribution(text) {
  const words = tokenizeWords(text);
  if (words.length < 20) return { score: 0.5, avgLength: 0, lengthCV: 0 };

  const lengths = words.map(w => w.length);
  const { mean, stdDev } = meanAndStdDev(lengths);
  const cv = mean > 0 ? stdDev / mean : 0;

  // AI: low CV in word lengths (0.4-0.5)
  // Human: higher CV (0.5-0.7)
  const score = clamp01(1 - (cv - 0.35) / 0.35);

  return { score, avgLength: mean, lengthCV: cv };
}

/**
 * Run all stylometric analyses.
 */
export function analyzeStylometric(text) {
  const punctuation = punctuationDiversity(text);
  const functionWords = functionWordDistribution(text);
  const yules = yulesK(text);
  const wordLength = wordLengthDistribution(text);

  const score = clamp01(
    punctuation.score * 0.25 +
    functionWords.score * 0.25 +
    yules.score * 0.25 +
    wordLength.score * 0.25
  );

  return {
    score,
    details: {
      punctuation: { score: punctuation.score, diversity: punctuation.diversity, typesFound: punctuation.typesFound },
      functionWords: { score: functionWords.score, ratio: functionWords.functionWordRatio, cv: functionWords.distributionCV },
      yulesK: { score: yules.score, k: yules.k },
      wordLength: { score: wordLength.score, avgLength: wordLength.avgLength, cv: wordLength.lengthCV },
    },
  };
}
