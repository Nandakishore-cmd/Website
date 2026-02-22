import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DATA_PATH = join(__dirname, '../../data/web-scraper.json');

const SOURCES = [
  { url: 'https://gptzero.me/blog', name: 'GPTZero Blog', selector: 'article h2, .blog-post h2' },
  { url: 'https://originality.ai/blog', name: 'Originality.ai Blog', selector: 'article h2, .post-title' },
];

export async function scrapeWeb() {
  logger.info('Web scraper starting...');
  const existing = jsonStore.read(WEB_DATA_PATH, { sources: {}, lastCheck: null });
  let findings = 0;

  for (const source of SOURCES) {
    try {
      const { data } = await axios.get(source.url, {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SafeWrite-Agent/1.0)' },
      });

      const $ = cheerio.load(data);
      const titles = [];
      $(source.selector).each((_, el) => {
        const title = $(el).text().trim();
        if (title) titles.push(title);
      });

      const prev = existing.sources[source.name]?.titles || [];
      const newTitles = titles.filter(t => !prev.includes(t));

      if (newTitles.length > 0) {
        findings += newTitles.length;
        for (const title of newTitles.slice(0, 3)) {
          proposalQueue.submit({
            agent: 'Research Agent',
            type: 'web-finding',
            description: `New article from ${source.name}: ${title}`,
            rationale: 'May contain new detection techniques or industry updates.',
            data: { source: source.name, title },
          });
        }
      }

      existing.sources[source.name] = { titles: titles.slice(0, 50), checkedAt: new Date().toISOString() };
    } catch (err) {
      logger.warn(`Web scraper failed for ${source.name}`, { error: err.message });
    }
  }

  existing.lastCheck = new Date().toISOString();
  jsonStore.write(WEB_DATA_PATH, existing);
  logger.info(`Web scraper complete. Found ${findings} new articles.`);
}
