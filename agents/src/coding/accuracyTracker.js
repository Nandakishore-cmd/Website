import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACCURACY_PATH = join(__dirname, '../../data/accuracy-reports.json');
const HISTORY_PATH = join(__dirname, '../../data/detection-history.json');

export async function trackAccuracy() {
  logger.info('Accuracy tracker starting...');

  const history = jsonStore.read(HISTORY_PATH, []);
  const verified = history.filter(entry => entry.verified && entry.verifiedLabel);

  if (verified.length === 0) {
    logger.info('No verified samples to track accuracy against.');
    return;
  }

  // Calculate metrics per class
  const classes = ['HUMAN', 'MIXED', 'AI'];
  const metrics = {};
  let totalCorrect = 0;

  for (const cls of classes) {
    const truePositives = verified.filter(e => e.classification === cls && e.verifiedLabel === cls).length;
    const falsePositives = verified.filter(e => e.classification === cls && e.verifiedLabel !== cls).length;
    const falseNegatives = verified.filter(e => e.classification !== cls && e.verifiedLabel === cls).length;

    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    metrics[cls] = { precision: +precision.toFixed(3), recall: +recall.toFixed(3), f1: +f1.toFixed(3), truePositives, falsePositives, falseNegatives };
    totalCorrect += truePositives;
  }

  const overallAccuracy = verified.length > 0 ? +(totalCorrect / verified.length).toFixed(3) : 0;

  const report = {
    timestamp: new Date().toISOString(),
    totalVerified: verified.length,
    overallAccuracy,
    perClass: metrics,
  };

  const reports = jsonStore.read(ACCURACY_PATH, []);
  reports.push(report);
  // Keep last 100 reports
  if (reports.length > 100) reports.splice(0, reports.length - 100);
  jsonStore.write(ACCURACY_PATH, reports);

  // Alert if accuracy drops below threshold
  if (overallAccuracy < 0.7 && verified.length >= 10) {
    proposalQueue.submit({
      agent: 'Coding Agent',
      type: 'accuracy-alert',
      description: `Detection accuracy dropped to ${(overallAccuracy * 100).toFixed(1)}%`,
      rationale: `Based on ${verified.length} verified samples. Consider adjusting weights or detection parameters.`,
      data: { overallAccuracy, perClass: metrics },
    });
  }

  logger.info(`Accuracy tracking complete. Overall: ${(overallAccuracy * 100).toFixed(1)}% on ${verified.length} samples.`);
}
