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
  const firstOutputSeenRef = useRef(false);
  const firstPromptSeenRef = useRef(false);
  const welcomeSeenRef = useRef(false);
  const readyPromptSeenRef = useRef(false);

  const stripAnsi = (s: string) =>
    s
      .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
      .replace(/\x1B\][^\x07]*(\x07|\x1B\\)/g, '')
      .replace(/\r/g, '');

  const mark = (name: string) => {
    if (typeof window === 'undefined') return;
    performance.mark(name);
    const w = window as Window & {
      __termTti?: {
        [key: string]: number;
      };
    };
    if (!w.__termTti) w.__termTti = {};
    w.__termTti[name] = performance.now();
  };

  useEffect(() => {
    mark('term:page-mounted');
    const wsManager = createWebSocketManager();
    wsManagerRef.current = wsManager;

    wsManager.onConnect(() => {
      mark('term:socket-connected');
    });

    wsManager.onDisconnect(() => {});

    wsManager.onError(() => {});

    wsManager.onOutput((data) => {
      if (!firstOutputSeenRef.current) {
        firstOutputSeenRef.current = true;
        mark('term:first-output');
      }

      const plain = stripAnsi(data);
      if (!firstPromptSeenRef.current && plain.includes('❯ ')) {
        firstPromptSeenRef.current = true;
        mark('term:first-prompt');
      }
      if (!welcomeSeenRef.current && /(^|\n)welcome(\n|$)/m.test(plain)) {
        welcomeSeenRef.current = true;
        mark('term:welcome-typed');
      }
      if (!readyPromptSeenRef.current && welcomeSeenRef.current && plain.includes('❯ ')) {
        readyPromptSeenRef.current = true;
        mark('term:ready-for-input');
      }

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
