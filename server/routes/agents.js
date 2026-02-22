import { Router } from 'express';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROPOSALS_DIR = join(__dirname, '../../agents/data/proposals');
const LOGS_DIR = join(__dirname, '../../agents/data/logs');

router.get('/status', async (req, res) => {
  try {
    let healthData = { agents: [], lastCheck: null };
    try {
      const healthPath = join(LOGS_DIR, 'health.json');
      const data = await readFile(healthPath, 'utf-8');
      healthData = JSON.parse(data);
    } catch {
      // No health data yet
    }
    res.json(healthData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read agent status' });
  }
});

router.get('/proposals', async (req, res) => {
  try {
    const files = await readdir(PROPOSALS_DIR).catch(() => []);
    const proposals = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = await readFile(join(PROPOSALS_DIR, file), 'utf-8');
        proposals.push(JSON.parse(data));
      } catch { /* skip invalid files */ }
    }
    const status = req.query.status;
    const filtered = status ? proposals.filter(p => p.status === status) : proposals;
    res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read proposals' });
  }
});

router.post('/proposals/:id/approve', async (req, res) => {
  try {
    const filePath = join(PROPOSALS_DIR, `${req.params.id}.json`);
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    data.status = 'approved';
    data.approvedAt = new Date().toISOString();
    await writeFile(filePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Proposal not found' });
  }
});

router.post('/proposals/:id/reject', async (req, res) => {
  try {
    const filePath = join(PROPOSALS_DIR, `${req.params.id}.json`);
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    data.status = 'rejected';
    data.rejectedAt = new Date().toISOString();
    await writeFile(filePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Proposal not found' });
  }
});

export default router;
