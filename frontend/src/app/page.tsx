'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Terminal from '@/components/Terminal';
import { createWebSocketManager, WebSocketManager } from '@/lib/websocket';

export default function Home() {
  const [, setIsConnected] = useState(false);
  const [, setConnectionStatus] = useState('Disconnected');
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const terminalRef = useRef<{ writeToTerminal: (data: string) => void; clearTerminal: () => void; fitTerminal: () => void } | null>(null);

  useEffect(() => {
    // Initialize WebSocket manager
    const wsManager = createWebSocketManager();
    wsManagerRef.current = wsManager;

    // Setup event handlers BEFORE connecting
    wsManager.onConnect(() => {
      console.log('WebSocket connected! Setting state...');
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    wsManager.onDisconnect(() => {
      console.log('WebSocket disconnected! Setting state...');
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    wsManager.onError((error) => {
      console.log('WebSocket error:', error);
      setConnectionStatus(`Error: ${error.message}`);
      setIsConnected(false);
    });

    wsManager.onOutput((data) => {
      console.log('Page received output from WebSocket:', JSON.stringify(data));
      if (terminalRef.current) {
        console.log('Writing to terminal:', JSON.stringify(data));
        terminalRef.current.writeToTerminal(data);
      } else {
        console.log('Terminal ref not ready for writing, terminalRef.current:', terminalRef.current);
      }
    });

    // Connect AFTER setting up handlers
    console.log('Connecting WebSocket...');
    wsManager.connect();

    // Cleanup on unmount
    return () => {
      wsManager.disconnect();
    };
  }, []);

  const handleTerminalData = useCallback((data: string) => {
    console.log('Terminal input received:', JSON.stringify(data));
    if (wsManagerRef.current) {
      console.log('Sending input to WebSocket');
      wsManagerRef.current.sendInput(data);
    } else {
      console.log('WebSocket manager not ready');
    }
  }, []);

  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.resize(cols, rows);
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
      setTimeout(() => {
        wsManagerRef.current?.connect();
      }, 1000);
    }
  }, []);

  // Keep the function available for potential future use
  console.log('Reconnect handler available:', handleReconnect);

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Terminal
        ref={terminalRef}
        onData={handleTerminalData}
        onResize={handleTerminalResize}
      />
    </div>
  );
}
