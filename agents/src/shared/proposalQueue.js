import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { jsonStore } from './jsonStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROPOSALS_DIR = join(__dirname, '../../data/proposals');

export const proposalQueue = {
  submit(proposal) {
    const id = randomBytes(8).toString('hex');
    const fullProposal = {
      id,
      agent: proposal.agent || 'unknown',
      type: proposal.type || 'suggestion',
      description: proposal.description,
      rationale: proposal.rationale || '',
      data: proposal.data || {},
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    jsonStore.write(join(PROPOSALS_DIR, `${id}.json`), fullProposal);
    return fullProposal;
  },

  list(status = null) {
    try {
      const files = readdirSync(PROPOSALS_DIR).filter(f => f.endsWith('.json'));
      const proposals = files.map(f => jsonStore.read(join(PROPOSALS_DIR, f))).filter(Boolean);
      return status ? proposals.filter(p => p.status === status) : proposals;
    } catch {
      return [];
    }
  },

  getById(id) {
    return jsonStore.read(join(PROPOSALS_DIR, `${id}.json`));
  },

  updateStatus(id, status) {
    const proposal = this.getById(id);
    if (!proposal) return null;
    proposal.status = status;
    proposal[`${status}At`] = new Date().toISOString();
    jsonStore.write(join(PROPOSALS_DIR, `${id}.json`), proposal);
    return proposal;
  },
};
