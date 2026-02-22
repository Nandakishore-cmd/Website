import { analyzeText } from '../engine/analyzer.js';

// Note: these tests run the full analyzer pipeline
// The aiMeta analyzer will return null unless API keys are set
describe('analyzeText', () => {
  test('returns proper response structure', async () => {
    const result = await analyzeText('This is a test sentence that should be long enough to analyze properly. We need multiple sentences for the analyzers to work correctly. Here is another sentence with different words.');

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('classification');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('weights');
    expect(result).toHaveProperty('effectiveWeights');
    expect(result).toHaveProperty('metadata');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(['HUMAN', 'MIXED', 'AI']).toContain(result.classification);
  });

  test('scores known AI text higher than known human text', async () => {
    const humanText = "I couldn't believe what happened at the grocery store today. This old guy in front of me was arguing with the cashier about expired coupons. Meanwhile, I'm standing there with my ice cream melting. Finally gave up and switched to self-checkout, which of course didn't work either.";

    const aiText = "In today's rapidly evolving digital landscape, artificial intelligence has emerged as a transformative force. Moreover, the integration of machine learning algorithms has significantly enhanced efficiency. Furthermore, it is important to note that comprehensive strategies must be developed. Additionally, organizations must navigate the complexities of implementation.";

    const humanResult = await analyzeText(humanText);
    const aiResult = await analyzeText(aiText);

    expect(aiResult.score).toBeGreaterThan(humanResult.score);
  });

  test('handles short text gracefully', async () => {
    const result = await analyzeText('Hello world.');
    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  test('weights redistribute when aiMeta is null', async () => {
    const result = await analyzeText('Test text for weight redistribution analysis with enough words.');
    // Without API keys, aiMeta should be null and weights redistributed
    if (result.breakdown.aiMeta === null) {
      expect(result.effectiveWeights).not.toHaveProperty('aiMeta');
      const totalWeight = Object.values(result.effectiveWeights).reduce((a, b) => a + b, 0);
      expect(totalWeight).toBeCloseTo(1.0, 1);
    }
  });
});
