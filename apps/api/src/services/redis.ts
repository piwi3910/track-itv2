import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    await redisClient.connect();
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    throw error;
  }
}

export function getRedis(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
  }
}