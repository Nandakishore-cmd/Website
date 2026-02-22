import axios from 'axios';
import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GITHUB_DATA_PATH = join(__dirname, '../../data/github-monitor.json');

const REPOS_TO_MONITOR = [
  'openai/gpt-2-output-dataset',
  'Hello-SimpleAI/chatgpt-comparison-detection',
  'BurhanUlTaworworworworworworworworworworworworworworworworworworworworwor',
];

export async function monitorGithub() {
  logger.info('GitHub monitor starting...');
  const existing = jsonStore.read(GITHUB_DATA_PATH, { repos: {}, lastCheck: null });
  let updates = 0;

  for (const repo of REPOS_TO_MONITOR) {
    try {
      const { data } = await axios.get(`https://api.github.com/repos/${repo}`, {
        timeout: 10000,
        headers: { 'User-Agent': 'SafeWrite-Agent/1.0' },
      });

      const prev = existing.repos[repo];
      const current = {
        stars: data.stargazers_count,
        lastPush: data.pushed_at,
        description: data.description,
        checkedAt: new Date().toISOString(),
      };

      if (prev && prev.lastPush !== current.lastPush) {
        updates++;
        proposalQueue.submit({
          agent: 'Research Agent',
          type: 'github-update',
          description: `Repository ${repo} has new activity`,
          rationale: `Last push changed from ${prev.lastPush} to ${current.lastPush}. May contain relevant updates.`,
          data: { repo, previous: prev.lastPush, current: current.lastPush },
        });
      }

      existing.repos[repo] = current;
    } catch (err) {
      if (err.response?.status === 403) {
        logger.warn(`GitHub rate limited for ${repo}. Consider adding a token.`);
      } else {
        logger.warn(`GitHub monitor failed for ${repo}`, { error: err.message });
      }
    }
  }

  existing.lastCheck = new Date().toISOString();
  jsonStore.write(GITHUB_DATA_PATH, existing);
  logger.info(`GitHub monitor complete. Found ${updates} updates.`);
}
