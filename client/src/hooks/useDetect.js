import { useState, useCallback } from 'react';
import { detectText } from '../services/api';

export function useDetect() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    try {
      const result = await detectText(text);
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

  return { data, loading, error, detect, reset };
}
