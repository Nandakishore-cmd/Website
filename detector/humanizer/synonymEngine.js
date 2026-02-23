import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nlp from 'compromise';

const __dirname = dirname(fileURLToPath(import.meta.url));
const thesaurus = JSON.parse(readFileSync(join(__dirname, 'data/thesaurus.json'), 'utf-8'));

/**
 * Determine the part of speech of a word within a sentence using compromise.
 */
function getPOS(word, sentence) {
  const doc = nlp(sentence);
  const term = doc.match(word).first();
  if (!term.found) return null;
  if (term.verbs().found) return 'verb';
  if (term.nouns().found) return 'noun';
  if (term.adjectives().found) return 'adjective';
  if (term.adverbs().found) return 'adverb';
  return null;
}

/**
 * Context-aware synonym replacement with POS disambiguation.
 * Supports POS-aware entries (object format) and flat entries (array format).
 */
export function replaceWithSynonyms(text, intensity = 'medium') {
  const replacementRate = intensity === 'light' ? 0.2 : intensity === 'heavy' ? 0.6 : 0.4;

  // Split into sentences for POS context
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

  return sentences.map(sentence => {
    let result = sentence;
    for (const word of Object.keys(thesaurus)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        if (Math.random() > replacementRate) return match;

        const entry = thesaurus[word.toLowerCase()];
        let synonyms;

        if (Array.isArray(entry)) {
          synonyms = entry;
        } else if (entry && typeof entry === 'object') {
          const pos = getPOS(word, sentence);
          synonyms = (pos && entry[pos]) ? entry[pos] : Object.values(entry).flat();
        } else {
          return match;
        }

        if (!synonyms || synonyms.length === 0) return match;
        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];

        // Preserve capitalization
        if (match[0] === match[0].toUpperCase()) {
          return synonym.charAt(0).toUpperCase() + synonym.slice(1);
        }
        return synonym;
      });
    }
    return result;
  }).join(' ');
}
