import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { analyzeStatistical } from './statistical.js';
import { analyzeLinguistic } from './linguistic.js';
import { analyzeWithAI } from './aiMetaDetector.js';
import { analyzeWithML } from './mlModelAnalyzer.js';

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
    aiMeta: results.aiMeta,
    mlModel: results.mlModel,
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

  // Run statistical and linguistic in parallel (CPU-only), then AI meta (network)
  const [statistical, linguistic] = await Promise.all([
    Promise.resolve(analyzeStatistical(text)),
    Promise.resolve(analyzeLinguistic(text)),
  ]);

  // AI meta-detection (may fail gracefully)
  let aiMeta = null;
  try {
    aiMeta = await analyzeWithAI(text);
  } catch (err) {
    console.warn('AI meta-detection failed:', err.message);
  }

  // ML model (stub, returns null)
  const mlModel = await analyzeWithML(text);

  const results = { statistical, linguistic, aiMeta, mlModel };
  const { score, effectiveWeights } = computeWeightedScore(results);
  const classification = classify(score);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  return {
    score,
    classification: classification.label,
    confidence: classification.confidence,
    breakdown: {
      statistical: { composite: statistical.score, details: statistical.details },
      linguistic: { composite: linguistic.score, details: linguistic.details },
      aiMeta: aiMeta ? { composite: aiMeta.score, details: aiMeta.details, provider: aiMeta.provider } : null,
      mlModel: null,
    },
    weights,
    effectiveWeights,
    metadata: {
      textLength: text.length,
      wordCount: words.length,
      processingTimeMs: Date.now() - startTime,
    },
  };
}
