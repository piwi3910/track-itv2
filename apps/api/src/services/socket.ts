import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer;

export function initializeSocketIO(socketServer: SocketIOServer): void {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('join-project', (projectId: string) => {
      void socket.join(`project:${projectId}`);
      logger.info(`Socket ${socket.id} joined project:${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      void socket.leave(`project:${projectId}`);
      logger.info(`Socket ${socket.id} left project:${projectId}`);
    });

    socket.on('join-task', (taskId: string) => {
      void socket.join(`task:${taskId}`);
      logger.info(`Socket ${socket.id} joined task:${taskId}`);
    });

    socket.on('leave-task', (taskId: string) => {
      void socket.leave(`task:${taskId}`);
      logger.info(`Socket ${socket.id} left task:${taskId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO() first.');
  }
  return io;
}

export function emitToProject(projectId: string, event: string, data: unknown): void {
  const socketIO = getSocketIO();
  socketIO.to(`project:${projectId}`).emit(event, data);
}

export function emitToTask(taskId: string, event: string, data: unknown): void {
  const socketIO = getSocketIO();
  socketIO.to(`task:${taskId}`).emit(event, data);
}