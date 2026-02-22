import { tokenizeWords, tokenizeSentences, countSyllables } from '../utils/tokenizer.js';
import { wordFrequency, meanAndStdDev, clamp01 } from '../utils/textStats.js';

// Common AI transition phrases (weighted indicators)
const AI_TRANSITIONS = [
  'furthermore', 'moreover', 'additionally', 'in conclusion',
  'it is important to note', 'it is worth noting', 'in summary',
  'on the other hand', 'in other words', 'that being said',
  'with that in mind', 'having said that', 'in this regard',
  'to summarize', 'in essence', 'broadly speaking',
  'it should be noted', 'it goes without saying',
];

// Known AI telltale patterns
const AI_TELLTALE_PATTERNS = [
  /as an ai/i,
  /it'?s important to note/i,
  /let'?s delve into/i,
  /in today'?s digital landscape/i,
  /in today'?s world/i,
  /it'?s worth mentioning/i,
  /at the end of the day/i,
  /in the realm of/i,
  /a testament to/i,
  /navigating the/i,
  /the landscape of/i,
  /unlock(ing)? the (full )?potential/i,
  /foster(ing)? a (sense of |culture of )?/i,
  /delve deeper/i,
  /tapestry of/i,
  /it'?s crucial to/i,
  /paramount importance/i,
  /seamlessly/i,
  /leverage(d|s|ing)?/i,
  /utilize(d|s|ing)?/i,
  /facilitate(d|s|ing)?/i,
  /comprehensive (guide|overview|analysis|understanding)/i,
  /embark on/i,
  /cutting-edge/i,
  /game-?changer/i,
  /in this article/i,
];

/**
 * Type-Token Ratio — vocabulary richness.
 * Low TTR (repetitive vocabulary) → AI-like.
 */
function typeTokenRatio(words) {
  if (words.length === 0) return { score: 0.5, ttr: 0 };
  const unique = new Set(words).size;
  const ttr = unique / words.length;
  // Typical AI: TTR 0.3-0.5, Humans: 0.5-0.8 (for longer texts)
  // For short texts TTR is naturally higher, so adjust by text length
  const adjustedThreshold = words.length > 200 ? 0.45 : 0.55;
  const score = clamp01(1 - (ttr - 0.3) / (0.5));
  return { score, ttr };
}

/**
 * Hapax legomena — words appearing exactly once.
 * Low ratio → more AI-like.
 */
function hapaxLegomenaRatio(words) {
  if (words.length === 0) return { score: 0.5, ratio: 0 };
  const freq = wordFrequency(words);
  const hapax = [...freq.values()].filter(c => c === 1).length;
  const unique = freq.size;
  if (unique === 0) return { score: 0.5, ratio: 0 };
  const ratio = hapax / unique;
  // AI text tends to have lower hapax ratio (0.4-0.55), humans higher (0.55-0.75)
  const score = clamp01(1 - (ratio - 0.4) / 0.35);
  return { score, ratio };
}

/**
 * Sentence structure variation — diversity of sentence lengths and starters.
 */
function sentenceStructureVariation(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, lengthCV: 0, starterDiversity: 0 };

  // Sentence length variation
  const lengths = sentences.map(s => tokenizeWords(s).length);
  const { mean, stdDev } = meanAndStdDev(lengths);
  const lengthCV = mean > 0 ? stdDev / mean : 0;

  // Sentence starter diversity
  const starters = sentences.map(s => {
    const words = tokenizeWords(s);
    return words.length > 0 ? words[0] : '';
  });
  const uniqueStarters = new Set(starters).size;
  const starterDiversity = starters.length > 0 ? uniqueStarters / starters.length : 0;

  // Low variation → AI-like → higher score
  const lengthScore = clamp01(1 - (lengthCV - 0.2) / 0.5);
  const starterScore = clamp01(1 - (starterDiversity - 0.3) / 0.5);

  return {
    score: clamp01(lengthScore * 0.5 + starterScore * 0.5),
    lengthCV,
    starterDiversity,
  };
}

/**
 * Flesch-Kincaid readability and its consistency across paragraphs.
 */
function readabilityConsistency(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, avgReadability: 0, readabilityCV: 0 };

  const readabilityScores = sentences.map(sentence => {
    const words = tokenizeWords(sentence);
    if (words.length === 0) return 50;
    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    // Flesch Reading Ease
    return 206.835 - 1.015 * words.length - 84.6 * (syllables / Math.max(words.length, 1));
  });

  const { mean, stdDev } = meanAndStdDev(readabilityScores);
  const cv = mean !== 0 ? Math.abs(stdDev / mean) : 0;

  // Consistent readability across sentences → AI-like
  const score = clamp01(1 - (cv - 0.1) / 0.6);

  return { score, avgReadability: mean, readabilityCV: cv };
}

/**
 * Count AI transition phrases relative to text length.
 */
function transitionFrequency(text) {
  const lowerText = text.toLowerCase();
  const words = tokenizeWords(text);
  if (words.length === 0) return { score: 0.5, count: 0, density: 0 };

  let count = 0;
  for (const phrase of AI_TRANSITIONS) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  }

  const density = count / (words.length / 100); // per 100 words
  // High density → AI-like
  const score = clamp01(density / 3);

  return { score, count, density };
}

/**
 * Detect repeated phrases (3+ words appearing 2+ times).
 */
function repetitionDetection(text) {
  const words = tokenizeWords(text);
  if (words.length < 20) return { score: 0.5, repeatedPhrases: 0 };

  const phrases = new Map();
  for (let len = 3; len <= 6; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  }

  const repeated = [...phrases.values()].filter(c => c >= 2).length;
  const total = phrases.size || 1;
  const ratio = repeated / total;

  // Higher repetition → more AI-like
  const score = clamp01(ratio * 5);

  return { score, repeatedPhrases: repeated };
}

/**
 * Check for AI telltale patterns.
 */
function telltalePatterns(text) {
  let matches = 0;
  const found = [];

  for (const pattern of AI_TELLTALE_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
      found.push(pattern.source);
    }
  }

  // Even 2-3 matches is a strong signal
  const score = clamp01(matches / 4);

  return { score, matchCount: matches, patterns: found };
}

/**
 * Run all linguistic analyses and return combined score.
 */
export function analyzeLinguistic(text) {
  const words = tokenizeWords(text);
  const ttr = typeTokenRatio(words);
  const hapax = hapaxLegomenaRatio(words);
  const structure = sentenceStructureVariation(text);
  const readability = readabilityConsistency(text);
  const transitions = transitionFrequency(text);
  const repetition = repetitionDetection(text);
  const telltales = telltalePatterns(text);

  const score = clamp01(
    ttr.score * 0.12 +
    hapax.score * 0.10 +
    structure.score * 0.18 +
    readability.score * 0.15 +
    transitions.score * 0.15 +
    repetition.score * 0.10 +
    telltales.score * 0.20
  );

  return {
    score,
    details: {
      typeTokenRatio: { score: ttr.score, ttr: ttr.ttr },
      hapaxLegomena: { score: hapax.score, ratio: hapax.ratio },
      sentenceStructure: { score: structure.score, lengthCV: structure.lengthCV, starterDiversity: structure.starterDiversity },
      readability: { score: readability.score, avgReadability: readability.avgReadability, readabilityCV: readability.readabilityCV },
      transitions: { score: transitions.score, count: transitions.count, density: transitions.density },
      repetition: { score: repetition.score, repeatedPhrases: repetition.repeatedPhrases },
      telltalePatterns: { score: telltales.score, matchCount: telltales.matchCount, patterns: telltales.patterns },
    },
  };
}
