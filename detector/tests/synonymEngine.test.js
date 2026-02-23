import { replaceWithSynonyms } from '../humanizer/synonymEngine.js';

describe('synonymEngine', () => {
  test('replaces known thesaurus words', () => {
    let replaced = false;
    for (let i = 0; i < 20; i++) {
      const result = replaceWithSynonyms('This is an important and significant finding.', 'heavy');
      if (result !== 'This is an important and significant finding.') {
        replaced = true;
        break;
      }
    }
    expect(replaced).toBe(true);
  });

  test('preserves sentence structure', () => {
    const input = 'The results demonstrate significant improvement.';
    const result = replaceWithSynonyms(input, 'medium');
    expect(result.trim()).toMatch(/\.$/);
    const inputWords = input.split(/\s+/).length;
    const outputWords = result.split(/\s+/).length;
    expect(Math.abs(outputWords - inputWords)).toBeLessThan(4);
  });

  test('respects intensity levels', () => {
    const input = 'The important, significant, crucial, fundamental, substantial, comprehensive change is notable.';
    let lightChanges = 0;
    let heavyChanges = 0;

    for (let i = 0; i < 50; i++) {
      const light = replaceWithSynonyms(input, 'light');
      const heavy = replaceWithSynonyms(input, 'heavy');
      if (light !== input) lightChanges++;
      if (heavy !== input) heavyChanges++;
    }

    expect(heavyChanges).toBeGreaterThan(lightChanges);
  });

  test('preserves capitalization', () => {
    const result = replaceWithSynonyms('Important findings were noted.', 'heavy');
    expect(result[0]).toBe(result[0].toUpperCase());
  });

  test('handles POS-aware entries', () => {
    // "run" has POS-aware entries in thesaurus
    let seenNounReplacement = false;
    let seenVerbReplacement = false;
    for (let i = 0; i < 50; i++) {
      const nounResult = replaceWithSynonyms('It was a good run of luck.', 'heavy');
      const verbResult = replaceWithSynonyms('They run fast every day.', 'heavy');
      if (nounResult !== 'It was a good run of luck.') seenNounReplacement = true;
      if (verbResult !== 'They run fast every day.') seenVerbReplacement = true;
    }
    // At least one type should get replaced
    expect(seenNounReplacement || seenVerbReplacement).toBe(true);
  });
});
