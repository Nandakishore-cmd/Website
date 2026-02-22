import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import { dirname } from 'path';
import { randomBytes } from 'crypto';

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export const jsonStore = {
  read(filePath, defaultValue = null) {
    try {
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  },

  write(filePath, data) {
    ensureDir(filePath);
    const tmpPath = filePath + '.tmp.' + randomBytes(4).toString('hex');
    writeFileSync(tmpPath, JSON.stringify(data, null, 2));
    renameSync(tmpPath, filePath);
  },

  append(filePath, entry) {
    const existing = this.read(filePath, []);
    existing.push(entry);
    this.write(filePath, existing);
  },
};
