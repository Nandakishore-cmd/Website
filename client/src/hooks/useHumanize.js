import { useState, useCallback } from 'react';
import { humanizeText } from '../services/api';
import { API_BASE } from '../utils/constants';

export function useHumanize() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const humanize = useCallback(async (text, options) => {
    setLoading(true);
    setError(null);
    setProgress(null);

    // Use streaming for medium/heavy, regular fetch for light
    if (options.intensity === 'light') {
      try {
        const result = await humanizeText(text, options);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    }

    // Streaming for medium/heavy
    try {
      const res = await fetch(`${API_BASE}/humanize/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, options }),
      });

      if (!res.ok) {
        throw new Error('Humanization failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (line.startsWith('event:') || line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.stage) setProgress(payload);
              if (payload.humanized) { setData(payload); setProgress(null); }
              if (payload.error) setError(payload.error);
            } catch {
              // ignore malformed JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setProgress(null);
  }, []);

  return { data, loading, error, progress, humanize, reset };
}
