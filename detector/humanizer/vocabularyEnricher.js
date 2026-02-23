import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aiPatterns = JSON.parse(readFileSync(join(__dirname, 'data/aiPatterns.json'), 'utf-8'));

// Words that scream "AI wrote this" (only entries NOT already in thesaurus.json)
const AI_VOCABULARY = {
  'paramount': 'top',
};

// Creative style transforms
const CREATIVE_TRANSFORMS = {
  intensifiers: {
    'very': ['incredibly', 'remarkably', 'strikingly'],
    'really': ['genuinely', 'truly', 'absolutely'],
    'extremely': ['wildly', 'breathtakingly', 'mind-bogglingly'],
    'highly': ['enormously', 'immensely', 'seriously'],
  },
  similePatterns: [
    { pattern: /is (?:very |really |extremely )?important/gi,
      replacements: ['matters more than people realize', 'carries real weight', 'is the kind of thing that sticks with you'] },
    { pattern: /is (?:very |really )?difficult/gi,
      replacements: ['is no walk in the park', 'is trickier than it sounds', 'takes real effort'] },
    { pattern: /is (?:very |really )?easy/gi,
      replacements: ['is a breeze', 'is simpler than you might think', 'comes naturally'] },
    { pattern: /is (?:very |really )?interesting/gi,
      replacements: ['is fascinating when you dig into it', 'grabs your attention', 'is surprisingly captivating'] },
  ],
  creativeOpeners: [
    'Picture this: ', 'Here is the thing -- ', 'Think of it this way: ',
    'Imagine for a moment: ', 'What strikes me is that ',
  ],
};

/**
 * Replace AI-typical vocabulary with human-natural words.
 */
export function enrichVocabulary(text, style = 'natural', intensity = 'medium') {
  let result = text;
  const rate = intensity === 'light' ? 0.3 : intensity === 'heavy' ? 0.8 : 0.5;

  // Replace AI vocabulary
  for (const [aiWord, humanWord] of Object.entries(AI_VOCABULARY)) {
    const regex = new RegExp(`\\b${aiWord}(?:s|d|ing|ed)?\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (Math.random() > rate) return match;
      const replacement = humanWord;
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  // Add contractions (casual/natural styles)
  if (style !== 'academic') {
    const contractions = [
      [/\bdo not\b/gi, "don't"],
      [/\bcannot\b/gi, "can't"],
      [/\bwill not\b/gi, "won't"],
      [/\bit is\b/gi, "it's"],
      [/\bthey are\b/gi, "they're"],
      [/\bwe are\b/gi, "we're"],
      [/\byou are\b/gi, "you're"],
      [/\bwould not\b/gi, "wouldn't"],
      [/\bcould not\b/gi, "couldn't"],
      [/\bshould not\b/gi, "shouldn't"],
      [/\bthat is\b/gi, "that's"],
      [/\bthere is\b/gi, "there's"],
      [/\bI am\b/g, "I'm"],
      [/\bI have\b/g, "I've"],
      [/\bI will\b/g, "I'll"],
    ];

    for (const [pattern, replacement] of contractions) {
      if (Math.random() < rate) {
        result = result.replace(pattern, replacement);
      }
    }
  }

  // Expand contractions for academic style
  if (style === 'academic') {
    const expansions = [
      [/\bdon't\b/gi, 'do not'],
      [/\bcan't\b/gi, 'cannot'],
      [/\bwon't\b/gi, 'will not'],
      [/\bit's\b/gi, 'it is'],
      [/\bthey're\b/gi, 'they are'],
      [/\bwe're\b/gi, 'we are'],
    ];

    for (const [pattern, replacement] of expansions) {
      result = result.replace(pattern, replacement);
    }
  }

  // Creative style: expressive transforms
  if (style === 'creative') {
    result = creativeEnrich(result);
  }

  return result;
}

/**
 * Apply creative-style transforms: expressive intensifiers, similes, creative openers.
 */
function creativeEnrich(text) {
  let result = text;

  // Replace bland intensifiers with expressive alternatives
  for (const [word, alts] of Object.entries(CREATIVE_TRANSFORMS.intensifiers)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (Math.random() < 0.5) return match;
      const alt = alts[Math.floor(Math.random() * alts.length)];
      return match[0] === match[0].toUpperCase()
        ? alt.charAt(0).toUpperCase() + alt.slice(1) : alt;
    });
  }

  // Apply simile patterns
  for (const { pattern, replacements } of CREATIVE_TRANSFORMS.similePatterns) {
    result = result.replace(pattern, (original) => {
      if (Math.random() < 0.4) return replacements[Math.floor(Math.random() * replacements.length)];
      return original;
    });
  }

  // Inject creative openers (~1 per 500 words)
  const sentences = result.split(/(?<=[.!?])\s+/);
  const wordCount = result.split(/\s+/).length;
  const injections = Math.floor(wordCount / 500) + (Math.random() < 0.3 ? 1 : 0);

  for (let i = 0; i < injections && i < 3; i++) {
    const idx = Math.floor((i + 1) * sentences.length / (injections + 1));
    if (sentences[idx] && sentences[idx].length > 20) {
      const opener = CREATIVE_TRANSFORMS.creativeOpeners[
        Math.floor(Math.random() * CREATIVE_TRANSFORMS.creativeOpeners.length)
      ];
      sentences[idx] = opener + sentences[idx].charAt(0).toLowerCase() + sentences[idx].slice(1);
    }
  }

  return sentences.join(' ');
}
