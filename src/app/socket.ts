import { io, Socket } from 'socket.io-client';
import { getStoredTokens } from './api/storage';

/**
 * SocketService is a singleton class that provides a socket connection to the server.
 * It is used to emit and receive events from the server.
 *
 * @example
 * const socket = new SocketService();
 * socket.on('event', (data) => {
 *   console.log(data);
 * });
 * socket.emit('event', { message: 'Hello, world!' });
 */
class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  }

  connect(): void {
    if (this.socket?.connected) return;

    const tokens = getStoredTokens();

    if (!tokens?.accessToken) {
      throw new Error('No access token available');
    }

    this.socket = io(this.url, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket'],
      autoConnect: false,
    });

    this.setupListeners();
    this.socket.connect();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
      if (error.message === 'Invalid token') {
        this.disconnect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T>(event: string, data: T): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  on<T>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    this.socket.on(event, callback);
  }

  off<T>(event: string, callback?: (data: T) => void): void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    this.socket.off(event, callback);
  }
}

export const socketService = new SocketService();
