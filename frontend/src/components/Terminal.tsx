'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface TerminalProps {
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
}

interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  fitTerminal: () => void;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(({ onData, onResize }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined') return;

    // Cleanup any existing terminal first
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    }

    let cleanupFunctions: (() => void)[] = [];

    // Dynamic import to avoid SSR issues
    import('@xterm/xterm').then(({ Terminal }) => {
      import('@xterm/addon-fit').then(({ FitAddon }) => {
        import('@xterm/xterm/css/xterm.css');

        // Check if component is still mounted
        if (!terminalRef.current) return;

        // Initialize xterm.js
        const xterm = new Terminal({
          cursorBlink: true,
          fontFamily: 'Monaco, "Lucida Console", monospace',
          fontSize: 16,
          lineHeight: 1.2,
          cols: 120,
          rows: 30,
          theme: {
            background: '#000000',
            foreground: '#00ff00',
            cursor: '#00ff00',
            selection: '#ffffff40',
          },
          allowProposedApi: true,
        });

        // Initialize fit addon
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);

        // Open terminal
        xterm.open(terminalRef.current!);
        fitAddon.fit();

        // Store references
        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;

        // Handle terminal input
        const dataDisposable = xterm.onData((data) => {
          console.log('xterm.js onData received:', JSON.stringify(data), 'char codes:', data.split('').map(c => c.charCodeAt(0)));
          onData(data);
        });

        // Handle terminal resize
        const resizeDisposable = xterm.onResize(({ cols, rows }) => {
          onResize(cols, rows);
        });

        // Focus terminal and handle clicks
        xterm.focus();
        
        // Add click handler to ensure focus
        const handleClick = () => {
          xterm.focus();
        };
        
        const currentTerminalElement = terminalRef.current!;
        currentTerminalElement.addEventListener('click', handleClick);

        // Handle window resize
        const handleResize = () => {
          fitAddon.fit();
        };

        window.addEventListener('resize', handleResize);
        setIsReady(true);

        // Store cleanup functions
        cleanupFunctions = [
          () => window.removeEventListener('resize', handleResize),
          () => currentTerminalElement.removeEventListener('click', handleClick),
          () => dataDisposable.dispose(),
          () => resizeDisposable.dispose(),
          () => xterm.dispose()
        ];
      });
    });

    // Return cleanup function
    return () => {
      console.log('Terminal component cleanup triggered');
      cleanupFunctions.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Error during terminal cleanup:', error);
        }
      });
      xtermRef.current = null;
      fitAddonRef.current = null;
      setIsReady(false);
    };
  }, [onData, onResize]);

  // Method to write data to terminal
  const writeToTerminal = (data: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(data);
    }
  };

  // Method to clear terminal
  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

  // Method to fit terminal
  const fitTerminal = () => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    writeToTerminal,
    clearTerminal,
    fitTerminal,
  }), [isReady]);

  return (
    <div 
      ref={terminalRef}
      className="w-full h-full bg-black"
      style={{ 
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    />
  );
});

Terminal.displayName = 'Terminal';
export default Terminal;