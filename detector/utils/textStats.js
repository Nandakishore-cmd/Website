/**
 * Calculate word frequency map.
 */
export function wordFrequency(words) {
  const freq = new Map();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return freq;
}

/**
 * Calculate Shannon entropy of a token sequence.
 * H = -Σ p(x) * log2(p(x))
 */
export function shannonEntropy(tokens) {
  if (tokens.length === 0) return 0;
  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  let entropy = 0;
  const total = tokens.length;
  for (const count of freq.values()) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Calculate n-gram frequency map.
 */
export function ngramFrequency(ngrams) {
  const freq = new Map();
  for (const ng of ngrams) {
    freq.set(ng, (freq.get(ng) || 0) + 1);
  }
  return freq;
}

/**
 * Calculate mean and standard deviation of a number array.
 */
export function meanAndStdDev(numbers) {
  if (numbers.length === 0) return { mean: 0, stdDev: 0 };
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, val) => sum + (val - mean) ** 2, 0) / numbers.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

/**
 * Clamp a value between 0 and 1.
 */
export function clamp01(val) {
  return Math.max(0, Math.min(1, val));
}
