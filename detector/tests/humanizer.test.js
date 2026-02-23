import { humanize } from '../humanizer/index.js';

const sampleText = 'Furthermore, it is important to note that artificial intelligence has significantly transformed the digital landscape. Moreover, organizations must leverage comprehensive strategies to optimize their outcomes. Additionally, the paradigm shift necessitates a holistic approach to implementation. This unprecedented transformation has fundamentally altered how we navigate the complexities of the modern world.';

describe('humanize pipeline', () => {
  test('returns required response shape', async () => {
    const result = await humanize(sampleText, { intensity: 'light' });
    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('humanized');
    expect(result).toHaveProperty('provider', 'indigenous');
    expect(result).toHaveProperty('style');
    expect(result).toHaveProperty('intensity');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('processingTimeMs');
    expect(result.metadata).toHaveProperty('engine', 'local-cpu');
  });

  test('output differs from input', async () => {
    const result = await humanize(sampleText, { intensity: 'medium' });
    expect(result.humanized).not.toBe(result.original);
  });

  test('different styles produce different outputs', async () => {
    const natural = await humanize(sampleText, { style: 'natural', intensity: 'medium' });
    const casual = await humanize(sampleText, { style: 'casual', intensity: 'medium' });
    const academic = await humanize(sampleText, { style: 'academic', intensity: 'medium' });
    // At least 2 of 3 should differ (randomness means they might occasionally match)
    const unique = new Set([natural.humanized, casual.humanized, academic.humanized]);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  test('handles short text gracefully', async () => {
    const result = await humanize('Hello world.', { intensity: 'light' });
    expect(result.humanized).toBeDefined();
    expect(typeof result.humanized).toBe('string');
  });

  test('preserves approximate sentence count', async () => {
    const inputSentences = sampleText.split(/(?<=[.!?])\s+/).length;
    const result = await humanize(sampleText, { intensity: 'light' });
    const outputSentences = result.humanized.split(/(?<=[.!?])\s+/).length;
    expect(Math.abs(outputSentences - inputSentences)).toBeLessThan(5);
  });

  test('onProgress callback fires for medium intensity', async () => {
    const events = [];
    await humanize(sampleText, { intensity: 'medium' }, (progress) => {
      events.push(progress);
    });
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('stage');
    expect(events[0]).toHaveProperty('detail');
    expect(events[0]).toHaveProperty('elapsed');
  });

  test('heavy mode includes self-verification metadata', async () => {
    const result = await humanize(sampleText, { intensity: 'heavy', maxIterations: 1 });
    expect(result.metadata.selfVerification).toBeDefined();
    expect(result.metadata.selfVerification).toHaveProperty('score');
    expect(result.metadata.selfVerification).toHaveProperty('passed');
  }, 120000);
});
