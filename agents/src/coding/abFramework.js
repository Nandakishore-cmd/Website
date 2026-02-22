import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPERIMENTS_PATH = join(__dirname, '../../data/experiments.json');

export const abFramework = {
  createExperiment(name, variantA, variantB) {
    const experiments = jsonStore.read(EXPERIMENTS_PATH, []);
    const experiment = {
      id: Date.now().toString(36),
      name,
      variantA: { config: variantA, results: [] },
      variantB: { config: variantB, results: [] },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    experiments.push(experiment);
    jsonStore.write(EXPERIMENTS_PATH, experiments);

    proposalQueue.submit({
      agent: 'Coding Agent',
      type: 'experiment',
      description: `New A/B experiment proposed: ${name}`,
      rationale: 'Comparing two configurations to find optimal detection parameters.',
      data: { experimentId: experiment.id, variantA, variantB },
    });

    return experiment;
  },

  recordResult(experimentId, variant, result) {
    const experiments = jsonStore.read(EXPERIMENTS_PATH, []);
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment) return null;

    const target = variant === 'A' ? experiment.variantA : experiment.variantB;
    target.results.push({ ...result, recordedAt: new Date().toISOString() });

    // Check for statistical significance (simple: 20+ results per variant)
    if (experiment.variantA.results.length >= 20 && experiment.variantB.results.length >= 20) {
      const avgA = experiment.variantA.results.reduce((s, r) => s + r.accuracy, 0) / experiment.variantA.results.length;
      const avgB = experiment.variantB.results.reduce((s, r) => s + r.accuracy, 0) / experiment.variantB.results.length;

      experiment.status = 'complete';
      experiment.winner = avgA >= avgB ? 'A' : 'B';
      experiment.completedAt = new Date().toISOString();

      proposalQueue.submit({
        agent: 'Coding Agent',
        type: 'experiment-result',
        description: `Experiment "${experiment.name}" complete. Variant ${experiment.winner} wins (${(Math.max(avgA, avgB) * 100).toFixed(1)}% vs ${(Math.min(avgA, avgB) * 100).toFixed(1)}%)`,
        rationale: `Recommend applying variant ${experiment.winner} configuration.`,
        data: { experimentId, winner: experiment.winner, avgA, avgB },
      });
    }

    jsonStore.write(EXPERIMENTS_PATH, experiments);
    return experiment;
  },

  getActive() {
    const experiments = jsonStore.read(EXPERIMENTS_PATH, []);
    return experiments.filter(e => e.status === 'pending');
  },
};
