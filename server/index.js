import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import humanizeRouter from './routes/humanize.js';
import detectRouter from './routes/detect.js';
import agentsRouter from './routes/agents.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.use('/api/humanize', humanizeRouter);
app.use('/api/detect', detectRouter);
app.use('/api/agents', agentsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
