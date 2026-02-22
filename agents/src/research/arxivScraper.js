import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../shared/logger.js';
import { jsonStore } from '../shared/jsonStore.js';
import { proposalQueue } from '../shared/proposalQueue.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAPERS_PATH = join(__dirname, '../../data/arxiv-papers.json');

const SEARCH_QUERIES = [
  'ai+text+detection',
  'llm+watermarking',
  'machine+generated+text+detection',
  'ai+writing+detection',
];

const parser = new XMLParser({ ignoreAttributes: false });

export async function scrapeArxiv() {
  logger.info('ArXiv scraper starting...');
  const existingPapers = jsonStore.read(PAPERS_PATH, []);
  const existingIds = new Set(existingPapers.map(p => p.id));
  let newPapers = 0;

  for (const query of SEARCH_QUERIES) {
    try {
      await new Promise(r => setTimeout(r, 3000)); // Respect arXiv rate limits
      const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
      const { data } = await axios.get(url, { timeout: 15000 });
      const parsed = parser.parse(data);
      const entries = parsed.feed?.entry;
      if (!entries) continue;

      const papers = Array.isArray(entries) ? entries : [entries];
      for (const paper of papers) {
        const id = paper.id || '';
        if (existingIds.has(id)) continue;

        const newPaper = {
          id,
          title: (paper.title || '').replace(/\s+/g, ' ').trim(),
          authors: Array.isArray(paper.author) ? paper.author.map(a => a.name) : [paper.author?.name || 'Unknown'],
          abstract: (paper.summary || '').replace(/\s+/g, ' ').trim().slice(0, 500),
          published: paper.published || '',
          query,
        };

        existingPapers.push(newPaper);
        existingIds.add(id);
        newPapers++;

        proposalQueue.submit({
          agent: 'Research Agent',
          type: 'new-paper',
          description: `New paper found: ${newPaper.title}`,
          rationale: `Published ${newPaper.published}. May contain insights for improving detection algorithms.`,
          data: { paperId: id, title: newPaper.title },
        });
      }
    } catch (err) {
      logger.warn(`ArXiv query failed: ${query}`, { error: err.message });
    }
  }

  jsonStore.write(PAPERS_PATH, existingPapers);
  logger.info(`ArXiv scraper complete. Found ${newPapers} new papers.`);
}
