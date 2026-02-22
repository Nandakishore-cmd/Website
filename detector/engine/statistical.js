import { tokenizeWords, tokenizeSentences, getNgrams } from '../utils/tokenizer.js';
import { wordFrequency, shannonEntropy, ngramFrequency, meanAndStdDev, clamp01 } from '../utils/textStats.js';

/**
 * Estimate per-sentence perplexity using unigram surprise.
 * Low, uniform perplexity across sentences → AI-like → higher score.
 */
function perplexityScore(text) {
  const words = tokenizeWords(text);
  if (words.length < 5) return { score: 0.5, perplexityMean: 0, perplexityVariation: 0 };

  const freq = wordFrequency(words);
  const total = words.length;

  const sentences = tokenizeSentences(text);
  if (sentences.length < 2) return { score: 0.5, perplexityMean: 0, perplexityVariation: 0 };

  const sentencePerplexities = sentences.map(sentence => {
    const sWords = tokenizeWords(sentence);
    if (sWords.length === 0) return 0;

    // Calculate average surprise per word in this sentence
    let totalSurprise = 0;
    for (const w of sWords) {
      const p = (freq.get(w) || 0.5) / total;
      totalSurprise += -Math.log2(Math.max(p, 1e-10));
    }
    return totalSurprise / sWords.length;
  });

  const { mean, stdDev } = meanAndStdDev(sentencePerplexities);
  // Low mean perplexity + low variation → AI-like
  // Normalize: typical AI has mean perplexity 3-6, humans 6-12
  const meanScore = clamp01(1 - (mean - 3) / 9); // Lower mean → higher score
  const variationScore = mean > 0 ? clamp01(1 - stdDev / mean) : 0.5; // Lower CV → higher score

  return {
    score: clamp01(meanScore * 0.5 + variationScore * 0.5),
    perplexityMean: mean,
    perplexityVariation: mean > 0 ? stdDev / mean : 0,
  };
}

/**
 * Measure burstiness — variation in sentence complexity.
 * Low burstiness (uniform sentence lengths) → AI-like → higher score.
 */
function burstinessScore(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, burstiness: 0 };

  const lengths = sentences.map(s => tokenizeWords(s).length);
  const { mean, stdDev } = meanAndStdDev(lengths);

  if (mean === 0) return { score: 0.5, burstiness: 0 };

  // Burstiness = coefficient of variation
  const B = stdDev / mean;
  // Typical AI: B = 0.2-0.4, Humans: B = 0.4-0.8+
  const score = clamp01(1 - (B - 0.2) / 0.6);

  return { score, burstiness: B };
}

/**
 * Analyze entropy variation across sentences.
 * AI has consistent entropy; humans vary.
 */
function entropyVariationScore(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, entropyMean: 0, entropyCV: 0 };

  const sentenceEntropies = sentences.map(s => {
    const words = tokenizeWords(s);
    return shannonEntropy(words);
  });

  const { mean, stdDev } = meanAndStdDev(sentenceEntropies);
  if (mean === 0) return { score: 0.5, entropyMean: 0, entropyCV: 0 };

  const cv = stdDev / mean;
  // Low CV → consistent entropy → AI-like → higher score
  const score = clamp01(1 - (cv - 0.1) / 0.5);

  return { score, entropyMean: mean, entropyCV: cv };
}

/**
 * N-gram predictability — how repetitive are word sequences.
 * More repetitive n-grams → AI-like → higher score.
 */
function ngramPredictabilityScore(text) {
  const words = tokenizeWords(text);
  if (words.length < 10) return { score: 0.5, bigramRepetition: 0, trigramRepetition: 0 };

  const bigrams = getNgrams(words, 2);
  const trigrams = getNgrams(words, 3);

  const bigramFreq = ngramFrequency(bigrams);
  const trigramFreq = ngramFrequency(trigrams);

  // Ratio of repeated n-grams (appearing 2+ times) to total
  const bigramRepeats = [...bigramFreq.values()].filter(c => c >= 2).length;
  const trigramRepeats = [...trigramFreq.values()].filter(c => c >= 2).length;

  const bigramRatio = bigramFreq.size > 0 ? bigramRepeats / bigramFreq.size : 0;
  const trigramRatio = trigramFreq.size > 0 ? trigramRepeats / trigramFreq.size : 0;

  // Higher repetition ratio → more AI-like
  const score = clamp01((bigramRatio * 0.4 + trigramRatio * 0.6) * 3);

  return { score, bigramRepetition: bigramRatio, trigramRepetition: trigramRatio };
}

/**
 * Run all statistical analyses and return combined score.
 */
export function analyzeStatistical(text) {
  const perplexity = perplexityScore(text);
  const burstiness = burstinessScore(text);
  const entropy = entropyVariationScore(text);
  const ngram = ngramPredictabilityScore(text);

  const score = clamp01(
    perplexity.score * 0.30 +
    burstiness.score * 0.30 +
    entropy.score * 0.20 +
    ngram.score * 0.20
  );

  return {
    score,
    details: {
      perplexity: { score: perplexity.score, mean: perplexity.perplexityMean, variation: perplexity.perplexityVariation },
      burstiness: { score: burstiness.score, value: burstiness.burstiness },
      entropy: { score: entropy.score, mean: entropy.entropyMean, cv: entropy.entropyCV },
      ngramPredictability: { score: ngram.score, bigramRepetition: ngram.bigramRepetition, trigramRepetition: ngram.trigramRepetition },
    },
  };
}
