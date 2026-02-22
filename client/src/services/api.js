import { API_BASE } from '../utils/constants';

export async function detectText(text) {
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || 'Detection failed');
  }
  return res.json();
}

export async function humanizeText(text, options = {}) {
  const res = await fetch(`${API_BASE}/humanize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, options }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || 'Humanization failed');
  }
  return res.json();
}

export async function getAgentStatus() {
  const res = await fetch(`${API_BASE}/agents/status`);
  if (!res.ok) throw new Error('Failed to fetch agent status');
  return res.json();
}

export async function getProposals(status) {
  const url = status ? `${API_BASE}/agents/proposals?status=${status}` : `${API_BASE}/agents/proposals`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch proposals');
  return res.json();
}

export async function approveProposal(id) {
  const res = await fetch(`${API_BASE}/agents/proposals/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve proposal');
  return res.json();
}

export async function rejectProposal(id) {
  const res = await fetch(`${API_BASE}/agents/proposals/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject proposal');
  return res.json();
}
