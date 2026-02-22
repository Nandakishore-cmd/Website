import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const aiPatterns = JSON.parse(readFileSync(join(__dirname, 'data/aiPatterns.json'), 'utf-8'));

/**
 * Break AI discourse patterns — replace formulaic transitions.
 */
export function breakDiscoursePatterns(text, intensity = 'medium') {
  let result = text;
  const rate = intensity === 'light' ? 0.4 : intensity === 'heavy' ? 0.9 : 0.7;

  // Replace AI transitions with human alternatives
  for (const [pattern, replacements] of Object.entries(aiPatterns.transitionReplacements)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, (match) => {
      if (Math.random() > rate) return match;
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      // Preserve case
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  // Break "First, ... Second, ... Third, ..." patterns
  result = result.replace(/\bFirst(?:ly)?,\s/gi, (m) => {
    if (Math.random() > rate) return m;
    const alts = ['To start, ', 'For one thing, ', 'Starting off, ', ''];
    return alts[Math.floor(Math.random() * alts.length)];
  });

  result = result.replace(/\bSecond(?:ly)?,\s/gi, (m) => {
    if (Math.random() > rate) return m;
    const alts = ['Next, ', 'Also, ', 'Then, ', 'Another thing — '];
    return alts[Math.floor(Math.random() * alts.length)];
  });

  result = result.replace(/\bThird(?:ly)?,\s/gi, (m) => {
    if (Math.random() > rate) return m;
    const alts = ['On top of that, ', 'And then, ', 'Plus, ', 'What\'s more, '];
    return alts[Math.floor(Math.random() * alts.length)];
  });

  result = result.replace(/\bFinally,\s/gi, (m) => {
    if (Math.random() > rate) return m;
    const alts = ['Last but not least, ', 'And lastly, ', 'One more thing — ', ''];
    return alts[Math.floor(Math.random() * alts.length)];
  });

  // Remove or replace "In conclusion" / "To summarize"
  result = result.replace(/\b(?:In conclusion|To summarize|In summary),?\s/gi, (m) => {
    if (Math.random() > rate) return m;
    const alts = ['So, ', 'Bottom line: ', 'All in all, ', 'Wrapping up, ', ''];
    return alts[Math.floor(Math.random() * alts.length)];
  });

  return result;
}
