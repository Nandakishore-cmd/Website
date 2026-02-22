import { Router } from 'express';
import { validateTextInput } from '../middleware/validateInput.js';
import { humanizeWithClaude } from '../services/claudeService.js';
import { humanizeWithOpenAI } from '../services/openaiService.js';

const router = Router();

router.post('/', validateTextInput, async (req, res, next) => {
  try {
    const { text, options = {} } = req.body;
    const provider = options.provider || 'claude';

    let result;
    if (provider === 'openai') {
      result = await humanizeWithOpenAI(text, options);
    } else {
      try {
        result = await humanizeWithClaude(text, options);
      } catch (claudeErr) {
        // Fallback to OpenAI
        try {
          result = await humanizeWithOpenAI(text, options);
        } catch (openaiErr) {
          return next(new Error('Both AI providers are unavailable. Please check API keys.'));
        }
      }
    }

    res.json({
      original: text,
      humanized: result.humanized,
      provider: result.provider,
      style: result.style,
      intensity: result.intensity,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
