import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEIGHTS_PATH = join(__dirname, '../../detector/config/weights.json');
const ACCURACY_PATH = join(__dirname, '../../data/accuracy-reports.json');

export async function tuneParameters() {
  logger.info('Parameter tuner starting...');

  const currentWeights = jsonStore.read(WEIGHTS_PATH);
  if (!currentWeights) {
    logger.warn('Cannot read detector weights.');
    return;
  }

  const reports = jsonStore.read(ACCURACY_PATH, []);
  if (reports.length < 2) {
    logger.info('Not enough accuracy reports for tuning.');
    return;
  }

  // Compare recent accuracy with older accuracy
  const recent = reports.slice(-5);
  const older = reports.slice(-10, -5);

  if (older.length === 0) return;

  const recentAvg = recent.reduce((s, r) => s + r.overallAccuracy, 0) / recent.length;
  const olderAvg = older.reduce((s, r) => s + r.overallAccuracy, 0) / older.length;

  // If accuracy is declining, propose weight adjustments
  if (recentAvg < olderAvg - 0.05) {
    const proposedWeights = { ...currentWeights };
    // Increase weight of statistical and linguistic (more reliable without API)
    proposedWeights.statistical = Math.min(0.45, currentWeights.statistical + 0.03);
    proposedWeights.linguistic = Math.min(0.40, currentWeights.linguistic + 0.02);
    // Decrease AI meta weight proportionally
    const increase = (proposedWeights.statistical - currentWeights.statistical) + (proposedWeights.linguistic - currentWeights.linguistic);
    proposedWeights.aiMeta = Math.max(0.15, currentWeights.aiMeta - increase);

    proposalQueue.submit({
      agent: 'Coding Agent',
      type: 'weight-adjustment',
      description: `Proposing weight adjustment: accuracy declined from ${(olderAvg * 100).toFixed(1)}% to ${(recentAvg * 100).toFixed(1)}%`,
      rationale: `Increase statistical (${currentWeights.statistical} → ${proposedWeights.statistical}) and linguistic (${currentWeights.linguistic} → ${proposedWeights.linguistic}) weights.`,
      data: { currentWeights, proposedWeights, recentAccuracy: recentAvg, olderAccuracy: olderAvg },
    });
  }

  logger.info('Parameter tuner complete.');
}
