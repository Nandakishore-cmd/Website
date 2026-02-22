import { tokenizeWords, tokenizeSentences, countSyllables } from '../utils/tokenizer.js';
import { wordFrequency, meanAndStdDev, clamp01 } from '../utils/textStats.js';

// Common AI transition phrases (weighted indicators)
const AI_TRANSITIONS = [
  'furthermore', 'moreover', 'additionally', 'in conclusion',
  'it is important to note', 'it is worth noting', 'in summary',
  'on the other hand', 'in other words', 'that being said',
  'with that in mind', 'having said that', 'in this regard',
  'to summarize', 'in essence', 'broadly speaking',
  'it should be noted', 'it goes without saying',
  'consequently', 'nevertheless', 'nonetheless',
  'in addition to this', 'as a result', 'for instance',
  'in particular', 'specifically', 'notably',
  'to elaborate', 'to illustrate', 'in contrast',
];

// 80+ AI telltale patterns
const AI_TELLTALE_PATTERNS = [
  /as an ai/i,
  /it'?s important to note/i,
  /let'?s delve into/i,
  /in today'?s digital landscape/i,
  /in today'?s world/i,
  /in today'?s (?:rapidly |ever[- ])?(?:evolving|changing)/i,
  /it'?s worth mentioning/i,
  /at the end of the day/i,
  /in the realm of/i,
  /a testament to/i,
  /navigating the/i,
  /the landscape of/i,
  /unlock(?:ing)? the (?:full )?potential/i,
  /foster(?:ing)? (?:a (?:sense|culture) of |innovation|growth)/i,
  /delve deeper/i,
  /tapestry of/i,
  /it'?s crucial to/i,
  /paramount importance/i,
  /seamlessly/i,
  /leverage(?:d|s|ing)?/i,
  /utilize(?:d|s|ing)?/i,
  /facilitate(?:d|s|ing)?/i,
  /comprehensive (?:guide|overview|analysis|understanding)/i,
  /embark on/i,
  /cutting[- ]edge/i,
  /game[- ]?changer/i,
  /in this article/i,
  /(?:plays?|serve[sd]?) (?:a )?(?:crucial|vital|pivotal|key) role/i,
  /it cannot be (?:overstated|understated)/i,
  /a myriad of/i,
  /a plethora of/i,
  /a multitude of/i,
  /the intricacies of/i,
  /the nuances of/i,
  /shed(?:s|ding)? light on/i,
  /pav(?:e|es|ing) the way/i,
  /(?:robust|holistic|scalable) (?:solution|approach|framework)/i,
  /(?:empower|equip)(?:s|ing|ed)? (?:individuals|people|users|teams)/i,
  /in the (?:ever[- ])?(?:evolving|changing) (?:landscape|world)/i,
  /(?:stands?|remain[sd]?) as a (?:testament|beacon|reminder)/i,
  /(?:it is|it'?s) (?:essential|imperative|crucial) (?:to|that)/i,
  /one cannot (?:simply|merely|just)/i,
  /(?:this|it) raises the question/i,
  /by and large/i,
  /all things considered/i,
  /in light of (?:this|these|the)/i,
  /the aforementioned/i,
  /as (?:previously )?mentioned (?:earlier|above|before)/i,
  /in the context of/i,
  /from this perspective/i,
  /through the lens of/i,
  /when it comes to/i,
  /in order to (?:ensure|achieve|maintain)/i,
  /(?:a |the )?(?:key|critical|essential) (?:aspect|component|element|factor)/i,
  /not only .{5,40} but also/i,
  /whether .{5,30} or .{5,30}/i,
  /(?:have|has) (?:significantly|dramatically|fundamentally) (?:changed|transformed)/i,
  /(?:innovative|dynamic|versatile|sustainable) (?:solution|approach|platform)/i,
  /(?:by|through) (?:leveraging|utilizing|implementing|harnessing)/i,
  /in (?:an|this) (?:era|age) of/i,
  /(?:the|this) (?:process|journey|experience) of/i,
  /(?:ensure|maintain|establish)(?:s|ing)? (?:a )?(?:strong|solid|robust)/i,
  /(?:significantly|substantially|considerably) (?:impact|improve|enhance)/i,
  /(?:the|this) (?:importance|significance) of (?:this|these)/i,
  /(?:empower|enable|prepare|position)(?:s|ing|ed)? .{0,20} to/i,
  /(?:seamlessly|effortlessly|efficiently) (?:integrate|blend|combine)/i,
  /the (?:key|secret|answer|solution) (?:to|for|lies)/i,
  /(?:cornerstone|pillar|foundation) of/i,
  /(?:with|given) (?:the|this|these) (?:rapid|ongoing|growing)/i,
  /dive (?:deep|deeper) into/i,
  /take (?:a )?(?:closer|deeper) look/i,
  /(?:the|a) (?:world|realm|field|domain) of/i,
  /(?:have you ever|did you know|are you looking)/i,
  /(?:in|throughout) (?:recent years|history|the past)/i,
  /(?:there'?s no denying|it'?s no secret)/i,
  /(?:first|second|third|finally),? (?:it is|it'?s|we|let)/i,
  /(?:this|these|such) (?:approach|method|technique|strategy)e?s? (?:offer|provide|enable)/i,
  /(?:can|could|may|will) (?:significantly|dramatically|profoundly) (?:impact|affect)/i,
  /(?:rich|vast|wide) (?:array|range|spectrum|variety) of/i,
  /(?:at its core|at the heart of)/i,
  /(?:redefine|revolutionize|reshape|transform)(?:s|d|ing)? (?:the|how|our)/i,
  /(?:boast|offer|provide)(?:s|ing)? (?:a )?(?:wide|rich|vast|broad) (?:range|array|variety)/i,
  /(?:strike|strikes|striking) (?:a )?(?:balance|chord)/i,
  /(?:the bottom line|long story short|to put it simply)/i,
  /(?:wrapping up|to wrap up|in closing)/i,
  /(?:food for thought|something to consider)/i,
];

/**
 * Type-Token Ratio — vocabulary richness.
 */
function typeTokenRatio(words) {
  if (words.length === 0) return { score: 0.5, ttr: 0 };
  const unique = new Set(words).size;
  const ttr = unique / words.length;
  const score = clamp01(1 - (ttr - 0.3) / 0.5);
  return { score, ttr };
}

/**
 * Hapax legomena — words appearing exactly once.
 */
function hapaxLegomenaRatio(words) {
  if (words.length === 0) return { score: 0.5, ratio: 0 };
  const freq = wordFrequency(words);
  const hapax = [...freq.values()].filter(c => c === 1).length;
  const unique = freq.size;
  if (unique === 0) return { score: 0.5, ratio: 0 };
  const ratio = hapax / unique;
  const score = clamp01(1 - (ratio - 0.4) / 0.35);
  return { score, ratio };
}

/**
 * Sentence structure variation.
 */
function sentenceStructureVariation(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, lengthCV: 0, starterDiversity: 0 };

  const lengths = sentences.map(s => tokenizeWords(s).length);
  const { mean, stdDev } = meanAndStdDev(lengths);
  const lengthCV = mean > 0 ? stdDev / mean : 0;

  const starters = sentences.map(s => {
    const words = tokenizeWords(s);
    return words.length > 0 ? words[0] : '';
  });
  const uniqueStarters = new Set(starters).size;
  const starterDiversity = starters.length > 0 ? uniqueStarters / starters.length : 0;

  const lengthScore = clamp01(1 - (lengthCV - 0.2) / 0.5);
  const starterScore = clamp01(1 - (starterDiversity - 0.3) / 0.5);

  return {
    score: clamp01(lengthScore * 0.5 + starterScore * 0.5),
    lengthCV,
    starterDiversity,
  };
}

/**
 * Flesch-Kincaid readability consistency.
 */
function readabilityConsistency(text) {
  const sentences = tokenizeSentences(text);
  if (sentences.length < 3) return { score: 0.5, avgReadability: 0, readabilityCV: 0 };

  const readabilityScores = sentences.map(sentence => {
    const words = tokenizeWords(sentence);
    if (words.length === 0) return 50;
    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    return 206.835 - 1.015 * words.length - 84.6 * (syllables / Math.max(words.length, 1));
  });

  const { mean, stdDev } = meanAndStdDev(readabilityScores);
  const cv = mean !== 0 ? Math.abs(stdDev / mean) : 0;
  const score = clamp01(1 - (cv - 0.1) / 0.6);

  return { score, avgReadability: mean, readabilityCV: cv };
}

/**
 * Count AI transition phrases.
 */
function transitionFrequency(text) {
  const words = tokenizeWords(text);
  if (words.length === 0) return { score: 0.5, count: 0, density: 0 };

  let count = 0;
  for (const phrase of AI_TRANSITIONS) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  }

  const density = count / (words.length / 100);
  const score = clamp01(density / 3);

  return { score, count, density };
}

/**
 * Detect repeated phrases (3+ words appearing 2+ times).
 */
function repetitionDetection(text) {
  const words = tokenizeWords(text);
  if (words.length < 20) return { score: 0.5, repeatedPhrases: 0 };

  const phrases = new Map();
  for (let len = 3; len <= 6; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  }

  const repeated = [...phrases.values()].filter(c => c >= 2).length;
  const total = phrases.size || 1;
  const ratio = repeated / total;
  const score = clamp01(ratio * 5);

  return { score, repeatedPhrases: repeated };
}

/**
 * Check for AI telltale patterns (80+).
 */
function telltalePatterns(text) {
  let matches = 0;
  const found = [];

  for (const pattern of AI_TELLTALE_PATTERNS) {
    if (pattern.test(text)) {
      matches++;
      found.push(pattern.source);
    }
  }

  const score = clamp01(matches / 5);

  return { score, matchCount: matches, patterns: found };
}

/**
 * Run all linguistic analyses.
 */
export function analyzeLinguistic(text) {
  const words = tokenizeWords(text);
  const ttr = typeTokenRatio(words);
  const hapax = hapaxLegomenaRatio(words);
  const structure = sentenceStructureVariation(text);
  const readability = readabilityConsistency(text);
  const transitions = transitionFrequency(text);
  const repetition = repetitionDetection(text);
  const telltales = telltalePatterns(text);

  const score = clamp01(
    ttr.score * 0.12 +
    hapax.score * 0.10 +
    structure.score * 0.18 +
    readability.score * 0.15 +
    transitions.score * 0.15 +
    repetition.score * 0.10 +
    telltales.score * 0.20
  );

  return {
    score,
    details: {
      typeTokenRatio: { score: ttr.score, ttr: ttr.ttr },
      hapaxLegomena: { score: hapax.score, ratio: hapax.ratio },
      sentenceStructure: { score: structure.score, lengthCV: structure.lengthCV, starterDiversity: structure.starterDiversity },
      readability: { score: readability.score, avgReadability: readability.avgReadability, readabilityCV: readability.readabilityCV },
      transitions: { score: transitions.score, count: transitions.count, density: transitions.density },
      repetition: { score: repetition.score, repeatedPhrases: repetition.repeatedPhrases },
      telltalePatterns: { score: telltales.score, matchCount: telltales.matchCount, patterns: telltales.patterns },
    },
  };
}
