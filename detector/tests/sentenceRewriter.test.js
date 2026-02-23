import { rewriteSentences } from '../humanizer/sentenceRewriter.js';

describe('sentenceRewriter', () => {
  test('returns array of sentences', () => {
    const input = ['This is a test.', 'Another sentence here.'];
    const result = rewriteSentences(input, 'medium');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('splits long sentences', () => {
    const longSentence = 'This is a very long sentence that contains many words and ideas, and it should probably be split into smaller pieces because it goes on and on without stopping, which makes it harder to read and understand for most human readers.';
    let wasSplit = false;
    for (let i = 0; i < 20; i++) {
      const result = rewriteSentences([longSentence], 'heavy');
      if (result.length > 1) { wasSplit = true; break; }
    }
    expect(wasSplit).toBe(true);
  });

  test('does not destroy content', () => {
    const input = ['The cat sat on the mat.', 'Dogs are loyal animals.'];
    const result = rewriteSentences(input, 'medium');
    const allText = result.join(' ').toLowerCase();
    expect(allText).toContain('cat');
    expect(allText).toContain('dog');
  });

  test('creative style can inject fragments', () => {
    const longSentences = [
      'This is a very long sentence that goes on and on with many clauses and ideas that connect to each other in complex ways.',
      'Another lengthy sentence that provides extensive detail about the subject matter under discussion.',
      'A third sentence that is also quite long and detailed in its description of the various phenomena being studied.',
    ];
    let hasFragment = false;
    for (let i = 0; i < 30; i++) {
      const result = rewriteSentences(longSentences, 'heavy', 'creative');
      if (result.some(s => ['Bold claim.', 'Worth noting.', 'A subtle shift.', 'Not always, though.', 'And yet.'].includes(s))) {
        hasFragment = true;
        break;
      }
    }
    expect(hasFragment).toBe(true);
  });

  test('accepts style parameter without error', () => {
    const input = ['Test sentence one.', 'Test sentence two.'];
    expect(() => rewriteSentences(input, 'medium', 'natural')).not.toThrow();
    expect(() => rewriteSentences(input, 'medium', 'creative')).not.toThrow();
    expect(() => rewriteSentences(input, 'medium', 'academic')).not.toThrow();
  });
});
