import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { setupRoutes } from './routes';
import { initializeSocketIO } from './services/socket';
import { connectDatabase } from './services/database';
import { connectRedis } from './services/redis';

export async function createServer(): Promise<Application> {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
    },
  });

  // Connect to databases
  await connectDatabase();
  await connectRedis();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Compression
  app.use(compression());

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use('/api', rateLimiter);

  // Initialize Socket.IO
  initializeSocketIO(io);

  // API routes
  setupRoutes(app);

  // Error handling
  app.use(errorHandler);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}