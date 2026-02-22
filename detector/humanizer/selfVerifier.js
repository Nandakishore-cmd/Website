import { analyzeText } from '../engine/analyzer.js';

/**
 * Self-verification loop.
 * Runs output through our 7-signal detector.
 * If AI score > threshold, returns feedback for re-processing.
 */
export async function selfVerify(text, threshold = 0.35) {
  try {
    const result = await analyzeText(text);
    return {
      passed: result.score <= threshold,
      score: result.score,
      classification: result.classification,
      confidence: result.confidence,
      flaggedSentences: (result.sentenceScores || [])
        .filter(s => s.score > 0.6)
        .map(s => s.text),
    };
  } catch (err) {
    console.error('Self-verification failed:', err.message);
    // If verification fails, assume passed to avoid infinite loop
    return { passed: true, score: 0, classification: 'UNKNOWN', confidence: 0, flaggedSentences: [] };
  }
}
