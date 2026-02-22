import { parseSentences, reconstructText } from './sentenceParser.js';
import { paraphraseBatch } from './localModel.js';
import { replaceWithSynonyms } from './synonymEngine.js';
import { rewriteSentences } from './sentenceRewriter.js';
import { breakDiscoursePatterns } from './discourseBreaker.js';
import { enrichVocabulary } from './vocabularyEnricher.js';
import { applyAntiDetection } from './antiDetection.js';
import { selfVerify } from './selfVerifier.js';

/**
 * Humanize text through multi-stage pipeline.
 *
 * Strength levels:
 * - light: Rules only (fast, ~1-2s)
 * - medium: Model + rules (moderate, ~5-15s)
 * - heavy/strong: Model + rules + self-verification loop (thorough, ~15-60s)
 *
 * Styles: natural, casual, academic, creative
 */
export async function humanize(text, options = {}) {
  const {
    style = 'natural',
    intensity = 'medium',
    maxIterations = 3,
  } = options;

  const startTime = Date.now();
  let current = text;

  // Stage 1: Parse sentences
  const parsed = parseSentences(current);
  let sentences = parsed.map(s => s.text);

  // Stage 2: Local transformer paraphrasing (medium/heavy only)
  if (intensity === 'medium' || intensity === 'heavy') {
    try {
      sentences = await paraphraseBatch(sentences);
    } catch (err) {
      console.warn('Model paraphrasing failed, using rule-based only:', err.message);
    }
  }

  // Stage 3a: Synonym replacement
  current = sentences.join(' ');
  current = replaceWithSynonyms(current, intensity);

  // Stage 3b: Sentence rewriting (structure transforms)
  sentences = current.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  sentences = rewriteSentences(sentences, intensity);
  current = sentences.join(' ');

  // Stage 3c: Discourse pattern breaking
  current = breakDiscoursePatterns(current, intensity);

  // Stage 3d: Vocabulary enrichment
  current = enrichVocabulary(current, style, intensity);

  // Stage 4: Anti-detection optimization
  current = applyAntiDetection(current, style, intensity);

  // Stage 5: Self-verification loop (heavy/strong only)
  let verificationResult = null;
  if (intensity === 'heavy') {
    for (let i = 0; i < maxIterations; i++) {
      const verification = await selfVerify(current);
      verificationResult = verification;

      if (verification.passed) break;

      // Re-process flagged sentences more aggressively
      if (verification.flaggedSentences.length > 0) {
        for (const flagged of verification.flaggedSentences) {
          const escaped = flagged.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, 'g');
          let replacement = replaceWithSynonyms(flagged, 'heavy');
          replacement = breakDiscoursePatterns(replacement, 'heavy');
          replacement = enrichVocabulary(replacement, style, 'heavy');
          current = current.replace(regex, replacement);
        }
      } else {
        // General re-processing
        current = replaceWithSynonyms(current, 'heavy');
        current = applyAntiDetection(current, style, 'heavy');
      }
    }
  }

  // Clean up double spaces, trailing whitespace
  current = current.replace(/\s+/g, ' ').trim();

  return {
    original: text,
    humanized: current,
    provider: 'indigenous',
    style,
    intensity,
    metadata: {
      processingTimeMs: Date.now() - startTime,
      stages: intensity === 'light' ? 3 : intensity === 'medium' ? 4 : 5,
      selfVerification: verificationResult,
      engine: 'local-cpu',
    },
  };
}
