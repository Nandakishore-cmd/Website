import { useState, useEffect, useCallback } from 'react';
import { getAgentStatus, getProposals, approveProposal, rejectProposal } from '../services/api';

export function useAgents() {
  const [status, setStatus] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [statusData, proposalData] = await Promise.all([
        getAgentStatus(),
        getProposals(),
      ]);
      setStatus(statusData);
      setProposals(proposalData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const approve = useCallback(async (id) => {
    await approveProposal(id);
    await refresh();
  }, [refresh]);

  const reject = useCallback(async (id) => {
    await rejectProposal(id);
    await refresh();
  }, [refresh]);

  return { status, proposals, loading, error, approve, reject, refresh };
}
