import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeText } from './engine/analyzer.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/analyze', async (req, res) => {
  try {
    const { text, provider } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await analyzeText(text.trim(), provider);
    res.json(result);
  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Detection failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Detector running on port ${PORT}`);
});
