import dotenv from 'dotenv';
import { createServer } from './server';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT ?? 3001;

async function startServer(): Promise<void> {
  try {
    const app = await createServer();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

void startServer();