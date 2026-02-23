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
export async function humanize(text, options = {}, onProgress = null) {
  const {
    style = 'natural',
    intensity = 'medium',
    maxIterations = 3,
  } = options;

  const startTime = Date.now();
  const emit = (stage, detail) => onProgress?.({ stage, detail, elapsed: Date.now() - startTime });
  let current = text;

  // Stage 1: Parse sentences
  emit('parse', 'Parsing sentences...');
  const parsed = parseSentences(current);
  let sentences = parsed.map(s => s.text);
  emit('parse', `Found ${sentences.length} sentences`);

  // Stage 2: Local transformer paraphrasing (medium/heavy only)
  if (intensity === 'medium' || intensity === 'heavy') {
    emit('model', 'Loading paraphrase engine...');
    try {
      sentences = await paraphraseBatch(sentences);
      emit('model', 'Paraphrasing complete');
    } catch (err) {
      emit('model', 'Model unavailable, using rule-based fallback');
      console.warn('Model paraphrasing failed, using rule-based only:', err.message);
    }
  }

  // Stage 3a: Synonym replacement
  emit('rules', 'Applying synonym replacement...');
  current = sentences.join(' ');
  current = replaceWithSynonyms(current, intensity);

  // Stage 3b: Sentence rewriting (structure transforms)
  emit('rules', 'Rewriting sentence structures...');
  sentences = parseSentences(current).map(s => s.text);
  sentences = rewriteSentences(sentences, intensity, style);
  current = sentences.join(' ');

  // Stage 3c: Discourse pattern breaking
  emit('rules', 'Breaking discourse patterns...');
  current = breakDiscoursePatterns(current, intensity);

  // Stage 3d: Vocabulary enrichment
  emit('rules', 'Enriching vocabulary...');
  current = enrichVocabulary(current, style, intensity);

  // Stage 4: Anti-detection optimization
  emit('antidetect', 'Applying anti-detection optimizations...');
  current = applyAntiDetection(current, style, intensity);

  // Stage 5: Self-verification loop (heavy/strong only)
  let verificationResult = null;
  if (intensity === 'heavy') {
    for (let i = 0; i < maxIterations; i++) {
      emit('verify', `Self-verification pass ${i + 1} of ${maxIterations}...`);
      const verification = await selfVerify(current);
      verificationResult = verification;

      if (verification.passed) {
        emit('verify', `Passed verification (score: ${Math.round(verification.score * 100)}%)`);
        break;
      }

      emit('verify', `Score ${Math.round(verification.score * 100)}% — re-processing flagged content...`);

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
  emit('complete', 'Done!');

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
