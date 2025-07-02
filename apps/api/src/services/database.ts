import { PrismaClient } from '@track-it/database';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

export async function connectDatabase(): Promise<void> {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    await prisma.$connect();
    logger.info('Successfully connected to PostgreSQL database');
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return prisma;
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}