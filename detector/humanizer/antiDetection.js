import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aiPatterns = JSON.parse(readFileSync(join(__dirname, 'data/aiPatterns.json'), 'utf-8'));
const idiomData = JSON.parse(readFileSync(join(__dirname, 'data/idioms.json'), 'utf-8'));

/**
 * Inject burstiness — vary sentence lengths to mimic human writing patterns.
 */
function injectBurstiness(sentences) {
  return sentences.map((sentence, idx) => {
    const words = sentence.split(/\s+/);

    // Occasionally make a sentence very short
    if (words.length > 15 && Math.random() < 0.15) {
      const cutPoint = Math.floor(words.length * 0.4);
      const short = words.slice(0, cutPoint).join(' ');
      const rest = words.slice(cutPoint).join(' ');
      return short.replace(/[,;]$/, '') + '. ' +
             rest.charAt(0).toUpperCase() + rest.slice(1);
    }

    return sentence;
  });
}

/**
 * Add perplexity variation — inject unusual but valid word choices.
 */
function addPerplexityVariation(text) {
  // Occasionally add parenthetical asides
  const parentheticals = [
    ' (well, mostly)',
    ' (at least in theory)',
    ' (which is interesting)',
    ' (surprisingly enough)',
    ' (for better or worse)',
    ' (if that makes sense)',
    ' (or so they say)',
  ];

  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map(s => {
    if (Math.random() < 0.08 && s.length > 30) {
      const parenComment = parentheticals[Math.floor(Math.random() * parentheticals.length)];
      const insertPoint = s.lastIndexOf(',');
      if (insertPoint > 10) {
        return s.slice(0, insertPoint) + parenComment + s.slice(insertPoint);
      }
    }
    return s;
  }).join(' ');
}

/**
 * Add human imperfections — fragments, questions, hedging.
 */
function addHumanImperfections(text, style = 'natural') {
  let result = text;
  const sentences = result.split(/(?<=[.!?])\s+/);

  // Add occasional rhetorical questions
  if (sentences.length > 5 && Math.random() < 0.2) {
    const questions = [
      'But why does this matter?',
      'So what does this mean in practice?',
      'Sounds simple, right?',
      'Makes sense so far?',
      'But here\'s the catch.',
    ];
    const insertIdx = Math.floor(sentences.length * 0.3) + Math.floor(Math.random() * 3);
    const question = questions[Math.floor(Math.random() * questions.length)];
    sentences.splice(insertIdx, 0, question);
  }

  // Add hedging phrases
  if (style === 'casual' || style === 'natural') {
    for (let i = 0; i < sentences.length; i++) {
      if (Math.random() < 0.08 && sentences[i].length > 20) {
        const hedge = aiPatterns.hedgingPhrases[Math.floor(Math.random() * aiPatterns.hedgingPhrases.length)];
        sentences[i] = hedge + ', ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
      }
    }
  }

  // Add occasional human fragments/interjections
  if (style === 'casual' && sentences.length > 4) {
    if (Math.random() < 0.25) {
      const fragment = aiPatterns.humanFragments[Math.floor(Math.random() * aiPatterns.humanFragments.length)];
      const insertIdx = Math.floor(Math.random() * Math.min(3, sentences.length));
      if (sentences[insertIdx]) {
        sentences[insertIdx] = fragment + sentences[insertIdx].charAt(0).toLowerCase() + sentences[insertIdx].slice(1);
      }
    }
  }

  return sentences.join(' ');
}

/**
 * Inject idioms and colloquialisms for human texture.
 * Skipped for academic style; limited to 1-2 per passage.
 */
function injectIdioms(text, style) {
  if (style === 'academic') return text;

  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length < 4) return text;

  const pool = style === 'casual'
    ? [...idiomData.colloquialisms, ...idiomData.humanExpressions]
    : idiomData.colloquialisms;

  // Replace generic summary phrases with colloquial alternatives
  let result = text;
  if (idiomData.summaryReplacements) {
    for (const [phrase, alts] of Object.entries(idiomData.summaryReplacements)) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        if (Math.random() < 0.4) return match;
        const alt = alts[Math.floor(Math.random() * alts.length)];
        return match[0] === match[0].toUpperCase()
          ? alt.charAt(0).toUpperCase() + alt.slice(1) : alt;
      });
    }
  }

  // Inject 1 colloquialism as a sentence prefix at a natural break point
  const resultSentences = result.split(/(?<=[.!?])\s+/);
  if (Math.random() < 0.3 && resultSentences.length > 6) {
    const insertIdx = Math.floor(resultSentences.length * 0.4) + Math.floor(Math.random() * 3);
    const expression = pool[Math.floor(Math.random() * pool.length)];
    if (resultSentences[insertIdx]) {
      resultSentences[insertIdx] = expression.charAt(0).toUpperCase() + expression.slice(1) + ', ' +
        resultSentences[insertIdx].charAt(0).toLowerCase() + resultSentences[insertIdx].slice(1);
    }
    result = resultSentences.join(' ');
  }

  return result;
}

/**
 * Apply all anti-detection optimizations.
 */
export function applyAntiDetection(text, style = 'natural', intensity = 'medium') {
  let result = text;

  // Stage 1: Burstiness injection
  const sentences = result.split(/(?<=[.!?])\s+/);
  const bursty = injectBurstiness(sentences);
  result = bursty.join(' ');

  // Stage 2: Perplexity variation
  if (intensity !== 'light') {
    result = addPerplexityVariation(result);
  }

  // Stage 3: Human imperfections
  result = addHumanImperfections(result, style);

  // Stage 4: Idiom/colloquialism injection (non-light only)
  if (intensity !== 'light') {
    result = injectIdioms(result, style);
  }

  return result;
}
