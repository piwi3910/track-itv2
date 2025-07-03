import Bull from 'bull';
import { getRedisClient } from './redis';

export interface EmailJobData {
  to: string;
  type: 'notification' | 'welcome' | 'password-reset';
  subject: string;
  data: Record<string, any>;
}

class QueueService {
  private emailQueue?: Bull.Queue<EmailJobData>;

  async initialize(): Promise<void> {
    const redis = getRedisClient();
    
    if (!redis) {
      console.warn('Redis not available, email queue disabled');
      return;
    }

    this.emailQueue = new Bull<EmailJobData>('email', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    });

    // Process email jobs
    this.emailQueue.process(async (job) => {
      console.log('Processing email job:', job.data);
      // In production, integrate with email service (SendGrid, SES, etc.)
      // For now, just log the email
      return Promise.resolve();
    });

    this.emailQueue.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    this.emailQueue.on('failed', (job, err) => {
      console.error(`Email job ${job?.id} failed:`, err);
    });
  }

  async addEmailJob(data: EmailJobData): Promise<void> {
    if (!this.emailQueue) {
      console.warn('Email queue not initialized, skipping email');
      return;
    }

    await this.emailQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}

export const queueService = new QueueService();