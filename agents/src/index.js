import cron from 'node-cron';
import { logger } from './shared/logger.js';
import { scrapeArxiv } from './research/arxivScraper.js';
import { monitorGithub } from './research/githubMonitor.js';
import { scrapeWeb } from './research/webScraper.js';
import { collectDatasets } from './research/datasetCollector.js';
import { checkHealth } from './coding/healthMonitor.js';
import { trackAccuracy } from './coding/accuracyTracker.js';
import { tuneParameters } from './coding/parameterTuner.js';
import { updatePatterns } from './coding/patternUpdater.js';

logger.info('SafeWrite Agents starting...');

// Research Agent schedules
cron.schedule('0 */6 * * *', () => {
  scrapeArxiv().catch(err => logger.error('ArXiv scraper failed', { error: err.message }));
});

cron.schedule('0 */4 * * *', () => {
  monitorGithub().catch(err => logger.error('GitHub monitor failed', { error: err.message }));
});

cron.schedule('0 */12 * * *', () => {
  scrapeWeb().catch(err => logger.error('Web scraper failed', { error: err.message }));
});

cron.schedule('0 2 * * *', () => {
  collectDatasets().catch(err => logger.error('Dataset collector failed', { error: err.message }));
});

// Coding Agent schedules
cron.schedule('*/5 * * * *', () => {
  checkHealth().catch(err => logger.error('Health monitor failed', { error: err.message }));
});

cron.schedule('0 * * * *', () => {
  trackAccuracy().catch(err => logger.error('Accuracy tracker failed', { error: err.message }));
});

cron.schedule('0 */8 * * *', () => {
  tuneParameters().catch(err => logger.error('Parameter tuner failed', { error: err.message }));
});

cron.schedule('0 3 * * *', () => {
  updatePatterns().catch(err => logger.error('Pattern updater failed', { error: err.message }));
});

// Run initial health check
checkHealth().catch(err => logger.error('Initial health check failed', { error: err.message }));

logger.info('All agent schedules registered.');
