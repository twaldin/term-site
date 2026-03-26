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
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'http://localhost:3001';
  };

  const connect = () => {
    if (socket?.connected) return;

    socket = io(getWebSocketUrl(), {
      transports: ['polling', 'websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: false,
    });

    socket.on('connect', () => {
      connectCallback?.();
    });

    socket.on('disconnect', () => {
      disconnectCallback?.();
    });

    socket.on('connect_error', (error) => {
      errorCallback?.(error);

      setTimeout(() => {
        if (socket && !socket.connected) {
          socket.connect();
        }
      }, 3000);
    });

    socket.on('reconnect_failed', () => {
      errorCallback?.(new Error('Reconnection failed'));
    });

    socket.on('output', (data) => {
      outputCallback?.(data);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendInput = (data: string) => {
    socket?.connected && socket.emit('input', data);
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
    socket?.connected && socket.emit('resize', { cols, rows });
  };

  return {
    get socket() { return socket; },
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
