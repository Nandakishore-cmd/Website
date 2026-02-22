import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = join(__dirname, '../../data/detection-history.json');
const PATTERNS_PATH = join(__dirname, '../../data/pattern-analysis.json');

export async function updatePatterns() {
  logger.info('Pattern updater starting...');

  const history = jsonStore.read(HISTORY_PATH, []);
  const misclassified = history.filter(e => e.verified && e.classification !== e.verifiedLabel);

  if (misclassified.length === 0) {
    logger.info('No misclassified samples to analyze.');
    return;
  }

  // Analyze common words/phrases in misclassified samples
  const wordFreq = {};
  for (const entry of misclassified) {
    const words = (entry.text || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }
  }

  // Find most common words in misclassified text
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const analysis = {
    timestamp: new Date().toISOString(),
    totalMisclassified: misclassified.length,
    falsePositives: misclassified.filter(e => e.verifiedLabel === 'HUMAN' && e.classification === 'AI').length,
    falseNegatives: misclassified.filter(e => e.verifiedLabel === 'AI' && e.classification === 'HUMAN').length,
    topWords,
  };

  jsonStore.write(PATTERNS_PATH, analysis);

  if (misclassified.length >= 5) {
    proposalQueue.submit({
      agent: 'Coding Agent',
      type: 'pattern-update',
      description: `Pattern analysis: ${misclassified.length} misclassified samples analyzed`,
      rationale: `Found ${analysis.falsePositives} false positives and ${analysis.falseNegatives} false negatives. Top indicator words identified.`,
      data: analysis,
    });
  }

  logger.info(`Pattern updater complete. Analyzed ${misclassified.length} misclassified samples.`);
}
