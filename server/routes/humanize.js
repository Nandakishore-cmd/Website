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

export default router;
