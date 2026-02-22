import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const thesaurus = JSON.parse(readFileSync(join(__dirname, 'data/thesaurus.json'), 'utf-8'));

/**
 * Context-aware synonym replacement.
 * Replaces AI-typical words with more natural alternatives.
 */
export function replaceWithSynonyms(text, intensity = 'medium') {
  const replacementRate = intensity === 'light' ? 0.2 : intensity === 'heavy' ? 0.6 : 0.4;

  let result = text;
  const words = Object.keys(thesaurus);

  for (const word of words) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (Math.random() > replacementRate) return match;

      const synonyms = thesaurus[word.toLowerCase()];
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
}
