import { io, Socket } from 'socket.io-client';

export interface WebSocketManager {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  sendInput: (data: string) => void;
  onOutput: (callback: (data: string) => void) => void;
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  onError: (callback: (error: any) => void) => void;
  resize: (cols: number, rows: number) => void;
}

export function createWebSocketManager(): WebSocketManager {
  let socket: Socket | null = null;
  let connectCallback: (() => void) | null = null;
  let disconnectCallback: (() => void) | null = null;
  let errorCallback: ((error: any) => void) | null = null;
  let outputCallback: ((data: string) => void) | null = null;

  const getWebSocketUrl = (): string => {
    const isDev = process.env.NODE_ENV === 'development';
    return isDev 
      ? 'http://localhost:3001'
      : process.env.NEXT_PUBLIC_API_URL || 'https://term-site-backend.fly.dev';
  };

  const connect = () => {
    if (socket?.connected) return;

    console.log('Creating WebSocket connection to:', getWebSocketUrl());
    socket = io(getWebSocketUrl(), {
      transports: ['websocket'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
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

  const onError = (callback: (error: any) => void) => {
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