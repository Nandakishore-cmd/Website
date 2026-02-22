import { Router } from 'express';
import axios from 'axios';
import { validateTextInput } from '../middleware/validateInput.js';

const router = Router();
const DETECTOR_URL = process.env.DETECTOR_URL || 'http://localhost:3002';

router.post('/', validateTextInput, async (req, res, next) => {
  try {
    const { text } = req.body;

    const response = await axios.post(`${DETECTOR_URL}/analyze`, { text }, {
      timeout: 30000, // 30 second timeout for AI meta-detection
      headers: { 'Content-Type': 'application/json' },
    });

    res.json(response.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Detection service is unavailable',
        code: 'DETECTOR_UNAVAILABLE',
      });
    }
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
});

export default router;
