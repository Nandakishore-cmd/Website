/**
 * Structural sentence transforms.
 */

/**
 * Try to convert passive to active voice (simple heuristic).
 */
function passiveToActive(sentence) {
  // Simple pattern: "X was/were VERBed by Y" → "Y VERBed X"
  const passiveMatch = sentence.match(/^(.+?)\s+(?:was|were|is|are)\s+(\w+ed)\s+by\s+(.+?)([.!?]?)$/i);
  if (passiveMatch && Math.random() > 0.5) {
    const [, subject, verb, agent, punct] = passiveMatch;
    const activeVerb = verb.replace(/ed$/, '');
    return `${agent.trim()} ${activeVerb}ed ${subject.trim()}${punct}`;
  }
  return sentence;
}

/**
 * Split overly long sentences at conjunctions.
 */
function splitLongSentence(sentence) {
  const words = sentence.split(/\s+/);
  if (words.length < 25) return [sentence];

  // Try splitting at common conjunctions
  const splitPoints = [', and ', ', but ', ', however ', ', which ', '; '];
  for (const point of splitPoints) {
    const idx = sentence.indexOf(point);
    if (idx > 15 && idx < sentence.length - 15) {
      const first = sentence.slice(0, idx).trim() + '.';
      let second = sentence.slice(idx + point.length).trim();
      second = second.charAt(0).toUpperCase() + second.slice(1);
      if (!second.match(/[.!?]$/)) second += '.';
      return [first, second];
    }
  }

  return [sentence];
}

/**
 * Merge short consecutive sentences.
 */
function mergeShortSentences(sentences) {
  const merged = [];
  let i = 0;

  while (i < sentences.length) {
    const curr = sentences[i];
    const next = sentences[i + 1];

    if (next && curr.split(/\s+/).length < 8 && next.split(/\s+/).length < 8 && Math.random() > 0.5) {
      // Merge with conjunction
      const conjunctions = [' and ', ' — ', ', plus ', '; '];
      const conj = conjunctions[Math.floor(Math.random() * conjunctions.length)];
      const mergedSentence = curr.replace(/[.!?]$/, '') + conj + next.charAt(0).toLowerCase() + next.slice(1);
      merged.push(mergedSentence);
      i += 2;
    } else {
      merged.push(curr);
      i++;
    }
  }

  return merged;
}

/**
 * Reorder clauses in a sentence (swap beginning/end around comma).
 */
function reorderClauses(sentence) {
  const commaIdx = sentence.indexOf(', ');
  if (commaIdx > 10 && commaIdx < sentence.length - 10 && Math.random() > 0.6) {
    const firstPart = sentence.slice(0, commaIdx);
    let secondPart = sentence.slice(commaIdx + 2);
    const endPunct = secondPart.match(/([.!?])$/)?.[1] || '.';
    secondPart = secondPart.replace(/[.!?]$/, '');

    return secondPart.charAt(0).toUpperCase() + secondPart.slice(1) + ', ' +
           firstPart.charAt(0).toLowerCase() + firstPart.slice(1) + endPunct;
  }
  return sentence;
}

/**
 * Apply structural rewrites to sentences.
 */
export function rewriteSentences(sentences, intensity = 'medium') {
  const rate = intensity === 'light' ? 0.2 : intensity === 'heavy' ? 0.5 : 0.35;

  let result = sentences.map(s => {
    if (Math.random() > rate) return s;

    let rewritten = s;
    const transform = Math.random();

    if (transform < 0.3) {
      rewritten = passiveToActive(rewritten);
    } else if (transform < 0.6) {
      rewritten = reorderClauses(rewritten);
    }

    return rewritten;
  });

  // Apply splitting for long sentences
  const split = [];
  for (const s of result) {
    if (s.split(/\s+/).length > 30 && Math.random() > 0.4) {
      split.push(...splitLongSentence(s));
    } else {
      split.push(s);
    }
  }

  // Apply merging for short sentences
  if (Math.random() > 0.5) {
    return mergeShortSentences(split);
  }

  return split;
}
