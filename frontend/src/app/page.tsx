'use client';

import { useEffect, useRef, useCallback } from 'react';
import Terminal from '@/components/Terminal';
import { createWebSocketManager, WebSocketManager } from '@/lib/websocket';

export default function Home() {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const terminalRef = useRef<{ writeToTerminal: (data: string) => void; clearTerminal: () => void; fitTerminal: () => void } | null>(null);

  useEffect(() => {
    const wsManager = createWebSocketManager();
    wsManagerRef.current = wsManager;

    wsManager.onConnect(() => {});

    wsManager.onDisconnect(() => {});

    wsManager.onError(() => {});

    wsManager.onOutput((data) => {
      if (terminalRef.current) {
        terminalRef.current.writeToTerminal(data);
      }
    });

    wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, []);

  const handleTerminalData = useCallback((data: string) => {
    wsManagerRef.current?.sendInput(data);
  }, []);

  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    wsManagerRef.current?.resize(cols, rows);
  }, []);

  return (
    <div className="w-full flex-1 bg-black overflow-hidden" style={{ minHeight: 0 }}>
      <Terminal
        ref={terminalRef}
        onData={handleTerminalData}
        onResize={handleTerminalResize}
      />
    </div>
  );
}
