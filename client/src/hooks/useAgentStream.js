import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../utils/constants';

export function useAgentStream() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(`${API_BASE}/agents/stream`);
      eventSourceRef.current = es;

      es.onopen = () => setConnected(true);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setEvents(prev => [data, ...prev].slice(0, 50));
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Reconnect after 5s
        setTimeout(connect, 5000);
      };
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, connected, clearEvents };
}
