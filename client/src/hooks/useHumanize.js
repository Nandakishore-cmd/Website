import { useState, useCallback } from 'react';
import { humanizeText } from '../services/api';

export function useHumanize() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const humanize = useCallback(async (text, options) => {
    setLoading(true);
    setError(null);
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
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, humanize, reset };
}
