import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const idiomData = JSON.parse(readFileSync(join(__dirname, 'data/idioms.json'), 'utf-8'));
const aiPatterns = JSON.parse(readFileSync(join(__dirname, 'data/aiPatterns.json'), 'utf-8'));

// Words that scream "AI wrote this"
const AI_VOCABULARY = {
  'utilize': 'use',
  'leverage': 'use',
  'facilitate': 'help',
  'implement': 'set up',
  'optimize': 'improve',
  'streamline': 'simplify',
  'paradigm': 'model',
  'synergy': 'teamwork',
  'holistic': 'complete',
  'scalable': 'flexible',
  'robust': 'strong',
  'pivotal': 'key',
  'paramount': 'top',
  'endeavor': 'effort',
  'encompass': 'include',
  'proliferation': 'spread',
  'multifaceted': 'complex',
  'delineate': 'outline',
  'elucidate': 'explain',
  'ubiquitous': 'common',
  'conducive': 'helpful',
  'trajectory': 'path',
  'catalyst': 'trigger',
  'garner': 'get',
  'bolster': 'boost',
  'augment': 'add to',
  'salient': 'key',
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

  return result;
}
