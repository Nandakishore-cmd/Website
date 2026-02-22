import { proposalQueue } from '../src/shared/proposalQueue.js';

describe('proposalQueue', () => {
  test('submit creates a proposal with correct structure', () => {
    const proposal = proposalQueue.submit({
      agent: 'Test Agent',
      type: 'test',
      description: 'Test proposal',
      rationale: 'Testing the queue',
    });

    expect(proposal).toHaveProperty('id');
    expect(proposal.agent).toBe('Test Agent');
    expect(proposal.status).toBe('pending');
    expect(proposal.createdAt).toBeTruthy();
  });

  test('list returns proposals', () => {
    const proposals = proposalQueue.list();
    expect(Array.isArray(proposals)).toBe(true);
  });

  test('getById returns specific proposal', () => {
    const created = proposalQueue.submit({
      agent: 'Test Agent',
      description: 'Specific proposal',
    });

    const found = proposalQueue.getById(created.id);
    expect(found).toBeTruthy();
    expect(found.id).toBe(created.id);
  });
});
