import { tokenizeSentences } from '../utils/tokenizer.js';

/**
 * Parse text into sentences with metadata.
 */
export function parseSentences(text) {
  const sentences = tokenizeSentences(text);
  return sentences.map((sentence, index) => ({
    text: sentence,
    index,
    wordCount: sentence.split(/\s+/).filter(w => w.length > 0).length,
    isQuestion: /\?$/.test(sentence.trim()),
    isExclamation: /!$/.test(sentence.trim()),
    startsWithTransition: /^(?:furthermore|moreover|additionally|consequently|nevertheless|however|therefore|thus|hence|indeed|specifically|notably)/i.test(sentence.trim()),
  }));
}

/**
 * Reconstruct text from sentence objects.
 */
export function reconstructText(sentenceObjs) {
  return sentenceObjs.map(s => s.text).join(' ');
}
