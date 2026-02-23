import nlp from 'compromise';

let pipeline = null;
let loading = false;
let modelFailed = false;
let modelStatus = 'not_loaded'; // 'not_loaded' | 'loading' | 'ready' | 'failed'
let modelError = null;

/**
 * Get current model loading status.
 */
export function getModelStatus() {
  return { status: modelStatus, error: modelError };
}

/**
 * Load the local transformer model (downloads once, then cached).
 * Uses @xenova/transformers for 100% local CPU inference.
 */
async function loadModel() {
  if (pipeline) return pipeline;
  if (modelFailed) return null;
  if (loading) {
    // Wait for loading to complete (max 120s)
    let waited = 0;
    while (loading && waited < 120000) {
      await new Promise(r => setTimeout(r, 200));
      waited += 200;
    }
    return pipeline;
  }

  loading = true;
  modelStatus = 'loading';
  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M', {
      quantized: true,
    });
    modelStatus = 'ready';
    return pipeline;
  } catch (err) {
    console.error('Failed to load transformer model:', err.message);
    console.log('Falling back to rule-based paraphrasing.');
    modelFailed = true;
    modelStatus = 'failed';
    modelError = err.message;
    return null;
  } finally {
    loading = false;
  }
}

/**
 * Compromise-based paraphrase: clause reordering and tense variation.
 */
function compromiseParaphrase(sentence) {
  if (!sentence || sentence.trim().length < 15) return sentence;

  // Try clause reorder around comma
  const commaIdx = sentence.indexOf(', ');
  if (commaIdx > 10 && commaIdx < sentence.length - 10 && Math.random() > 0.5) {
    const first = sentence.slice(0, commaIdx);
    let second = sentence.slice(commaIdx + 2);
    const punct = second.match(/([.!?])$/)?.[1] || '.';
    second = second.replace(/[.!?]$/, '');
    return second.charAt(0).toUpperCase() + second.slice(1) + ', ' +
           first.charAt(0).toLowerCase() + first.slice(1) + punct;
  }

  // Try tense variation using compromise
  try {
    const doc = nlp(sentence);
    let changed = doc.sentences().toPastTense().text();
    if (changed === sentence) {
      changed = doc.sentences().toPresentTense().text();
    }
    if (changed !== sentence) return changed;
  } catch {
    // compromise parsing failed, fall through
  }

  return sentence;
}

// --- Rule-based fallback paraphraser ---

const CLAUSE_STARTERS = [
  'which means', 'and this', 'meaning that', 'so basically',
  'in other words', 'that is to say', 'put differently',
];

const SENTENCE_OPENERS = [
  'Interestingly, ', 'As it turns out, ', 'In practice, ',
  'Looking at it closely, ', 'When you think about it, ', 'Broadly speaking, ',
  'From a practical standpoint, ', 'On closer inspection, ',
];

/**
 * Rule-based paraphrasing fallback when transformer model is unavailable.
 * Applies structural transforms to make sentences sound different.
 */
function ruleBasedParaphrase(sentence) {
  if (!sentence || sentence.trim().length < 15) return sentence;

  let result = sentence;
  const roll = Math.random();

  // Strategy 1: Swap clauses around a comma (30%)
  if (roll < 0.3) {
    const commaIdx = result.indexOf(', ');
    if (commaIdx > 12 && commaIdx < result.length - 12) {
      const first = result.slice(0, commaIdx);
      let second = result.slice(commaIdx + 2);
      const punct = second.match(/([.!?])$/)?.[1] || '.';
      second = second.replace(/[.!?]$/, '');
      result = second.charAt(0).toUpperCase() + second.slice(1) + ', ' +
               first.charAt(0).toLowerCase() + first.slice(1) + punct;
    }
  }
  // Strategy 2: Add a sentence opener (25%)
  else if (roll < 0.55) {
    const opener = SENTENCE_OPENERS[Math.floor(Math.random() * SENTENCE_OPENERS.length)];
    if (!/^(?:Interestingly|As it|In practice|Looking|When you|Broadly|From a|On closer)/i.test(result)) {
      result = opener + result.charAt(0).toLowerCase() + result.slice(1);
    }
  }
  // Strategy 3: Convert "X is Y" to "Y is what X is about" style (15%)
  else if (roll < 0.7) {
    const isMatch = result.match(/^(.{10,}?)\s+(?:is|are|was|were)\s+(.{10,})$/i);
    if (isMatch) {
      const [, subject, predicate] = isMatch;
      const punct = predicate.match(/([.!?])$/)?.[1] || '.';
      const cleanPred = predicate.replace(/[.!?]$/, '');
      result = `What we see here is that ${subject.charAt(0).toLowerCase() + subject.slice(1)} ${isMatch[0].match(/\b(?:is|are|was|were)\b/i)[0]} ${cleanPred}${punct}`;
    }
  }
  // Strategy 4: Split at conjunction and rephrase (15%)
  else if (roll < 0.85) {
    const conjunctions = [' and ', ' but ', ' yet ', ' while '];
    for (const conj of conjunctions) {
      const idx = result.indexOf(conj);
      if (idx > 15 && idx < result.length - 15) {
        const first = result.slice(0, idx).replace(/[.!?]$/, '').trim();
        let second = result.slice(idx + conj.length).trim();
        const punct = second.match(/([.!?])$/)?.[1] || '.';
        second = second.replace(/[.!?]$/, '');
        result = first + '.' + ' ' + second.charAt(0).toUpperCase() + second.slice(1) + punct;
        break;
      }
    }
  }
  // Strategy 5: Parenthetical insertion (15%)
  else {
    const words = result.split(/\s+/);
    if (words.length > 8) {
      const insertAt = Math.floor(words.length * 0.4) + Math.floor(Math.random() * 3);
      const aside = CLAUSE_STARTERS[Math.floor(Math.random() * CLAUSE_STARTERS.length)];
      // Only insert parenthetical if not already present
      if (!result.includes('(') && !result.includes(' — ')) {
        words.splice(insertAt, 0, '—');
        words.splice(insertAt + 1, 0, aside + ' —');
        // This can get awkward, so just use the opener strategy instead
        const opener = SENTENCE_OPENERS[Math.floor(Math.random() * SENTENCE_OPENERS.length)];
        result = opener + result.charAt(0).toLowerCase() + result.slice(1);
      }
    }
  }

  return result;
}

/**
 * Paraphrase a sentence using local transformer model, with rule-based fallback.
 * Falls through: model -> rule-based -> compromise-based.
 */
export async function paraphraseSentence(sentence) {
  try {
    const model = await loadModel();
    if (!model) {
      // Use rule-based with compromise enhancement
      const result = ruleBasedParaphrase(sentence);
      return result !== sentence ? result : compromiseParaphrase(sentence);
    }

    const prompt = `Paraphrase the following sentence while keeping the same meaning: ${sentence}`;
    const result = await model(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      do_sample: true,
    });

    const output = result[0]?.generated_text?.trim();
    // Only use model output if it's reasonable
    if (output && output.length > 10 && output.length < sentence.length * 3) {
      return output;
    }
    return ruleBasedParaphrase(sentence);
  } catch {
    const result = ruleBasedParaphrase(sentence);
    return result !== sentence ? result : compromiseParaphrase(sentence);
  }
}

// Pre-warm model in background on module import
setTimeout(() => {
  loadModel().catch(() => {
    console.log('Model pre-load failed, will use rule-based fallback');
  });
}, 1000);

/**
 * Paraphrase multiple sentences in batch.
 * Applies paraphrasing to a subset of sentences (not all) to preserve natural variation.
 */
export async function paraphraseBatch(sentences) {
  const results = [];
  for (let i = 0; i < sentences.length; i++) {
    // Paraphrase ~60% of sentences to maintain natural variation
    if (Math.random() < 0.6 && sentences[i].trim().length > 15) {
      const paraphrased = await paraphraseSentence(sentences[i]);
      results.push(paraphrased);
    } else {
      results.push(sentences[i]);
    }
  }
  return results;
}
