'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useCallback, useState } from 'react';
import { createWebSocketManager, WebSocketManager } from '@/lib/websocket';

// xterm references browser globals (`self`) at module level — skip SSR.
const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

export default function Home() {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const terminalRef = useRef<{ writeToTerminal: (data: string) => void; clearTerminal: () => void; fitTerminal: () => void } | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const wsManager = createWebSocketManager();
    wsManagerRef.current = wsManager;

    wsManager.onConnect(() => {});

    wsManager.onDisconnect(() => {});

    wsManager.onError(() => {});

    wsManager.onOutput((data) => {
      setShowSkeleton(false);
      if (terminalRef.current) {
        terminalRef.current.writeToTerminal(data);
      }
    });

    wsManager.connect();

    return () => {
      wsManager.disconnect();
    };
  }, []);

  // Auto-dismiss skeleton after 3s so it never permanently blocks the
  // terminal — if the WS is rate-limited or slow, xterm still shows.
  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const w = window as Window & { __terminalSendCommand?: (cmd: string) => void };
    w.__terminalSendCommand = (cmd: string) => {
      // For home/welcome commands, send clear first then welcome
      if (cmd === 'welcome' || cmd === 'home') {
        wsManagerRef.current?.sendInput('clear\r');
        // Add small delay to ensure clear is processed
        setTimeout(() => {
          wsManagerRef.current?.sendInput('welcome\r');
        }, 100);
      } else {
        wsManagerRef.current?.sendInput(cmd + '\r');
      }
    };
    return () => { delete w.__terminalSendCommand; };
  }, []);

  const handleTerminalData = useCallback((data: string) => {
    wsManagerRef.current?.sendInput(data);
  }, []);

  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    wsManagerRef.current?.resize(cols, rows);
  }, []);

  return (
    <div className="w-full flex-1 bg-black overflow-hidden" style={{ minHeight: 0, position: 'relative' }}>
      {showSkeleton && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1d2021', fontFamily: 'monospace',
        }}>
          <span style={{ color: '#928374', fontSize: '13px' }}>
            <span style={{ animation: 'blink 1s step-end infinite' }}>▌</span>
          </span>
        </div>
      )}
      <Terminal
        ref={terminalRef}
        onData={handleTerminalData}
        onResize={handleTerminalResize}
      />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
