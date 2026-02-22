import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { analyzeStatistical } from './statistical.js';
import { analyzeLinguistic } from './linguistic.js';
import { analyzeSentenceLevel } from './sentenceAnalyzer.js';
import { analyzeStylometric } from './stylometric.js';
import { analyzeCoherence } from './coherence.js';
import { analyzeFingerprint } from './fingerprint.js';
import { analyzeReadabilityForensics } from './readabilityForensics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const weights = JSON.parse(readFileSync(join(__dirname, '../config/weights.json'), 'utf-8'));

function classify(score) {
  if (score < 0.35) return { label: 'HUMAN', confidence: +(1 - score).toFixed(2) };
  if (score < 0.65) return { label: 'MIXED', confidence: +(1 - Math.abs(score - 0.5) * 2).toFixed(2) };
  return { label: 'AI', confidence: +score.toFixed(2) };
}

function computeWeightedScore(results) {
  const analyzerMap = {
    statistical: results.statistical,
    linguistic: results.linguistic,
    sentenceLevel: results.sentenceLevel,
    stylometric: results.stylometric,
    coherence: results.coherence,
    fingerprint: results.fingerprint,
    readabilityForensics: results.readabilityForensics,
  };

  const available = Object.entries(analyzerMap).filter(([_, v]) => v !== null);
  const totalAvailableWeight = available.reduce((sum, [key]) => sum + (weights[key] || 0), 0);

  if (totalAvailableWeight === 0) return { score: 0.5, effectiveWeights: {} };

  let finalScore = 0;
  const effectiveWeights = {};
  for (const [key, result] of available) {
    const normalizedWeight = (weights[key] || 0) / totalAvailableWeight;
    effectiveWeights[key] = +normalizedWeight.toFixed(3);
    finalScore += normalizedWeight * result.score;
  }

  return { score: +finalScore.toFixed(4), effectiveWeights };
}

export async function analyzeText(text) {
  const startTime = Date.now();

  // Run all 7 signals in parallel (all CPU-only, no network)
  const [statistical, linguistic, sentenceLevel, stylometric, coherence, fingerprint, readabilityForensics] = await Promise.all([
    Promise.resolve(analyzeStatistical(text)),
    Promise.resolve(analyzeLinguistic(text)),
    Promise.resolve(analyzeSentenceLevel(text)),
    Promise.resolve(analyzeStylometric(text)),
    Promise.resolve(analyzeCoherence(text)),
    Promise.resolve(analyzeFingerprint(text)),
    Promise.resolve(analyzeReadabilityForensics(text)),
  ]);

  const results = { statistical, linguistic, sentenceLevel, stylometric, coherence, fingerprint, readabilityForensics };
  const { score, effectiveWeights } = computeWeightedScore(results);
  const classification = classify(score);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  return {
    score,
    classification: classification.label,
    confidence: classification.confidence,
    sentenceScores: sentenceLevel.sentenceScores || [],
    breakdown: {
      statistical: { composite: statistical.score, details: statistical.details },
      linguistic: { composite: linguistic.score, details: linguistic.details },
      sentenceLevel: { composite: sentenceLevel.score, details: sentenceLevel.details },
      stylometric: { composite: stylometric.score, details: stylometric.details },
      coherence: { composite: coherence.score, details: coherence.details },
      fingerprint: { composite: fingerprint.score, details: fingerprint.details },
      readabilityForensics: { composite: readabilityForensics.score, details: readabilityForensics.details },
    },
    weights,
    effectiveWeights,
    metadata: {
      textLength: text.length,
      wordCount: words.length,
      processingTimeMs: Date.now() - startTime,
      signals: 7,
    },
  };
}
