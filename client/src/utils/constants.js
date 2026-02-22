export const API_BASE = '/api';

export const CLASSIFICATION_COLORS = {
  HUMAN: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/25' },
  MIXED: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/25' },
  AI: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/25' },
};

export const STYLES = [
  { value: 'natural', label: 'Natural' },
  { value: 'casual', label: 'Casual' },
  { value: 'academic', label: 'Academic' },
  { value: 'creative', label: 'Creative' },
];

export const INTENSITIES = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Strong' },
];
