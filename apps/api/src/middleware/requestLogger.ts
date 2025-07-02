import morgan from 'morgan';
import { logger } from '../utils/logger';

const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export const requestLogger = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  {
    stream,
    skip: (req) => req.url === '/health',
  }
);