import { writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '../../data/logs');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function getLogFile() {
  const date = new Date().toISOString().split('T')[0];
  return join(LOGS_DIR, `agent-${date}.log`);
}

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  info(message, meta) {
    const formatted = formatMessage('INFO', message, meta);
    console.log(formatted);
    ensureDir(LOGS_DIR);
    appendFileSync(getLogFile(), formatted + '\n');
  },
  warn(message, meta) {
    const formatted = formatMessage('WARN', message, meta);
    console.warn(formatted);
    ensureDir(LOGS_DIR);
    appendFileSync(getLogFile(), formatted + '\n');
  },
  error(message, meta) {
    const formatted = formatMessage('ERROR', message, meta);
    console.error(formatted);
    ensureDir(LOGS_DIR);
    appendFileSync(getLogFile(), formatted + '\n');
  },
};
