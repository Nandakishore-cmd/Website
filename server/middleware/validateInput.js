import { AppError } from './errorHandler.js';

export function validateTextInput(req, res, next) {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return next(new AppError('Text is required and must be a string', 400, 'INVALID_INPUT'));
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return next(new AppError('Text cannot be empty', 400, 'EMPTY_TEXT'));
  }

  req.body.text = trimmed;
  next();
}
