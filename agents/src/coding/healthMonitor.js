import axios from 'axios';
import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HEALTH_PATH = join(__dirname, '../../data/logs/health.json');

const SERVICES = [
  { name: 'detector', url: 'http://localhost:3002/health' },
  { name: 'server', url: 'http://localhost:3001/api/health' },
];

export async function checkHealth() {
  const healthData = jsonStore.read(HEALTH_PATH, { agents: [], checks: [], lastCheck: null });
  const results = [];

  for (const service of SERVICES) {
    const start = Date.now();
    try {
      const { data, status } = await axios.get(service.url, { timeout: 5000 });
      results.push({
        name: service.name,
        status: 'healthy',
        responseTimeMs: Date.now() - start,
        httpStatus: status,
        checkedAt: new Date().toISOString(),
      });
    } catch (err) {
      results.push({
        name: service.name,
        status: 'unhealthy',
        responseTimeMs: Date.now() - start,
        error: err.message,
        checkedAt: new Date().toISOString(),
      });

      // Check if service was previously healthy (transition to unhealthy)
      const lastCheck = healthData.checks[healthData.checks.length - 1];
      const wasHealthy = lastCheck?.results?.find(r => r.name === service.name)?.status === 'healthy';
      if (wasHealthy || !lastCheck) {
        proposalQueue.submit({
          agent: 'Coding Agent',
          type: 'alert',
          description: `Service ${service.name} is unhealthy`,
          rationale: `${service.name} at ${service.url} is not responding: ${err.message}`,
          data: { service: service.name, error: err.message },
        });
      }
    }
  }

  healthData.agents = [
    { name: 'Research Agent', status: 'active', lastRun: new Date().toISOString() },
    { name: 'Coding Agent', status: 'active', lastRun: new Date().toISOString() },
  ];
  healthData.checks.push({ results, timestamp: new Date().toISOString() });
  // Keep only last 100 checks
  if (healthData.checks.length > 100) healthData.checks = healthData.checks.slice(-100);
  healthData.lastCheck = new Date().toISOString();

  jsonStore.write(HEALTH_PATH, healthData);
  logger.info('Health check complete', { results: results.map(r => `${r.name}: ${r.status}`) });
}
