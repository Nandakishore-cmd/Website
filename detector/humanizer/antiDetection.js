import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aiPatterns = JSON.parse(readFileSync(join(__dirname, 'data/aiPatterns.json'), 'utf-8'));

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

  return result;
}
