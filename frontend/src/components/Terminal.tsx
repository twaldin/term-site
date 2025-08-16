"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { terminalConfig } from "../config/terminal-theme";

interface TerminalProps {
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
}

interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  fitTerminal: () => void;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(
  ({ onData, onResize }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<import("@xterm/xterm").Terminal | null>(null);
    const fitAddonRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
    const [, setIsReady] = useState(false);

    useEffect(() => {
      if (!terminalRef.current || typeof window === "undefined") return;

      // Cleanup any existing terminal first
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        fitAddonRef.current = null;
      }

      let cleanupFunctions: (() => void)[] = [];

      // Dynamic import to avoid SSR issues
      import("@xterm/xterm").then(({ Terminal }) => {
        import("@xterm/addon-fit").then(({ FitAddon }) => {
          import("@xterm/addon-web-links").then(({ WebLinksAddon }) => {
            // CSS is imported via next.config or global CSS

          // Check if component is still mounted
          if (!terminalRef.current) return;

          // Initialize xterm.js with your personalized config
          const xterm = new Terminal(terminalConfig);

          // Initialize fit addon
          const fitAddon = new FitAddon();
          xterm.loadAddon(fitAddon);

          // Initialize web links addon for clickable URLs
          const webLinksAddon = new WebLinksAddon();
          xterm.loadAddon(webLinksAddon);

          // Open terminal
          xterm.open(terminalRef.current!);

          // Store references
          xtermRef.current = xterm;
          fitAddonRef.current = fitAddon;

          // Handle terminal input
          const dataDisposable = xterm.onData((data) => {
            console.log(
              "xterm.js onData received:",
              JSON.stringify(data),
              "char codes:",
              data.split("").map((c) => c.charCodeAt(0)),
            );
            onData(data);
          });

          // Handle terminal resize
          const resizeDisposable = xterm.onResize(({ cols, rows }) => {
            console.log("Terminal resized to:", cols, "x", rows);
            onResize(cols, rows);
          });

          // Fit terminal after a short delay to ensure DOM is ready
          setTimeout(() => {
            fitAddon.fit();
            // Send initial resize to backend
            const { cols, rows } = xterm;
            console.log("Initial terminal size:", cols, "x", rows);
            onResize(cols, rows);
          }, 100);

          // Focus terminal and handle clicks
          xterm.focus();

          // Add click handler to ensure focus
          const handleClick = () => {
            xterm.focus();
          };

          const currentTerminalElement = terminalRef.current!;
          currentTerminalElement.addEventListener("click", handleClick);

          // Add clipboard integration
          const handlePaste = async (event: ClipboardEvent) => {
            event.preventDefault();
            try {
              const text = await navigator.clipboard.readText();
              xterm.paste(text);
            } catch (err) {
              console.warn("Failed to read clipboard:", err);
            }
          };

          const handleCopy = async () => {
            try {
              const selection = xterm.getSelection();
              if (selection) {
                await navigator.clipboard.writeText(selection);
              }
            } catch (err) {
              console.warn("Failed to write to clipboard:", err);
            }
          };

          // Add keyboard shortcuts for copy/paste and tab handling
          const handleKeyDown = async (event: KeyboardEvent) => {
            // Handle tab key for completion
            if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
              // Let the tab go through, but we'll handle the response properly
              // The issue is likely in how the shell responds to tab completion
              // Don't prevent default here - let normal tab completion work
            }
            else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
              event.preventDefault();
              try {
                const text = await navigator.clipboard.readText();
                xterm.paste(text);
              } catch (err) {
                console.warn("Failed to read clipboard:", err);
              }
            } else if ((event.ctrlKey || event.metaKey) && event.key === "c") {
              const selection = xterm.getSelection();
              if (selection) {
                event.preventDefault();
                handleCopy();
              }
            }
          };

          currentTerminalElement.addEventListener("paste", handlePaste);
          currentTerminalElement.addEventListener("keydown", handleKeyDown);

          // Handle window resize
          const handleResize = () => {
            fitAddon.fit();
          };

          window.addEventListener("resize", handleResize);
          setIsReady(true);

          // Additional resize after component is fully ready
          setTimeout(() => {
            fitAddon.fit();
            const { cols, rows } = xterm;
            onResize(cols, rows);
          }, 200);

          // Store cleanup functions
          cleanupFunctions = [
            () => window.removeEventListener("resize", handleResize),
            () =>
              currentTerminalElement.removeEventListener("click", handleClick),
            () =>
              currentTerminalElement.removeEventListener("paste", handlePaste),
            () =>
              currentTerminalElement.removeEventListener(
                "keydown",
                handleKeyDown,
              ),
            () => dataDisposable.dispose(),
            () => resizeDisposable.dispose(),
            () => xterm.dispose(),
          ];
          });
        });
      });

      // Return cleanup function
      return () => {
        console.log("Terminal component cleanup triggered");
        cleanupFunctions.forEach((cleanup) => {
          try {
            cleanup();
          } catch (error) {
            console.error("Error during terminal cleanup:", error);
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

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      writeToTerminal,
      clearTerminal,
      fitTerminal: () => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          // Trigger resize event to notify backend
          const { cols, rows } = xtermRef.current;
          onResize(cols, rows);
        }
      },
    }), [onResize]);

    return (
      <div
        ref={terminalRef}
        className="w-full h-full"
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: terminalConfig.theme.background,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    );
  },
);

Terminal.displayName = "Terminal";
export default Terminal;

