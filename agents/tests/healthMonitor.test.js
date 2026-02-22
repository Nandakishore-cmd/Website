import { checkHealth } from '../src/coding/healthMonitor.js';

describe('checkHealth', () => {
  test('completes without throwing', async () => {
    // Services may not be running, but the function should handle that gracefully
    await expect(checkHealth()).resolves.not.toThrow();
  });
});
