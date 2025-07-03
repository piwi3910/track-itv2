import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

// Connect socket when user is authenticated
export function connectSocket(userId: string): void {
  if (!socket.connected) {
    socket.auth = { userId };
    socket.connect();
  }
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

// Join a project room for real-time updates
export function joinProject(projectId: string): void {
  socket.emit('join:project', projectId);
}

// Leave a project room
export function leaveProject(projectId: string): void {
  socket.emit('leave:project', projectId);
}

// Join a task room for real-time updates
export function joinTask(taskId: string): void {
  socket.emit('join:task', taskId);
}

// Leave a task room
export function leaveTask(taskId: string): void {
  socket.emit('leave:task', taskId);
}