import { Redis } from 'ioredis';
import { config } from '../config/env.js';

export const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableReadyCheck: false,
  retryStrategy(times: number) {
    // Reconnect with exponential backoff capped at 3s
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
});

redisConnection.on('error', (err: Error) => {
  if (config.nodeEnv !== 'test') {
    console.warn('[Redis] Offline/Connection notice:', err.message);
  }
});

export async function connectRedis(): Promise<boolean> {
  try {
    await redisConnection.connect();
    return true;
  } catch (err) {
    if (config.nodeEnv !== 'test') {
      console.warn('[Redis] Continuing without active Redis daemon (offline fallback active).');
    }
    return false;
  }
}
