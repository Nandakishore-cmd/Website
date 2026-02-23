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

// Streaming humanize endpoint (SSE)
app.post('/humanize/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const { text, options = {} } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Text is required' })}\n\n`);
    return res.end();
  }

  try {
    const { humanize } = await import('./humanizer/index.js');
    const result = await humanize(text.trim(), options, (progress) => {
      res.write(`event: progress\ndata: ${JSON.stringify(progress)}\n\n`);
    });
    res.write(`event: complete\ndata: ${JSON.stringify(result)}\n\n`);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  }
  res.end();
});

// Model status endpoint
app.get('/humanize/status', async (_req, res) => {
  try {
    const { getModelStatus } = await import('./humanizer/localModel.js');
    res.json(getModelStatus());
  } catch (err) {
    res.json({ status: 'error', error: err.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', signals: 7, engine: 'indigenous' });
});

app.listen(PORT, () => {
  console.log(`Detector running on port ${PORT} — 7-signal indigenous engine`);
});
