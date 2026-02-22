import { analyzeLinguistic } from '../engine/linguistic.js';

describe('analyzeLinguistic', () => {
  test('returns score between 0 and 1', () => {
    const result = analyzeLinguistic('This is a simple test. It has enough sentences. We need a few more for analysis. The sentences vary in structure. Short ones too.');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  test('detects AI telltale patterns', () => {
    const aiText = "In today's digital landscape, it is important to note that leveraging cutting-edge technology is paramount. Furthermore, organizations must navigate the complexities of implementation.";
    const result = analyzeLinguistic(aiText);
    expect(result.details.telltalePatterns.matchCount).toBeGreaterThan(0);
  });

  test('returns low score for natural human text', () => {
    const humanText = "So I went to the store yesterday and bought some groceries. Nothing special, just the usual stuff. Milk, bread, eggs. Oh, and I grabbed some of those cookies my kid likes. The chocolate chip ones.";
    const result = analyzeLinguistic(humanText);
    expect(result.score).toBeLessThan(0.7);
  });

  test('returns all expected detail fields', () => {
    const result = analyzeLinguistic('Test text with enough content for analysis. Multiple sentences help. The analyzer needs several sentences. It processes them all. Results are returned.');
    expect(result.details).toHaveProperty('typeTokenRatio');
    expect(result.details).toHaveProperty('hapaxLegomena');
    expect(result.details).toHaveProperty('sentenceStructure');
    expect(result.details).toHaveProperty('readability');
    expect(result.details).toHaveProperty('transitions');
    expect(result.details).toHaveProperty('repetition');
    expect(result.details).toHaveProperty('telltalePatterns');
  });
});
