import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tokenizeWords } from '../utils/tokenizer.js';
import { clamp01 } from '../utils/textStats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fingerprints = JSON.parse(readFileSync(join(__dirname, 'data/fingerprints.json'), 'utf-8'));

// Compile regex patterns once
const compiledPatterns = fingerprints.patterns.map(p => new RegExp(p, 'gi'));
const compiledOpening = fingerprints.openingPatterns.map(p => new RegExp(p, 'i'));
const compiledClosing = fingerprints.closingPatterns.map(p => new RegExp(p, 'i'));

/**
 * Check text against known AI-generated phrase fingerprints.
 */
function phraseMatching(text) {
  const lowerText = text.toLowerCase();
  const words = tokenizeWords(text);
  let matches = 0;
  const found = [];

  for (const phrase of fingerprints.phrases) {
    if (lowerText.includes(phrase)) {
      matches++;
      found.push(phrase);
    }
  }

  const density = words.length > 0 ? matches / (words.length / 100) : 0;
  // Even 2-3 matches per 100 words is significant
  const score = clamp01(density / 2.5);

  return { score, matches, density, found: found.slice(0, 10) };
}

/**
 * Check against compiled regex patterns for AI structure.
 */
function patternMatching(text) {
  let totalMatches = 0;
  const found = [];

  for (const pattern of compiledPatterns) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      totalMatches += matches.length;
      found.push(pattern.source);
    }
  }

  const words = tokenizeWords(text);
  const density = words.length > 0 ? totalMatches / (words.length / 100) : 0;
  const score = clamp01(density / 3);

  return { score, matches: totalMatches, density, found: found.slice(0, 10) };
}

/**
 * Check opening and closing patterns (strong AI signals).
 */
function structuralPatterns(text) {
  const trimmed = text.trim();
  let openingMatch = false;
  let closingMatch = false;

  for (const p of compiledOpening) {
    if (p.test(trimmed)) {
      openingMatch = true;
      break;
    }
  }

  // Check last ~200 chars for closing patterns
  const tail = trimmed.slice(-300);
  for (const p of compiledClosing) {
    if (p.test(tail)) {
      closingMatch = true;
      break;
    }
  }

  let score = 0;
  if (openingMatch) score += 0.4;
  if (closingMatch) score += 0.4;
  if (openingMatch && closingMatch) score += 0.2; // Both = very strong signal

  return { score: clamp01(score), openingMatch, closingMatch };
}

/**
 * Run all fingerprint analyses.
 */
export function analyzeFingerprint(text) {
  const phrases = phraseMatching(text);
  const patterns = patternMatching(text);
  const structural = structuralPatterns(text);

  const score = clamp01(
    phrases.score * 0.40 +
    patterns.score * 0.35 +
    structural.score * 0.25
  );

  return {
    score,
    details: {
      phrases: { score: phrases.score, matches: phrases.matches, density: phrases.density, found: phrases.found },
      patterns: { score: patterns.score, matches: patterns.matches, density: patterns.density },
      structural: { score: structural.score, opening: structural.openingMatch, closing: structural.closingMatch },
    },
  };
}
