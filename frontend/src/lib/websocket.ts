import { io, Socket } from 'socket.io-client';

export interface WebSocketManager {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  sendInput: (data: string) => void;
  onOutput: (callback: (data: string) => void) => void;
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  onError: (callback: (error: Error) => void) => void;
  resize: (cols: number, rows: number) => void;
}

export function createWebSocketManager(): WebSocketManager {
  let socket: Socket | null = null;
  let connectCallback: (() => void) | null = null;
  let disconnectCallback: (() => void) | null = null;
  let errorCallback: ((error: Error) => void) | null = null;
  let outputCallback: ((data: string) => void) | null = null;

  const getWebSocketUrl = (): string => {
    // For self-hosted: If no API URL is set, use same origin (nginx will route)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Use same origin for self-hosted deployment
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // Fallback for SSR/development
    return 'http://localhost:3001';
  };

  const connect = () => {
    if (socket?.connected) return;

    console.log('Creating WebSocket connection to:', getWebSocketUrl());
    socket = io(getWebSocketUrl(), {
      transports: ['polling', 'websocket'], // Prioritize polling for Cloud Run stability
      timeout: 10000, // 10 second connection timeout - prevents indefinite hanging
      reconnection: true,
      reconnectionAttempts: 10, // More attempts for better reliability
      reconnectionDelay: 2000, // Longer delay between attempts
      reconnectionDelayMax: 10000, // Cap exponential backoff
      forceNew: true, // Force new connection on reconnect
      upgrade: true, // Allow transport upgrade
      rememberUpgrade: false, // Don't remember upgraded transport
    });

    // Set up event handlers with stored callbacks
    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      if (connectCallback) connectCallback();
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (disconnectCallback) disconnectCallback();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      if (errorCallback) errorCallback(error);
      
      // Auto-retry with simple backoff on connection errors
      setTimeout(() => {
        if (socket && !socket.connected) {
          console.log('Retrying connection after error...');
          socket.connect();
        }
      }, 3000); // Simple 3-second delay for retry
    });

    socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after all attempts');
      if (errorCallback) errorCallback(new Error('Reconnection failed'));
    });

    socket.on('output', (data) => {
      console.log('WebSocket received output:', JSON.stringify(data));
      if (outputCallback) outputCallback(data);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendInput = (data: string) => {
    console.log('WebSocket sendInput called:', JSON.stringify(data));
    if (socket?.connected) {
      console.log('WebSocket is connected, emitting input event');
      socket.emit('input', data);
    } else {
      console.log('WebSocket not connected, cannot send input');
    }
  };

  const onOutput = (callback: (data: string) => void) => {
    outputCallback = callback;
  };

  const onConnect = (callback: () => void) => {
    connectCallback = callback;
  };

  const onDisconnect = (callback: () => void) => {
    disconnectCallback = callback;
  };

  const onError = (callback: (error: Error) => void) => {
    errorCallback = callback;
  };

  const resize = (cols: number, rows: number) => {
    if (socket?.connected) {
      socket.emit('resize', { cols, rows });
    }
  };

  return {
    socket,
    connect,
    disconnect,
    sendInput,
    onOutput,
    onConnect,
    onDisconnect,
    onError,
    resize,
  };
}