import { Router } from 'express';

const router = Router();

// In-memory activity log (last 100 events)
const activityLog = [];
const MAX_LOG_SIZE = 100;
const clients = new Set();

/**
 * Add an event to the activity log and broadcast to SSE clients.
 */
export function pushAgentEvent(event) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...event,
  };

  activityLog.unshift(entry);
  if (activityLog.length > MAX_LOG_SIZE) activityLog.pop();

  // Broadcast to all SSE clients
  for (const client of clients) {
    client.write(`data: ${JSON.stringify(entry)}\n\n`);
  }
}

// SSE endpoint
router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send recent history
  for (const entry of activityLog.slice(0, 20).reverse()) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

// Get recent activity
router.get('/activity', (_req, res) => {
  res.json(activityLog.slice(0, 50));
});

// Simulate agent activity for demo purposes
function simulateActivity() {
  const agents = ['Research Agent', 'Coding Agent'];
  const actions = [
    { agent: 'Research Agent', type: 'scan', message: 'Scanning arXiv for new AI detection papers' },
    { agent: 'Research Agent', type: 'found', message: 'Found 3 new papers on text watermarking' },
    { agent: 'Research Agent', type: 'scan', message: 'Monitoring GitHub for detection tool updates' },
    { agent: 'Research Agent', type: 'found', message: 'New dataset published: AI-generated essay corpus v3' },
    { agent: 'Coding Agent', type: 'health', message: 'Health check passed — all 7 signals operational' },
    { agent: 'Coding Agent', type: 'tune', message: 'Adjusting fingerprint pattern weights (+0.02)' },
    { agent: 'Coding Agent', type: 'accuracy', message: 'Accuracy test: 94.2% on mixed dataset' },
    { agent: 'Coding Agent', type: 'update', message: 'Added 5 new AI telltale patterns to linguistic analyzer' },
  ];

  setInterval(() => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    pushAgentEvent(action);
  }, 15000 + Math.random() * 30000); // Every 15-45s
}

// Start simulation
simulateActivity();

export default router;
