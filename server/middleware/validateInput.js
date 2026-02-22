import { AppError } from './errorHandler.js';

export function validateTextInput(req, res, next) {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return next(new AppError('Text is required and must be a string', 400, 'INVALID_INPUT'));
  }

  const trimmed = text.trim();
  if (trimmed.length < 50) {
    return next(new AppError('Text must be at least 50 characters for meaningful analysis', 400, 'TEXT_TOO_SHORT'));
  }

  if (trimmed.length > 50000) {
    return next(new AppError('Text must not exceed 50,000 characters', 400, 'TEXT_TOO_LONG'));
  }

  req.body.text = trimmed;
  next();
}
