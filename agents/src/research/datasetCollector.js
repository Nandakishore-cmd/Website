import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASET_INDEX_PATH = join(__dirname, '../../data/training/index.json');

export async function collectDatasets() {
  logger.info('Dataset collector starting...');

  const index = jsonStore.read(DATASET_INDEX_PATH, {
    collections: [],
    totalSamples: 0,
    lastCollection: null,
  });

  // Check for new samples from detection history
  const detectionHistory = jsonStore.read(
    join(__dirname, '../../data/detection-history.json'),
    []
  );

  const newSamples = detectionHistory.filter(
    entry => entry.verified && !index.collections.some(c => c.id === entry.id)
  );

  if (newSamples.length > 0) {
    for (const sample of newSamples) {
      index.collections.push({
        id: sample.id,
        label: sample.verifiedLabel,
        addedAt: new Date().toISOString(),
      });
    }
    index.totalSamples += newSamples.length;

    proposalQueue.submit({
      agent: 'Research Agent',
      type: 'dataset-update',
      description: `Added ${newSamples.length} new verified samples to training dataset`,
      rationale: 'New verified samples can improve detection accuracy through better calibration.',
      data: { newSamples: newSamples.length, totalSamples: index.totalSamples },
    });
  }

  index.lastCollection = new Date().toISOString();
  jsonStore.write(DATASET_INDEX_PATH, index);
  logger.info(`Dataset collector complete. Total samples: ${index.totalSamples}`);
}
