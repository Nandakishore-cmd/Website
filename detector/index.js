import express from 'express';
import cors from 'cors';
import { analyzeText } from './engine/analyzer.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await analyzeText(text.trim());
    res.json(result);
  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Detection failed' });
  }
});

// Humanize endpoint — proxied from detector service
app.post('/humanize', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Dynamic import to avoid loading heavy model at startup
    const { humanize } = await import('./humanizer/index.js');
    const result = await humanize(text.trim(), options);
    res.json(result);
  } catch (err) {
    console.error('Humanization error:', err);
    res.status(500).json({ error: 'Humanization failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', signals: 7, engine: 'indigenous' });
});

app.listen(PORT, () => {
  console.log(`Detector running on port ${PORT} — 7-signal indigenous engine`);
});
