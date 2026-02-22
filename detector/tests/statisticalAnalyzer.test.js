import { analyzeStatistical } from '../engine/statistical.js';

describe('analyzeStatistical', () => {
  test('returns score between 0 and 1', () => {
    const result = analyzeStatistical('This is a test. It has multiple sentences. Each one differs in length and complexity. Some are short. Others, like this one, tend to meander a bit more and use different vocabulary choices throughout.');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  test('returns expected detail structure', () => {
    const result = analyzeStatistical('The quick brown fox jumps over the lazy dog. This is another sentence with different words. A third sentence adds variety.');
    expect(result.details).toHaveProperty('perplexity');
    expect(result.details).toHaveProperty('burstiness');
    expect(result.details).toHaveProperty('entropy');
    expect(result.details).toHaveProperty('ngramPredictability');
  });

  test('handles very short text', () => {
    const result = analyzeStatistical('Hi.');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
