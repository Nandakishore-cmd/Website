import { Router } from 'express';
import axios from 'axios';
import { validateTextInput } from '../middleware/validateInput.js';

const router = Router();
const DETECTOR_URL = process.env.DETECTOR_URL || 'http://localhost:3002';

router.post('/', validateTextInput, async (req, res, next) => {
  try {
    const { text, options = {} } = req.body;

    const response = await axios.post(`${DETECTOR_URL}/humanize`, { text, options }, {
      timeout: 120000, // 2 minute timeout for model inference
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Humanization service is unavailable',
        code: 'HUMANIZER_UNAVAILABLE',
      });
    }
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
});

// Streaming humanize endpoint — proxies SSE from detector
router.post('/stream', validateTextInput, async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const response = await axios.post(`${DETECTOR_URL}/humanize/stream`, req.body, {
      responseType: 'stream',
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    });
    response.data.pipe(res);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Service unavailable' })}\n\n`);
    res.end();
  }
});

export default router;
